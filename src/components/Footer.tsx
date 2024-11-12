import { Link } from 'react-router-dom';
import { useLanguageContext } from '../context/languageContext';
import { footerConstants,footerConditions,footerColumns } from '../constants/constantsData';

function Footer() {
  const { language} = useLanguageContext();

  return (
    <footer className="dark:text-lightPrimary pb-20 ">
      <div className=" px-8  flex flex-around border-t border-white  py-8  ">
        <div className="w-full flex justify-center  mb-4 ">
          <div>
          <h3 className="text-lg font-bold mb-4 text-darkAccent ">{footerColumns.links[language]}</h3>
          <ul>
              {footerConstants[language].map((item: string, index: number) => (
              <li key={index} className="mb-2">
                <Link to="" className="hover:text-white">{item}</Link>
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
            {footerConditions[language].map((condition, index) => (
              <li key={index} className="mb-2">
                <Link to="" className="hover:text-white">{condition}</Link>
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
