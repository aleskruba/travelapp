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
    setSelectedReplyDivId:React.Dispatch<React.SetStateAction<number | null>>
}

function CreateReply({setReplyDiv,message,setSelectedReplyDivId}:Props) {
      
      const queryClient = useQueryClient();
       const { user} = useAuthContext();
       const { chosenCountry } = useCountryContext();
       const replyEmojiPickerRef = useRef<HTMLDivElement | null>(null);
       const emojiPickerRefButton = useRef<HTMLDivElement | null>(null);
       const [showEmojiPicker, setShowEmojiPicker] = useState(false);
       const [backendError,setBackendError] = useState('');
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
      

      const createReply = async (newReply: ReplyProps) => {

        const response = await fetchData(`${BASE_URL}/reply`,'POST',newReply)
/* 
        const response = await fetch(`${BASE_URL}/reply`, {
          ...HTTP_CONFIG, 
          method: 'POST',
          body: JSON.stringify(newReply),
          credentials: 'include',
        }); */
    
        if (!response.ok) {
          throw new Error('Chyba při odeslaní zprávy');
        }
    
        return response.json();
      };

      const createReplyMutation = useMutation({
        mutationFn: createReply,
        onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['messages',chosenCountry]});
          setReply(initialSingleReplyState);
          setReplyDiv(false)
        }
      });

      const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (user) {
        const newReply = { ...reply, user_id: user.id, 
                                     message_id: message.id };
       
    
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
  <div>{backendError ? backendError : ''}</div>
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