import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ComboBox from '../components/traveltips/Countries';
import PopularCountries from '../components/traveltips/PopularCountries'
import { useCountryContext } from '../context/countryContext';
import { countriesData,countriesDataEn,countriesDataEs,countryTranslationsEn,countryTranslationsEs,countryNames } from '../constants/constantsData';
import Country from '../components/traveltips/Country';
import Messages from '../components/traveltips/Messages';
import Vlogs from '../components/traveltips/Vlogs';
import Button from '../components/customButton/Button';
import { travelTipsConstants } from '../constants/constantsTravelTips';
import { useLanguageContext } from '../context/languageContext';

function TravelTips() {

    const { chosenCountry, setChosenCountryData  } = useCountryContext();
    const [selectComp, setSelectComp] = useState(true);
    const [openDivCreateVlog,setOpenDivCreateVlog] = useState<boolean>(false);
    const { language} = useLanguageContext();
    const navigate = useNavigate();  
    const [urlError, setUrlError] = useState<boolean>(false);
    

    useEffect(() => {
      // First check if in localStorage is stored key traveltipsCountry and if its value is in countryNames
      const storedCountry = localStorage.getItem('traveltipsCountry');
      
      if (storedCountry && countryNames.includes(storedCountry)) {

    
        // Check if the current URL includes a country parameter
        const urlCountry = window.location.pathname.split('/')[2];
        
        if (urlCountry === undefined) {
          // Navigate to the country URL if no country is in the URL
          navigate(`/traveltips/${storedCountry}?page=1`);
        }
        const decodedUrlCountry = decodeURIComponent(window.location.pathname.split('/')[2]);
          if (decodedUrlCountry !== decodedUrlCountry) {
              navigate(`/traveltips/${storedCountry}?page=1`)
          }
      
      } else {
        // Set error if no valid country in localStorage or URL
        setUrlError(true);
        console.log('error');
      }
    
      // Now handle scrolling and language-specific logic if country is selected
      window.scrollTo(0, 0);
    
      if (chosenCountry) {
        setOpenDivCreateVlog(false);
    
        const selectedCountryData = countriesData.find(
          (country) => country.name === chosenCountry
        );
    
        // Handle English language
        if (language === 'en') {
          const translation = countryTranslationsEn.find(c => c.cz === chosenCountry); 
    
          if (translation) {
      
            const selectedCountryDataEn = countriesDataEn.find(
              (country) => country.name === translation.en
            );
            if (selectedCountryDataEn) {
              setChosenCountryData(selectedCountryDataEn);
            }
     
          } else {
            console.log('Translation not found');
          }
        }
    
        // Handle Spanish language
        if (language === 'es') {
          const translation = countryTranslationsEs.find(c => c.cz === chosenCountry); 
    
          if (translation) {
          
            const selectedCountryDataEs = countriesDataEs.find(
              (country) => country.name === translation.es
            );
            if (selectedCountryDataEs) {
              setChosenCountryData(selectedCountryDataEs);
            }
          } else {
            console.log('Translation not found');
          }
        }
    
        // Handle Czech language
        if (language === 'cz') {
          if (selectedCountryData) {
            setChosenCountryData(selectedCountryData);
          } else {
            setChosenCountryData(null);
          }
        }
      }
    
    }, [chosenCountry, language, setChosenCountryData, countryNames, countriesData, countriesDataEn, countriesDataEs, countryTranslationsEn, countryTranslationsEs, navigate]);
    

  return (
    <div className="flex  flex-col md:flex-row pb-16">
      <div className="w-full h-[90%] md:w-[250px] md:bg-transparent md:border-r md:border-gray-300 md:rounded text-navbarTextColor   pt-2 flex items-center flex-col">
        <ComboBox />
        <div className="hidden md:block ">
          <PopularCountries setUrlError={setUrlError} />
        </div>
      </div>

      <div className="flex-1 ">
        <Country urlError={urlError}/>
        <div className="flex justify-center py-4 dark:text-white">
          {chosenCountry && (
         <Button
         onClick={() => setSelectComp(!selectComp)}
         color="green" // Assuming you want to use a green color, you might need to add it to your Button component
         className="py-3 px-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 text-xl"
       >
         {selectComp ? travelTipsConstants.travelVlogs[language]: travelTipsConstants.forum[language]}
       </Button>
          )}
        </div>
      {chosenCountry ? 
          selectComp ? <Messages/> : <Vlogs openDivCreateVlog={openDivCreateVlog} setOpenDivCreateVlog={setOpenDivCreateVlog}/>
          : null
        }
      </div>


     </div>
  )
}

export default TravelTips