import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { typeOfTour, typeOfTourLang } from '../../constants/constantsData';
import { useLanguageContext } from '../../context/languageContext';
import { tourConstants } from '../../constants/constantsTours';
 import { typeOfTourEn } from '../../constants/constantsData';
import { typeOfTourEs } from '../../constants/constantsData'; 
import { typeOfTourObject } from '../../constants/constantsData';

interface TourTypeProps {
  tourTypes: any;
  setTourTypes:React.Dispatch<React.SetStateAction<any[]>>
}

function SearchTourTypeComponent({tourTypes,setTourTypes}:TourTypeProps) {

 
    const animatedComponents = makeAnimated();

    const { language} = useLanguageContext(); // can be 'en' or 'es' or 'cz


  const translateToEnglish = (countryName: string) => {
    const country = typeOfTourEn.find(c => c.cz === countryName);
    return country ? country.en : countryName; // Return English name or the original if not found
  };
    const translateToSpanish = (countryName: string) => {
    const country = typeOfTourEs.find(c => c.cz === countryName);
    return country ? country.es : countryName; // Return Spanish name or the original if not found
  };
  
const getTranslatedTypeOfTours = () => {
    return tourTypes?.map((value :any) => ({
      ...value,
      label:
        language === 'cz'
          ? value.value // Keep the original label for Czech
          : language === 'en'
          ? translateToEnglish(value.label) // Translate to English
          : language === 'es'
          ? translateToSpanish(value.label) // Translate to Spanish
          : value.label, // Fallback to original label if no language is matched
    }));
  };

/*   console.log(typeOfTourObject) */
    const formattedTypeOfTour = typeOfTourObject.map((tourObject: any) => {
      const key = Object.keys(tourObject)[0]; // get the key of the object (1, 2, 3, etc.)
      const tour = tourObject[key];
    /*   console.log(tourObject[key][language]) */
      // Dynamically choose the label based on the current language
      return {
        value: key,// Use the key as the value
        label: tourObject[key][language], // Fallback to English if the current language doesn't exist
      };
    });

      const handleChange = (selectedOption: any) => {
        setTourTypes(selectedOption)
      
    
      };

      const newArr = typeOfTourObject.map((tour: any) => {
        const key = Object.keys(tour)[0]; // Get the key (1, 2, 3)
        const label = tour[key][language]; // Get the corresponding label
    
        return { value: key, label }; // Return an object with value and label
      });
    
      // Compare newArr with tourTypes and return matches
      const matchedArr = newArr.filter((newItem) =>
        tourTypes.some((tourType:any) => tourType.value === newItem.value)
      );

     return (


    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      defaultValue={matchedArr}
      isMulti
      placeholder={tourConstants.chooseTourType[language]}
      options={formattedTypeOfTour}
      onChange={handleChange} 
      />
  )
}

export default SearchTourTypeComponent