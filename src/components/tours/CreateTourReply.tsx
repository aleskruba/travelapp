import React,{useState,FormEvent,useEffect,useRef} from 'react'
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../context/authContext';
import { useTourContext } from '../../context/tourContext';
import { BASE_URL } from '../../constants/config';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiGrin } from "react-icons/bs";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {   initialSingleTourReplyState, TourMessageProps, TourReplyProps } from '../../types';
import { fetchData } from '../../hooks/useFetchData';
import Button from '../customButton/Button';
import socket from '../../utils/socket';
import { travelTipsConstants } from '../../constants/constantsTravelTips';
import { useLanguageContext } from '../../context/languageContext';


interface Props {
    setReplyDiv: React.Dispatch<boolean>; 
    message:TourMessageProps
    currentPage:number;
    setSelectedReplyDivId:React.Dispatch<React.SetStateAction<number | null>>
    tourID:string | undefined;
    deletedMessage: number | null;
}

function CreateTourReply({setReplyDiv,message,currentPage,setSelectedReplyDivId,tourID,deletedMessage}:Props) {
      
      const queryClient = useQueryClient();
       const { user} = useAuthContext();
       const replyEmojiPickerRef = useRef<HTMLDivElement | null>(null);
       const emojiPickerRefButton = useRef<HTMLDivElement | null>(null);
       const [showEmojiPicker, setShowEmojiPicker] = useState(false);
       const [backendError,setBackendError] = useState<string | null>(null);
       const [tourreply, setTourReply] = useState<TourReplyProps>(initialSingleTourReplyState);
        const {isPrivate,setIsPrivate,setPrivateIdsArray} = useTourContext()
        const { language} = useLanguageContext();

       
       useEffect(() => {
        const handleClickOutside = (event:any) => {
          // Check if the clicked target is outside the emoji picker div
          if (replyEmojiPickerRef.current && !replyEmojiPickerRef.current.contains(event.target)
            && emojiPickerRefButton.current && !emojiPickerRefButton.current.contains(event.target)) {
            setShowEmojiPicker(false);
          }
        };
    
        // Add event listener to handle clicks
        document.addEventListener('mousedown', handleClickOutside);
    
        // Cleanup the event listener when the component is unmounted
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [replyEmojiPickerRef]);


      const addEmoji = (event: any) => {
        const sym = event.unified.split("_");
           const codeArray: any[] = [];
      
        sym.forEach((el: any) => {
          codeArray.push("0x" + el);
        });
        let emoji = String.fromCodePoint(...codeArray);
      
         
        setTourReply((prevMessage: any) => ({
          ...prevMessage,
          message: (prevMessage.message || '') + emoji,
        }));
      };
   
      const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const sanitizedMessage = DOMPurify.sanitize(event.target.value);
        setTourReply(prevState => ({
          ...prevState,
          message: sanitizedMessage
        }));
      };
      

      const createReply = async ({ message, message_id, id, isPrivate,user_id,image,firstName }: any) => {

        const data = {
          message,
          message_id,
          id,
          isPrivate,
          user_id,
          user: {
            image, 
            firstName
          }
        };
      

        const response = await fetchData(`${BASE_URL}/tourreply`,'POST',data)

        if (!response.ok) {
          throw new Error('sending message error');
        }
    
        return response.json();
      };

      const createReplyMutation = useMutation({
        mutationFn: createReply,
        onMutate: async (newMessage) => {
          // Cancel any outgoing queries to prevent them from overwriting optimistic update
 await queryClient.cancelQueries({ queryKey: ['tourmessages', currentPage] });

 const previousMessages = queryClient.getQueryData(['tourmessages', currentPage]);

 // Optimistically update the cache with the new message and sort by id
 queryClient.setQueryData(['tourmessages', currentPage], (old: any) => {
   if (!old) return old;

   // Map through existing messages and update the reply array in the matching message
   const updatedMessages = old.tourmessages.map((mes: any) => {
       if (mes.id === message.id) {
           return {
               ...mes,
               tourreply: [...mes.tourreply, newMessage], // Add the newMessage to the reply array
           };
       }
       return mes; // Return other messages unchanged
   });

   // Return the updated object with modified messages array
   return {
       ...old,
       tourmessages: updatedMessages,
   };
});


 // Return the context with the previous messages for rollback
 return { previousMessages };
},
onSuccess: (data, variables) => {
 backendError && setBackendError(null);
 setTourReply(initialSingleTourReplyState);


 queryClient.setQueryData(['tourmessages', currentPage], (old: any) => {
   if (!old) return old;

   const updatedMessages = old.tourmessages.map((msg: any) => {
       // Only update the message that matches message.id
       if (msg.id === message.id) {
           // Map through replies to find and update the specific reply

            const updatedReplies = msg.tourreply.map((rep: any) => {
              if (rep.id === variables.id) {
                // Update the reply and set the private IDs array state
                if (isPrivate === 1){
                  setPrivateIdsArray((prevIds) => [...prevIds, data.message.id]);
                }

                const socketMessage = {
                  ...data.message,
                    user: { 
                    image: user?.image, 
                    firstName: user?.firstName 
                  },
                         };
               console.log('socketMessage',data.message);
               socket.emit('send_reply_tour', { tourreply: socketMessage ,tour_room:tourID,receiver_id:message.user_id});
                return { ...rep, id: data.message.id };
              }
              return rep;
            });

           // Return the updated message with the modified replies array
           return { ...msg, tourreply: updatedReplies };
       }
       // Return the message as-is if it doesn't match the target message.id
       return msg;
   });

   // Return the updated old object with the modified messages array
   setIsPrivate(0)
   return { ...old, tourmessages: updatedMessages };
});


},


onError: (err, context) => {
 setBackendError(travelTipsConstants.somethingWentWrong[language])
 queryClient.setQueryData(['tourmessages', currentPage], context?.previousMessages);
 console.log(err)
},
onSettled: (data, error) => {

  if (error ) {
 queryClient.invalidateQueries({ queryKey: ['tourmessages', currentPage] });
 }
},
      });

      const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setReplyDiv(false);
        if (isPrivate) {console.log('isPrivate')}
        const tempId = Date.now();
        if (user) {
/*         const newReply = { ...reply, user_id: user.id, 
                                     message_id: message.id }; */
        
        const newReply = {                                     
                                    id: tempId,  
                                    message:tourreply.message, 
                                    message_id: message.id,
                                    user_id: user.id,
                                    isPrivate:isPrivate,
                                      user: { 
                                        image: user.image, 
                                        firstName: user.firstName 
                                      }
                                                                     };
    
        try {
          createReplyMutation.mutate(newReply);
 
        } catch (e) {
          console.error(e);
        }
  
      }
      };


  return (
   
    <form onSubmit={handleSubmit} className='w-full '>
    <div className="flex flex-col items-center space-y-4 mt-4 ">
      <div className='relative w-full '>
    <textarea
      name="reply"
      value={tourreply.message}
      onChange={handleChange}
      className="w-full min-h-[100px] py-2 pl-2 pr-6 bg-gray-200 dark:text-black rounded-lg focus:outline-none focus:ring focus:border-blue-500 resize-none"
      style={{ maxWidth: '100%', overflowWrap: 'break-word' }}
      placeholder={travelTipsConstants.messageplaceholder[language]}
      maxLength={400} 
    />
           <div className={tourreply.message.length >= 400 ? 'hidden' :'absolute bottom-4 right-5 dark:text-black text-xl cursor-pointer '}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            ref={emojiPickerRefButton}
            ><BsEmojiGrin /></div> 
        </div>
    <div className={showEmojiPicker ? 'hidden':"flex justify-center items-center gap-16"}>
      
      <div className='flex gap-1'>


         <Button 
              type="submit"   
              color='green'
              className={`${!tourreply.message.length || deletedMessage === message.id ? 'opacity-30 cursor-default pointer-events-none': '' } rounded-md shadow-md w-[100px]  focus:ring `}
             >
              
              {travelTipsConstants.send[language]}
          </Button>

      <div className="flex items-center ">
      <input
          type="checkbox"
          id="privateCheckbox"
          disabled={deletedMessage === message.id}
          className="w-8 h-8  bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          onChange={(e) => setIsPrivate(e.target.checked ? 1 : 0)} // Set to 1 if checked, 0 if not
        />
          <label htmlFor="privateCheckbox" className="ml-2 ">
            Private
          </label>
        </div>
        </div>

          <Button 
       
              color='gray'
              className={` ${deletedMessage === message.id ? 'opacity-30 cursor-default pointer-events-none' : '' } rounded-md shadow-md w-[100px] focus:ring `}
              onClick={() => {setReplyDiv(false);setSelectedReplyDivId(null)}}
             >
              
              {travelTipsConstants.back[language]}
          </Button>

    </div>
  </div>
  <div>    {backendError && <div className=" w full text-base font bold dark:text-red-200 text-red-800 mt-2 mb-2 px-2 text-center rounded">{backendError} </div>}
</div>
  <div className='flex justify-center mt-2 '  ref={replyEmojiPickerRef}>

  {showEmojiPicker && tourreply.message.length < 400 && (
       <Picker
             data={data}
        onEmojiSelect={addEmoji}
        
   />
    )}
</div>
{tourreply.message.length >= 400  &&
    <p className='text-red-800 dark:text-red-200 text-center'>   {travelTipsConstants.tooLongMessage[language]}</p>
   }

  </form>

  )
}

export default CreateTourReply