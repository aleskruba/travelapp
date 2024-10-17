import React, { useEffect, useState } from 'react'
import ComboBox from '../components/traveltips/Countries';
import PopularCountries from '../components/traveltips/PopularCountries'
import { useCountryContext } from '../context/countryContext';
import { countriesData } from '../constants/constantsData';
import Country from '../components/traveltips/Country';
import Messages from '../components/traveltips/Messages';
import Vlogs from '../components/traveltips/Vlogs';
import Button from '../components/customButton/Button';

function TravelTips() {

    const { chosenCountry, setChosenCountryData } = useCountryContext();
    const [selectComp, setSelectComp] = useState(true);
    const [openDivCreateVlog,setOpenDivCreateVlog] = useState<boolean>(false);

    useEffect(() => {
      window.scrollTo(0, 0);
  
      if (chosenCountry) {
        setOpenDivCreateVlog(false)
       
        const selectedCountryData = countriesData.find(
          (country) => country.name === chosenCountry
        );
        if (selectedCountryData) {
          setChosenCountryData(selectedCountryData);
        } else {
          setChosenCountryData(null);
        }
      }
    }, [chosenCountry, setChosenCountryData]);

  return (
    <div className="flex  flex-col md:flex-row pb-16">
      <div className="w-full h-[90%] md:w-[250px] md:bg-transparent md:border-r md:border-gray-300 md:rounded text-navbarTextColor   pt-2 flex items-center flex-col">
        <ComboBox />
        <div className="hidden md:block ">
          <PopularCountries />
        </div>
      </div>

      <div className="flex-1 ">
        <Country/>
        <div className="flex justify-center py-4 dark:text-white">
          {chosenCountry && (
         <Button
         onClick={() => setSelectComp(!selectComp)}
         color="green" // Assuming you want to use a green color, you might need to add it to your Button component
         className="py-3 px-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 text-xl"
       >
         {selectComp ? "Cestovatelské vlogy - klikni zde" : "Fórum - klikni zde"}
       </Button>
          )}
        </div>
      {chosenCountry ? 
          selectComp ? <Messages/> : <Vlogs openDivCreateVlog={openDivCreateVlog} setOpenDivCreateVlog={setOpenDivCreateVlog}/>
          : null
        }
      </div>


     </div>
  )
}

export default TravelTips