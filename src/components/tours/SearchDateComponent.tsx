import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useLanguageContext } from '../../context/languageContext';
import { tourConstants } from '../../constants/constantsTours';

interface TourTypeProps {
  tourDates: any;
  setTourDates:React.Dispatch<any>
}

/* const Checkbox = ({ children, ...props }: JSX.IntrinsicElements['input']) => (
  <label style={{ marginRight: '1em' }}>
    <input type="checkbox" {...props} />
    {children}
  </label>
);
 */

function SearchDateComponent({tourDates,setTourDates}:TourTypeProps) {

    const animatedComponents = makeAnimated();
    const isClearable = true;
    const formattedDates = [];
    const currentDate = new Date();
    const { language} = useLanguageContext();

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
    <div className='text-black'>
      
      <Select
   
        isClearable={isClearable}
        components={animatedComponents}
        placeholder={tourConstants.chooseTourDate[language]}
        options={formattedDateInTour}
        onChange={handleChange}
        defaultValue={tourDates} 
        // Set default value based on state */
      />
</div>
  )
}

export default SearchDateComponent