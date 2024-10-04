import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Flip, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from '../custom/Image';
import lide from '../assets/images/lide.svg';
import fun from '../assets/images/fun.png';
import { useAuthContext } from '../context/authContext';
import { fetchData } from '../hooks/useFetchData';

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
      .required('Povinné!')
      .email('Neplatný formát emailu')
      .max(50, 'Email může mít maximálně 50 znaků'),
    password: Yup.string()
      .required('Povinné!')
      .min(6, 'Heslo musí mít alespoň 6 znaků')
      .max(50, 'Heslo může mít maximálně 50 znaků')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/,
        'Heslo musí obsahovat alespoň jedno malé písmeno, jedno velké písmeno a jednu číslici'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Hesla se musí shodovat')
      .required('Povinné!')
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
        throw new Error('Email je již zaregistrován');
      }
      if (!response.ok && response.status === 400) {
        setIsLoding(false);
        throw new Error('Hesla musí být stejná');
      }

      const data = await response.json();
      setUser(data.user);
      setIsLoding(false);

      toast.success(data.message, {
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

      resetForm();
      navigate('/');
    } catch (error: any) {
      setBackendError(error.message);
      toast.error('Chyba při registraci', {
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
          throw new Error('Chyba při přihlašování');
        }

        const data = await response.json();

        toast.success(data.message, {
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

        setUser(data.user);
        navigate(location.pathname);
      } catch (error: any) {
        setBackendErrorGoogle('Tento účet je již zaregistrován');
      }
    }
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto ">
      <div className='flex flex-wrap items-center  overflow-y-auto min-h-[600px] mt-20'>
        <div className={` ${isLoding ? 'opacity-30 pointer-events-none' : ''}relative bg-white px-4 py-4 rounded-lg flex items-center justify-center flex-col `}>
          <h1 className='mt-4 text-black poppins-extrabold text-3xl'>Registrace</h1>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors }) => {
              const isFormValid = values.email && !errors.password && !errors.confirmPassword && values.password && values.confirmPassword;
              return (
                <Form className="flex flex-col space-y-4 items-center w-[350px] ">
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
                      placeholder="Heslo"
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
                      placeholder="Zopakuj heslo"
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
                    <input type="submit"
                      className={`px-4 py-2 rounded-md cursor-pointer transition duration-300 w-[120px] ${isFormValid ? 'bg-blue-500 text-gray-700 hover:bg-blue-600' : 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed'}`}
                      value="Registrovat" />
                    <button onClick={handleBack}
                      type="button"
                      className="px-4 py-2 text-center bg-gray-300 text-gray-700 rounded-md cursor-pointer hover:bg-gray-400 transition duration-300 w-[120px]">
                      Zpět
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>

          <div className='mt-4 w-[80%]  bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer'>
            <button
              className="bg-blue-500 hover:bg-blue-700  font-bold py-2  rounded"
              onClick={() => login()}
              style={{ width: '100%' }}
            >
              Zaregistovat se s  Google 🚀
            </button>
          </div>
          {backendErrorGoogle && <div className="text-red-500">{backendErrorGoogle}</div>}

          <h5 className='pt-4 text-gray-600 '>Již nemáš účet?
            <Link to='/login' className='text-gray-600 underline cursor-pointer'>
              Přihlásit se
            </Link>
          </h5>
          <h5 className='text-gray-600 '>Zapomenuté heslo : <Link to='/forgottenpassword' className='text-gray-600 underline cursor-pointer'>
            Klikni zde
          </Link>  </h5>

          <div className='h-[100px]'>
            <Image className='flex mt-4  w-full h-full object-cover' src={fun} alt="lide" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
