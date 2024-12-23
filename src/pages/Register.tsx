import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from '../custom/Image';
import fun from '../assets/images/fun.png';
import { useAuthContext } from '../context/authContext';
import { fetchData } from '../hooks/useFetchData';
import Button from '../components/customButton/Button';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';
import { authConstants } from "../constants/constantsAuth";
import { navbarConstants } from "../constants/constantsData";
import { useLanguageContext } from '../context/languageContext';

interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [backendErrorGoogle, setBackendErrorGoogle] = useState('');
  const [isLoding, setIsLoding] = useState(false);
  const { user, setUser } = useAuthContext();
  let location = useLocation();
  const { language} = useLanguageContext();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  const showPasswordToggle = () => {
    setShowPassword(prev => !prev);
  }

  const handleBack = () => {
    const currentPath = location.pathname;
    if (currentPath === '/login' || currentPath === '/register') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .required(authConstants.required[language])
      .email(authConstants.emailFormat[language])
      .max(50, authConstants.emailMaxMin[language]),
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
    email: '',
    password: '',
    confirmPassword: ''
  }

  const handleSubmit = async (values: RegisterCredentials, { resetForm }: any) => {
    try {
      setIsLoding(true);
      const response = await fetchData(`${BASE_URL}/signup`,'POST',values)

      if (!response.ok && response.status === 401) {
        setIsLoding(false);
        throw new Error(authConstants.accountExists[language]);
      }
      if (!response.ok && response.status === 400) {
        setIsLoding(false);
        throw new Error(authConstants.passwordsMatch[language]);
      }

      const data = await response.json();
      setUser(data.user);
      setIsLoding(false);
      showSuccessToast(data.message);
      resetForm();
      navigate('/');
    } catch (error: any) {
      setBackendError(error.message);
      showErrorToast(authConstants.registrationError[language])
    }
  }

  const login = useGoogleLogin({
    onSuccess: async (res) => {
      try {
        const responseGoogle = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${res.access_token}`,
          },
        });

        if (!responseGoogle.ok) {
          throw new Error(`HTTP error! status: ${responseGoogle.status}`);
        }

        const dataGoogle = await responseGoogle.json();

        const values = {
          email: dataGoogle.email,
          name: dataGoogle.given_name,
          profilePicture: dataGoogle.picture,
        }

        const response = await fetch(`${BASE_URL}/googlesignup`, {
          ...HTTP_CONFIG,
          method: 'POST',
          body: JSON.stringify(values),
          credentials: 'include',
        });

        if (!response.ok) {
          setIsLoding(false);
          throw new Error(authConstants.loginError[language]);
        }

        const data = await response.json();
        showSuccessToast(data.message)
        setUser(data.user);
        navigate(location.pathname);
      } catch (error: any) {
        setBackendErrorGoogle(authConstants.accountExists[language]);
      }
    }
  });

  return (
    <div className="fixed z-50 inset-0 flex md:items-center justify-center bg-black bg-opacity-50 overflow-y-auto ">
      <div className='flex flex-wrap md:items-center  overflow-y-auto max-h-[510px] md:max-h-[550px] mt-2 md:mt-20'>
      {isLoding ? (
          <h1>{navbarConstants.waitplease[language]}</h1>
        ) : (
        <div className={` ${isLoding ? 'opacity-30 pointer-events-none' : ''}relative bg-white px-4 py-4 rounded-lg flex items-center justify-center flex-col `}>
          <h1 className='pb-2 md:mt-4 text-black poppins-extrabold text-2xl md:text-3xl'>{authConstants.registration[language]}</h1>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors }) => {
              const isFormValid = values.email && !errors.email && !errors.password && !errors.confirmPassword && values.password && values.confirmPassword;
              return (
                <Form className="flex flex-col space-y-3 items-center md:w-[380px] w-[300px]">
                  <Field name="email"
                    type="email"
                    id="email"
                    placeholder="Email"
                    autoComplete="off"
                    className="w-full px-4 py-2 relative border text-black border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                  <ErrorMessage name="email"
                    component="div"
                    className="text-red-500" />

                  <div className="relative w-full">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder={authConstants.password[language]}
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
                  className={`${isFormValid ? "text-gray-700" : "text-gray-200 opacity-50 cursor-not-allowed"} transition duration-300`}
                  width="120px"
                  disabled={!isFormValid}
                >
                  Registrovat
                </Button>
                <Button
                  onClick={handleBack}
                  type="button"
                  color="gray"
                  className="transition duration-300"
                  width="120px"
                >
                    {authConstants.back[language]}
                </Button>
              </div>

                </Form>
              );
            }}
          </Formik>
      
          <div className='mt-4 w-[80%]  bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer'>
                    <Button
            color="blue"
            className="font-bold"
            width="100%"
            onClick={() => login()}
          >
             {authConstants.registerWithGoogle[language]}🚀
          </Button>

          </div>
          {backendErrorGoogle && <div className="text-red-500">{backendErrorGoogle}</div>}

          <h5 className='pt-4 text-gray-600 '>{authConstants.alreadyAccount[language]}
            <Link to='/login' className='text-gray-600 underline cursor-pointer'>
            {authConstants.login[language]}
            </Link>
          </h5>
          <h5 className='text-gray-600 '>  {authConstants.ForgottenPassword[language]}{": "}<Link to='/forgottenpassword' className='text-gray-600 underline cursor-pointer'>
            {authConstants.click[language]}
          </Link>  </h5>

    {/*       <div className='h-[100px]'>
            <Image className='flex mt-4  w-full h-full object-cover' src={fun} alt="lide" />
          </div> */}
        </div>
    )}</div>
    </div>
  );
}

export default Register;
