import React, { useState } from 'react';
import { MessageProps, ReplyProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { useThemeContext } from '../../context/themeContext';
import { useCountryContext } from '../../context/countryContext';
import { FaRegTrashAlt } from "react-icons/fa";
import moment from 'moment'; // Import moment
import { io } from 'socket.io-client';
import { BASE_URL, SOCKET_URL } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../ConfirmationModal';
import CreateReplyVote from './CreateReplyVote';
import { fetchData } from '../../hooks/useFetchData';
import useRelativeDate from '../../hooks/DateHook';
import lide from "../../assets/images/lide.svg"
import socket from '../../utils/socket';

type Props = {
  reply: ReplyProps;
  message: MessageProps;
  currentPage:number;
  deletedReply:number | null;

};


const Reply: React.FC<Props> = ({ reply, message ,currentPage,deletedReply}) => {

/*   const socket = io(SOCKET_URL); */
  const { user } = useAuthContext();
  const { toggleModal } = useThemeContext();
  const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { chosenCountry } = useCountryContext();
  const [backendError, setBackendError] = useState<string | null>(null);
  const imageUrl = reply?.user.image ? reply?.user.image : lide;

  // Convert Date object to Moment object
  const replyDateMoment = moment(reply.date);

  // Use the custom hook to get the relative date
  const displayDateText = useRelativeDate(replyDateMoment);

  const handleDeleteClick = (ID: number) => {  
    setSelectedReplyId(ID);
    setShowModal(true);
  };

  const queryClient = useQueryClient();

  const deleteMessageFunction = async (id: number): Promise<any> => {

    console.log('delete reply',id)
    const response = await fetchData(`${BASE_URL}/reply/${id}`, 'DELETE');
  
    if (!response.ok) {
      throw new Error('Error while deleting the reply');
    }
  
    const data = await response.json();
    return data;
  };

  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessageFunction,
    onMutate: async (id) => {

      console.log('onMutate delete reply',id)
      // Cancel any outgoing refetches to prevent overwriting the optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', chosenCountry, currentPage] });
  
      // Get the previous messages from the cache
      const previousMessages = queryClient.getQueryData(['messages', chosenCountry, currentPage,]);
  
      // Optimistically update the cache by removing the deleted reply
      queryClient.setQueryData(['messages', chosenCountry, currentPage], (oldData: { messages: MessageProps[] } | undefined) => {
        if (!oldData) return oldData;
  
        return {
          ...oldData,
          messages: oldData.messages.map((mes) => {
            if (mes.id === message.id) {
              return {
                ...mes,
                reply: mes.reply.filter((rep) => rep.id !== id),
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
      queryClient.setQueryData(['messages', chosenCountry, currentPage], context?.previousMessages);
    },
    onSuccess: () => {
      backendError && setBackendError(null);
      setShowModal(false);
      socket.emit('delete_reply', {replyID:selectedReplyId, messageID:message.id, user_id:user?.id,chosenCountry});
    },
    onSettled: (data, error) => {
      if (error) {
        queryClient.invalidateQueries({ queryKey: ['messages', chosenCountry, currentPage] });
      } else {
        // Optionally, validate if data from the server is consistent with the cache.
      }
    },
  });

 
  return (
    <div
      className={`relative shadow-xl rounded-lg transition-opacity duration-[2000ms] ${
        deletedReply === reply.id ? 'opacity-0 delay-[2000ms] dark:bg-gray-600' : 'opacity-100'
      }`}
      id={reply?.id.toString()}
    >
      <div className="absolute right-1 bottom-1 text-red-500 dark:text-red-200 font-thin">
        {backendError && backendError}
      </div>
      <div key={reply.id} className="flex flex-col pt-2 border-t border-gray-400 dark:text-gray-100 relative">
        <div className={`flex items-center gap-6 md:gap-2 cursor-pointer mt-1 ${reply.user_id === user?.id ? 'pl-1' : 'p3-6'}`}>
        {(user?.isAdmin || reply.user_id === user?.id) && (
            <div
              className="text-red-500 hover:text-red-300 absolute top-3 right-1"
              onClick={() => handleDeleteClick(reply.id)}
            >
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
            <p className={`${reply.user_id === user?.id ? 'text-red-600 dark:text-red-200' : 'text-gray-600 dark:text-gray-100'} font-bold`}>
              {reply.user.firstName ? reply.user.firstName.slice(0, 10) : ''} - {reply.id}
            </p>
            <p className="text-gray-600 dark:text-gray-100 italic">{displayDateText}</p>
          </div>
        </div>
        <div className="md:pl-14 break-all">
          <p className={`${reply.user_id === user?.id ? 'text-red-600 dark:text-red-200' : 'text-gray-600 dark:text-gray-100'}`}>
           
            {   deletedReply === reply.id ? <span className="font-semibold "> zpráva byla smazána</span>: reply.message} 
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <CreateReplyVote message={message} reply={reply} currentPage={currentPage} />
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

export default Reply;
