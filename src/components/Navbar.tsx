import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Image from '../custom/Image';
import ThemeComponent from './ThemeComponent';
import logo from '../assets/images/travel4.png';
import { useAuthContext } from '../context/authContext';
import FlagComponent from './FlagComponent';
import { useLanguageContext } from '../context/languageContext';
import { navbarConstants } from '../constants/constantsData';
import { UserCircleIcon  } from '@heroicons/react/24/solid'
import { LogIn, UserPlus } from "lucide-react";


function Navbar() {
    

    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const { user } = useAuthContext();
     const { language} = useLanguageContext();
     const { isServerOn,isSocketServerOn,isRedisOn } = useAuthContext();
    


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



      

    return (
        <>
            <nav className={`relative pt-4 md:pt-0 bg-gray-200 dark:bg-gray-700 top-0 flex justify-between items-center w-full text-gray-500 dark:text-gray-200 md:px-4 px-2 md:py-4 font-bold pb-4`}>
             
            <div className="flex gap-2 top-1  absolute left-1/2 transform -translate-x-1/2 ">
          
          <div className="flex items-center gap-2 w-14 h-3 text-xs">
              <div className={`w-2 h-2 rounded-full ${isServerOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Server</span>
            </div>
          
            {/* Socket Server Status */}
            <div className="flex items-center gap-2 w-14 h-3 text-xs">
              <div className={`w-2 h-2 rounded-full ${isSocketServerOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Socket</span>
            </div>
          
            {/* Redis Status */}
            <div className="flex items-center gap-2 w-14 h-3 text-xs">
              <div className={`w-2 h-2 rounded-full ${isRedisOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Redis</span>
            </div>
            </div>


                <div className='flex flex-col md:flex-row md:space-x-16 space-x-2 md:space-y-0 space-y-2 items-start md:items-center'>
                <NavLink to="/" className="md:w-[150px] w-[150px] pl-4 pt-2 block">
                    <Image src={logo} alt="Logo" className="blended-image" />
                    </NavLink>


                    <div className='flex text-lg  gap-2 md:gap-6 w-62 '>
                        <NavLink
                            to="/traveltips"
                            className={({ isActive }) =>
                                ` p-2   font-bold md:font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-darkBlue dark:text-lightBlue' : ' hover:text-darkBlue dark:hover:text-lightBlue'}`
                            }
                        >
                           {navbarConstants.traveltips[language]}
                        </NavLink>
                        <NavLink
                            to="/tours"
                            className={({ isActive }) =>
                                `p-2    font-bold md:font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-darkBlue dark:text-lightBlue' : ' hover:text-darkBlue dark:hover:text-lightBlue'}`
                            }
                        >
                             {navbarConstants.travelMates[language]}
                        </NavLink>
                    </div>
                </div>

                {!user ? (
                    <div className="mt-12 md:mt-8 pl-4 flex gap-2 md:flex-row flex-col shadow-md">
                    {/* Login Link */}
                    <Link 
                      to="/login" 
                      className="flex items-center p-2 gap-2 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <LogIn className="h-5 w-5" />
                      <span>{navbarConstants.login[language]}</span>
                    </Link>
              
                    {/* Register Link */}
                    <Link 
                      to="/register" 
                      className="flex items-center p-2 gap-2 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>{navbarConstants.signUp[language]}</span>
                    </Link>
                  </div>
                   

                ) : (
                    <div className="mt-8  flex text-lg md:text-base  md:gap-4 flex-col sm:flex-row items-center justify-center  p-2 mr-4 bg-gray-300 text-gray-900 rounded-lg shadow-md">

                   
                       <NavLink
                       to="/profil"
                       className={({ isActive }) =>
                         `${isActive 
                           ? 'text-darkBlue ' 
                           : ' hover:text-darkBlue text-gray-500 '} 
                           flex items-center justify-center`
                       }
                     >
                       <UserCircleIcon className="h-8 w-8" />
                       <span className="">{navbarConstants.profile[language]}</span>
                     </NavLink>
              
                    </div>
                )}
                    
                <div className="flex items-center pt-5 md:pt-0 md:gap-2 gap-6 dark:hover:text-gray-300 hover:text-darkBlue absolute top-1 right-2">
               <FlagComponent/> <ThemeComponent />
                </div>
            </nav>

            {/* BOTTOM NAVBAR */}
            <nav className={`${visible ? 'hidden' : 'fixed'} bg-gray-200 dark:bg-gray-700 bottom-0 flex  flex-col md:flex-row justify-between items-center w-full text-gray-500 dark:text-gray-200 px-2 md:px-4 md:py-4 md:text-xl font-bold text-base pb-4 `}>
                <div className='flex gap-2 md:items-center'>
                    <NavLink
                        to="/traveltips"
                        className={({ isActive }) =>
                            `p-2 font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-darkBlue dark:text-lightBlue' : ' hover:text-darkBlue dark:hover:text-lightBlue'}`
                        }
                    >
                    {navbarConstants.traveltips[language]}
                    </NavLink>
                    <NavLink
                        to="/tours"
                        className={({ isActive }) =>
                            `p-2 font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-darkBlue dark:text-lightBlue' : ' hover:text-darkBlue dark:hover:text-lightBlue'}`
                        }
                    >
                {navbarConstants.travelMates[language]}
                    </NavLink>
                </div>

                <div className='flex gap-4 justify-center items-center  md:pr-0'>
                    {!user ? (
                        <>
                       <Link 
                      to="/login" 
                      className="flex items-center p-2 gap-2 hover:text-gray-700 dark:text-gray-200  dark:hover:text-gray-300"
                    >
                      <LogIn className="h-5 w-5" />
                      <span>{navbarConstants.login[language]}</span>
                    </Link>
              
                    {/* Register Link */}
                    <Link 
                      to="/register" 
                      className="flex items-center p-2 gap-2 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-300"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>{navbarConstants.signUp[language]}</span>
                    </Link>
                        </>
                    ) : (
                        <> 
                            <NavLink
                            to="/profil"
                            className={({ isActive }) =>
                              `${isActive 
                                ? 'text-darkBlue dark:text-lightBlue'
                                : ' hover:text-darkBlue text-gray-500 dark:text-gray-200 dark:hover:text-lightBlue'} 
                                flex items-center justify-center`
                            }
                          >
                            <UserCircleIcon className="h-8 w-8" />
                            <span className="">{navbarConstants.profile[language]}</span>
                          </NavLink>  
                   
                        </>
                    )}

                    <div className="dark:hover:text-gray-300 hover:text-darkBlue pl-4">
                        <ThemeComponent />
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
