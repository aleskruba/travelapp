import React, { ChangeEvent, FormEvent, useState } from "react";
import Button from "../customButton/Button";
import { useAuthContext } from "../../context/authContext";
import { fetchData } from "../../hooks/useFetchData";
import { BASE_URL } from "../../constants/config";
import google from "../../assets/images/google.png";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import { authConstants } from "../../constants/constantsAuth";
import { useLanguageContext } from '../../context/languageContext';

interface UpdateProfileProps {
  updateProfile: boolean;
  setUpdateProfile: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  googleUser:boolean ;
}

const UpdateProfile = ({
  updateProfile,
  setUpdateProfile,
  handleChange,
  setIsLoading,
  googleUser
}: UpdateProfileProps) => {

  const { user, updateUser,setUpdateUser, setUser } = useAuthContext();
  const [errorBackend, setErrorBackend] = useState<string | null>(null);
  const [errorUsername, setErrorUsername] = useState<string | null>(null);
  const [errorfirstName, setErrorfirstName] = useState<string | null>(null);
  const [errorlasttName, setErrorlastName] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const { language} = useLanguageContext();

  const isFalse =
    updateUser?.username === user?.username &&
    updateUser?.firstName === user?.firstName &&
    updateUser?.lastName === user?.lastName &&
    updateUser?.email === user?.email;

 /*  useEffect(() => {
    console.log("UseEffect runs - user was updated");
  }, [user]); */

  const handleSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    
    const validationErrors = {
      username: null as string | null,
      firstName: null as string | null,
      lastName: null as string | null,
      email: null as string | null,
  };

  
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailRegex.test(updateUser?.email || "")) {
      validationErrors.email = authConstants.emailFormat[language];
    }
  
    if (
      updateUser?.username &&
      (updateUser.username.trim().length < 1 || updateUser.username.trim().length > 15)
    ) {
      validationErrors.username = authConstants.username[language];
    }
  
    if (
      updateUser?.firstName &&
      (updateUser.firstName.trim().length < 1 || updateUser.firstName.trim().length > 15)
    ) {
      validationErrors.firstName = authConstants.firstName[language];
    }
  
    if (
      updateUser?.lastName &&
      (updateUser.lastName.trim().length < 1 || updateUser.lastName.trim().length > 15)
    ) {
      validationErrors.lastName = authConstants.lastName[language];
    }
  
    const hasErrors = Object.values(validationErrors).some((error) => error !== null);
  
    if (hasErrors) {
      setErrorUsername(validationErrors.username);
      setErrorfirstName(validationErrors.firstName);
      setErrorlastName(validationErrors.lastName);
      setErrorEmail(validationErrors.email);
      return;
    }
  
    // Proceed with form submission if no validation errors
    try {
      setIsLoading(true);
      const response = await fetchData(
        `${BASE_URL}/updateprofile`,
        "PUT",
        updateUser
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
  
      const data = await response.json();
      setUser(data.updatedUser);
      setIsLoading(false);
      showSuccessToast(authConstants.updateSuccess[language]);
      setUpdateProfile(false);
    } catch (e: any) {
      setErrorBackend(e.message);
      setIsLoading(false);
      showErrorToast(authConstants.updateError[language]);
    }
  };
  


  return (
    <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
      {!updateProfile ? (
        <div>
          <div className="text-lg font-semibold mb-2">{authConstants.yourProfile[language]}</div>
          <div className="mb-2">Username: {updateUser?.username}</div>
          <div className="mb-2">{authConstants.name[language]}: {updateUser?.firstName}</div>
          <div className="mb-2">{authConstants.surname[language]}: {updateUser?.lastName}</div>
          <div>Email: {user?.email}</div>
        </div>
      ) : (
        <form
          className="space-y-4 dark:bg-gray-500 dark:text-gray-100"
          onSubmit={handleSubmitProfile}
        >
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="w-full border rounded-md p-2 text-black"
            onChange={handleChange}
            value={updateUser?.username ?? ""}
            maxLength={20}
          />
            {errorUsername && <div className="text-red-800">{errorUsername}</div>}
          <input
            type="text"
            placeholder={authConstants.name[language]}
            name="firstName"
            className="w-full border rounded-md p-2 text-black"
            onChange={handleChange}
            value={updateUser?.firstName ?? ""}
            maxLength={20}
          />
           {errorfirstName && <div className="text-red-800">{errorfirstName}</div>}
          <input
            type="text"
            placeholder={authConstants.surname[language]}
            name="lastName"
            className="w-full border rounded-md p-2 text-black"
            onChange={handleChange}
            value={updateUser?.lastName ?? ""}
            maxLength={20}
          />
              {errorlasttName && <div className="text-red-800">{errorlasttName}</div>}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Email"
              name={updateUser?.googleEmail ? "" : "email"}
              className={`w-full border rounded-md p-2 text-black ${
                googleUser
                  ? "bg-gradient-to-r from-red-700 via-yellow-600 to-blue-200 text-white pointer-events-none"
                  : ""
              }`}
              onChange={handleChange}
              value={updateUser?.email ?? ""}
              maxLength={35}
              style={{ paddingRight: "40px" }} // Adjust padding to accommodate the image
            />

            {googleUser && (
              <img
                src={google}
                alt="Google Logo"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "25px",
                  height: "25px",
                }}
              />
            )}  {errorEmail && <div className="text-red-800">{errorEmail}</div>}
          </div>

          {user?.googleEmail ? (
            <span className="text-xs">
              {authConstants.emailGoogleLoggedin[language]}
            </span>
          ) : (
            ""
          )}
          {errorBackend && <div className="text-red-800">{errorBackend}</div>}

          <Button
            type="submit"
            color="blue"
            className={`w-full ${
              isFalse ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
            }`}
            disabled={isFalse}
          >
           {authConstants.save[language]}
          </Button>
        </form>
      )}

      {!updateProfile ? (
        <Button
          onClick={() => {
            setUpdateProfile(true);
            setErrorBackend("");
          }}
          color="blue"
          className="mt-4 w-full"
        >
           {authConstants.profilUpdate[language]}
        </Button>
      ) : (
        <Button
          onClick={() => {
            setUpdateUser(user)
            setUpdateProfile(false);
            setErrorBackend("");
          }}
          color="gray"
          className="mt-4 w-full border-1.5"
        >
         {authConstants.cancel[language]}
        </Button>
      )}
    </div>
  );
};

export default UpdateProfile;
