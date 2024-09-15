import Select from 'react-select';
import makeAnimated from 'react-select/animated';

function SearchDateComponent() {

    const animatedComponents = makeAnimated();

    const formattedDates = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {

    const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
    const year = futureDate.getFullYear();

    const monthName = futureDate.toLocaleString('default', { month: 'long' });
    
    formattedDates.push(`${monthName} ${year}`);
    }

    const formattedDateInTour = formattedDates.map((t:any) => ({
        value: t,
        label: t,
      }));
    
      const handleChange = (selectedOption: any) => {
        console.log(selectedOption); 
      };
      
  return (
    <Select
      closeMenuOnSelect={true}
      components={animatedComponents}
      placeholder="Vyber termin cesty ..."
      options={formattedDateInTour}
      onChange={handleChange} 
      />
  )
}

export default SearchDateComponent