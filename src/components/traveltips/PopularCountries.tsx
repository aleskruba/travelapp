
import { popularCountryNames,popularCountryNamesEn,popularCountryNamesEs,countryTranslationsEn,countryTranslationsEs  } from '../../constants/constantsData';
import { useCountryContext } from '../../context/countryContext';
import { useNavigate } from 'react-router-dom';
import { useLanguageContext } from '../../context/languageContext';
import { travelTipsConstants } from '../../constants/constantsTravelTips';
import { useEffect, useState } from 'react';

type ErrorProps = { 
  setUrlError: (value: boolean) => void;  // Directly typing the setter function
};


function PopularCountries({ setUrlError }: ErrorProps) {
  const { chosenCountry, setChosenCountry, setChosenCountryTranslated  } = useCountryContext();
  const { language} = useLanguageContext();
  const navigate = useNavigate();
  
  const chooseCountryFunction: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const country = event.currentTarget.textContent || '';
   
    if (language && language ==='en') {
      const translation = countryTranslationsEn.find(c => c.en === country); 
      if (translation) {
        setUrlError(false)
        setChosenCountry(translation.cz);
        setChosenCountryTranslated(translation.en)
        navigate(`/traveltips/${translation.cz}`)

      } else {
        console.log('Translation not found');
      }
    }
    if (language && language ==='es') {
      const translation = countryTranslationsEs.find(c => c.es === country); 
      if (translation) {
        setUrlError(false)
        setChosenCountry(translation.cz);
        setChosenCountryTranslated(translation.es)
        navigate(`/traveltips/${translation.cz}`)

      } else {
        console.log('Translation not found');
      }
    } if (language && language ==='cz') {
      if (window.location.pathname !== `/traveltips/${country}`) {
        setUrlError(false)
        navigate(`/traveltips/${country}`);
        setChosenCountry(country);
      } 
     }



  };
  

  const getPopularCountriesByLanguage = (language:string) => {
    switch (language) {
      case "en":
        return popularCountryNamesEn;
      case "es":
        return popularCountryNamesEs;
      case "cz":
      default:
        return popularCountryNames;
    }
  };
  
  const selectedPopularCountries = getPopularCountriesByLanguage(language);

  
  const [translatedCountry, setTranslatedCountry] = useState('');

  useEffect(() => {
    let translation;
    if (language === 'en') {
      translation = countryTranslationsEn.find(country => country.cz === chosenCountry)?.en;
    } else if (language === 'es') {
      translation = countryTranslationsEs.find(country => country.cz === chosenCountry)?.es;
    } else if (language === 'cz') {
      translation = chosenCountry
    }

    if (translation) {
      setTranslatedCountry(translation);
    } else {
      setTranslatedCountry(chosenCountry); // Fallback to the original Czech name
    }
  }, [chosenCountry, language]);


  return (
    <div className='mt-6 flex flex-col justify-start item-start text-base s'>
          {selectedPopularCountries.map(country => {

          return (
        <div 
          key={country} 
          className={`dark:text-white text-black cursor-pointer px-2 py-1 rounded ${translatedCountry === country ? 'bg-green-500  text-lighTextColor' : ''}`} 
          onClick={chooseCountryFunction} 
        >
          {country}
        </div> 
      ) } )}
      <div>{travelTipsConstants.next80countries[language]}</div>
    </div>
  );
}

export default PopularCountries;
