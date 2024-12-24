import { Link } from 'react-router-dom';
import { useLanguageContext } from '../context/languageContext';
import { footerConstants,footerConditions,footerColumns } from '../constants/constantsData';

function Footer() {
  const { language} = useLanguageContext();

  return (
    <footer className="dark:text-lightPrimary pb-20  ">
      <div className=" px-8  flex flex-around border-t border-white  py-8  z-50  ">
        <div className="w-full flex justify-center  mb-4 ">
          <div>
          <h3 className="text-lg font-bold mb-4 text-darkAccent ">{footerColumns.links[language]}</h3>
          <ul>
          {footerConstants[language].map((item, index) => (
              <li key={index} className="mb-2">
                <Link to={`/${item.link}`} className="dark:hover:text-gray-200  hover:text-gray-600 ">
                  {item.text}
                </Link>
              </li>
            ))}
            </ul>
          </div>
        </div>

        {/* 
            <img src="footer.svg" alt="lide" className='hidden md:flex  w-full '/> */}
        
        <div className="w-full flex justify-center mb-4  ">
          <div>
          <h3 className="text-lg font-bold mb-4 text-darkAccent ">{footerColumns.conditions[language]}</h3>
          <ul>
          {footerConditions[language].map((item, index) => (
            <li key={index} className="mb-2">
              <Link to={`/${item.link}`} className="dark:hover:text-gray-200  hover:text-gray-600 ">
                {item.text}
              </Link>
            </li>
          ))}


          </ul>
        </div>
        </div>
        {/* Add more sections as needed */}
      </div>
    </footer>
  );
}

export default Footer;
