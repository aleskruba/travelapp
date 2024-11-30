import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useLanguageContext } from '../../context/languageContext';
import { tourConstants } from '../../constants/constantsTours';
import { countryTranslationsEn,countryTranslationsEs } from '../../constants/constantsData'; // Import country translations

interface CountryOption {
  readonly value: string;
  readonly label: string;
}

interface CountryProps {
  availableDestinations?: CountryOption[]; // Allow undefined
  countries: any;
  setCountries: React.Dispatch<React.SetStateAction<any[]>>;
}

const SearchComponent: React.FC<CountryProps> = ({ availableDestinations, countries, setCountries }) => {
  const animatedComponents = makeAnimated();
  const { language } = useLanguageContext();

  // Function to translate Czech country names to English
  const translateToEnglish = (countryName: string) => {
    const country = countryTranslationsEn.find(c => c.cz === countryName);
    return country ? country.en : countryName; // Return English name or the original if not found
  };
  
  const translateToSpanish = (countryName: string) => {
    const country = countryTranslationsEs.find(c => c.cz === countryName);
    return country ? country.es : countryName; // Return Spanish name or the original if not found
  };
  
/*   console.log(availableDestinations) */
  // Translate availableDestinations based on the current language
  const getTranslatedDestinations = () => {
    return availableDestinations?.map((destination) => ({
      ...destination,
      label:
        language === 'cz'
          ? destination.value // Keep the original label for Czech
          : language === 'en'
          ? translateToEnglish(destination.label) // Translate to English
          : language === 'es'
          ? translateToSpanish(destination.label) // Translate to Spanish
          : destination.label, // Fallback to original label if no language is matched
    }));
  };
  
  ;    
  const handleChange = (selectedOption: any) => {
;    setCountries(selectedOption); // Update the countries state with selected options
  };


  return (
    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      defaultValue={countries} // Set defaultValue based on countries state
      isMulti
      placeholder={tourConstants.chooseCountry[language]}
      options={getTranslatedDestinations()} // Use translated options
      onChange={handleChange}
    />
  );
};

export default SearchComponent;
