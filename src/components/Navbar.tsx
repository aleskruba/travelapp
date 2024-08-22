import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Image from '../custom/Image';
import ThemeComponent from './ThemeComponent';
import logo from '../assets/images/logo.png';
import { useAuthContext } from '../context/authContext';
import { Flip, toast } from 'react-toastify';
import { BASE_URL } from '../constants/config';
import axios from 'axios';

function Navbar() {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const { user, setUser, setUpdateUser, isLoading } = useAuthContext();
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
                if (response.status === 200) {
                    toast.success(response.data.message, {
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
                console.log('Error fetching user data:', err);
            }
        };

        fetchUserData();
    };

    return (
        <>
            <nav className={`relative bg-gray-200 dark:bg-gray-700 top-0 flex justify-between items-center w-full dark:text-white text-yellow-800 md:px-4 md:py-4 font-bold pb-4`}>
                <div className='flex flex-col md:flex-row md:space-x-16 space-x-2 md:space-y-0 space-y-2 items-start md:items-center'>
                    <NavLink to="/" className="md:w-[250px] w-[150px] block">
                        <Image src={logo} alt="Logo" className='' />
                    </NavLink>

                    <div className='flex text-xl  gap-2 md:gap-6 justify-center md:justify-start md:w-0 w-[20rem]'>
                        <NavLink
                            to="/traveltips"
                            className={({ isActive }) =>
                                ` p-4 font-bold md:font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                            }
                        >
                            TravelTips
                        </NavLink>
                        <NavLink
                            to="/spolucesty"
                            className={({ isActive }) =>
                                `p-4 font-bold md:font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                            }
                        >
                            Spolucesty
                        </NavLink>
                    </div>
                </div>

                {!user ? (
                    <div className='flex flex-col md:flex-row md:space-x-4 items-start justify-start pr-8 md:pr-0 '>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                            }
                        >
                            Přihlášení
                        </NavLink>
                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                            }
                        >
                            Registrace
                        </NavLink>
                    </div>
                ) : (
                    <div className='flex flex-col md:flex-row md:space-x-4 items-start justify-start pr-8 md:pr-0 '>
                        <NavLink
                            to="/profil"
                            className={({ isActive }) =>
                                `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                            }
                        >
                            Profil
                        </NavLink>
                        <div onClick={logOutFunction} className="dark:hover:text-gray-300 cursor-pointer hover:text-yellow-500">
                            Odhlásit
                        </div>
                    </div>
                )}

                <div className="dark:hover:text-gray-300 hover:text-yellow-500 absolute top-1 right-2">
                    <ThemeComponent />
                </div>
            </nav>

            {/* BOTTOM NAVBAR */}
            <nav className={`${visible ? 'hidden' : 'fixed'} bg-gray-200 dark:bg-gray-700 bottom-0 flex justify-between items-center w-full dark:text-white text-yellow-800 px-2 md:px-4 md:py-4 md:text-xl font-bold text-base pb-4 z-50`}>
                <div className='flex gap-4 md:items-center'>
                    <NavLink
                        to="/traveltips"
                        className={({ isActive }) =>
                            `p-4 font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                        }
                    >
                        TravelTips
                    </NavLink>
                    <NavLink
                        to="/spolucesty"
                        className={({ isActive }) =>
                            `p-4 font-extrabold transition duration-300 ease-in-out ${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                        }
                    >
                        Spolucesty
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
                                Přihlášení
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                                }
                            >
                                Registrace
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/profil"
                                className={({ isActive }) =>
                                    `${isActive ? 'text-yellow-500' : 'dark:hover:text-gray-300 hover:text-yellow-500'}`
                                }
                            >
                                Profil
                            </NavLink>
                            <div onClick={logOutFunction} className="dark:hover:text-gray-300 hover:text-yellow-500 cursor-pointer">
                                Odhlásit
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
