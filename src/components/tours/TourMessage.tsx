import React, { useState } from "react";
import moment from "moment";
import { FaRegTrashAlt } from "react-icons/fa";
import { TourMessageProps } from "../../types";
import { useAuthContext } from "../../context/authContext";
import { BASE_URL, HTTP_CONFIG, SOCKET_URL } from "../../constants/config";
import { useThemeContext } from "../../context/themeContext";
import { io } from "socket.io-client";
import ConfirmationModal from "../ConfirmationModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TourReply from "./TourReply";
import CreateTourReply from "./CreateTourReply";
import { fetchData } from "../../hooks/useFetchData";
import ReactPaginate from "react-paginate";
import useRelativeDate from "../../hooks/DateHook";
import Button from "../customButton/Button";

type Props = {
  message: TourMessageProps;
  currentPage: number;
  currentPageReply: number;
  setCurrentPageReply: React.Dispatch<React.SetStateAction<number>>;
};

const TourMessage: React.FC<Props> = ({
  message,
  currentPage,
  currentPageReply,
  setCurrentPageReply,
}) => {
  const ITEMS_PER_PAGE = 4;

  const { user } = useAuthContext();
  const { toggleModal } = useThemeContext();
  const [hiddenAnswers, setHiddenAnswes] = useState(true);
  const [selectedReplyDivId, setSelectedReplyDivId] = useState<number | null>(
    null
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );
  const [replyDiv, setReplyDiv] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Convert Date object to Moment object
  const replyDateMoment = moment(message.date);

  // Use the custom hook to get the relative date
  const displayDateText = useRelativeDate(replyDateMoment);

  //const socket = io(SOCKET_URL);
  const imageUrl = message?.user?.image ? message?.user?.image : "/profile.png";

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPageReply(selected);
  };

  const handleDeleteMessageClick = (ID: number) => {
    setSelectedMessageId(ID);
    setShowModal(true);
  };

  const queryClient = useQueryClient();

  const deleteMessageFunction = async (id: number): Promise<any> => {
    setBackendError(null);
    const response = await fetchData(`${BASE_URL}/tourmessage/${id}`, "DELETE");

    if (!response.ok) {
      throw new Error("Error while deleting the message");
    }

    // Wait for the response to be parsed as JSON.
    const data = await response.json();
    return data;
  };

  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessageFunction,
    onMutate: async (id) => {
      console.log("onMutate", id);
      // Cancel any outgoing refetches (so they don't overwrite optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["tourmessages", currentPage, currentPageReply],
      });

      // Get the previous messages from the cache
      const previousMessages = queryClient.getQueryData([
        "tourmessages",
        currentPage,
        currentPageReply,
      ]);

      // Optimistically update the cache by removing the deleted message
      queryClient.setQueryData(
        ["tourmessages", currentPage, currentPageReply],
        (oldData: { tourmessages: any[] }) => {
          if (!oldData) return oldData;
          console.log(oldData);
          return {
            ...oldData,
            tourmessages: oldData.tourmessages.filter(
              (message) => message.id !== id
            ),
          };
        }
      );

      // Return context with the previous messages for rollback in case of error
      return { previousMessages };
    },
    onSuccess: (data, variables) => {
      setShowModal(false);
      // If you need to confirm that the deletion was successful on the backend and matches your optimistic update,
      // you can log the response or do additional checks here.
    },
    onError: (error, id, context) => {
      setShowModal(false);
      setBackendError("Něco se pokazilo, zpráva nebyla smazána");
      console.error("Error deleting message:", error);

      // Rollback cache to the previous state
      queryClient.setQueryData(
        ["tourmessages", currentPage, currentPageReply],
        context?.previousMessages
      );
    },
    onSettled: (data, error, variables, context) => {
      // Only refetch if the mutation failed or if the server response indicates a need for it.
      if (error) {
        queryClient.invalidateQueries({
          queryKey: ["tourmessages", currentPage, currentPageReply],
        });
      } else {
        // Optionally, validate if data from the server is consistent with the cache.
        // If not, invalidate the query to fetch updated data.
      }
    },
  });

  const pageCount = Math.ceil(message?.tourreply?.length / ITEMS_PER_PAGE);

  const startIndex = currentPageReply * ITEMS_PER_PAGE;

  const selectedReplies = message?.tourreply
    ? message?.tourreply
        .sort((a, b) => b.id - a.id)
        .slice(startIndex, startIndex + ITEMS_PER_PAGE)
    : null;

  return (
    <div
      className="relative flex flex-col dark:bg-gray-600  dark:text-gray-100 px-4 py-2 shadow-2xl rounded-lg"
      id={message?.id.toString()}
    >
      <div className="absolute right-1 bottom-1 text-red-500 dark:text-red-200 font-thin">
        {backendError && backendError}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-auto">
        <div className="flex  items-center gap-2">
          {message?.user_id === user?.id && (
            <>
              <div
                className={` absolute top-1 right-1 min-w-[25px] text-red-500  cursor-pointer hover:text-red-300`}
                onClick={() => handleDeleteMessageClick(message?.id)}
              >
                <FaRegTrashAlt />
              </div>
            </>
          )}
          <div
            className={"w-14 h-14 overflow-hidden rounded-full cursor-pointer"}
            onClick={() => toggleModal(imageUrl)}
          >
            <img
              src={imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-row gap-4 md:gap-2">
            <p className="text-gray-600 dark:bg-gray-500 dark:text-gray-100 font-semibold">
              {message?.user?.firstName?.slice(0, 10)}
            </p>
            <p className="text-gray-600 dark:bg-gray-500 dark:text-gray-100  shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {/*  {moment(message?.date).format('DD-MM YYYY ')}
               */}
              {displayDateText}
            </p>
          </div>
        </div>
        <div className="md:px-4 pt-4 break-all">
          <p className="">{message?.message} </p>
        </div>
      </div>

      <div className="flex  gap-2 flex-col md:flex-row ">
        <div className="flex gap-4 pt-2 pb-2">
          {!replyDiv && user?.id !== message.user_id && (
            <Button
              color="answer"
              className=" px-4 py-1 text-sm	rounded-full focus:ring "
              onClick={() => {
                setReplyDiv(true);
                setHiddenAnswes(false);
                setSelectedReplyDivId(message.id);
              }}
            >
              Odpověz
            </Button>
          )}
        </div>
        {replyDiv && message.id === selectedReplyDivId && (
          <CreateTourReply
            setReplyDiv={setReplyDiv}
            message={message}
            setSelectedReplyDivId={setSelectedReplyDivId}
            currentPage={currentPage}
            currentPageReply={currentPageReply}
          />
        )}
      </div>
      {typeof message.tourreply !== "string" && (
        <div
          className="flex gap-4"
          onClick={() => setHiddenAnswes(!hiddenAnswers)}
        >
          <h4 className="text-sm font-bold cursor-pointer">
            {message?.tourreply?.filter((r) => r.tourmessage_id === message.id)
              .length > 1
              ? `${
                  message?.tourreply?.filter(
                    (r) => r.tourmessage_id === message.id
                  ).length
                } odpovědí`
              : message?.tourreply?.filter(
                  (r) => r.tourmessage_id === message.id
                ).length > 0
              ? `${
                  message?.tourreply?.filter(
                    (r) => r.tourmessage_id === message.id
                  ).length
                } odpověď`
              : ""}
          </h4>
        </div>
      )}

      <div
        className={`transition-wrapper ${
          !hiddenAnswers ? "open" : ""
        }  dark:bg-slate-600 bg-slate-200 px-2  pb-4`}
      >
        {selectedReplies?.map((r) => (
          <TourReply
            key={r.id}
            reply={r}
            message={message}
            currentPage={currentPage}
            currentPageReply={currentPageReply}
          />
        ))}

        {selectedReplies && selectedReplies.length > 0 && (
          <ReactPaginate
            previousLabel={"←"}
            nextLabel={"→"}
            disabledClassName={"disabled"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount || 0}
            marginPagesDisplayed={2}
            pageRangeDisplayed={8}
            onPageChange={handlePageChange}
            containerClassName={"pagination flex justify-center mt-8"}
            pageClassName={"page-item"}
            pageLinkClassName={
              "page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100"
            }
            previousClassName={"page-item"}
            previousLinkClassName={
              "page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100"
            }
            nextClassName={"page-item"}
            nextLinkClassName={
              "page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100"
            }
            activeClassName={"active bg-blue-500 text-white"}
          />
        )}
      </div>

      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          selectedMessageId && deleteMessageMutation.mutate(selectedMessageId);
        }}
        message="Chceš opravdu smazat tuto zprávu?"
      />
    </div>
  );
};

export default TourMessage;