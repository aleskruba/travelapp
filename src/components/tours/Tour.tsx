import React from 'react'
import { TourProps } from '../../types';
import moment from 'moment';
import { useLanguageContext } from '../../context/languageContext';
import { tourConstants } from '../../constants/constantsTours';
import { countryNames, typeOfTourObject } from '../../constants/constantsData';
import { countryNamesEn } from '../../constants/constantsData';
import { countryNamesEs } from '../../constants/constantsData';

type Props = {
    tour: TourProps;

  };
  
  const Tour: React.FC<Props> = ( {tour}) => {

  const imageUrl = tour?.user?.image ? tour?.user?.image : '/profile.png';
  const { language} = useLanguageContext();

  const monthsInCzech = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  const monthsInEnglish = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsInSpanish = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  let chosenLanguage: any[] = [];
  
  if (language === 'en') {
    chosenLanguage = monthsInEnglish;  // Corrected assignment
  } else if (language === 'cz') {
    chosenLanguage = monthsInCzech;
  } else if (language === 'es') {
    chosenLanguage = monthsInSpanish;
  }

 
  const formatTourDate = (startDate:any, endDate:any) => {
  const start = moment(startDate);
  const end = moment(endDate);

  const startMonthName = chosenLanguage[start.month()];
  const endMonthName = chosenLanguage[end.month()];

  const year = start.year();

  if (start.isSame(end, 'month')) {
    return `${year} ${startMonthName}`;
  } else {
    return `${year} ${startMonthName} - ${endMonthName}`;
  }
};


const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  };


  const tourtypeString = tour.tourtype;

  // Initialize tourtypeArray as an empty array
  let tourtypeArray: string[] = [];
  
  // Check if tourtypeString is valid before parsing
  if (typeof tourtypeString === 'string') {
      tourtypeArray = JSON.parse(tourtypeString);
  }
  

  const destinationIndex = typeof tour?.destination === 'string' ? countryNames.indexOf(tour.destination) : -1;

    return (
<div className="box border hover:bg-zinc-200 dark:hover:bg-zinc-900 border-black dark:border-white rounded-md p-2 pb-4 text-center grid grid-rows-[subgrid] row-span-4 1px solid relative">
     <div className='flex  justify-between pl-2 pr-8'>
        <div className='flex flex-col gap-2' >
            <div
            className={'w-14 h-14 overflow-hidden rounded-full cursor-pointer'}
                 >
            <img src={imageUrl} alt="Profile" className='w-full h-full object-cover'/>
        </div>
        <div className='font-semibold italic dark:text-yellow-200 text-yellow-800'>
            {tour.user.firstName}
        </div>
            
        </div>   

        <div className='flex flex-col justify-start items-center leading-tight'>
            <h2 className='text-xl font-bold'>
            <div>
        {language === 'cz' && tour.destination}
        {language === 'en' && destinationIndex !== -1 && countryNamesEn[destinationIndex]}
        {language === 'es' && destinationIndex !== -1 && countryNamesEs[destinationIndex]}
    </div>

            </h2>
            <div>
                {formatTourDate(tour.tourdate, tour.tourdateEnd)}
            </div>
    </div>
  </div>
  <div className="text-left border border-dotted 1px dark:border-white border-black p-2 rounded-sm">
       <span className='italic dark:text-yellow-200 text-yellow-800'>{tourConstants.aboutMe[language] }</span>      {tour.aboutme && truncateText(tour.aboutme, 30)}
  </div>

  <div className="text-left border border-dotted 1px dark:border-white border-black 1px solid p-2 rounded-sm mb-6">
       <span className='italic dark:text-yellow-200 text-yellow-800'>{tourConstants.iLookFor[language] }</span>      {tour.fellowtraveler && truncateText(tour.fellowtraveler, 30)}
  </div>

  <div className='flex justify-start px-2   items-center text-xs dark:bg-purple-900 bg-purple-200 absolute bottom-1 w-full'>
  {tourtypeArray &&

    tourtypeArray.slice(0, 3).map((item: any, index: number) => (
      <span key={index}>
              {typeOfTourObject.map((tourObj) => {
        if (tourObj[item]) {
          // Extract the language-specific value based on the 'language' variable
          return tourObj[item][language];
        }
        return null; // In case the item doesn't exist in the object
      })}
        
        {index < tourtypeArray.slice(0, 3).length - 1 && ', '}
      </span>
    ))}
  {tourtypeArray && tourtypeArray.length > 3 && `, ${tourConstants.andMore[language]} ${tourtypeArray.length - 3}`}
</div>

 
  <div>

  </div>


</div>
  )
}

export default Tour