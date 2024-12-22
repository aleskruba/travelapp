import { useEffect, useState } from 'react';
import TourMessage from './TourMessage';
import { useAuthContext } from '../../context/authContext';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import CreateTourMessage from './CreateTourMessage';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import socket from '../../utils/socket';
import { travelTipsConstants } from '../../constants/constantsTravelTips';
import { useLanguageContext } from '../../context/languageContext';

type Props = {
  tourID: number;
 
};

function TourMessages({tourID}:Props) {
  const { user } = useAuthContext();
  let { id } = useParams<string>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletedMessage,setDeletedMessage] = useState<number | null>(null)
  const [deletedReply,setDeletedReply] = useState<number | null>(null)
  // Retrieve `currentPage` based on `searchParams`
  const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;

  const { language} = useLanguageContext();
  
  useEffect(() => {
    setSearchParams({ page: (currentPage + 1).toString() });
  }, [currentPage, setSearchParams, id]);


  useEffect(() => {
   
    if (tourID) {
    socket.emit('join_tour_room', String(tourID),user?.id);
    }

    socket.on('receive_message_tour', (socketdata) => {
 
      if (socketdata.message.user_id !== user?.id) {
    
        queryClient.setQueryData(['tourmessages', currentPage], (old: any) => {
          console.log(old);
          const updatedMessages = [
            ...(old?.tourmessages?.map((msg: any) => ({ ...msg, reply: msg.tourreply || [] })) || []),
            socketdata.message,  // Add socketdata as a new message
          ];
    
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
    
          return { ...old, tourmessages: updatedMessages };
        });
      }
    });
    
    socket.on('receive_reply_tour', (socketdata) => {
   
      if (socketdata.user_id !== user?.id) {
        setDeletedMessage(socketdata.messageID)
        if  (socketdata.messagetype === 1 && user?.id !== socketdata.receiver_id) return;
        if  (socketdata.messagetype === 1 && user?.id  === socketdata.receiver_id) {
          queryClient.invalidateQueries({ queryKey: ['tourmessages',currentPage]})
        }
        queryClient.setQueryData(['tourmessages',  currentPage], (old: any) => {
 
        
          // Clone the old messages array
          const updatedMessages = (old?.tourmessages || []).map((msg: any) => {
            // Check if the current message is the one to update
            if (msg.id === socketdata.tourmessage_id
            ) {
              // Add socketdata to the reply array of the specific message and ensure votesreply array
              return {
                ...msg,
                  tourreply: [...(msg.tourreply || []), socketdata], // Add new reply
              };
            }
        
            return msg; // Return other messages unchanged
          });
   
          // Sort updatedMessages if necessary
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
        
          return { ...old, tourmessages: updatedMessages };
        });
        
      }
    });
    
    socket.on('receive_deleted_message_tour', (socketdata) => {

        console.log(socketdata)
      if (socketdata.user_id !== user?.id) {
      
        setDeletedMessage(socketdata.messageID)

        setTimeout(() => {
          
        queryClient.setQueryData(['tourmessages', currentPage], (old: any) => {
          console.log(old)
          
          // Filter out the message with the specified message_id
          const updatedMessages = (old?.tourmessages || []).filter((msg: any) => msg.id !== socketdata.messageID);
    
         // console.log(updatedMessages)
    
          // Sort updatedMessages if necessary
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
      //    queryClient.invalidateQueries({ queryKey: ['tourmessages',currentPage]})
          return { ...old, tourmessages: updatedMessages };
        });

        setDeletedMessage(null)
      }, 3500);



      }
    });


    
    socket.on('receive_deleted_reply_tour', (socketdata) => {

      console.log(socketdata)
      setDeletedReply(socketdata.replyID)
      setTimeout(() => {

      if (socketdata.user_id !== user?.id) {
        queryClient.setQueryData(['tourmessages', currentPage], (old: any) => {
          // Clone the old messages array and map to find the correct message
          const updatedMessages = (old?.tourmessages || []).map((msg: any) => {
            // Check if the current message is the one to update
            if (msg.id === socketdata.messageID) {
              // Filter out the specific reply by its ID
              const updatedReplies = msg.tourreply.filter((r: any) => r.id !== socketdata.replyID);
            
              // Return the message with updated replies
              return { ...msg, tourreply: updatedReplies };
            }
            return msg; // Return other messages unchanged
          });
    
          // Sort updatedMessages if necessary
          updatedMessages.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
       //   queryClient.invalidateQueries({ queryKey: ['tourmessages',currentPage]})
          return { ...old, tourmessages: updatedMessages };
        });

        
      }
      setDeletedReply(null)

    }, 3500);
    });
    
    // Cleanup event listeners on unmount
    return () => {
      socket.off('receive_message_tour');
     socket.off('receive_reply_tour');
     socket.off('receive_deleted_message_tour');
      socket.off('receive_deleted_reply_tour');
      
      

    };
  }, [ user?.id, tourID,queryClient, currentPage]);


  // Fetch messages function
  const fetchMessages = async (page = 0) => {
    const response = await fetch(`${BASE_URL}/tourmessages/${id}?page=${page + 1}`, {
      ...HTTP_CONFIG,
      credentials: 'include',
    });
  
    if (!response.ok) {
      throw new Error('Chyba při získaní dat');
    }
  
    // Await the response.json() to resolve the promise and log the data
    const data = await response.json();
  
    return data;
  };


  // React Query to fetch messages
  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryFn: () => fetchMessages(currentPage ),
    queryKey: ['tourmessages', currentPage],
/*     placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 10000, */
  });


  if (isLoading ) {
    return    <div className='flex justify-center items-center '>{travelTipsConstants.momentPlease[language]}</div>
  }

  if (isError) {
    return <span>{travelTipsConstants.somethingWentWrong[language]}</span>;
  }


  return (
    <div className="flex flex-col px-2 md:px-4 w-full pb-6">

      {user ? (
        <CreateTourMessage
          user={user}
          currentPage={currentPage}
          tourID={id}
        />
      ) : (
        <div className="p-4 bg-blue-100 text-blue-800 border border-blue-300 rounded-md shadow-lg">
          {travelTipsConstants.onlyLoggedInCanShare[language]}
   
          <span
            onClick={() => navigate('/login')}
            className="cursor-pointer text-blue-500 hover:underline"
          >
            {travelTipsConstants.loginHere[language]}
          </span>
        </div>
      )}

     
        <>
        <div className="flex flex-col mt-4 gap-1">
         
          {data && data.tourmessages
            .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
            .map((message: any, idx: number) => (
              <TourMessage
                key={message.id}
                message={message}
                currentPage={currentPage}
                tourID={id}
                deletedMessage={deletedMessage}
                deletedReply={deletedReply}
                />
            ))}
        </div>
        {data.tourmessages > 10 &&
        <div className="flex items-center flex-col">
          
        <span className="text-gray-700 dark:text-gray-200 font-medium">
        {travelTipsConstants.currentPage[language]}  {currentPage + 1} of {data.totalPages}
        </span>

       <div className='flex gap-2'>    
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
        
      </div>
}
      
        </>

    </div>
  );
}

export default TourMessages;
