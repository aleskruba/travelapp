
import { popularCountryNames } from '../../constants/constantsData';
import { useCountryContext } from '../../context/countryContext';


function PopularCountries() {
  const { chosenCountry, setChosenCountry } = useCountryContext();

  const chooseCountryFunction: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const country = event.currentTarget.textContent || '';

    setChosenCountry(country);

    try{


      

    }catch(err){
      console.log(err);
    }
  };
  

  
  return (
    <div className='mt-6 flex flex-col justify-start item-start text-base s'>
      {popularCountryNames.sort((a, b) => a.localeCompare(b)).map(country => (
        <div 
          key={country} 
          className={`dark:text-white text-black cursor-pointer px-2 py-1 rounded ${chosenCountry === country ? 'bg-green-500  text-lighTextColor' : ''}`} 
          onClick={chooseCountryFunction} 
        >
          {country}
        </div>
      ))}
      <div>+dalších 80 zemí</div>
    </div>
  );
}

export default PopularCountries;
