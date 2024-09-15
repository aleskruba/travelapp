import React, { useState } from 'react';
import { MessageProps, ReplyProps } from '../../types';
import { useAuthContext } from '../../context/authContext';
import { useThemeContext } from '../../context/themeContext';
import { useCountryContext } from '../../context/countryContext';
import { FaRegTrashAlt } from "react-icons/fa";
import moment from 'moment'; // Import moment
import { io } from 'socket.io-client';
import { BASE_URL, HTTP_CONFIG, SOCKET_URL } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../ConfirmationModal';
import CreateReplyVote from './CreateReplyVote';
import { fetchData } from '../../hooks/useFetchData';
import useRelativeDate from '../../hooks/DateHook';

type Props = {
  reply: ReplyProps;
  message: MessageProps;
  currentPage:number;
  currentPageReply:number
};

const Reply: React.FC<Props> = ({ reply, message ,currentPage,currentPageReply}) => {
  const { user } = useAuthContext();
  const { toggleModal } = useThemeContext();
  const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { chosenCountry } = useCountryContext();
  const [backendError, setBackendError] = useState<string | null>(null);
  const imageUrl = reply?.user.image ? reply?.user.image : '/profile.png';

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
    const response = await fetchData(`${BASE_URL}/reply/${id}`, 'DELETE');

    if (!response.ok) {
      throw new Error('Chyba při odeslaní zprávy');
    }
    const data = response.json();
    return data;
  };

  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessageFunction,
    onSuccess: () => {
      backendError && setBackendError(null);
      queryClient.invalidateQueries({ queryKey: ['messages', chosenCountry,currentPage,currentPageReply] });
      setShowModal(false);
    },
    onError: (error) => {
      setShowModal(false);
      setBackendError('Něco se pokazilo , zpráva nebyla smazána');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chosenCountry,currentPage,currentPageReply] });
    },
  });

  return (
    <div className="relative shadow-xl rounded-lg" id={reply?.id.toString()}>
      <div className="absolute right-1 bottom-1 text-red-500 dark:text-red-200 font-thin">
        {backendError && backendError}
      </div>
      <div key={reply.id} className="flex flex-col pt-2 border-t border-gray-400 dark:text-gray-100 relative">
        <div className={`flex items-center gap-6 md:gap-2 cursor-pointer mt-1 ${reply.user_id === user?.id ? 'pl-1' : 'p3-6'}`}>
          {reply.user_id === user?.id && (
            <div className="text-red-500 hover:text-red-300 absolute top-3 right-1" onClick={() => handleDeleteClick(reply.id)}>
              <FaRegTrashAlt />
            </div>
          )}
          <div className="w-14 h-14 overflow-hidden rounded-full cursor-pointer" onClick={() => toggleModal(imageUrl)}>
            <img
              src={imageUrl ? imageUrl : 'profile.png'}
              alt="Profile"
              className="w-full z-30 h-full object-cover"
            />
          </div>
          <div className="flex gap-1">
            <p className={`${reply.user_id === user?.id ? 'text-red-600 dark:text-red-200' : 'text-gray-600 dark:text-gray-100'} font-bold`}>
              {reply.user.firstName ? reply.user.firstName.slice(0, 10) : ''}
            </p>
            <p className="text-gray-600 dark:text-gray-100 italic">{displayDateText}</p>
          </div>
        </div>
        <div className="md:pl-14 break-all">
          <p className={`${reply.user_id === user?.id ? 'text-red-600 dark:text-red-200' : 'text-gray-600 dark:text-gray-100'}`}>
            {reply.message}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <CreateReplyVote message={message} reply={reply} />
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
