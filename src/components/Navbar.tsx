import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate ,useLocation} from 'react-router-dom';
import Image from '../custom/Image';
import ThemeComponent from './ThemeComponent';
import logo from '../assets/images/travel4.png';
import { useAuthContext } from '../context/authContext';
import { Flip, toast } from 'react-toastify';
import { BASE_URL } from '../constants/config';
import axios from 'axios';
import FlagComponent from './FlagComponent';
import { useLanguageContext } from '../context/languageContext';
import { navbarConstants } from '../constants/constantsData';
import { authConstants } from "../constants/constantsAuth";
import { useQueryClient } from '@tanstack/react-query';

function Navbar() {
    
     const queryClient = useQueryClient();
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const { user, setUser, setUpdateUser } = useAuthContext();
     const { language} = useLanguageContext();
     const location = useLocation();

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;

            setPrevScrollPos(currentScrollPos);
            setVisible(visible);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [prevScrollPos]);

    const logOutFunction = () => {
        const fetchUserData = async () => {
            try {
                const url = `${BASE_URL}/logout`;
                const response = await axios.get(url, { withCredentials: true });

      

                    queryClient.clear(); // Clear all cached data
              

                if (response.status === 200) {
                    toast.success(authConstants.logout[language], {
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
                    setUpdateUser(null);
                    setUser(null);
                    navigate('/');
                }
            } catch (err) {
                console.log('Error during logout :', err);
            }
        };

        fetchUserData();
    };

   
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, "0")}.${String(
          today.getMonth() + 1
        ).padStart(2, "0")} ${today.getFullYear()}`;

    return (
        <>
            <nav className={`relative bg-gray-200 dark:bg-gray-700 top-0 flex justify-between items-center w-full dark:text-white text-yellow-800 md:px-4 px-2 md:py-4 font-bold pb-4`}>
                <div className='flex flex-col md:flex-row md:space-x-16 space-x-2 md:space-y-0 space-y-2 items-start md:items-center'>
                <NavLink to="/" className="md:w-[150px] w-[150px] pl-4 pt-2 block">
                    <Image src={logo} alt="Logo" className="blended-image" />
                    </NavLink>


                    <div className='flex text-lg  gap-2 md:gap-6   '>
                        <NavLink
                            to="/traveltips"
                            className={({ isActive }) =>
                                ` p-4 font-bold md:font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                            }
                        >
                           {navbarConstants.traveltips[language]}
                        </NavLink>
                        <NavLink
                            to="/tours"
                            className={({ isActive }) =>
                                `p-4 font-bold md:font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                            }
                        >
                             {navbarConstants.travelMates[language]}
                        </NavLink>
                    </div>
                </div>

                {!user ? (
                       <div className="mt-8  flex text-lg md:text-base  md:gap-4 flex-col sm:flex-row items-center justify-center  p-2 mr-4 bg-gray-300 text-gray-900 rounded-lg shadow-md">
                        <div className='text-xs font-thin md:hidden '>start here</div>
                       <Link 
                           to="/login" 
                           className="flex justify-center w-full hover:text-gray-700 ">
                              {navbarConstants.login[language]}
                       </Link>
                       <Link 
                           to="/register" 
                           className=" flex justify-center w-full hover:text-gray-700">
                             {navbarConstants.signUp[language]}
                       </Link>
                   </div>
                   

                ) : (
                    <div className="mt-8  flex text-lg md:text-base  md:gap-4 flex-col sm:flex-row items-center justify-center  p-2 mr-4 bg-gray-300 text-gray-900 rounded-lg shadow-md">
                     <div className='text-xs font-thin md:hidden '>welcome</div>
                        {!user.isAdmin && 
                      <Link 
                      to="/profil" 
                      className="auth-link text-center hover:text-gray-700">
                        {navbarConstants.profile[language]}
                  </Link> }
                        <div onClick={logOutFunction} className="auth-link text-center hover:text-gray-700 cursor-pointer">
                        {navbarConstants.logout[language]}
                        </div>
                    </div>
                )}
                    
                <div className="flex items-center gap-2 dark:hover:text-gray-300 hover:text-yellow-500 absolute top-1 right-2">
                {!user?.isAdmin &&<FlagComponent/>} <ThemeComponent />
                </div>
            </nav>

            {/* BOTTOM NAVBAR */}
            <nav className={`${visible ? 'hidden' : 'fixed'} bg-gray-200 dark:bg-gray-700 bottom-0 flex flex-col md:flex-row justify-between items-center w-full dark:text-white text-yellow-800 px-2 md:px-4 md:py-4 md:text-xl font-bold text-base pb-4 z-50`}>
                <div className='flex gap-2 md:items-center'>
                    <NavLink
                        to="/traveltips"
                        className={({ isActive }) =>
                            `p-2 font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                        }
                    >
                    {navbarConstants.traveltips[language]}
                    </NavLink>
                    <NavLink
                        to="/tours"
                        className={({ isActive }) =>
                            `p-2 font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                        }
                    >
                {navbarConstants.travelMates[language]}
                    </NavLink>
                </div>

                <div className='flex gap-2 pl-2 items-center pr-6 md:pr-0'>
                    {!user ? (
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                                }
                            >
                          {navbarConstants.login[language]}
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                                }
                            >
                              {navbarConstants.signUp[language]}
                            </NavLink>
                        </>
                    ) : (
                        <> {!user.isAdmin && 
                            <NavLink
                                to="/profil"
                                className={({ isActive }) =>
                                    `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                                }
                            >
                                {navbarConstants.profile[language]}
                            </NavLink>}
                            <div onClick={logOutFunction} className="dark:hover:text-gray-300 hover:text-yellow-500 cursor-pointer">
                            {navbarConstants.logout[language]}
                            </div>
                        </>
                    )}

                    <div className="dark:hover:text-gray-300 hover:text-yellow-500">
                        <ThemeComponent />
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
