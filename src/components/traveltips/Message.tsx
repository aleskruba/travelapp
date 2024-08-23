import React, {useEffect, useState } from 'react';
import moment from 'moment';
import { FaRegTrashAlt } from "react-icons/fa";
import { GoTriangleDown ,GoTriangleUp } from "react-icons/go";
import { MessageProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { BASE_URL, HTTP_CONFIG, SOCKET_URL} from '../../constants/config';
/* import { motion, useAnimation } from 'framer-motion'; */
import useVote from '../../hooks/useVote';
import { useCountryContext } from '../../context/countryContext';
import { useThemeContext } from '../../context/themeContext';
import { io } from 'socket.io-client';
import ConfirmationModal from '../ConfirmationModal';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import Reply from './Reply';
import CreateReply from './CreateReply';
import CreateMessageVote from './CreateMessageVote';
import { fetchData } from '../../hooks/useFetchData';
import ReactPaginate from 'react-paginate';

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
  
    const ITEMS_PER_PAGE = 4;
    const [currentPage, setCurrentPage] = useState(0);
    const { user} = useAuthContext();
    const { toggleModal } = useThemeContext();
    const [hiddenAnswers,setHiddenAnswes] = useState(true);
    const [selectedReplyDivId, setSelectedReplyDivId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const { chosenCountry } = useCountryContext();
   // const {votes,handleVote,setVotes} = useVote(chosenCountry);
     const [replyDiv, setReplyDiv] = useState(false);

    //const socket = io(SOCKET_URL);
    const imageUrl = message?.user.image ? message?.user.image : '/profile.png';
                
    const handlePageChange = ({ selected }: { selected: number }) => {
      setCurrentPage(selected);
    };
  

/*     const shakeAnimation = {
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
    }; */
    

 /*    useEffect(() => {
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
 */

const handleDeleteMessageClick = (ID: number) => {
      setSelectedMessageId(ID);
      setShowModal(true);
      };
    

    const queryClient = useQueryClient();


  const deleteMessageFunction = async (id:number): Promise<any> => {


    const response = await fetchData(`${BASE_URL}/message/${id}`,'DELETE')

/*    const response = await fetch(`${BASE_URL}/message/${id}`,{
    ...HTTP_CONFIG, 
    method: 'DELETE',
    credentials: 'include',
   }) */
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

const pageCount = Math.ceil(message.reply.length / ITEMS_PER_PAGE);

// Get items for the current page
const startIndex = currentPage * ITEMS_PER_PAGE;
const selectedReplies = message.reply
  .sort((a, b) => b.id - a.id)
  .slice(startIndex, startIndex + ITEMS_PER_PAGE);

return (
  <div
  className='flex flex-col dark:bg-gray-500 dark:text-gray-100 px-4 py-2 shadow-2xl rounded-lg'

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

      <CreateMessageVote
              message={message}/>


          {!replyDiv &&  user?.id !== message.user_id  &&
     <button className='bg-gray-300 text-gray-700 px-4 py-1 text-sm	 rounded-full hover:bg-gray-400 focus:outline-none focus:ring focus:border-gray-500'
             onClick={()=>{setReplyDiv(true);setHiddenAnswes(false);setSelectedReplyDivId(message.id )}} >
        Odpověz
      </button>
      }


</div>
{replyDiv && message.id === selectedReplyDivId &&

<CreateReply 
      setReplyDiv={setReplyDiv}
      message={message}
      setSelectedReplyDivId={setSelectedReplyDivId}

/>
}  
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




  <div className={`transition-wrapper ${!hiddenAnswers ? 'open' : ''} dark:bg-slate-600 bg-slate-200 px-2 rounded-lg`}>
  {selectedReplies.map(r => (
      <Reply 
        key={r.id}
        reply={r}
        message={message}
        allowedToDelete={allowedToDelete}
      />
    ))}

{selectedReplies.length > 0 && 
<ReactPaginate
      previousLabel={'←'}
      nextLabel={'→'}
      disabledClassName={'disabled'}
      breakLabel={'...'}
      breakClassName={'break-me'}
      pageCount={pageCount || 0}
      marginPagesDisplayed={2}
      pageRangeDisplayed={8}
      onPageChange={handlePageChange}
      containerClassName={'pagination flex justify-center mt-8'}
      pageClassName={'page-item'}
      pageLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
      previousClassName={'page-item'}
      previousLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
      nextClassName={'page-item'}
      nextLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
      activeClassName={'active bg-blue-500 text-white'}
    />}
</div>


     <ConfirmationModal
      show={showModal}
      onClose={() => setShowModal(false)}
       onConfirm={()=>{selectedMessageId &&deleteMessageMutation.mutate(selectedMessageId)}}             
      message="Chceš opravdu smazat tuto zprávu?"
    /> 
    </div>
  );
};

export default Message;
