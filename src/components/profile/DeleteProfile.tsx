import Button from "../customButton/Button";
import { BASE_URL } from "../../constants/config";
import { fetchData } from "../../hooks/useFetchData";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import ConfirmationModal from "../ConfirmationModal";
import { FormEvent, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";

interface DeleteProfileProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteProfile = ({ setIsLoading }: DeleteProfileProps) => {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);


  const handleDeleteAccountClick = () => {
    setShowModal(true);
  };
  const deleteAccount = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setBackendError('ssss')

    setIsLoading(true);
    try {
      const response = await fetchData(`${BASE_URL}/deleteprofile`, "DELETE", {});
      console.log(response);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        setBackendError("Něco se pokazilo");
        return;
      }
  
      await response.json();
  
      setShowModal(false);
      setUser(null);
      navigate("/");
      setIsLoading(false);
      showSuccessToast("Účet byl úspěšně smazán");
    } catch (e: any) {
      console.error(e.message);
      setIsLoading(false);

      showErrorToast("Chyba při smazání profilu");
    }
  };
  

  return (
    <>
      <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
        <Button
          type="button"
          color="red"
          className="w-full"
          onClick={handleDeleteAccountClick}
        >
          Smazat účet
        </Button>
        { backendError && <div className="text-red-800">server error</div>}
      </div>
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => deleteAccount()}
        message="Chceš opravdu smazat svůj účet ? "
      />
    </>
  );
};

export default DeleteProfile;
