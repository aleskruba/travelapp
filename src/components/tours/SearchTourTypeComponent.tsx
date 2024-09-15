import React from 'react'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { typeOfTour } from '../../constants/constantsData';

function SearchTourTypeComponent() {


    const animatedComponents = makeAnimated();

      const formattedTypeOdTour = typeOfTour.map((t:any) => ({
        value: t,
        label: t,
      }));

      const handleChange = (selectedOption: any) => {
        console.log(selectedOption); 
      };

  return (

    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      isMulti
      placeholder="Vyber typ cesty ..."
      options={formattedTypeOdTour}
      onChange={handleChange} 
      />
  )
}

export default SearchTourTypeComponent