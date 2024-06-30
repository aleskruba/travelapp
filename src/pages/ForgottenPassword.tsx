import React, { useState, FormEvent} from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { BASE_URL,HTTP_CONFIG } from '../constants/config';
import { Flip, toast } from "react-toastify";


function ForgottenPassword() {

  const navigate = useNavigate();
  const [backendError, setBackendError] = useState("");
  const [isLoading, setIsloading] = useState(false);

  let location = useLocation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Required!")
      .email("Invalid email format")
      .max(50, "Email must be at most 50 characters"),
  });

  const initialValues = {
    email: "",
  };



  async function handleSubmit(values: any, { resetForm }: any) {


    try {
    console.log(values);



    } catch (err: any) {
      setBackendError(err.response.data.error);
      setIsloading(false);
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
        <div className="relative bg-white p-2 rounded-lg flex items-center justify-center flex-col w-[350px] min-w-[350px] h-full max-h-[400px] md:w-[450px] md:h-[550px] ">
          <div className="absolute text-2xl top-2 right-2  text-gray-500 hover:text-gray-700 cursor-pointer">

          </div>
          <h1 className="mt-4 text-black poppins-extrabold text-3xl mb-4">
            ZAPOMENUTÉ HESLO
          </h1>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {!isLoading ? (
                  <>
                    <Form className="flex flex-col space-y-4 items-center w-[350px] ">
                      <Field
                        name="email"
                        type="email"
                        id="email"
                        placeholder="zadej svůj email"
                        autoComplete="off"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
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
                        <input
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition duration-300 w-[120px]"
                          value="Odeslat"
                        /> 
                        <button onClick={handleBack} type="button" className="px-4 py-2 text-center bg-gray-300 text-gray-700 rounded-md cursor-pointer hover:bg-gray-400 transition duration-300 w-[120px]">
                        Zpět
                      </button>
                      </div>
                    </Form>
                  </>
                ) : (
                  <>
                  <p>moment prosím....</p>
                  </>
                )}
              </Formik>
            </div>
   
          <h5 className="pt-4">
            vzpomněl jsi si?
            <Link to="/login">
              
              Přihlásit se
            </Link>
          </h5>
        </div>
      </div>


    </div>
  )
}

export default ForgottenPassword