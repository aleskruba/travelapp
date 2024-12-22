import  { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "../custom/Image";
import fun from "../assets/images/fun.png";
import { BASE_URL, HTTP_CONFIG } from "../constants/config";
import { useAuthContext } from "../context/authContext";
import { useGoogleLogin } from "@react-oauth/google";
import { fetchData } from "../hooks/useFetchData";
import Button from "../components/customButton/Button";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { authConstants } from "../constants/constantsAuth";
import { navbarConstants } from "../constants/constantsData";
import { useLanguageContext } from '../context/languageContext';

interface LoginCredentials {
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [backendErrorGoogle, setBackendErrorGoogle] = useState("");
  const [isLoding, setIsLoding] = useState(false);
  const { user, setUser } = useAuthContext();
  const [wrongData,setWrongData] = useState<any>(null)
  const { language} = useLanguageContext();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const location = useLocation();

  const showPasswordToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleBack = () => {
    const currentPath = location.pathname;
    if (currentPath === "/login" || currentPath === "/register") {
      navigate("/");
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
      .max(50, authConstants.passwordMax[language]),
  });

  const initialValues = {
    email: wrongData ? wrongData.email : "",
    password: wrongData ? wrongData.password : "",

  };

  const logCredentials = async (credentials: LoginCredentials) => {
    setIsLoding(true);
    try {
      const response = await fetchData(
        `${BASE_URL}/login`,
        "POST",
        credentials
      );

      const data = await response.json();
   
      if (!response.ok) {
        console.log(data)
       setWrongData({email:data.error.email,password:data.error.password})
        setIsLoding(false);
        throw new Error(response.statusText);
      }

   
      setUser(data.user);
      setIsLoding(false);
      return data;
    } catch (error:any) {
      setIsLoding(false);
      console.log('error',error.message);
      if (error.message === 'Unauthorized') {
        throw new Error(`BACKEND - ${authConstants.loginError[language] }`);
      }
        }

  };
  const getClientIp = async () => {
    try {
      // Step 1: Get the IP address from ipify API
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      // Step 2: Fetch geolocation data (country) based on the IP
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoResponse.json();

      // Get the country from the geolocation response
      const country = geoData.country_name || 'Unknown'; // Fallback to 'Unknown' if country info is not available

      // Step 3: Concatenate the IP and country with a hyphen
      const concatenatedResult = `${ip}-${country}`;
      console.log(concatenatedResult); // Logs something like "192.168.0.1-US"

      return concatenatedResult; // Return the concatenated result
  } catch (error) {
      console.error("Unable to fetch IP or country:", error);
      return ''; // Fallback or empty string
  }
};

  const handleSubmit = async (values: LoginCredentials, { resetForm }: any) => {
    try {


      const clientIpAddress = await getClientIp(); // This function could make a request to an external service

      // Spread the values and add the IP address
      const requestData = {
          ...values, // This includes email and password
          ipAddress: clientIpAddress, // Add the IP address to the payload
      };

      const data = await logCredentials(requestData);
 
      resetForm();
      navigate("/");
      showSuccessToast(authConstants.success[language])
    
    } catch (error: any) {
       setBackendError(error.message)
       showErrorToast(authConstants.loginError[language])
    }
  };

  const login = useGoogleLogin({
    
    onSuccess: async (res) => {
      try {
        setIsLoding(true);
        const responseGoogle = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${res.access_token}`,
            },
          }
        );

        if (!responseGoogle.ok) {
          throw new Error(`HTTP error! status: ${responseGoogle.status}`);
        }

        const clientIpAddress = await getClientIp();

        const dataGoogle = await responseGoogle.json();
        const values = {
          email: dataGoogle.email,
          name: dataGoogle.given_name,
          profilePicture: dataGoogle.picture,
          ipAddress: clientIpAddress, 
        };

        const response = await fetch(`${BASE_URL}/googleauthLogin`, {
          ...HTTP_CONFIG,
          method: "POST",
          body: JSON.stringify(values),
          credentials: "include",
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
        setBackendErrorGoogle(authConstants.wrongEmail[language]);
      }
    },
  });

  return (
    <div className="fixed inset-0 flex md:items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="flex flex-wrap md:items-center overflow-y-auto max-h-[500px] mt-2  md:mt-20">
        {isLoding ? (
          <h1>{navbarConstants.waitplease[language]}</h1>
        ) : (
          <div
            className={` ${
              isLoding ? "opacity-10 pointer-events-none" : ""
            }relative bg-white px-4 py-4 rounded-lg flex items-center justify-center flex-col `}
          >
            <h1 className="pb-4 text-black poppins-extrabold text-2xl md:text-3xl">
              {authConstants.login[language]}
            </h1>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values,errors }) => {
                const isFormValid = values.email &&  !errors.email && values.password 

                return (
                  <Form className="flex flex-col space-y-4 items-center md:w-[380px] w-[300px] relative">

                    <div className="relative w-full">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>  
                    <Field
                      name="email"
                      type="email"
                      id="email"
                      placeholder="Email"
                      autoComplete="off"
                      className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500"
                    />
            </div>
                    <div className="relative w-full">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {authConstants.password[language]}
                </label>
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
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500"
                    />

                    {backendError && (
                      <div className="text-red-500">{backendError}</div>
                    )}
                    <div className="flex space-x-4">
                      <Button
                        type="submit"
                        color={isFormValid ? "blue" : "gray"}
                        className={`${isFormValid ? "text-gray-700" : "text-gray-200 opacity-50 cursor-not-allowed"} w-[120px] transition duration-300`}
                          disabled={!isFormValid}
                      >
                      {authConstants.login[language]}
                      </Button>
                      <Button
                        onClick={handleBack}
                        type="button"
                        color="gray"
                        className="w-[120px]"
                      >
                          {authConstants.back[language]}
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>

            <div className="mt-4 w-[80%] bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer">
              <Button
                color="blue"
                className="font-bold"
                width="100%"
                onClick={() => login()}
              >
                   {authConstants.google[language]} 🚀
              </Button>
            </div>
            {backendErrorGoogle && (
              <div className="text-red-500">{backendErrorGoogle}</div>
            )}
            <h5 className="pt-4 text-gray-600">
            {authConstants.account[language]}
              <Link
                to="/register"
                className="text-gray-600 underline cursor-pointer"
              >
                    {authConstants.register[language]}
              </Link>
            </h5>
            <h5 className="text-gray-600">
            {authConstants.ForgottenPassword[language]}{": "}
              <Link
                to="/forgottenpassword"
                className="text-gray-600 underline cursor-pointer"
              >
                   {authConstants.click[language]}
              </Link>
            </h5>
            <div className="h-[100px]">
              <Image
                className="flex mt-4 w-full h-full object-cover"
                src={fun}
                alt="lide"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
