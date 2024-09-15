import React,{useState,FormEvent,useEffect,useRef} from 'react'
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../context/authContext';
import { useCountryContext } from '../../context/countryContext';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiGrin } from "react-icons/bs";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  initialSingleReplyState, MessageProps, ReplyProps } from '../../types';
import { fetchData } from '../../hooks/useFetchData';

  interface Props {
    setReplyDiv: React.Dispatch<boolean>; 
    message:MessageProps
    currentPage:number;
    setSelectedReplyDivId:React.Dispatch<React.SetStateAction<number | null>>
    currentPageReply:number
}

function CreateReply({setReplyDiv,message,currentPage,setSelectedReplyDivId,currentPageReply}:Props) {
      
      const queryClient = useQueryClient();
       const { user} = useAuthContext();
       const { chosenCountry } = useCountryContext();
       const replyEmojiPickerRef = useRef<HTMLDivElement | null>(null);
       const emojiPickerRefButton = useRef<HTMLDivElement | null>(null);
       const [showEmojiPicker, setShowEmojiPicker] = useState(false);
       const [backendError,setBackendError] = useState<string | null>(null);
       const [reply, setReply] = useState<ReplyProps>(initialSingleReplyState);
  

       
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
      
         
        setReply((prevMessage: any) => ({
          ...prevMessage,
          message: (prevMessage.message || '') + emoji,
        }));
      };
   
      const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const sanitizedMessage = DOMPurify.sanitize(event.target.value);
        setReply(prevState => ({
          ...prevState,
          message: sanitizedMessage
        }));
      };
      

      const createReply = async ({ message, message_id, id, user_id,image,firstName }: any) => {

        const data = {
          message,
          message_id,
          id,
          user_id,
          user: {
            image, 
            firstName
          }
        };
      

        const response = await fetchData(`${BASE_URL}/reply`,'POST',data)

        if (!response.ok) {
          throw new Error('Chyba při odeslaní zprávy');
        }
    
        return response.json();
      };

      const createReplyMutation = useMutation({
        mutationFn: createReply,
        onMutate: async (newMessage) => {
          // Cancel any outgoing queries to prevent them from overwriting optimistic update
          await queryClient.cancelQueries({ queryKey: ['messages', chosenCountry, currentPage,currentPageReply] });
      
          // Get the previous messages
          const previousMessages = queryClient.getQueryData(['messages', chosenCountry, currentPage,currentPageReply]);
      
          // Optimistically update the cache with the new message and sort by id
          queryClient.setQueryData(['messages', chosenCountry, currentPage,currentPageReply], (old: any) => {
            // Update only the reply of the specific message by ID
            const updatedMessages = (old?.messages || []).map((mes: any) => {
              if (mes.id === message.id) {
                console.log(message);
                // Update the reply array for the message with matching ID
                return {
                  ...mes,
                  reply: [...(mes.reply || []), newMessage], // Add the newMessage object to the reply array
                };
              }
              return mes; // Return other messages unchanged
            });
          
            return {
              ...old,
              messages: updatedMessages,
            };
          });
      
          // Return the context with the previous messages for rollback
          return { previousMessages };
        },
        onSuccess: () => {
           backendError && setBackendError(null)
          queryClient.invalidateQueries({queryKey: ['messages',chosenCountry,currentPage,currentPageReply]});
          setReply(initialSingleReplyState);
           setReplyDiv(false) 
        },
        onError: (err, newMessage, context) => {
          setBackendError('Něco se pokazilo, zpráva nebyla vytvořena')
         },
        onSettled: () => {
          // Always refetch the messages to sync with the server
          queryClient.invalidateQueries({ queryKey: ['messages', chosenCountry,currentPage,currentPageReply] });
        },
      });

      const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const tempId = Date.now();
        if (user) {
/*         const newReply = { ...reply, user_id: user.id, 
                                     message_id: message.id }; */
        
        const newReply = {                                     
                                    id: tempId,  
                                    message:reply.message, 
                                    message_id: message.id,
                                    user_id: user.id,
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
      value={reply.message}
      onChange={handleChange}
      className="w-full min-h-[100px] py-2 pl-2 pr-6 bg-gray-200 dark:text-black rounded-lg focus:outline-none focus:ring focus:border-blue-500 resize-none"
      style={{ maxWidth: '100%', overflowWrap: 'break-word' }}
      placeholder="Sdlej svůj názor (max 400 znaků)"
      maxLength={400} 
    />
           <div className={reply.message.length >= 400 ? 'hidden' :'absolute bottom-4 right-5 dark:text-black text-xl cursor-pointer '}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            ref={emojiPickerRefButton}
            ><BsEmojiGrin /></div> 
        </div>
    <div className={showEmojiPicker ? 'hidden':"flex justify-center space-x-4"}>
      
 
        <button
          type="submit"
          className={`${
            !reply.message.length
              ? 'bg-blue-500 opacity-30 pointer-events-none'
              : 'bg-blue-500 hover:bg-blue-600'
          } w-[80px] text-white py-2 px-4 rounded-md focus:outline-none focus:ring focus:border-blue-700`}
        >
          Odešli
      </button>
      <button className="bg-gray-300 w-[80px] text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:border-gray-500" 
              onClick={() => {setReplyDiv(false);setSelectedReplyDivId(null)}}
              type='button'>
        Zpět
      </button>

    </div>
  </div>
  <div>    {backendError && <div className=" w full text-base font bold dark:text-red-200 text-red-800 mt-2 mb-2 px-2 text-center rounded">{backendError} </div>}
</div>
  <div className='flex justify-center mt-2 '  ref={replyEmojiPickerRef}>

  {showEmojiPicker && reply.message.length < 400 && (
       <Picker
             data={data}
        onEmojiSelect={addEmoji}
        
   />
    )}
</div>
{reply.message.length >= 400  &&
    <p className='text-red-800 dark:text-red-200 text-center'>Zpráva je příliš dlouhá !!!!!</p>
   }

  </form>

  )
}

export default CreateReply