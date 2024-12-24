import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { Flip, toast } from 'react-toastify';
import { BASE_URL } from '../../constants/config';
import { authConstants } from '../../constants/constantsAuth';
import { useAuthContext } from "../../context/authContext";
import { navbarConstants } from '../../constants/constantsData';

function LogoutComponent() {
  const { setUpdateUser, setUser } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Placeholder for language (replace with actual language logic)
  const language = 'en'; 

  const logOutFunction = async () => {
    try {
      const url = `${BASE_URL}/logout`;
      const response = await axios.get(url, { withCredentials: true });

      // Clear all cached data
      queryClient.clear();

      if (response.status === 200) {
        toast.success(authConstants.logout[language], {
          position: "top-left",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Flip,
        });
        setUpdateUser(null);
        setUser(null);
        navigate('/');
      }
    } catch (err) {
      console.log('Error during logout:', err);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-500 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
      <button
        type="button"
        className="w-full text-red-800 bg-lightgray py-2 px-4 rounded bg-gray-300"
        onClick={logOutFunction}
      >
        {navbarConstants.logout[language]}
      </button>

    </div>
  );
}

export default LogoutComponent;
