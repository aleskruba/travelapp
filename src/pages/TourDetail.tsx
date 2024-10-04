import React,{useEffect, useState} from 'react'
import { useParams,useNavigate} from 'react-router-dom';
import { keepPreviousData, useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../context/authContext';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import { fetchData } from '../hooks/useFetchData';
import moment from 'moment';
import { countriesData } from '../constants/constantsData';


function TourDetail() {
  const [backendError,setBackendError] = useState<string | null>(null);
  let { id } = useParams<string>();

  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const url = `${BASE_URL}/tour/${id}`;

  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate to the desired URL with query parameters
    navigate(-1);
  };


  const fetchTour = async () => {

    try {
    const response = await fetchData(url,'GET');

    return response.json();
  } catch (err:any) {
    console.error(err)
    setBackendError(err ? err.message : 'Něco se pokazilo')
  }
  };
  const { data, isSuccess ,isLoading, isError } = useQuery({
    queryFn: () => fetchTour(),
    queryKey: ['tour'],
    retry: 2,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 100000,
});
queryClient.invalidateQueries({ queryKey: ['tour'] })

const [flag, setFlag] = useState('');

useEffect(() => {
  if (isSuccess) {
    const foundCountry = countriesData.find((country) => country.name === data.tour.destination);
    if (foundCountry) {
      setFlag(foundCountry.flag);
    }
  }
}, [isSuccess, countriesData, data?.tour.destination]);

// This will log the flag every time it changes
useEffect(() => {
  console.log(flag);
}, [flag]);


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

if (isLoading) {
  return <span>Moment prosím ...</span>;
}

if (isError) {
  return <span>Něco se pokazilo, spoluceta nebyla načtena</span>;
}

  return (
    <div className='h-screen  dark:text-gray-300 text-gray-900 bg-gradient-to-b from-gray-200  via-gray-300 via-30%  to-gray-300 dark:from-gray-700 dark:via-gray-900 dark:via-30%  dark:to-gray-900  '>
 <button onClick={handleBack}>Zpět na výpis</button>


    <div className='flex justify-around pt-4'>
         <div className='text-2xl font-thin text-center'>
          Přidej se k cestě do destinace {data.tour.destination} 
          </div>
          <div>
          <img src={flag} 
                        alt="flag" 
                        className='w-16 h-auto rounded-sm'/>
          </div>
       </div>
     <div className='flex justify-center '>
      <div className='bg-inherit p-8 w-full flex flex-col gap-2'>
       <div className='flex justify-between'>
           <div className='flex items-center gap-2'>
               <div className='w-14 h-14 hover:scale-110 transition-all 1s '>
                   <img src={data.tour.user.image} 
                        alt="profile" 
                        className='w-full h-full object-cover rounded-full'/>
               </div>
               <div className='text-xl'>{data.tour.user.firstName}</div>
           </div>
           <div>
             <h1 className='font-thin text-xs'>Vloženo <span>{data.tour.date}</span></h1>
           </div>
       </div>
       <div>
       
      
        <h1 className='flex gap-2 font-bold text-lg '>Termín <span className='font-thin'> {formatTourDate(data.tour.tourdate, data.tour.tourdateEnd)} </span></h1>

       </div>

       <div className='flex gap-2 flex-col md:flex-row md:items-center font-bold text-lg'> Typ cesty
         {JSON.parse(data.tour.tourtype).map((t:any, idx:number) => (
           <span key={idx} className='text-xs font-thin italic pl-4 md:pl-0'>
             {t}
             {idx < JSON.parse(data.tour.tourtype).length - 1 && ', '}
           </span>
         ))}
       </div>


       <div className='pt-4 flex flex-col'>
         <div className='font-bold text-lg'>Něco málo o mně</div> 
         <div className='text-justify pl-4'>{data.tour.aboutme}</div>
       </div>
       <div className='pt-4 flex flex-col'>
        <div className='font-bold text-lg'>S kým rád cestoval </div>
         <div className='text-justify pl-4'> {data.tour.fellowtraveler}</div>
       </div>
 
     </div>
   </div>
   {backendError && <div>{backendError} </div>}
   </div>
  )
}

export default TourDetail