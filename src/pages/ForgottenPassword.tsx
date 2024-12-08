import { useState, useEffect} from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuthContext } from "../context/authContext";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { BASE_URL } from '../constants/config';
import { fetchData } from "../hooks/useFetchData";
import Button from "../components/customButton/Button";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { authConstants } from "../constants/constantsAuth";
import { useLanguageContext } from '../context/languageContext';

function ForgottenPassword() {

  const navigate = useNavigate();
  const [backendError, setBackendError] = useState("");
  const [isLoading,setisLoading] = useState(false);
  const { user} = useAuthContext()
  const { language} = useLanguageContext();
  let location = useLocation();

  useEffect(()=>{
    if (user){
        navigate('/')
        }
    },[user])

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Required!")
      .email(authConstants.emailFormat[language])
      .max(50,authConstants.emailMaxMin[language]),
  });

  const initialValues = {
    email: "",
  };



  async function handleSubmit(values: any, { resetForm }: any) {
    setisLoading(true)

    try {
      const response = await fetchData(`${BASE_URL}/sendemail`,'POST',values)
/*     const response = await fetch(`${BASE_URL}/sendemail`, {
      ...HTTP_CONFIG, // Spread HTTP_CONFIG if needed
      method: 'POST',
      body: JSON.stringify(values),
      credentials: 'include', // Set credentials directly here
    }); */

    if (response.status === 404) {
      setisLoading(false)
      setBackendError(authConstants.emailNotRegistered[language]);
      showErrorToast(authConstants.emailNotRegistered[language])
    }
    if (response.status === 201) {

      setisLoading(false)
      showSuccessToast(authConstants.emailWasSent[language])

      navigate('/');
    }


    } catch (err: any) {
      setBackendError('Something went wrong....');
   //   setIsloading(false);
      return;
    } finally {
      resetForm();
    }
  }


  const handleBack = () => {
    const currentPath = location.pathname;
    if (currentPath === '/login' || currentPath === '/register' || currentPath === '/forgottenpassword') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto ">
      <div className="flex flex-wrap items-center  overflow-y-auto min-h-[500px] mt-20">
        <div className="relative bg-white p-2 rounded-lg flex items-center justify-center flex-col  w-[330px] md:min-w-[350px] h-full max-h-[400px] md:w-[450px] md:h-[550px] ">
          <div className="absolute text-2xl top-2 right-2  text-gray-500 hover:text-gray-700 cursor-pointer">

          </div>
          <h1 className="mt-4 text-black poppins-extrabold text-2xl md:text-3xl mb-4">
          {authConstants.forgottenPasswordTitle[language]}
          </h1>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                        {({ values, errors }) => {
    const isFormValid = values.email;  

    return (
                    <Form className="flex flex-col space-y-4 items-center w-[320px] md:w-[350px] ">
                      <Field
                        name="email"
                        type="email"
                        id="email"
                        placeholder=  {authConstants.enterYourEmail[language]}
                        autoComplete="off"
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:border-blue-500"
                      />

                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500"
                      />
                      {backendError && (
                        <div className="text-red-500">{backendError}</div>
                      )}
               <div className="flex justify-center gap-4 mt-4">
              <Button
                type="submit"
                color={isLoading ? "blue" : isFormValid ? "blue" : "gray"}
                className={`px-4 py-2 rounded-md transition duration-300 w-[120px] ${isLoading ? 'opacity-50 pointer-events-none' : isFormValid ? 'text-gray-700 hover:bg-blue-600' : 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed'}`}
                disabled={isLoading || !isFormValid}
              >
              {authConstants.send[language]}
              </Button>
              <Button
                onClick={handleBack}
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
            </div>
   
          <h5 className="pt-4">
          {authConstants.remember[language]}
            <Link to="/login">
              
            {authConstants.login[language]}
            </Link>
          </h5>
        </div>
      </div>


    </div>
     
  )
}

export default ForgottenPassword