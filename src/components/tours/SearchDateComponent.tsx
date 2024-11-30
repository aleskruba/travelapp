import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useLanguageContext } from '../../context/languageContext';
import { tourConstants } from '../../constants/constantsTours';
import { monthNameObject } from '../../constants/constantsData';

interface TourTypeProps {
  tourDates: any;
  setTourDates:React.Dispatch<any>
}


function SearchDateComponent({tourDates,setTourDates}:TourTypeProps) {

    const animatedComponents = makeAnimated();
    const isClearable = true;
    const formattedDates: any[] = [];
    const currentDate = new Date();
    const { language} = useLanguageContext();


    const translateToEnglish = (dateValue: string) => {
      const monthName = dateValue.split('-')[0]; // Extract the month part
      const month = monthNameObject.find((c) => c.cz === monthName);
      return month ? month.en : dateValue; // Return English translation or the original value
    };
    
    const translateToSpanish = (dateValue: string) => {
      const monthName = dateValue.split('-')[0]; // Extract the month part
      const month = monthNameObject.find((c) => c.cz === monthName);
      return month ? month.es : dateValue; // Return Spanish translation or the original value
    };
    
/*     console.log(translateToEnglish('Listopad-2004'))   November
    console.log(translateToSpanish('Listopad-2004'))   Noviembre */
  
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
      const year = futureDate.getFullYear();
      const monthIndex = futureDate.getMonth(); // Get month index (0-11)
      const monthNameCz = monthNameObject[monthIndex]?.cz; // Get Czech month name
  
      if (monthNameCz) {
        formattedDates.push({
          value: `${monthNameCz}-${year}`, // Store the value in Czech
          label: `${monthNameCz}-${year}`, // Initial label in Czech
        });
      }
    }
  
    const getTranslatedDates = () => {
      return formattedDates.map((date: any) => {
        const [monthName, year] = date.value.split('-'); // Split month and year from value
        let translatedMonth = date.label;
  
        // Translate the month based on the current language
        if (language === 'cz') {
          translatedMonth = date.label; // Use the original label for Czech
        } else if (language === 'en') {
          translatedMonth = translateToEnglish(monthName) + `-${year}`; // Translate month to English and append year
        } else if (language === 'es') {
          translatedMonth = translateToSpanish(monthName) + `-${year}`; // Translate month to Spanish and append year
        } else {
          translatedMonth = translateToEnglish(monthName) + `-${year}`; // Default to English if unsupported language
        }
  
        return {
          ...date,
          label: translatedMonth, // Set the translated label with year
        };
      });
    };
  
    const handleChange = (selectedOption: any) => {
      setTourDates(selectedOption ? [selectedOption] : []); // Make sure the state is an array
    };
  
    // Map the selected date to match the correct label in the current language
    const getSelectedDate = () => {
      if (!tourDates || tourDates.length === 0) return null;
      const selectedDateValue = tourDates[0].value;
      const selectedDate = formattedDates.find((date) => date.value === selectedDateValue);
      if (!selectedDate) return null;
  
      const [monthName, year] = selectedDate.value.split('-');
      let translatedMonth = selectedDate.label;
  
      if (language === 'cz') {
        translatedMonth = selectedDate.label;
      } else if (language === 'en') {
        translatedMonth = translateToEnglish(monthName) + `-${year}`;
      } else if (language === 'es') {
        translatedMonth = translateToSpanish(monthName) + `-${year}`;
      }
  
      return {
        ...selectedDate,
        label: translatedMonth, // Set the translated label for the selected date
      };
    };
  
    return (
      <div className="text-black">
        <Select
          isClearable={isClearable}
          components={animatedComponents}
          placeholder={tourConstants.chooseTourDate[language]}
          options={getTranslatedDates()}
          onChange={handleChange}
          value={getSelectedDate()} // Set the current selected option based on the language
        />
      </div>
    );
  }
  
  export default SearchDateComponent;