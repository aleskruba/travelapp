import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuthContext } from "../context/authContext";
import { BASE_URL } from '../constants/config';
import { Flip, toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { fetchData } from "../hooks/useFetchData";
import Button from "../components/customButton/Button";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { authConstants } from "../constants/constantsAuth";
import { useLanguageContext } from '../context/languageContext';

interface NewPasswordCredentials {
  password: string;
  confirmPassword: string;
}

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [isLoding, setIsLoding] = useState(false);
  const [verified, setVerified] = useState(false);
  const [userId, setUserId] = useState(null);
  const { user } = useAuthContext();
  const { language} = useLanguageContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error(authConstants.missingToken[language], {
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
      navigate("/");
      return;
    }

    const fetchFunction = async () => {
      try {

        const response = await fetchData(`${BASE_URL}/verifytoken`,'POST',{ token: token })
/*         const response = await fetch(`${BASE_URL}/verifytoken`, {
          ...HTTP_CONFIG,
          method: 'POST',
          body: JSON.stringify({ token: token }),
          credentials: 'include',
        });
 */
        if (!response.ok) {
          throw new Error('Failed to verify token');
        }

        const data = await response.json();
        setUserId(data.user);
        setVerified(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        toast.error(authConstants.expiredToken[language], {
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
        navigate("/login");
      }
    };

    fetchFunction();
  }, [token, navigate]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const showPasswordToggle = () => {
    setShowPassword(prev => !prev);
  }

  const validationSchema = Yup.object({
    password: Yup.string()
      .required(authConstants.required[language])
      .min(6, authConstants.passwordMin[language])
      .max(50, authConstants.passwordMax[language])
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/,
        authConstants.passwordFormat[language]
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], authConstants.passwordsMatch[language])
      .required(authConstants.required[language])
  });

  const initialValues = {
    password: '',
    confirmPassword: ''
  }

  const handleSubmit = async (values: NewPasswordCredentials, { resetForm }: any) => {
    const payload = {
      ...values,
      userId: userId
    };

    try {
      setIsLoding(true);
      const response = await fetchData(`${BASE_URL}/resetpassword`,'PUT',payload)

/*       const response = await fetch(`${BASE_URL}/resetpassword`, {
        ...HTTP_CONFIG,
        method: 'PUT',
        body: JSON.stringify(payload),
        credentials: 'include',
      }); */

      if (!response.ok && response.status === 400) {
        setIsLoding(false);
        throw new Error(authConstants.passwordsMatch[language]);
      }

      const data = await response.json();
      setIsLoding(false);
      showSuccessToast(data.message)
      resetForm();
      navigate("/login");
    } catch (error: any) {
      setBackendError(error.message);
      showErrorToast('ERROR...')
    }
  }

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto ">
      <div className='flex flex-wrap items-center overflow-y-auto min-h-[600px] mt-20'>
        <div className={` ${isLoding ? 'opacity-30 pointer-events-none' : ''}relative bg-white px-4 py-4 rounded-lg flex items-center justify-center flex-col `}>
          <h1 className='mt-4 text-black poppins-extrabold text-3xl'>RESET HESLA</h1>
          {verified ? (
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ values, errors }) => {
                const isFormValid = !errors.password && !errors.confirmPassword && values.password && values.confirmPassword;
                return (
                  <Form className="flex flex-col space-y-4 items-center w-[350px] ">
                    <div className="relative w-full">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder={authConstants.newPassword[language]}
                        autoComplete="off"
                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                      <div
                        className="absolute inset-y-0 right-1 text-xl flex items-center pr-3 cursor-pointer"
                        onClick={showPasswordToggle}
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </div>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-red-500" />
                    <div className="relative w-full">
                      <Field
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder={authConstants.repeatPassword[language]}
                        autoComplete="off"
                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                      <div
                        className="absolute inset-y-0 right-1 text-xl flex items-center pr-3 cursor-pointer"
                        onClick={showPasswordToggle}
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </div>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="text-red-500" />
                    {backendError && <div className="text-red-500">{backendError}</div>}
                    <div className="flex space-x-4">
                  <Button
                    type="submit"
                    color={isFormValid ? "blue" : "gray"}
                    className={`px-4 py-2 rounded-md transition duration-300 w-[120px] ${isFormValid ? 'text-gray-700 hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isFormValid}
                  >
                  {authConstants.save[language]}
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    type="button"
                    color="gray"
                    className="px-4 py-2 text-center transition duration-300 w-[120px]"
                  >
                 {authConstants.back[language]}
                  </Button>
                </div>

                  </Form>
                );
              }}
            </Formik>
          ) : (
            <div>  {authConstants.verifyToken[language]}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
