import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../custom/Image';
import ThemeComponent from './ThemeComponent';
import logo from '../assets/images/logo.png';
import { useAuthContext } from '../context/authContext';
import { Flip, toast } from 'react-toastify';
import { BASE_URL } from '../constants/config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const { user,setUser,setUpdateUser,isLoading} = useAuthContext();
    const navigate = useNavigate()

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

      //  setChosenCountry('')
        toast.success(response.data.message,  {
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
          setUpdateUser(null)
      setUser(null)
      navigate('/')
        }
    
    } catch (err) {
      console.log('Error fetching user data:', err);
  };

}
  fetchUserData();

}

  return (
    <>
      <nav className={`relative bg-gray-200 dark:bg-gray-700  top-0 flex justify-between items-center w-full dark:text-yellow-500 text-yellow-800 md:px-4  md:py-4  font-bold  pb-4 `}>
        <div className='flex flex-col md:flex-row md:space-x-16 space-x-2 md:space-y-0 space-y-2 items-start md:items-center'>
          <Link to="/" className="md:w-[250px] w-[150px] block">
            <Image src={logo} alt="Logo" className='' />
          </Link>

            <div className='flex gap-2 md:gap-6'>
                <Link to="/traveltips" className="dark:hover:text-gray-300 hover:text-yellow-500 ">
                    TravelTips
                </Link>
                
                <Link to="/spolucesty" className="dark:hover:text-gray-300 hover:text-yellow-500 ">
                    Spolucesty
                </Link>
             </div>
        </div>

{!user ?         
    <div className='flex flex-col md:flex-row md:space-x-4  items-start justify-start pr-8 md:pr-0 '>
          <Link to="/login" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Přihlášení
          </Link>
          
          <Link to="/register" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Registrace
          </Link>

        </div> : 
          <div className='flex flex-col md:flex-row md:space-x-4  items-start justify-start pr-8 md:pr-0 '>
          <Link to="/profil" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Profil
          </Link>
          
          <div onClick={logOutFunction} className="dark:hover:text-gray-300 cursor-pointer hover:text-yellow-500">
            Odhlásit
          </div>

        </div>
        
        }
    
    
    
  

        
            <div className="dark:hover:text-gray-300 hover:text-yellow-500 absolute top-1 right-2">
            <ThemeComponent />
          </div>

      </nav>

      {/* BOTTOM NAVBAR */}
      <nav className={` ${visible ? 'hidden' : 'fixed'} bg-gray-200 dark:bg-gray-700 bottom-0 flex justify-between items-center  w-full dark:text-yellow-500 text-yellow-800 px-2 md:px-4 md:py-4 md:text-xl font-bold text-base pb-4 `}>
        <div className='flex gap-4 md:items-center'>

          <Link to="/traveltips" className="dark:hover:text-gray-300 hover:text-yellow-500">
            TravelTips
          </Link>
          
          <Link to="/spolucesty" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Spolucesty
          </Link>
        
        </div>

        <div className='flex gap-2 pl-2 items-center pr-6 md:pr-0'>
          
        {!user ?        
          <>          <Link to="/login" className="dark:hover:text-gray-300 hover:text-yellow-500">
          Přihlášení
          </Link>
          
          <Link to="/register" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Registrace
          </Link>
          </>

          :     <>   
          <Link to="/profil" className="dark:hover:text-gray-300 hover:text-yellow-500">
          Profil
          </Link>
          
          <div onClick={logOutFunction} className="dark:hover:text-gray-300 hover:text-yellow-500">
          Odhlásit
          </div>          </>} 


          <div className="dark:hover:text-gray-300 hover:text-yellow-500">
            <ThemeComponent />
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
