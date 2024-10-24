import { Link } from 'react-router-dom';
import { footerItems,footerConditions } from '../constants/constantsData';

function Footer() {

  return (
    <footer className="dark:text-lightPrimary pb-20 ">
      <div className=" px-8  flex flex-around border-t border-white  py-8  ">
        <div className="w-full flex justify-center  mb-4 ">
          <div>
          <h3 className="text-lg font-bold mb-4 text-darkAccent ">Odkazy</h3>
          <ul>
            {footerItems.map((item, index) => (
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
          <h3 className="text-lg font-bold mb-4 text-darkAccent ">Podmínky</h3>
          <ul>
            {footerConditions.map((condition, index) => (
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
