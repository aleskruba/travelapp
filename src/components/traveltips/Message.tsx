import React, {useEffect, useState } from 'react';
import { BiLike,BiDislike  } from "react-icons/bi";
import moment from 'moment';
import { FaRegTrashAlt } from "react-icons/fa";
import { GoTriangleDown ,GoTriangleUp } from "react-icons/go";
import { MessageProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { BASE_URL, HTTP_CONFIG, SOCKET_URL} from '../../constants/config';
import { motion, useAnimation } from 'framer-motion';
import useVote from '../../hooks/useVote';
import { useCountryContext } from '../../context/countryContext';
import { useThemeContext } from '../../context/themeContext';
import { useNavigate  } from 'react-router-dom';
import { io } from 'socket.io-client';
import ConfirmationModal from '../ConfirmationModal';
import { useMutation,useQueryClient } from '@tanstack/react-query';

import Reply from './Reply';

type Props = {
  message: MessageProps;
  allowedToDelete:boolean
  isSubmitted:boolean
};

const Message: React.FC<Props> = ( {
                                    message,
                                    allowedToDelete,
                                    isSubmitted
                           }) => {

  const { user} = useAuthContext();
  const { toggleModal } = useThemeContext();
    const [hiddenAnswers,setHiddenAnswes] = useState(true);
    const [deleted, setDeleted] = useState(false);
    const controls = useAnimation();
    const[deletedReply,setDeletedReply] = useState<number | null>(null);
    const [selectedReplyDivId, setSelectedReplyDivId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const { chosenCountry } = useCountryContext();
   // const {votes,handleVote,setVotes} = useVote(chosenCountry);
    const [liked, setLiked] = useState(false);
    const [disliked, setdisLiked] = useState(false);
    const [replyDiv, setReplyDiv] = useState(false);
    const navigate = useNavigate();
    //const socket = io(SOCKET_URL);
    const imageUrl = message?.user.image ? message?.user.image : '/profile.png';
                

    const shakeAnimation = {
      shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      },
      fadeOut: {
        opacity: 0,
        transition: { duration: 1 }
      },
      visible: {
        opacity: 1,
     
      }
    };
    

    useEffect(() => {
      if (deleted) { // If deleted is true, start the animation sequence
        controls.start("shake").then(() => {
          controls.start("fadeOut").then(() => {
            // Reset deleted state and trigger the visible animation after fadeOut completes
            setDeleted(false);
            controls.start("visible");
          });
        });
      }
    }, [deleted, controls]);


const handleDeleteMessageClick = (ID: number) => {
      setSelectedMessageId(ID);
      setShowModal(true);
      };
    

    const queryClient = useQueryClient();


  const deleteMessageFunction = async (id:number): Promise<any> => {

   const response = await fetch(`${BASE_URL}/message/${id}`,{
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





/* const handleVoteClick = async (voteType: 'thumb_up' | 'thumb_down',message_id:any) => {

  if (!user) {
    navigate('/login')

  } 

  if (voteType === 'thumb_up') {
  setLiked(true);
  setTimeout(() => {
    setLiked(false);
  }, 500); 
}
else if (voteType === 'thumb_down') {
  setdisLiked(true);
  setTimeout(() => {
    setdisLiked(false);
  }, 500); 
}

  try {
    handleVote(voteType,message_id);

    const newValue = votes.map(vote => {
      if (vote.message_id === message_id && vote.user_id === user?.id) {
        return { ...vote, vote_type: voteType };
      }
      return vote;
    });
    
    const voteExists = votes.some(vote => vote.message_id === message_id && vote.user_id === user?.id);
    
    if (!voteExists && user) {
      newValue.push({
        message_id: message_id,
        user_id: user?.id ,
        vote_type: voteType,
      });
    }
    
    setVotes(newValue);
    

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
 */

return (
  <motion.div
  className='flex flex-col dark:bg-gray-500 dark:text-gray-100 px-4 py-2 shadow-2xl rounded-lg'
  animate={controls}
  variants={shakeAnimation}
> 


    <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-auto">
      <div className="flex  items-center gap-2"> 
         {message.user_id === user?.id &&
                 
                 <div className={`${!isSubmitted && allowedToDelete ? '' : 'pointer-events-none '} absolute top-1 right-1 min-w-[25px] text-red-500  cursor-pointer hover:text-red-300`} 
                      onClick={ ()=>handleDeleteMessageClick(message.id)}
                      >
            <FaRegTrashAlt /> 
                  </div>
                  }
      <div
          className={'w-14 h-14 overflow-hidden rounded-full cursor-pointer'}
          onClick={() => toggleModal(imageUrl)}
         >
        <img src={imageUrl} alt="Profile" className='w-full h-full object-cover'/>
      </div>
    


        <div className="flex flex-row gap-4 md:gap-2"> 
        <p className="text-gray-600 dark:bg-gray-500 dark:text-gray-100 font-semibold">{message?.user.firstName?.slice(0, 10)}</p>
        <p className="text-gray-600 dark:bg-gray-500 dark:text-gray-100  shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
      {moment(message.date).format('DD-MM YYYY ')}</p>

     
        </div>
      </div>
        <div className="md:px-4 pt-4 break-all" >
          <p className="">{message.message} </p>
      </div>
     </div>
    


 
     <div className='flex  gap-2 flex-col md:flex-row '>
   
     <div className='flex gap-4  '>
        {/*   <div className='flex flex-col'>         
            <div onClick={() => handleVoteClick('thumb_up',message.id)} 
            className={`
              ${user?.id === message.user_id ? 'opacity-20 pointer-events-none' : `cursor-pointer transition-transform
                ${liked 
                                   ? 'scale-150 rotate-10 ' 
                                   : 'scale-100 rotate-0 '}
                `}
     
       
            `} >
            
                        
                    
              
  
              <BiLike />

              </div>
               
            <div>{ countThumbsUp(message.id)}</div>
          </div> */}
     {/*      <div className='flex flex-col'>    
            <div onClick={() => handleVoteClick('thumb_down',message.id)} 
                 className={`
                  ${user?.id === message.user_id ? 'opacity-20 pointer-events-none' : `cursor-pointer transition-transform
                    ${disliked 
                                       ? 'scale-150 rotate-10 ' 
                                       : 'scale-100 rotate-0 '}
                    `}
         
           
                `} >
                
              <BiDislike /></div>
        
            <div>{countThumbsDown((message.id))}</div>
          </div> */}


          {!replyDiv &&  user?.id !== message.user_id  &&
     <button className='bg-gray-300 text-gray-700 px-4 py-1 text-sm	 rounded-full hover:bg-gray-400 focus:outline-none focus:ring focus:border-gray-500'
             onClick={()=>{setReplyDiv(true);setHiddenAnswes(false);setSelectedReplyDivId(message.id )}} >
        Odpověz
      </button>
      }


</div>

  
    </div>
    
    <div className='flex gap-4' onClick={()=>setHiddenAnswes(!hiddenAnswers)}>
        {message.reply.filter(r => r.message_id === message.id).length > 0 && <>
          {hiddenAnswers ?
          <GoTriangleDown />
            :
          <GoTriangleUp />
      }
      </>}

      <h4 className='text-sm font-bold cursor-pointer'>
  {message.reply.filter(r => r.message_id === message.id).length > 1 ? 
    `${message.reply.filter(r => r.message_id === message.id).length} odpovědí`   
    :
    message.reply.filter(r => r.message_id === message.id).length > 0 ?
      `${message.reply.filter(r => r.message_id === message.id).length} odpověď`
      :
      ''
  }
</h4>      
  </div>




<div className={`${hiddenAnswers ? 'hidden' : 'block'}`}>
 {message.reply.sort((a, b) => b.id - a.id).map(r=>{
 
  return (
    <Reply 
      key={r.id}
      reply={r}
      message={message}
      allowedToDelete={allowedToDelete}/>
  )
 })}

</div>


     <ConfirmationModal
      show={showModal}
      onClose={() => setShowModal(false)}
       onConfirm={()=>{selectedMessageId &&deleteMessageMutation.mutate(selectedMessageId)}}             
      message="Chceš opravdu smazat tuto zprávu?"
    /> 
    </motion.div>
  );
};

export default Message;
