import React,{useState,FormEvent} from 'react'
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../context/authContext';
import { useCountryContext } from '../../context/countryContext';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiGrin } from "react-icons/bs";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  initialSingleReplyState, MessageProps, ReplyProps } from '../../types';

  interface Props {
    setReplyDiv: React.Dispatch<boolean>; 
    message:MessageProps
    setSelectedReplyDivId:React.Dispatch<React.SetStateAction<number | null>>
}

function CreateReply({setReplyDiv,message,setSelectedReplyDivId}:Props) {
      
      const queryClient = useQueryClient();
       const { user} = useAuthContext();
       const { chosenCountry } = useCountryContext();
       const [showEmojiPicker, setShowEmojiPicker] = useState(false);
       const [backendError,setBackendError] = useState('');
       const [reply, setReply] = useState<ReplyProps>(initialSingleReplyState);
  


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

        const response = await fetch(`${BASE_URL}/reply`, {
          ...HTTP_CONFIG, 
          method: 'POST',
          body: JSON.stringify(newReply),
          credentials: 'include',
        });
    
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
      className="w-full min-h-[100px] py-2 px-4 bg-gray-200 dark:text-black rounded-lg focus:outline-none focus:ring focus:border-blue-500 resize-none"
      style={{ maxWidth: '100%', overflowWrap: 'break-word' }}
      placeholder="Sdlej svůj názor (max 500 znaků)"
      maxLength={500} 
    />
           <div className='absolute top-5 right-2 dark:text-black text-xl cursor-pointer ' onClick={() => setShowEmojiPicker(!showEmojiPicker)} ><BsEmojiGrin /></div> 
        </div>
    <div className="flex justify-center space-x-4">
      
      {message.message !== 'TATO ZPRÁVA BYLA SMAZÁNA !!!!!'?   
      <button className="bg-blue-500 w-[80px] text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-700"
              type="submit" 
      >
        
        Odešli
      </button> : null }
      <button className="bg-gray-300 w-[80px] text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:border-gray-500" 
              onClick={() => {setReplyDiv(false);setSelectedReplyDivId(null)}}
              type='button'>
        Zpět
      </button>

    </div>
  </div>
  <div>{backendError ? backendError : ''}</div>
  <div className='flex justify-center mt-2 '>
 {showEmojiPicker && (
       <Picker
             data={data}
        onEmojiSelect={addEmoji}
   />
    )}
</div>

  </form>

  )
}

export default CreateReply