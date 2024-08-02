import React, { useState } from 'react'
import { MessageProps, ReplyProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { useThemeContext } from '../../context/themeContext';
import { useCountryContext } from '../../context/countryContext';
import { FaRegTrashAlt } from "react-icons/fa";
import { BiLike,BiDislike  } from "react-icons/bi";
import moment from 'moment';
import useVote from '../../hooks/useVote';
import { useNavigate  } from 'react-router-dom';
import { io } from 'socket.io-client';
import { BASE_URL, HTTP_CONFIG, SOCKET_URL} from '../../constants/config';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../ConfirmationModal';

type Props = {
  reply: ReplyProps;
  message: MessageProps;
  allowedToDelete:boolean
};

const Reply: React.FC<Props> = ( {reply,message,allowedToDelete}) => {

  const { user} = useAuthContext();
  const { toggleModal } = useThemeContext();
  const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { chosenCountry } = useCountryContext();
 // const {  votes,votesReply,handleVoteReply,setVotesReply} = useVote(chosenCountry);
  const [likedReply, setLikedReply] = useState(false);
  const [dislikedReply, setdisLikedReply] = useState(false);
  const navigate = useNavigate();
  //const socket = io(SOCKET_URL);

  const imageUrl = reply?.user.image ? reply?.user.image : '/profile.png';

  const currentDate = moment();
  const replyDate = moment(reply.date);
  const diffMinutes = currentDate.diff(replyDate, 'minutes');
  const diffDays = currentDate.diff(replyDate, 'days');
  const diffMonths = currentDate.diff(replyDate, 'months');
  let displayText;

  if (diffMinutes < 1) {
    displayText = 'před chvílí';
  } else if (diffDays === 0) { // Check if it's today
    displayText = 'dnes';
  } else if (diffDays === 1) { // Check if it's yesterday
    displayText = 'vcera';
  } else if (diffDays > 1) { // Check for other past days
    displayText = `pred ${diffDays} dny`;
  } else if (diffMonths === 1) { // Check if it's one month ago
    displayText = 'pred mesicem';
  } else if (diffMonths > 1) { // Check for other past months
    displayText = `pred ${diffMonths} mesici`;
  } else { // For dates in the future or more than a day ago
    displayText = moment(reply.date).format('YY DD-MM HH:mm');
  }

  const handleDeleteClick = (ID: number) => {  
    console.log(ID)
    setSelectedReplyId(ID);
    setShowModal(true);
  };


  const queryClient = useQueryClient();

  const deleteMessageFunction = async (id:number): Promise<any> => {

    const response = await fetch(`${BASE_URL}/reply/${id}`,{
     ...HTTP_CONFIG, 
     method: 'DELETE',
     credentials: 'include',
    })
    queryClient.invalidateQueries({queryKey: ['messages',chosenCountry]});
 
    if (!response.ok) {
     throw new Error('Chyba při odeslaní zprávy');
   }
   const data = response.json();
   return data;
   }
 
   
   const deleteMessageMutation = useMutation({
     mutationFn: deleteMessageFunction,
     onSuccess: () => {
       queryClient.invalidateQueries({queryKey: ['messages',chosenCountry]});
       setShowModal(false)
     }
   });
 
 
 

/*   const handleVoteClickReply = async (voteType: 'thumb_up' | 'thumb_down',reply_id:any,message_id:any) => {

    if (!user) {
      navigate('/login')
  
    } 
    
    if (voteType === 'thumb_up') {
      setLikedReply(true);
      setTimeout(() => {
        setLikedReply(false);
      }, 500); 
    }
    if (voteType === 'thumb_down') {
      setdisLikedReply(true);
      setTimeout(() => {
        setdisLikedReply(false);
      }, 500); 
    }
  
    try {
      handleVoteReply(voteType,reply_id,message_id);
  
      const newValue = votesReply.map(vote => {
        if (vote.reply_id === reply_id && vote.user_id === user?.id) {
          return { ...vote, vote_type: voteType };
        }
        return vote;
      });
      
      const voteExists = votesReply.some(vote => vote.reply_id === reply_id && vote.user_id === user?.id);
      
      if (!voteExists && user) {
        newValue.push({
          reply_id:reply_id,
          message_id: message_id,
          user_id: user?.id ,
          vote_type: voteType,
        });
      }
      
      setVotesReply(newValue);
      
  
      // Optionally, update state or UI after voting
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };
  
  
  const countThumbsUp = (message_id:any) =>{
    let counter = 0;
    votes.forEach(vote => {
      if (vote.message_id === message_id && vote.vote_type === 'thumb_up') {
              counter++
            }
        }) ;
    return counter 
  }
  
  const countThumbsDown = (message_id:any) =>{
    let counter = 0;
    votes.forEach(vote => {
      if (vote.message_id === message_id && vote.vote_type === 'thumb_down') {
              counter++
            }
          }) ;
    return counter 
  }

  const countThumbsUpReply = (reply_id:any) =>{
    let counter = 0;
    votesReply.forEach(vote => {
      if (vote.reply_id === reply_id && vote.vote_type === 'thumb_up') {
              counter++
            }
        }) ;
    return counter 
  }
  
  const countThumbsDownReply = (reply_id:any) =>{
    let counter = 0;
    votesReply.forEach(vote => {
      if (vote.reply_id === reply_id && vote.vote_type === 'thumb_down') {
              counter++
            }
          }) ;
    return counter 
  } */



  return (
    <div   className={`shadow-xl rounded-lg transition-opacity duration-1000 opacity-100'}`}>
    <div key={reply.id} className='flex flex-col  pt-2  border-t border-gray-400 dark:text-gray-100 relative'>
      <div className={`flex items-center gap-6 md:gap-2  cursor-pointer mt-1 ${reply.user_id ===  user?.id ? 'pl-1': 'p3-6' }`}>
        {reply.user_id === user?.id &&
          <div className="text-red-500 hover:text-red-300  absolute  top-3 right-1" onClick={() => handleDeleteClick(reply.id)}>
         {allowedToDelete &&  <FaRegTrashAlt />}
          </div>
        }
      <div className={'w-14 h-14 overflow-hidden rounded-full cursor-pointer'}
        onClick={() => toggleModal(imageUrl)}>
        <img
          src={imageUrl ? imageUrl : 'profile.png' }
          alt="Profile"
          className="w-full z-30 h-full object-cover"
        />


        </div>
        <div className="flex gap-1 ">
        <p className={` ${reply.user_id ===  user?.id ? 'text-red-600 dark:text-red-200' : 'text-gray-600 dark:text-gray-100' }  font-bold  `}>{reply.user.firstName ? reply.user.firstName.slice(0, 10) : '' }</p>
        <p className="text-gray-600  dark:bg-gray-500 dark:text-gray-100 italic"> {displayText}</p>
        </div>
      </div>
     
      <div className="md:pl-14 break-all" >
        <p className={` ${reply.user_id ===  user?.id ? 'text-red-600 dark:text-red-200'  : 'text-gray-600 dark:text-gray-100' }`}>{reply.message}</p>
     </div>

  </div>
    
 {/*    <div className='flex gap-4 md:pl-14'>
      <div className='flex flex-col'>         
        <div onClick={() => handleVoteClickReply('thumb_up',reply.id,message.id)} 
                 className={`
              ${user?.id === reply.user_id ? 'opacity-20 pointer-events-none' : `cursor-pointer transition-transform
                ${likedReply 
                                   ? 'scale-150 rotate-10 ' 
                                   : 'scale-100 rotate-0 '}
                `}
     
       
            `} >
          
          <BiLike /></div>
           
        <div>{ countThumbsUpReply(reply.id)}</div>
      </div>
      <div className='flex flex-col'>    
        <div onClick={() => handleVoteClickReply('thumb_down',reply.id,message.id)} 
              className={`
                ${user?.id === reply.user_id ? 'opacity-20 pointer-events-none' : `cursor-pointer transition-transform
                  ${dislikedReply 
                                     ? 'scale-150 rotate-10 ' 
                                     : 'scale-100 rotate-0 '}
                  `}
       
         
              `} >
          
          <BiDislike /></div>
    
        <div>{countThumbsDownReply((reply.id))}</div>
      </div>
    </div> */}

    
  <ConfirmationModal
      show={showModal}
      onClose={() => setShowModal(false)}
       onConfirm={()=>{selectedReplyId &&deleteMessageMutation.mutate(selectedReplyId)}}             
      message="Chceš opravdu smazat tuto zprávu?"
    /> 
    
  </div>
  )
}

export default Reply