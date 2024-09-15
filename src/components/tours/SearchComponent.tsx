import React from 'react'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

 interface CountryOption {
  readonly value: string;
  readonly label: string;
}

interface CountryProps {
  availableDestinations?: CountryOption[]; // Allow undefined
}

const SearchComponent: React.FC<CountryProps> = ({ availableDestinations }) => {

    const animatedComponents = makeAnimated();

    const handleChange = (selectedOption: any) => {
      console.log(selectedOption); 
    };

    
  return (

    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      defaultValue={[availableDestinations && availableDestinations[4]]}
      isMulti
      placeholder="Vyber zemi ..."
      options={availableDestinations}
      onChange={handleChange} 
      />

  )
}

export default SearchComponent


