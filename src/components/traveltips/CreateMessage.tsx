import React, { FormEvent, useState, useEffect ,useRef } from 'react';
import { initialMessageState, MessageProps, UserProps } from '../../types';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { BsEmojiGrin } from "react-icons/bs";
import DOMPurify from 'dompurify';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCountryContext } from '../../context/countryContext';
import { fetchData } from '../../hooks/useFetchData';

interface CreateMessageProps {
  user: UserProps;
  backendError: string;
  allowedToDelete: boolean;
}

const CreateMessage: React.FC<CreateMessageProps> = ({ user, backendError, allowedToDelete }) => {
  const queryClient = useQueryClient();
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRefButton = useRef<HTMLDivElement | null>(null);
  const emojiPickerRefButtonSM = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState<MessageProps>(initialMessageState);
  const { chosenCountry } = useCountryContext();

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

  const createMessage = async (newMessage: MessageProps) => {

    const response = await fetchData(`${BASE_URL}/message`,'POST',newMessage)

/*     const response = await fetch(`${BASE_URL}/message`, {
      ...HTTP_CONFIG, 
      method: 'POST',
      body: JSON.stringify(newMessage),
      credentials: 'include',
    }); */

    if (!response.ok) {
      throw new Error('Chyba při odeslaní zprávy');
    }

    return response.json();
  };

  const createMessageMutation = useMutation({
    mutationFn: createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['messages',chosenCountry]});
      setMessage(initialMessageState);
    }
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newMessage = { ...message, 
                                  country: chosenCountry, 
                                  user_id: user.id };

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
          <img src={user?.image ?? 'profile.png'} alt="Profile" className="w-full h-full object-cover" />
        </div>
       </div>
      <div className="flex-1 hidden md:flex relative">
      <textarea
  name="message"
  value={message.message}
  onChange={handleChange}
  className="w-full min-h-28 py-2 pl-2 pr-10 bg-gray-200 dark:text-black rounded-lg focus:outline-none focus:ring focus:border-blue-500 resize-none"
  style={{ maxWidth: '100%', overflowWrap: 'break-word' }}  
  placeholder="Sdlej svůj názor (max 400 znaků)"
  maxLength={400}
/>
       <div className={message.message.length >= 400  ? 'hidden' : `absolute bottom-2  right-5 dark:text-black text-xl cursor-pointer `} 
            onClick={ () => setShowEmojiPicker(!showEmojiPicker)}
            ref={emojiPickerRefButton}
         ><BsEmojiGrin /></div> 

      </div>
   
      <div>
        <button type="submit"   className={`py-2 px-4 bg-green-500 text-white rounded-lg shadow-md focus:outline-none focus:ring focus:border-green-700 ${
    !message.message.length || !allowedToDelete
      ? 'opacity-30 cursor-default pointer-events-none'
      : 'hover:bg-green-600'
  }`}>Odešli</button>
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

    {backendError && <div className=" w full bg-gray-200 text-xl font bold text-red-800 mt-2 mb-2 px-2 text-center rounded">{backendError} </div>}
   {message.message.length >= 400  &&
    <p className='text-red-800 dark:text-red-200 text-center'>Zpráva je příliš dlouhá !!!!!</p>
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

export default CreateMessage