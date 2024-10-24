import { useEffect, useState } from 'react';
import TourMessage from './TourMessage';
import { useAuthContext } from '../../context/authContext';
import { BASE_URL, HTTP_CONFIG, SOCKET_URL } from '../../constants/config';
import CreateTourMessage from './CreateTourMessage';
import { io } from 'socket.io-client';
import { useNavigate, useSearchParams,useParams } from 'react-router-dom';
import { keepPreviousData, useQuery  } from '@tanstack/react-query';

function TourMessages() {

  const { user } = useAuthContext();
  let { id } = useParams<string>();
  const [searchParams, setSearchParams] = useSearchParams();
   const [currentPageReply, setCurrentPageReply] = useState(0);
  const navigate = useNavigate();
//  const socket = io(SOCKET_URL);

const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;

/* useEffect(()=>{
  if (chosenCountry ) {
setCurrentPage((parseInt(searchParams.get('page') || '1', 10) - 1))
}
},[chosenCountry]) */

useEffect(() => {
  setSearchParams({ page: (currentPage + 1).toString() }); // Convert number to string

}, [currentPage, setSearchParams]);

  const fetchMessages = async (page = 0) => {
    const response = await fetch(`${BASE_URL}/tourmessages/${id}?page=${page+1}`,{
      ...HTTP_CONFIG,
      credentials: 'include',
    }
    );

  
    if (!response.ok) {
      throw new Error('Chyba při získaní dat');
    }
    return response.json();
  };

  const { data,isLoading,isError,isFetching,isPlaceholderData } = useQuery({
    queryFn: ()=>fetchMessages(currentPage),
    queryKey: ['tourmessages', currentPage],
    placeholderData: keepPreviousData,
    refetchOnWindowFocus:true, // automaticly refetch data while changing window , default is true       
    staleTime:10000,
  });



  if (isLoading || isFetching) {
    return    <div className='flex justify-center items-center '>Moment prosim...</div>
  }

  if (isError) {
    return <span>Něco se pokazilo , spolucety nebyly načteny </span>;
  }


  return (
    <div className="flex flex-col px-2 md:px-4 w-full">
      {user ? (
        <CreateTourMessage
          user={user}
          currentPage={currentPage}
          currentPageReply={currentPageReply}
          tourID={id}
        />
      ) : (
        <div className="p-4 bg-blue-100 text-blue-800 border border-blue-300 rounded-md shadow-lg">
          Jenom přihlášení uživatelé mohou sdílet své názory,
          <span
            onClick={() => navigate('/login')}
            className="cursor-pointer text-blue-500 hover:underline"
          >
            Přihlaš se zde
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
                currentPageReply={currentPageReply}
                setCurrentPageReply={setCurrentPageReply}
                />
            ))}
        </div>
        <div className="flex items-center justify-center space-x-4 py-2">
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          Aktuální stránka: {currentPage + 1} of {data.totalPages}
        </span>
       
        <button
          onClick={() =>
            setSearchParams({ page: Math.max(currentPage, 1).toString() }) // Convert result to string
          }
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
            currentPage === 0
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500'
          }`}
        >
          Minulá stránka
        </button>
        <button
          onClick={() => setSearchParams({ page: (currentPage + 2).toString() })}
          disabled={isPlaceholderData || currentPage + 1 >= data.totalPages}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
            isPlaceholderData || currentPage + 1 >= data.totalPages
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500'
          }`}
        >
          Další stránka
        </button>
      </div>
        </>


    </div>
  );
}

export default TourMessages;
