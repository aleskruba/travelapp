import React, { ChangeEvent, FormEvent, useState } from "react";
import Button from "../customButton/Button";
import { useAuthContext } from "../../context/authContext";
import { fetchData } from "../../hooks/useFetchData";
import { BASE_URL } from "../../constants/config";
import google from "../../assets/images/google.png";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import { authConstants } from "../../constants/constantsAuth";
import { navbarConstants } from "../../constants/constantsData";
import { useLanguageContext } from '../../context/languageContext';

interface UpdateProfileProps {
  updateProfile: boolean;
  setUpdateProfile: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const UpdateProfile = ({
  updateProfile,
  setUpdateProfile,
  handleChange,
  setIsLoading,
}: UpdateProfileProps) => {

  const { user, updateUser, setUser } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
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

    try {
      //  setError(null);

      if (isFalse) return;

      if (updateUser) {

         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex validation

        if (!emailRegex.test(updateUser.email)) {
            setError("Špatný fomát mailu");
            return;
        }

        if (
          updateUser.username &&
          (updateUser.username.trim().length < 4 ||
            updateUser.username.trim().length > 15)
        ) {
          setError("Username musí mít 4 až 15 znaků F");
          return;
        }
        if (
          updateUser.firstName &&
          (updateUser.firstName.trim().length < 4 ||
            updateUser.firstName.trim().length > 15)
        ) {
          setError("Jméno musí mít 4 až 15 znaků F");
          return;
        }
        if (
          updateUser.lastName &&
          (updateUser.lastName.trim().length < 4 ||
            updateUser.lastName.trim().length > 15)
        ) {
          setError("Příjmení musí mít 4 až 15 znaků F");
        }
        if (
          updateUser.lastName &&
          (updateUser.lastName.trim().length < 4 ||
            updateUser.lastName.trim().length > 15)
        ) {
          setError("Email  musí mít 4 až 50 znaků F");
        }
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
        console.log(data.message)
        setUser(data.updatedUser);
        setIsLoading(false);
        showSuccessToast("Update proběhl úspěšně")
        setUpdateProfile(false);
      }
    } catch (e:any) {
    
      setError(e.message);
      setIsLoading(false);
      showErrorToast("Chyba při úpravě profilu")
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
          <input
            type="text"
            placeholder={authConstants.name[language]}
            name="firstName"
            className="w-full border rounded-md p-2 text-black"
            onChange={handleChange}
            value={updateUser?.firstName ?? ""}
            maxLength={20}
          />
          <input
            type="text"
            placeholder={authConstants.surname[language]}
            name="lastName"
            className="w-full border rounded-md p-2 text-black"
            onChange={handleChange}
            value={updateUser?.lastName ?? ""}
            maxLength={20}
          />
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Email"
              name={updateUser?.googleEmail ? "" : "email"}
              className={`w-full border rounded-md p-2 text-black ${
                user?.googleEmail
                  ? "bg-gradient-to-r from-red-700 via-yellow-600 to-blue-200 text-white pointer-events-none"
                  : ""
              }`}
              onChange={handleChange}
              value={updateUser?.email ?? ""}
              maxLength={35}
              style={{ paddingRight: "40px" }} // Adjust padding to accommodate the image
            />
            {updateUser?.googleEmail && (
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
            )}
          </div>

          {user?.googleEmail ? (
            <span className="text-xs text-violet-700">
              {authConstants.emailGoogleLoggedin[language]}
            </span>
          ) : (
            ""
          )}
          {error && <div className="text-red-800">{error}</div>}

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
            setError("");
          }}
          color="blue"
          className="mt-4 w-full"
        >
           {authConstants.profilUpdate[language]}
        </Button>
      ) : (
        <Button
          onClick={() => {
            setUpdateProfile(false);
            setError("");
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
