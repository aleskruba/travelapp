import React, { ChangeEvent, FormEvent, useState } from "react";
import Button from "../customButton/Button";
import { useAuthContext } from "../../context/authContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { fetchData } from "../../hooks/useFetchData";
import { BASE_URL } from "../../constants/config";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import { authConstants } from "../../constants/constantsAuth";
import { useLanguageContext } from '../../context/languageContext';

interface UpdatePasswordProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdatePassword: React.Dispatch<React.SetStateAction<boolean>>;
  updatePassword: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const UpdatePassword = ({
  setIsLoading,
  setUpdatePassword,
  updatePassword,
  handleChange,
}: UpdatePasswordProps) => {
  
  const { language} = useLanguageContext();
  const { updateUser } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFalse =
    updateUser?.password === undefined ||
    updateUser?.confirmPassword === undefined ||
    updateUser?.password.length < 1 ||
    updateUser?.confirmPassword.length < 1 ||
    (updateUser.password && updateUser.password.trim().length < 8) ||
    (updateUser.password && updateUser.password.trim().length > 50) ||
    (updateUser.password &&
      updateUser.confirmPassword &&
      updateUser.password !== updateUser.confirmPassword);

  const handleSubmitPassword = async (event: FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();

    try {
      setError(null)
      if (updateUser) {
        if (updateUser.password !== updateUser.confirmPassword) {
          setError("Hesla nejsou stejná ");
          return;
        }
        if (
          updateUser.password.trim().length < 8 ||
          updateUser.password.trim().length > 50
        ) {
          setError(authConstants.passwordErrorMinMax[language]);
          return;
        }
        const response = await fetchData(`${BASE_URL}/updatepassword`, "PUT", {
          password: updateUser.password,
          confirmPassword: updateUser.confirmPassword,
        });

        if (response.ok) {
             await response.json();
    
        }
        setIsLoading(false);
        showSuccessToast(authConstants.changePasswordSuccess[language]);
        setUpdatePassword(false);
      }
    } catch (e:any) {
      console.error(e.message);
      setError(authConstants.changePasswordError[language])  
      setIsLoading(false);
      showErrorToast(authConstants.changePasswordError[language]);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
      {!updatePassword ? (
        <div>
          <div className="text-lg font-semibold mb-2">{authConstants.password[language]}</div>
        </div>
      ) : (
        <form className="space-y-4 relative" onSubmit={handleSubmitPassword}>
          <input
            type="text"
            name="username"
            style={{ display: "none" }}
            aria-hidden="true"
            autoComplete="username"
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={authConstants.newPassword[language]}
            className="w-full border rounded-md p-2 text-black"
            maxLength={20}
            autoComplete="new-password"
            onChange={handleChange}
          />

          <div className="absolute top-3 text-xl right-1 flex items-center pr-3">
            {showPassword ? (
              <FaEye onClick={() => setShowPassword(false)} />
            ) : (
              <FaEyeSlash onClick={() => setShowPassword(true)} />
            )}
          </div>

          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder={authConstants.repeatPassword[language]}
            className="w-full border rounded-md p-2 text-black"
            maxLength={20}
            autoComplete="new-password"
            onChange={handleChange}
          />
          <div className="absolute top-[72px] text-xl right-1 flex items-center pr-3">
            {showPassword ? (
              <FaEye onClick={() => setShowPassword(false)} />
            ) : (
              <FaEyeSlash onClick={() => setShowPassword(true)} />
            )}
          </div>

          {error && <div className="text-red-800">{error}</div>}

          <Button
            type="submit"
            color="blue"
            className={`w-full ${
              isFalse
                ? "opacity-50 cursor-not-allowed pointer-events-none "
                : ""
            }`}
            disabled={!!isFalse}
          >
            {authConstants.save[language]}
          </Button>
        </form>
      )}

      {!updatePassword ? (
        <Button
          onClick={() => {
            setUpdatePassword(true);
            setError("");
          }}
          color="blue"
          className="mt-4 w-full"
        >
          {authConstants.changePassword[language]}
        </Button>
      ) : (
        <Button
          onClick={() => {
            setUpdatePassword(false);
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

export default UpdatePassword;
