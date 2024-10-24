import { MessageProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { BiLike, BiDislike } from "react-icons/bi";
import { BASE_URL } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCountryContext } from '../../context/countryContext';
import { fetchData } from '../../hooks/useFetchData';

interface Props {
    message: MessageProps;
    currentPage: number;
    currentPageReply: number;
}

function CreateMessageVote({ message, currentPage }: Props) {
    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const { chosenCountry } = useCountryContext();

    const createVote = async (voteType: string) => {
        const newVote = {
            voteType: voteType,
            message_id: message.id,
        };

        const response = await fetchData(`${BASE_URL}/votemessage`, 'PUT', newVote);

        if (!response.ok) {
            throw new Error('Error while sending the vote');
        }

        return response.json();
    };

    const mutation = useMutation({
        mutationFn: createVote,
        onMutate: async (voteType) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: ["messages", chosenCountry, currentPage ],
            });

            // Get the previous messages from the cache
            const previousMessages = queryClient.getQueryData([
                "messages",
                chosenCountry,
                currentPage,
                
            ]);

            // Optimistically update the cache
            queryClient.setQueryData(
                ["messages", chosenCountry, currentPage],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        messages: oldData.messages.map((msg: any) =>
                            msg.id === message.id
                                ? {
                                    ...msg,
                                    votes: [
                                        ...msg.votes.filter((vote: any) => vote.user_id !== user?.id),
                                        { user_id: user?.id, vote_type: voteType, message_id: message.id },
                                    ],
                                }
                                : msg
                        ),
                    };
                }
            );

            // Return context with the previous messages for rollback
            return { previousMessages };
        },
        onError: (err, voteType, context) => {
            // Rollback to previous state if mutation fails
            queryClient.setQueryData(
                ["messages", chosenCountry, currentPage],
                context?.previousMessages
            );
        },
        onSettled: (data, error) => {
            // Invalidate to refetch the data
           if (error) {
            queryClient.invalidateQueries({
                queryKey: ['messages', chosenCountry, currentPage],
            });
          }
        },
    });

    const countThumbsUp = (message_id: any) => {
        return message?.votes?.filter(
            (vote) => vote.message_id === message_id && vote.vote_type === 'thumb_up'
        ).length;
    };

    const countThumbsDown = (message_id: any) => {
        return message?.votes?.filter(
            (vote) => vote.message_id === message_id && vote.vote_type === 'thumb_down'
        ).length;
    };

    const hasVotedUp = message?.votes?.some(
        (vote) => vote.user_id === user?.id && vote.vote_type === 'thumb_up'
    );
    const hasVotedDown = message?.votes?.some(
        (vote) => vote.user_id === user?.id && vote.vote_type === 'thumb_down'
    );

    return (
        <>
            <div className='flex flex-col'>
                <div
                    onClick={() => mutation.mutate('thumb_up')}
                    className={`
                        ${user?.id === message.user_id
                            ? 'opacity-20 pointer-events-none'
                            : hasVotedUp
                            ? 'opacity-70 pointer-events-none scale-150 rotate-10 dark:text-yellow-200 text-yellow-900'
                            : `cursor-pointer transition-transform`}
                    `}
                >
                    <BiLike />
                </div>
                <div>{countThumbsUp(message.id)}</div>
            </div>
            <div className='flex flex-col'>
                <div
                    onClick={() => mutation.mutate('thumb_down')}
                    className={`
                        ${user?.id === message.user_id
                            ? 'opacity-20 pointer-events-none'
                            : hasVotedDown
                            ? 'opacity-70 pointer-events-none scale-150 rotate-10 dark:text-red-300 text-red-900'
                            : `cursor-pointer transition-transform`}
                    `}
                >
                    <BiDislike />
                </div>
                <div>{countThumbsDown(message.id)}</div>
            </div>
        </>
    );
}

export default CreateMessageVote;