import React from 'react'
import { TourProps } from '../../types';
import moment from 'moment';
import { useThemeContext } from '../../context/themeContext';

type Props = {
    tour: TourProps;

  };
  
  const Tour: React.FC<Props> = ( {tour}) => {

    const { toggleModal } = useThemeContext();
    const imageUrl = tour?.user?.image ? tour?.user?.image : '/profile.png';
    
  const monthsInCzech = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
 
  const formatTourDate = (startDate:any, endDate:any) => {
  const start = moment(startDate);
  const end = moment(endDate);

  const startMonthName = monthsInCzech[start.month()];
  const endMonthName = monthsInCzech[end.month()];

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

    return (
<div className="box border border-black dark:border-white rounded-md p-2 text-center grid grid-rows-[subgrid] row-span-4  1px solid relative">

     <div className='flex  justify-between pl-2 pr-8'>
        <div className='flex flex-col gap-2' >
            <div
            className={'w-14 h-14 overflow-hidden rounded-full cursor-pointer'}
            onClick={() => toggleModal(imageUrl)}
            >
            <img src={imageUrl} alt="Profile" className='w-full h-full object-cover'/>
        </div>
        <div className='font-semibold italic dark:text-yellow-200 text-yellow-800'>
            {tour.user.firstName}
        </div>
            
        </div>   

        <div className='flex flex-col justify-start items-center leading-tight'>
            <h2 className='text-xl font-bold'>{tour.destination}</h2>
            <div>
                {formatTourDate(tour.tourdate, tour.tourdateEnd)}
            </div>
    </div>
  </div>
  <div className="text-left border border-dotted 1px dark:border-white border-black p-2 rounded-sm">
       <span className='italic dark:text-yellow-200 text-yellow-800'>O Mně </span>      {tour.aboutme && truncateText(tour.aboutme, 50)}
  </div>

  <div className="text-left border border-dotted 1px dark:border-white border-black 1px solid p-2 rounded-sm mb-4">
       <span className='italic dark:text-yellow-200 text-yellow-800'>Hledám </span>      {tour.fellowtraveler && truncateText(tour.fellowtraveler, 50)}
  </div>

  <div className='flex justify-start px-2 pb-2 items-center text-base dark:bg-purple-900  bg-purple-200 absolute bottom-0 w-full'> {tour.tourtype && JSON.parse(tour.tourtype).splice(0,3).map((item:string,index: number)=>(
      <span key={index}>       {item} {tour.tourtype && index <  JSON.parse(tour.tourtype).splice(0,3).length - 1 && ' ,'} </span>))}
  </div>
 
  <div>

  </div>
</div>
  )
}

export default Tour