import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuthContext } from "../context/authContext";
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import { Flip, toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { fetchData } from "../hooks/useFetchData";
import Button from "../components/customButton/Button";

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

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('chybí token nebo jsi přihlášen', {
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
        toast.error('vypšela platnost tokenu', {
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
      .required('Required')
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be at most 50 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one digit'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Required')
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
        throw new Error('Hesla musí být stejná');
      }

      const data = await response.json();
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
      navigate("/login");
    } catch (error: any) {
      setBackendError(error.message);
      toast.error('Chyba při resetování hesla', {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto ">
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
                        placeholder="Nové heslo"
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
                  <Button
                    type="submit"
                    color={isFormValid ? "blue" : "gray"}
                    className={`px-4 py-2 rounded-md transition duration-300 w-[120px] ${isFormValid ? 'text-gray-700 hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isFormValid}
                  >
                    Uložit
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    type="button"
                    color="gray"
                    className="px-4 py-2 text-center transition duration-300 w-[120px]"
                  >
                    Zpět
                  </Button>
                </div>

                  </Form>
                );
              }}
            </Formik>
          ) : (
            <div>ověřuji token...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
