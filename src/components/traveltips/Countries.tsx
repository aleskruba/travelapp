import React, { useState, useRef, useEffect } from 'react';
import { countryNames,countryNamesEn,countryNamesEs,countryTranslationsEn,countryTranslationsEs  } from '../../constants/constantsData';
import { useCountryContext } from '../../context/countryContext';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { travelTipsConstants } from '../../constants/constantsTravelTips';
import { useLanguageContext } from '../../context/languageContext';

const ComboBox: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const { setChosenCountry, chosenCountry,chosenCountryTranslated, setChosenCountryTranslated ,chosenCountryData} = useCountryContext();
  const navigate = useNavigate();
  let { id } = useParams<string>();
  const { language} = useLanguageContext();



  useEffect(() => {
    if (id && countryNames.includes(id)) {
      handleSelectCountry(id);
    }
  }, [id, countryNames,language]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectCountry = (country: string) => {
    setChosenCountry(country);
    setIsOpen(false);
    setSearchTerm('');


    if (language && language =='en') {
      const translation = countryTranslationsEn.find(c => c.en === country); 
      if (translation) {

        setChosenCountry(translation.cz);
        setChosenCountryTranslated(translation.en)
        navigate(`/traveltips/${translation.cz}`)

      } 
    }
    if (language && language =='es') {
      const translation = countryTranslationsEs.find(c => c.es === country); 
      if (translation) {
      
        setChosenCountry(translation.cz);
        setChosenCountryTranslated(translation.es)
        navigate(`/traveltips/${translation.cz}`)

      } 
    } if (language && language =='cz') {
      if (window.location.pathname !== `/traveltips/${country}`) {
        navigate(`/traveltips/${country}`);
        setChosenCountry(country);
        setChosenCountryTranslated(country)
      } 
     }


  };

  const handleDropdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const maxDisplayedCountries = 15;

  const getCountriesByLanguage = (language:string) => {
    switch (language) {
      case "en":
        return countryNamesEn;
      case "cz":
        return countryNames;
      case "es":
        return countryNamesEs; // Assuming you have a Spanish array
      default:
        return countryNames; // Default to Czech if no match
    }
  };
  
 
  const selectedCountries = getCountriesByLanguage(language);
  
  let filteredCountries = selectedCountries.filter((country:string) => {
    const normalizedCountry = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedSearchTerm = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      normalizedCountry.toLowerCase().includes(normalizedSearchTerm.toLowerCase()) ||
      country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  

/*   let filteredCountries = countryNames.filter((country) => {
    const normalizedCountry = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedSearchTerm = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      normalizedCountry.toLowerCase().includes(normalizedSearchTerm.toLowerCase()) ||
      country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }); */

  if (filteredCountries.length > maxDisplayedCountries) {
    filteredCountries = filteredCountries.slice(0, maxDisplayedCountries);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex === filteredCountries.length - 1 ? 0 : prevIndex + 1
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex === 0 ? filteredCountries.length - 1 : prevIndex - 1
          );
        } else if (e.key === 'Enter' && highlightedIndex !== -1) {
          handleSelectCountry(filteredCountries[highlightedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, filteredCountries]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="relative w-full px-2 ">
      <label htmlFor="countryInput" 
             className='md:hidden flex justify-center pb-2 '>{travelTipsConstants.chooseCountry[language]}</label>
      <input
        id="countryInput"
        type="text"
        placeholder={chosenCountryData && chosenCountryData.name ? chosenCountryData.name : ` ${travelTipsConstants.chooseCountry[language]} ...`}
        maxLength={8}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full border rounded px-4 py-2 focus:outline-none text-black font-bold bg-blue-100 focus:bg-white "
      />
      {isOpen && (
        <div
          className="absolute px-4  z-10 mt-1 w-[97%] md:w-[94%] bg-white text-black border rounded shadow-lg"
          ref={dropdownRef}
          onClick={handleDropdownClick}
        >
          {filteredCountries.length === 0 ? (
            <div className="px-4 py-2">{travelTipsConstants.noMatch[language]}</div>
          ) : (
            filteredCountries.map((country, index) => (
              <div
                key={index}
                onClick={() => handleSelectCountry(country)}
                className={`px-4 py-2 hover:bg-gray-300 cursor-pointer ${
                  index === highlightedIndex ? 'bg-gray-300' : ''
                }`}
              >
                {country}
              </div>
            ))
          )}
          {countryNames.length > filteredCountries.length && (
            <div className="flex items-center justify-center opacity-50 italic">
              + {travelTipsConstants.next[language]} {countryNames.length - filteredCountries.length} {travelTipsConstants.noMatch[language]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComboBox;
