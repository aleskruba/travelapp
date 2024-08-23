import {  MessageProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { BiLike,BiDislike  } from "react-icons/bi";
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCountryContext } from '../../context/countryContext';
import { fetchData } from '../../hooks/useFetchData';

interface Props {
    message:MessageProps
}

function CreateMessageVote({message}:Props) {

    const queryClient = useQueryClient();
    const {user} = useAuthContext();
    const {chosenCountry} = useCountryContext();

    const createVote = async (voteType:string) => {

      const newVote = {
          voteType: voteType,
          message_id: message.id
      };
    
      const response = await fetchData(`${BASE_URL}/votemessage`,'PUT',newVote)

/*       const response = await fetch(`${BASE_URL}/votemessage`, {
          ...HTTP_CONFIG,
          method: 'PUT',
          body: JSON.stringify(newVote),
          credentials: 'include',
      }); */
    
      if (!response.ok) {
          throw new Error('Error while sending the message');
      }
    
      return response.json();
    }

    const mutation = useMutation({
      mutationFn: createVote,
      onSuccess: (data) => {
        queryClient.invalidateQueries({queryKey: ['messages',chosenCountry]});
        console.log('success', data);
      },
      onError: (error) => {
        console.log(`error `,error)
      },
    })

    const countThumbsUp = (message_id:any) =>{
        let counter = 0;
        message.votes.forEach(vote => {
          if (vote.message_id === message_id && vote.vote_type === 'thumb_up') {
                  counter++
                }
            }) ;
        return counter 
      }
      
      const countThumbsDown = (message_id:any) =>{
        let counter = 0;
        message.votes.forEach(vote => {
          if (vote.message_id === message_id && vote.vote_type === 'thumb_down') {
                  counter++
                }
              }) ;
        return counter 
      } 
      const hasVotedUp = message.votes.some(vote => vote.user_id === user?.id && vote.vote_type === 'thumb_up');
      const hasVotedDown = message.votes.some(vote => vote.user_id === user?.id && vote.vote_type === 'thumb_down');

    return (
    
    <>
    <div className='flex flex-col'>         
            <div onClick={() => mutation.mutate('thumb_up')} 
            className={`
              ${user?.id === message.user_id ? 'opacity-20 pointer-events-none' : hasVotedUp ? 'opacity-70 pointer-events-none scale-150 rotate-10  dark:text-yellow-200 text-yellow-900' : `cursor-pointer transition-transform
                         `}`} >
             <BiLike />

            </div>
               
  <div>{ countThumbsUp(message.id)}</div> 
          </div> 
          <div className='flex flex-col'>    
            <div onClick={() => mutation.mutate('thumb_down')} 
                 className={`
                  ${user?.id === message.user_id  ? 'opacity-20 pointer-events-none' : hasVotedDown ? 'opacity-70 pointer-events-none scale-150 rotate-10  dark:text-red-300 text-red-900' : `cursor-pointer transition-transform
                    `} `} >
                
              <BiDislike />
          </div>
      
            <div>{countThumbsDown((message.id))}</div> 
          </div> 
  
          </>
  )
}

export default CreateMessageVote