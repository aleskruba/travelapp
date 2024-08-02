import React, { useState, useEffect, FormEvent } from 'react';
import ReactPaginate from 'react-paginate';
import DOMPurify from 'dompurify';
import axios from 'axios';
import Message from './Message';
import { initialMessageState, MessageProps, UserProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { useCountryContext } from '../../context/countryContext';
import { BASE_URL, HTTP_CONFIG, SOCKET_URL } from '../../constants/config';
import CreateMessage from './CreateMessage';
import { io } from 'socket.io-client';
import { useNavigate  } from 'react-router-dom';
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';


const ITEMS_PER_PAGE = 10;



function Messages() {
  const { user } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(0);
  const { chosenCountry } = useCountryContext();
  const [message, setMessage] = useState<MessageProps>(initialMessageState);
  const [backendError, setBackendError] = useState('');
  const [allowedToDelete, setAllowedToDelete] = useState(true);
  const [isSubmitted,setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const socket = io(SOCKET_URL);
  const queryClient = useQueryClient();
  const fetchMessages = async () => { 
    const response = await fetch(`${BASE_URL}/messages/${chosenCountry}`)
    if (!response.ok) {

      throw new Error('Chyba při odeslaní zprávy'); 
      
    }
  
    return response.json()
  }

  const {data,isLoading} = useQuery({
         queryFn: fetchMessages,
         queryKey: ["messages",chosenCountry]
  })



  const handlePageChange = ({ selected }: any) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div className="flex flex-col px-2 md:px-4 w-full">
      {user ? (
        <CreateMessage
          user={user}
          backendError={backendError}
          allowedToDelete={allowedToDelete}
        />
      ) : (
        <div className="p-4 bg-blue-100 text-blue-800 border border-blue-300 rounded-md shadow-lg">
          Jenom přihlášení uživatelé mohou sdílet své názory,
          <span onClick={() => navigate('/login')} className="cursor-pointer text-blue-500 hover:underline">
            Přihlaš se zde
          </span>
        </div>
      )}


{!isLoading ? 
  
      <div className="flex flex-col mt-4 gap-1">
{

data.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id).map((message:any,idx:number)=>{
  return(
      <Message key={message.id}
               message={message}
               allowedToDelete={allowedToDelete}
               isSubmitted={isSubmitted}
      
        />
  )
})

}
      </div> : <div> ... is Loading </div> 
      }
   
    </div>
  );
}

export default Messages;
