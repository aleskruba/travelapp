import { useState } from 'react';
import ReactPaginate from 'react-paginate';
import Message from './Message';
import { useAuthContext } from '../../context/authContext';
import { useCountryContext } from '../../context/countryContext';
import { BASE_URL, SOCKET_URL } from '../../constants/config';
import CreateMessage from './CreateMessage';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery  } from '@tanstack/react-query';

/* const ITEMS_PER_PAGE = 8;
 */
function Messages() {
  const { user } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(0);
  const { chosenCountry } = useCountryContext();
  const [backendError, setBackendError] = useState('');
  const [allowedToDelete, setAllowedToDelete] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const socket = io(SOCKET_URL);





  const fetchMessages = async () => {
    const response = await fetch(`${BASE_URL}/messages/${chosenCountry}?page=${currentPage+1}`);

  
    if (!response.ok) {
      throw new Error('Chyba při získaní dat');
    }
    return response.json();
  };

  const { data, isLoading ,isPlaceholderData,isFetching } = useQuery({
    queryFn: ()=>fetchMessages(),
    queryKey: ['messages', chosenCountry,currentPage],
    placeholderData: keepPreviousData,

  });


  const handlePageChange = ({ selected }: { selected: number }) => {
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
          <span
            onClick={() => navigate('/login')}
            className="cursor-pointer text-blue-500 hover:underline"
          >
            Přihlaš se zde
          </span>
        </div>
      )}

      {!isLoading ? (
        <div className="flex flex-col mt-4 gap-1">
          {data.messages
            .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
            .map((message: any, idx: number) => (
              <Message
                key={message.id}
                message={message}
                allowedToDelete={allowedToDelete}
                isSubmitted={isSubmitted}
              />
            ))}
        </div>
      ) : (
        <div>... is Loading</div>
      )}

<ReactPaginate
        previousLabel={'←'}
        nextLabel={'→'}
        disabledClassName={'disabled'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={data?.totalPages || 0}
        marginPagesDisplayed={2}
        pageRangeDisplayed={8}
        onPageChange={handlePageChange}
        containerClassName={'pagination flex justify-center mt-8'}
        pageClassName={'page-item'}
        pageLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
        previousClassName={'page-item'}
        previousLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
        nextClassName={'page-item'}
        nextLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
        activeClassName={'active bg-blue-500 text-white'}
      />

{isFetching ? <span> Loading...</span> : null}
    </div>
  );
}

export default Messages;
