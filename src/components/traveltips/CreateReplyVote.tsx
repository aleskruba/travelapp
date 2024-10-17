import { MessageProps, ReplyProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { BiLike, BiDislike } from "react-icons/bi";
import { BASE_URL } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCountryContext } from '../../context/countryContext';
import { fetchData } from '../../hooks/useFetchData';

interface Props {
    message: MessageProps;
    reply: ReplyProps;
    currentPage: number;
    currentPageReply: number;
}

function CreateReplyVote({ message, reply, currentPage, currentPageReply }: Props) {
    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const { chosenCountry } = useCountryContext();

    const createVote = async (voteType: string) => {
        const newVote = {
            voteType: voteType,
            message_id: message.id,
            reply_id: reply.id,
        };

        const response = await fetchData(`${BASE_URL}/votereply`, 'PUT', newVote);

        if (!response.ok) {
            throw new Error('Error while sending the vote');
        }

        return response.json();
    };

    const mutation = useMutation({
        mutationFn: createVote,
        onMutate: async (voteType) => {
            // Cancel any outgoing refetches to avoid conflicts with optimistic update
            await queryClient.cancelQueries({
                queryKey: ['messages', chosenCountry, currentPage, currentPageReply],
            });

            // Snapshot the previous value
            const previousMessages = queryClient.getQueryData([
                'messages',
                chosenCountry,
                currentPage,
                currentPageReply,
            ]);

            // Optimistically update the cache
            queryClient.setQueryData(['messages', chosenCountry, currentPage, currentPageReply], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    messages: oldData.messages.map((msg: any) =>
                        msg.id === message.id
                            ? {
                                ...msg,
                                reply: msg.reply.map((rep: any) =>
                                    rep.id === reply.id
                                        ? {
                                            ...rep,
                                            votesreply: [
                                                ...rep.votesreply.filter((vote: any) => vote.user_id !== user?.id),
                                                { user_id: user?.id, vote_type: voteType, reply_id: reply.id },
                                            ],
                                        }
                                        : rep
                                ),
                            }
                            : msg
                    ),
                };
            });

            // Return the context for rollback
            return { previousMessages };
        },
        onError: (err, voteType, context) => {
            // Rollback to the previous state if mutation fails
            queryClient.setQueryData(
                ['messages', chosenCountry, currentPage, currentPageReply],
                context?.previousMessages
            );
        },
        onSettled: (data, error) => {
            // Invalidate queries to ensure data is up-to-date
            if (error) {
                queryClient.invalidateQueries({
                    queryKey: ['messages', chosenCountry, currentPage, currentPageReply],
                });
            }
        },
    });

    const countThumbsUp = (reply_id: any) => {
        return reply?.votesreply?.filter(
            (vote) => vote.reply_id === reply_id && vote.vote_type === 'thumb_up'
        ).length;
    };

    const countThumbsDown = (reply_id: any) => {
        return reply?.votesreply?.filter(
            (vote) => vote.reply_id === reply_id && vote.vote_type === 'thumb_down'
        ).length;
    };

    const hasVotedUp = reply?.votesreply?.some(
        (vote) => vote.user_id === user?.id && vote.vote_type === 'thumb_up'
    );
    const hasVotedDown = reply?.votesreply?.some(
        (vote) => vote.user_id === user?.id && vote.vote_type === 'thumb_down'
    );

    return (
        <>
            <div className='flex flex-col'>
                <div
                    onClick={() => mutation.mutate('thumb_up')}
                    className={`
                        ${user?.id === reply.user_id
                            ? 'opacity-20 pointer-events-none'
                            : hasVotedUp
                            ? 'opacity-70 pointer-events-none scale-150 rotate-10 dark:text-yellow-200 text-yellow-900'
                            : 'cursor-pointer transition-transform'}
                    `}
                >
                    <BiLike />
                </div>
                <div>{countThumbsUp(reply?.id)}</div>
            </div>
            <div className='flex flex-col'>
                <div
                    onClick={() => mutation.mutate('thumb_down')}
                    className={`
                        ${user?.id === reply.user_id
                            ? 'opacity-20 pointer-events-none'
                            : hasVotedDown
                            ? 'opacity-70 pointer-events-none scale-150 rotate-10 dark:text-red-300 text-red-900'
                            : 'cursor-pointer transition-transform'}
                    `}
                >
                    <BiDislike />
                </div>
                <div>{countThumbsDown(reply?.id)}</div>
            </div>
        </>
    );
}

export default CreateReplyVote;
