import { useEffect, useState } from 'react';
import Message from './Message';
import { useAuthContext } from '../../context/authContext';
import { useCountryContext } from '../../context/countryContext';
import { BASE_URL } from '../../constants/config';
import CreateMessage from './CreateMessage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import socket from '../../utils/socket';
import { travelTipsConstants } from '../../constants/constantsTravelTips';
import { useLanguageContext } from '../../context/languageContext';

function Messages() {
  const { user } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const { chosenCountry } = useCountryContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;
  const [deletedMessage,setDeletedMessage] = useState<number | null>(null)
  const [deletedReply,setDeletedReply] = useState<number | null>(null)
  const { language} = useLanguageContext();
  
  useEffect(() => {
    if (chosenCountry) {
      socket.emit('join_room', chosenCountry, user?.id);
    }

    socket.on('receive_message', (socketdata) => {

      if (socketdata.user_id !== user?.id) {

        queryClient.setQueryData(['messages', chosenCountry, currentPage], (old: any) => {
          const updatedMessages = [
            ...(old?.messages?.map((msg: any) => ({ ...msg, votes: msg.votes || [], reply:msg.reply || [] })) || []),
            socketdata,
          ];
        
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
        
          return { ...old, messages: updatedMessages };
        });
        
      }
    });
    
    
    socket.on('receive_reply', (socketdata) => {

      if (socketdata.user_id !== user?.id) {

               queryClient.setQueryData(['messages', chosenCountry, currentPage], (old: any) => {
 
        
          const updatedMessages = (old?.messages || []).map((msg: any) => {
            // Check if the current message is the one to update
            if (msg.id === socketdata.message_id) {
              // Add socketdata to the reply array of the specific message and ensure votesreply array
              return {
                ...msg,
                  reply: [...(msg.reply || []), socketdata], // Add new reply
              };
            }
        
            return msg; // Return other messages unchanged
          });
   
          // Sort updatedMessages if necessary
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
        
          return { ...old, messages: updatedMessages };
        });
        
      }
    });

    socket.on('receive_deleted_message', (socketdata) => {

      
      if (socketdata.user_id !== user?.id) {
      
        setDeletedMessage(socketdata.messageID)

        setTimeout(() => {
          
        queryClient.setQueryData(['messages', chosenCountry, currentPage], (old: any) => {
          
          // Filter out the message with the specified message_id
          const updatedMessages = (old?.messages || []).filter((msg: any) => msg.id !== socketdata.messageID);
    
        
    
          // Sort updatedMessages if necessary
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
          queryClient.invalidateQueries({ queryKey: ['tourmessages',chosenCountry,currentPage]})
          return { ...old, messages: updatedMessages };
        });

        setDeletedMessage(null)
      }, 3500);



      }
    });
    
    socket.on('receive_deleted_reply', (socketdata) => {
      setDeletedReply(socketdata.replyID)
      setTimeout(() => {

      if (socketdata.user_id !== user?.id) {
        queryClient.setQueryData(['messages', chosenCountry, currentPage], (old: any) => {
          // Clone the old messages array and map to find the correct message
          const updatedMessages = (old?.messages || []).map((msg: any) => {
            // Check if the current message is the one to update
            if (msg.id === socketdata.messageID) {
              // Filter out the specific reply by its ID
              const updatedReplies = msg.reply.filter((r: any) => r.id !== socketdata.replyID);
              // Return the message with updated replies
              return { ...msg, reply: updatedReplies };
            }
            return msg; // Return other messages unchanged
          });
    
          // Sort updatedMessages if necessary
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
    
          return { ...old, messages: updatedMessages };
        });

        
      }
      setDeletedReply(null)
    }, 3500);
    });
    

    // Cleanup event listeners on unmount
    return () => {
      socket.off('receive_message');
      socket.off('receive_reply');
      socket.off('delete_message');
      socket.off('receive_deleted_reply');
      
      

    };
  }, [chosenCountry, user?.id, queryClient, currentPage]);

  useEffect(() => {
    setSearchParams({ page: (currentPage + 1).toString() });
  }, [currentPage, setSearchParams]);

  const fetchMessages = async (page = 0) => {
    const response = await fetch(`${BASE_URL}/messages/${chosenCountry}?page=${page + 1}`);
    if (!response.ok) {
      throw new Error('Fetching Error');
    }
    return response.json();
  };

  const { data,isLoading,isError,isFetching,isPlaceholderData } = useQuery({
    queryFn: ()=>fetchMessages(currentPage),
    queryKey: ['messages', chosenCountry,currentPage],
    placeholderData: keepPreviousData,
    refetchOnWindowFocus:true, // automaticly refetch data while changing window , default is true       
    staleTime:10000,
  });



  if (isLoading || isFetching) {
    return    <div className='flex justify-center items-center '>{travelTipsConstants.momentPlease[language]}</div>
  }

  if (isError) {
    return <span>{travelTipsConstants.somethingWentWrong[language]} </span>;
  }


  return (
    <div className="flex flex-col px-2 md:px-4 w-full">
      {user ? (
        <CreateMessage
          user={user}
          currentPage={currentPage}
   
        />
      ) : (
        <div className="p-4 bg-blue-100 text-blue-800 border border-blue-300 rounded-md shadow-lg">
          {travelTipsConstants.travelMateError[language]}
          <span
            onClick={() => navigate('/login')}
            className="cursor-pointer text-blue-500 hover:underline pl-2"
          >
         {travelTipsConstants.loginHere[language]}
          </span>
        </div>
      )}

     
        <>
        <div className="flex flex-col mt-4 gap-1">
          {data && data.messages
            .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
            .map((message: any, idx: number) => (
              <Message
                key={message.id}
                message={message}
                currentPage={currentPage}
                deletedMessage={deletedMessage}
                deletedReply={deletedReply}
      
                  
                />
            ))}
        </div>
        <div className="flex items-center justify-center space-x-4 py-2">
        <span className="text-gray-700 dark:text-gray-200 font-medium">
        {travelTipsConstants.currentPage[language]} {currentPage + 1}    {travelTipsConstants.of[language]} {data.totalPages}
        </span>
       
        <button
          onClick={() =>
            setSearchParams({ page: Math.max(currentPage, 1).toString() }) // Convert result to string
          }
          disabled={currentPage === 0}
          className={`px-2 py-2 w-32 rounded-md border text-sm font-medium transition-colors duration-200 ${
            currentPage === 0
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500'
          }`}
        >
          {travelTipsConstants.previousPage[language]} 
        </button>
        <button
          onClick={() => setSearchParams({ page: (currentPage + 2).toString() })}
          disabled={isPlaceholderData || currentPage + 1 >= data.totalPages}
          className={`px-2 py-2 w-32 rounded-md border text-sm font-medium transition-colors duration-200 ${
            isPlaceholderData || currentPage + 1 >= data.totalPages
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500'
          }`}
        >
        {travelTipsConstants.nextPage[language]} 
        </button>
      </div>
        </>


    </div>
  );
}

export default Messages;
