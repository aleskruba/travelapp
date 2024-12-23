import { useState, ChangeEvent, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";
import { UserProps } from "../types";
import UpdateProfile from "../components/profile/UpdateProfile";
import DOMPurify from "dompurify";
import UpdatePassword from "../components/profile/UpdatePassword";
import { UpdateImage } from "../components/profile/UpdateImage";
import DeleteProfile from "../components/profile/DeleteProfile";
import { authConstants } from "../constants/constantsAuth";
import { navbarConstants } from "../constants/constantsData";
import { useLanguageContext } from '../context/languageContext';
import { BASE_URL } from "../constants/config";
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Flip, toast } from 'react-toastify';
import Button from "../components/customButton/Button";

function Profil() {
  const { user, setUpdateUser,setUser } = useAuthContext();
  const [updateProfile, setUpdateProfile] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language} = useLanguageContext();

  const [googleUser,setGoogleUser] = useState(false);

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  useEffect(() => {
    setUpdateUser(user);
    if (user?.googleEmail) {setGoogleUser(true)}
    console.log("useEffect updateUser profile runs");
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = DOMPurify.sanitize(value);
    setUpdateUser((prevUser: UserProps | null) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        [name]: sanitizedValue,
      };
    });
  };

  const logOutFunction = () => {
    const fetchUserData = async () => {
        try {
            const url = `${BASE_URL}/logout`;
            const response = await axios.get(url, { withCredentials: true });

  

                queryClient.clear(); // Clear all cached data
          

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
            console.log('Error during logout :', err);
        }
    };

    fetchUserData();
};


  return (
    <div className="flex items-center h-full min-h-screen pb-4 flex-col pt-8 px-2 gap-6 ">
      {isLoading ? (
        <h1 className="flex h-full justify-center items-center">
           {navbarConstants.waitplease[language]}
        </h1>
      ) : (
        <>
          {!updatePassword && !updateProfile && (
            <>
              <Link
                to={`/yourvlogs`}
                className="p-6 rounded-lg shadow-md w-full md:w-[35rem] flex justify-center items-center font-extrabold bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 dark:text-white cursor-pointer hover:shadow-lg dark:hover:from-slate-600 dark:hover:to-slate-500 transition duration-300 ease-in-out"
              >
                  {authConstants.yourVlogs[language]}
              </Link>

              <Link
                to={`/yourtours`}
                className="p-6 rounded-lg shadow-md w-full md:w-[35rem] flex justify-center items-center font-extrabold bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 dark:text-white cursor-pointer hover:shadow-lg dark:hover:from-slate-600 dark:hover:to-slate-500 transition duration-300 ease-in-out"
              >   {authConstants.yourTravelMates[language]}

              </Link>
            </>
          )}

          {!updatePassword && !updateProfile && <UpdateImage />}

          {!updatePassword && (
            <UpdateProfile
              setIsLoading={setIsLoading}
              updateProfile={updateProfile}
              setUpdateProfile={setUpdateProfile}
              handleChange={handleChange}
              googleUser={googleUser}
            />
          )}

          {!updateProfile && !googleUser && (
            <UpdatePassword
              setIsLoading={setIsLoading}
              setUpdatePassword={setUpdatePassword}
              updatePassword={updatePassword}
              handleChange={handleChange}
                      />
          )}
              <div className="bg-gray-100 dark:bg-gray-500  p-6 rounded-lg shadow-md w-full md:w-[35rem]">
                    <Button
                      type="button"
                      color="lightgray"
                      className="w-full text-red-800  "
                      onClick={logOutFunction}
                    >
                            {navbarConstants.logout[language]}
                    </Button>
                   {/*  { backendError && <div className="text-red-800">server error</div>} */}
                  </div>

    {/*       <div onClick={logOutFunction} className="dark:hover:text-gray-300 hover:text-yellow-500 cursor-pointer">
                            {navbarConstants.logout[language]}
            </div> */}

          {!updatePassword && !updateProfile && (
            <DeleteProfile setIsLoading={setIsLoading} />
          )}
        </>
      )}

     
    </div>
  );
}

export default Profil;
