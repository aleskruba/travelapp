import { useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

interface TourTypeProps {
  tourDates: any;
  setTourDates:React.Dispatch<any>
}

const Checkbox = ({ children, ...props }: JSX.IntrinsicElements['input']) => (
  <label style={{ marginRight: '1em' }}>
    <input type="checkbox" {...props} />
    {children}
  </label>
);

function SearchDateComponent({tourDates,setTourDates}:TourTypeProps) {

    const animatedComponents = makeAnimated();
    const [isClearable, setIsClearable] = useState(true);
    const formattedDates = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {

    const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
    const year = futureDate.getFullYear();

    const monthName = futureDate.toLocaleString('default', { month: 'long' });
    
    formattedDates.push(`${monthName}-${year}`);
    }

    const formattedDateInTour = formattedDates.map((t:any) => ({
        value: t,          
        label: t,
      }));
    
      const handleChange = (selectedOption: any) => {
        setTourDates(selectedOption); 
      };

      
  return (
    <Select
     isClearable={isClearable}
      components={animatedComponents}
      defaultValue={tourDates}
      placeholder="Vyber termin cesty ..."
      options={formattedDateInTour}
      onChange={handleChange} 
      />
  )
}

export default SearchDateComponent