import React, { FormEvent, useState, useEffect ,useRef } from 'react';
import {  initialTourMessageState,  TourMessageProps, UserProps } from '../../types';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { BsEmojiGrin } from "react-icons/bs";
import DOMPurify from 'dompurify';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../customButton/Button';
import lide from "../../assets/images/lide.svg"
import socket from '../../utils/socket';
import { travelTipsConstants } from '../../constants/constantsTravelTips';
import { useLanguageContext } from '../../context/languageContext';


interface CreateTourMessageProps {
  user: UserProps;
  currentPage:number;
  tourID:string | undefined;
}

const CreateTourMessage: React.FC<CreateTourMessageProps> = ({ user, currentPage,tourID }) => {
  const queryClient = useQueryClient();
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRefButton = useRef<HTMLDivElement | null>(null);
  const emojiPickerRefButtonSM = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState<TourMessageProps>(initialTourMessageState);
   const [backendError,setBackendError] = useState<string | null>(null);
   const { language} = useLanguageContext();

  useEffect(() => {
    const handleClickOutside = (event:any) => {
      // Check if the clicked target is outside the emoji picker div
      if ( emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) 
        && emojiPickerRefButton.current && !emojiPickerRefButton.current.contains(event.target)
        && emojiPickerRefButtonSM.current && !emojiPickerRefButtonSM.current.contains(event.target)
    ) {
        setShowEmojiPicker(false);
      }
    };

    // Add event listener to handle clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [emojiPickerRef]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedMessage = DOMPurify.sanitize(event.target.value);
    setMessage({ ...message, [event.target.name]: sanitizedMessage });
    
  };


  const addEmoji = (event: any) => {
    const sym = event.unified.split("_");
    const codeArray: any[] = [];

    sym.forEach((el: any) => {
      codeArray.push("0x" + el);
    });

    let emoji = String.fromCodePoint(...codeArray);

    setMessage((prevMessage: any) => ({
      ...prevMessage,
      message: (prevMessage.message || '') + emoji,
    }));
  };

  useEffect(() => {
    setShowEmojiPicker(false);
  }, []);

  const createMessage = async ({ message, id, user_id,image,firstName }: any) => {
    const data = {
      message,
      id,
      user_id,
      user: {
        image, 
        firstName
      }
    };
  

  
    try {
      const response = await fetch(`${BASE_URL}/tourmessage/${tourID}`, {
        ...HTTP_CONFIG,
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Error occurred while sending message');
      }
  
      const responseData = await response.json();

  
      return responseData;
    } catch (error) {
 
      console.error('Error in createMessage:', error);
      throw error;  // Ensure the error is propagated to the mutation's `onError`
    }
  };



  const createMessageMutation = useMutation({
    mutationFn: createMessage,
    onMutate: async (newMessage) => {
      // Cancel any outgoing queries to prevent them from overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['tourmessages', currentPage] });
  
      // Get the previous messages
      const previousMessages = queryClient.getQueryData(['tourmessages',  currentPage]);
  
      // Optimistically update the cache with the new message and sort by id
      queryClient.setQueryData(['tourmessages',  currentPage], (old: any) => {
        // Create a new array with the new message added
        const updatedMessages = [...(old?.tourmessages || []), newMessage];
        
        // Sort messages by ID to ensure proper order
        updatedMessages.sort((a: { id: number }, b: { id: number }) => b.id - a.id);
     //   console.log(updatedMessages)
        return {
          ...old,
          tourmessages: updatedMessages,
        };
      });
  
      // Return the context with the previous messages for rollback
      return { previousMessages };
    },
    onSuccess: (data, variables) => {
      backendError && setBackendError(null)
      setMessage(initialTourMessageState);
      queryClient.setQueryData(['tourmessages', currentPage], (old: any) => {
        if (!old) return old;
   /*      old.tourmessages.map((msg: any) => {
          console.log(msg.id, variables.id);
        })
      */
        const updatedMessages = old.tourmessages.map((msg: any) => 
          msg.id === variables.id ? { ...msg, id: data.message.id } : msg
        );


        const socketMessage = {
          ...data.message,
          user: { 
            image: user.image, 
            firstName: user.firstName 
          },
          tourreply:[]
        };
        console.log(socketMessage);
        socket.emit('send_message_tour', { message: socketMessage, tour_room:tourID});
        
        return { ...old, tourmessages: updatedMessages };
      });

    },
    onError: (err, newMessage, context) => {
      setBackendError(travelTipsConstants.somethingWentWrong[language])
      queryClient.setQueryData(['tourmessages',  currentPage], context?.previousMessages);
    },
    onSettled: (data, error) => {
      // Only refetch if there's an error
      if (error) {
        queryClient.invalidateQueries({ queryKey: ['tourmessages',  currentPage] });
      }
    },
  });
  
  //console.log(createMessageMutation.variables)
  

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tempId = Date.now();
    const newMessage = {          message:message.message, 
                                  id: tempId,
                                  user_id: user.id,
                                  user: { 
                                    image: user.image, 
                                    firstName: user.firstName 
                                  }
                                };

    try {
 
      createMessageMutation.mutate(newMessage);
    } catch (e) {
      console.error(e);
    }
  };

    return (
      <div className='flex flex-col '>
  <form onSubmit={handleSubmit}>

    <div className="flex justify-between items-center dark:text-lighTextColor gap-4 bg-gray-100 px-2 py-2 md:rounded-lg shadow-md mt-2">
      <div className="flex items-center gap-2"> 
        <div className="w-14 h-14 overflow-hidden rounded-full">
          <img src={user?.image ?? lide} alt="Profile" className="w-full h-full object-cover" />
        </div>
       </div>
      <div className="flex-1 hidden md:flex relative">
      <textarea
  name="message"
  value={message.message}
  onChange={handleChange}
  className="w-full min-h-28 py-2 pl-2 pr-10 bg-gray-200 dark:text-black rounded-lg focus:outline-none focus:ring focus:border-blue-500 resize-none"
  style={{ maxWidth: '100%', overflowWrap: 'break-word' }}  
  placeholder={travelTipsConstants.messageplaceholder[language]}
  maxLength={400}
/>
       <div className={message.message.length >= 400  ? 'hidden' : `absolute bottom-2  right-5 dark:text-black text-xl cursor-pointer `} 
            onClick={ () => setShowEmojiPicker(!showEmojiPicker)}
            ref={emojiPickerRefButton}
         ><BsEmojiGrin /></div> 

      </div>
   
      <div className='flex flex-col gap-2'>
            <Button 
              type="submit"   
              color='green'
              className={`${!message.message.length ? 'opacity-30 cursor-default pointer-events-none': '' } rounded-lg shadow-md  focus:ring `}
             >
              
              Odešli
              </Button>

      </div>
      

    </div>
 
    <div className="md:hidden relative">
      <textarea
        name="message"
        value={message.message}
        onChange={handleChange}
        className="w-full  min-h-28 py-2 pl-2 pr-8 bg-gray-200 text-black focus:outline-none focus:ring focus:border-blue-500 resize-none"
        placeholder="Sdlej svůj názor (max 400 znaků)"
        maxLength={400} 
   />
     <div className={message.message.length >= 400  ? 'hidden' : 'absolute bottom-4 right-5 dark:text-black text-xl cursor-pointer'}
      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      ref={emojiPickerRefButtonSM}
      ><BsEmojiGrin /></div> 
    </div>

    {backendError && <div className=" w full text-base font bold dark:text-red-200 text-red-800 mt-2 mb-2 px-2 text-center rounded">{backendError} </div>}
   {message.message.length >= 400  &&
    <p className='text-red-800 dark:text-red-200 text-center'>{travelTipsConstants.tooLongMessage[language]}</p>
   }

    </form> 
  <div className='flex justify-center items-center flex-col mt-1 '       ref={emojiPickerRef}>

  {showEmojiPicker && message.message.length < 400 && (
       <Picker
 
             data={data}
        onEmojiSelect={addEmoji}
   />
    )}
    
    </div>
    
  </div>
  )
}

export default CreateTourMessage