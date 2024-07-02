import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Flip, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from '../custom/Image';
import lide from '../assets/images/lide.svg';
import { useMutation } from '@tanstack/react-query';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import { useAuthContext } from '../context/authContext';
import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;

}

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [backendErrorGoogle, setBackendErrorGoogle] = useState('');
  const { setUser,setUpdateUser} = useAuthContext()

  const location = useLocation();

  const showPasswordToggle = () => {
    setShowPassword(prev => !prev);
  };

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
      .required('Required!')
      .email('Invalid email format')
      .max(50, 'Email must be at most 50 characters'),
    password: Yup.string()
      .required('Required')
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be at most 50 characters'),
  });

  const initialValues = {
    email: '',
    password: '',
  };

  // Mutation function that logs values to the console
  const logCredentials = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        ...HTTP_CONFIG, // Spread HTTP_CONFIG if needed
        method: 'POST',
        body: JSON.stringify(credentials),
        credentials: 'include', // Set credentials directly here
      });
/*       const response = await axios.post(`${BASE_URL}/login`, credentials, HTTP_CONFIG);
      console.log(response); */
      if (!response.ok) {
        throw new Error('Chyba při přihlašování'); 
      }
  
      const data = await response.json(); 
            setUser(data.user);

      return data; 
    } catch (error) {
      console.error('Error logging in:', error);
      throw error; 
    }
  };
  

  const mutation = useMutation<void, Error, LoginCredentials>({
    mutationFn: logCredentials,
    onSuccess: (data:any) => {
      navigate('/');
        toast.success(data.message,  { 
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
    },
    onError: (error) => {
      setBackendError(error.message);
      toast.error('Chyba při přihlašování', {
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
    },
  });

  const handleSubmit = (values: LoginCredentials, { resetForm }: any) => {
    mutation.mutate(values);
    resetForm();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className='flex flex-wrap items-center overflow-y-auto min-h-[600px] mt-20'>
        <div className="relative bg-white px-4 py-4 rounded-lg flex items-center justify-center flex-col">
          <h1 className='mt-4 text-black poppins-extrabold text-3xl'>Příhlášení</h1>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            <Form className="flex flex-col space-y-4 items-center w-[350px] relative">
              <Field name="email" type="email" id="email" placeholder="Email" autoComplete="off" className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
              <ErrorMessage name="email" component="div" className="text-red-500" />

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

              {backendError && <div className="text-red-500">{backendError}</div>}
              <div className="flex space-x-4">
                <input type="submit" className="px-4 py-2 bg-blue-500 text-gray-700 rounded-md cursor-pointer hover:bg-blue-600 transition duration-300 w-[120px]" value="Přihlásit" />
                <button onClick={handleBack} type="button" className="px-4 py-2 text-center bg-gray-300 text-gray-700 rounded-md cursor-pointer hover:bg-gray-400 transition duration-300 w-[120px]">
                  Zpět
                </button>
              </div>
            </Form>
          </Formik>

          <div className='mt-4 w-[80%] bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer'>
            <button className="bg-blue-500 hover:bg-blue-700 font-bold py-2 rounded" style={{ width: '100%' }}>
              Přihlásit s Google 🚀
            </button>
          </div>

          <h5 className='pt-4 text-gray-600'>Ještě nemáš účet?
            <Link to='/register' className='text-gray-600 underline cursor-pointer'>Zaregistrovat se</Link>
          </h5>
          <h5 className='text-gray-600'>Zapomenuté heslo: <Link to='/forgottenpassword' className='text-gray-600 underline cursor-pointer'>Klikni zde</Link></h5>

       {/*    {backendError && <div className="text-red-500">{backendError}</div>}
          {backendErrorGoogle && <div className="text-red-500">{backendErrorGoogle}</div>} */}
          <div className='h-[100px]'>
            <Image className='flex mt-4 w-full h-full object-cover' src={lide} alt="lide" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
