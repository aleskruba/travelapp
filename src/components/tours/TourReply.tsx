import React, { useState } from 'react';
import { TourMessageProps, TourReplyProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { useThemeContext } from '../../context/themeContext';
import { useTourContext } from '../../context/tourContext';
import { FaRegTrashAlt } from "react-icons/fa";
import moment from 'moment'; // Import moment
import { io } from 'socket.io-client';
import { BASE_URL,  SOCKET_URL } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../ConfirmationModal';
import { fetchData } from '../../hooks/useFetchData';
import useRelativeDate from '../../hooks/DateHook';
import lide from "../../assets/images/lide.svg"

type Props = {
  reply: TourReplyProps;
  message: TourMessageProps;
  currentPage:number;
  currentPageReply:number
};

const TourReply: React.FC<Props> = ({ reply, message ,currentPage,currentPageReply}) => {
  const { user } = useAuthContext();
  const { toggleModal } = useThemeContext();
  const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const imageUrl = reply?.user.image ? reply?.user.image : lide;
  const {privateIdsArray} = useTourContext()
  const replyDateMoment = moment(reply.date);
  console.log(privateIdsArray)

  // Use the custom hook to get the relative date
  const displayDateText = useRelativeDate(replyDateMoment);

  const handleDeleteClick = (ID: number) => {  
    setSelectedReplyId(ID);
    setShowModal(true);
  };

  const queryClient = useQueryClient();

  const deleteMessageFunction = async (id: number): Promise<any> => {
    const response = await fetchData(`${BASE_URL}/tourreply/${id}`, 'DELETE');

    if (!response.ok) {
      throw new Error('Chyba při odeslaní zprávy');
    }
    const data = response.json();
    return data;
  };

  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessageFunction,
    onMutate: async (id) => {

      console.log('onMutate delete reply',id)
      // Cancel any outgoing refetches to prevent overwriting the optimistic update
      await queryClient.cancelQueries({ queryKey: ['tourmessages', currentPage]  });
  
      // Get the previous messages from the cache
      const previousMessages = queryClient.getQueryData(['tourmessages', currentPage] );
  
      // Optimistically update the cache by removing the deleted reply
      queryClient.setQueryData(['tourmessages', currentPage] , (oldData: { tourmessages: TourMessageProps[] } | undefined) => {
        if (!oldData) return oldData;
  
        return {
          ...oldData,
          tourmessages: oldData.tourmessages.map((mes) => {
            if (mes.id === message.id) {
              return {
                ...mes,
                tourreply: mes.tourreply.filter((rep) => rep.id !== id),
              };
            }
            return mes;
          }),
        };
      });
  
      // Return context with the previous messages for rollback in case of error
      return { previousMessages };
    },
    onError: (error, id, context) => {
      setBackendError('Něco se pokazilo, odpověď nebyla smazána');
      console.error('Error deleting reply:', error);
      setShowModal(false);
  
      // Rollback cache to the previous state
      queryClient.setQueryData(['tourmessages', currentPage] , context?.previousMessages);
    },
    onSuccess: () => {
      backendError && setBackendError(null);
      setShowModal(false);
    },
    onSettled: (data, error) => {
      if (error) {
        queryClient.invalidateQueries({ queryKey: ['tourmessages', currentPage]  });
      } else {
        // Optionally, validate if data from the server is consistent with the cache.
      }
    },
  });

  return (
        <div
          className={`relative shadow-xl rounded-lg ${
            (reply.messagetype === 1 || (privateIdsArray.includes(reply.id)))
              ? 'dark:bg-shinyDarkBackground bg-shinyLightBackground text-red-500 dark:text-red-200'
              : ''
          }`}
          id={reply?.id.toString()}
        >

    
     <span className='px-2'>{    (reply.messagetype === 1 || (privateIdsArray.includes(reply.id)))  && ` soukromá zašifrovaná zpráva  , vidí ji pouze  ${message.user.firstName === user?.firstName ?  reply.user.firstName :message.user.firstName } a ty` } </span> 
      <div className="absolute right-1 bottom-1 text-red-500 dark:text-red-200 font-thin">
        {backendError && backendError}
      </div>
      <div key={reply.id} className="flex flex-col pt-2  dark:text-gray-100 relative">
        <div className={`flex items-center gap-6 md:gap-2 cursor-pointer mt-1 ${reply.user_id === user?.id ? 'pl-1' : 'p3-6'}`}>
          {reply.user_id === user?.id && (
            <div className="text-red-500 hover:text-red-300 absolute top-3 right-1" onClick={() => handleDeleteClick(reply.id)}>
              <FaRegTrashAlt />
            </div>
          )}
          <div className="w-14 h-14 overflow-hidden rounded-full cursor-pointer" onClick={() => toggleModal(imageUrl)}>
            <img
              src={imageUrl ? imageUrl : lide}
              alt="Profile"
              className="w-full z-30 h-full object-cover"
            />
          </div>
          <div className="flex gap-1">
            <p className={`${reply.user_id === user?.id ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-100'} font-bold`}>
              {reply.user.firstName ? reply.user.firstName.slice(0, 10) : ''}
            </p>
            <p className="text-gray-600 dark:text-gray-100 italic">{displayDateText}</p>
          </div>
        </div>
        <div className="md:pl-14 break-all">
          <p className={`${reply.user_id === user?.id ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-100'}`}>
            {reply.message}
          </p>
        </div>
      </div>

      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => { selectedReplyId && deleteMessageMutation.mutate(selectedReplyId) }}
        message="Chceš opravdu smazat tuto zprávu?"
      />
    </div>
  );
};

export default TourReply;
