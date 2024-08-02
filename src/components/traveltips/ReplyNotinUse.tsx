import React,{useState,FormEvent, useEffect} from 'react'
import DOMPurify from 'dompurify';
import { MessageProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import axios from 'axios';
import { BASE_URL, SOCKET_URL } from '../../constants/config';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiGrin } from "react-icons/bs";
import { useCountryContext } from '../../context/countryContext';
import { io } from 'socket.io-client';

  interface Props {
    setReplyDiv: React.Dispatch<boolean>; 
    //setReplies: React.Dispatch<React.SetStateAction<ReplyProps[]>>
    message:MessageProps
    setAllowedToDelete: React.Dispatch<React.SetStateAction<boolean>>
    setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedReplyDivId:React.Dispatch<React.SetStateAction<number | null>>
}
function ReplyNotinUse({setReplyDiv,message,setAllowedToDelete,setIsSubmitted,setSelectedReplyDivId}:Props) {
       const { user} = useAuthContext();
       const { chosenCountry } = useCountryContext();
      const [showEmojiPicker, setShowEmojiPicker] = useState(false);
      const [backendError,setBackendError] = useState('');
         
      const socket = io(SOCKET_URL);

      const addEmoji = (event: any) => {
        const sym = event.unified.split("_");
           const codeArray: any[] = [];
      
        sym.forEach((el: any) => {
          codeArray.push("0x" + el);
        });
        let emoji = String.fromCodePoint(...codeArray);
      



      
      const onSubmitFunction = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
      
   
      };
/*       useEffect(() => {
        setShowEmojiPicker(false)
      },[reply]) 
 */
  return (
   
    <form onSubmit={onSubmitFunction}>
    <div className="flex flex-col items-center space-y-4 mt-4">
      <div className='relative w-full'>
    <textarea
      name="reply"
      value=''

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
}

export default ReplyNotinUse