import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../custom/Image';
import ThemeComponent from './ThemeComponent';
import logo from '../assets/images/logo.png';

function Navbar() {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);

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
      <nav className={`relative bg-gray-200 dark:bg-gray-700  top-0 flex justify-between items-center w-full dark:text-yellow-500 text-yellow-800 md:px-4  md:py-4 md:text-2xl font-bold text-xl pb-4 `}>
        <div className='flex flex-col md:flex-row md:space-x-16 space-x-2 md:space-y-0 space-y-2 items-start md:items-center'>
          <Link to="/" className="md:w-[250px] w-[150px] block">
            <Image src={logo} alt="Logo" className='' />
          </Link>

            <div className='flex gap-6'>
                <Link to="/traveltips" className="dark:hover:text-gray-300 hover:text-yellow-500 pl-4 md:pl-0">
                    TravelTips
                </Link>
                
                <Link to="/spolucesty" className="dark:hover:text-gray-300 hover:text-yellow-500 pl-4 md:pl-0">
                    Spolucesty
                </Link>
             </div>
        </div>

        <div className='flex flex-col md:flex-row md:space-x-4 md:pt-2 items-start justify-start pr-6 md:pr-0 '>
          <Link to="/login" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Login
          </Link>
          
          <Link to="/register" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Register
          </Link>

        </div>

        
            <div className="dark:hover:text-gray-300 hover:text-yellow-500 absolute top-1 right-2">
            <ThemeComponent />
          </div>

      </nav>

      {/* BOTTOM NAVBAR */}
      <nav className={` ${visible ? 'hidden' : 'fixed'} bg-gray-200 dark:bg-gray-700 bottom-0 flex justify-between items-center  w-full dark:text-yellow-500 text-yellow-800 px-2 md:px-4 md:py-4 md:text-2xl font-bold text-base pb-4 `}>
        <div className='flex md:space-x-16 space-x-2 md:items-center'>

          <Link to="/traveltips" className="dark:hover:text-gray-300 hover:text-yellow-500">
            TravelTips
          </Link>
          
          <Link to="/spolucesty" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Spolucesty
          </Link>
        
        </div>

        <div className='flex space-x-4 items-center pr-6 md:pr-0'>
          <Link to="/login" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Login
          </Link>
          
          <Link to="/register" className="dark:hover:text-gray-300 hover:text-yellow-500">
            Register
          </Link>

          <div className="dark:hover:text-gray-300 hover:text-yellow-500">
            <ThemeComponent />
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
