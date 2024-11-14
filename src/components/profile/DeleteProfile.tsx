import Button from "../customButton/Button";
import { BASE_URL } from "../../constants/config";
import { fetchData } from "../../hooks/useFetchData";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import ConfirmationModal from "../ConfirmationModal";
import { FormEvent, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import { authConstants } from "../../constants/constantsAuth";
import { useLanguageContext } from '../../context/languageContext';

interface DeleteProfileProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteProfile = ({ setIsLoading }: DeleteProfileProps) => {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { language} = useLanguageContext();

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
        setBackendError("Server error");
        return;
      }
  
      await response.json();
  
      setShowModal(false);
      setUser(null);
      navigate("/");
      setIsLoading(false);
      showSuccessToast(authConstants.deleteAccountSuccess[language]);
    } catch (e: any) {
      console.error(authConstants.deleteAccountError[language]);
      setIsLoading(false);

      showErrorToast( authConstants.deleteAccountError[language]);
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
     {authConstants.deleteAccount[language]}
        </Button>
        { backendError && <div className="text-red-800">server error</div>}
      </div>
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => deleteAccount()}
        message={authConstants.deleteAccountMessage[language]}
      />
    </>
  );
};

export default DeleteProfile;
