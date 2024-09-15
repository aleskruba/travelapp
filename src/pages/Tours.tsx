import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/authContext';
import { BASE_URL } from '../constants/config';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Tour from '../components/tours/Tour';
import SearchComponent from '../components/tours/SearchComponent';
import SearchTourTypeComponent from '../components/tours/SearchTourTypeComponent';
import SearchDateComponent from '../components/tours/SearchDateComponent';

interface CountryOption {
  readonly value: string;
  readonly label: string;
}


function Tours() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableDestinations,setAvailableDestinations] = useState<CountryOption[] >()
  // Get the current page from URL query params; default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;

  const fetchTours = async (page = 0) => {
    const response = await fetch(`${BASE_URL}/tours/?page=${page + 1}`);
    console.log('fetched');

    if (!response.ok) {
      setBackendError('Něco se pokazilo , spolucety nebyly načteny');
      return;
    }
    backendError && setBackendError(null);
    return response.json();
  };

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryFn: () => fetchTours(currentPage),
    queryKey: ['tours', currentPage],
    retry: 2,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 100000,
  });

 const arr:any = [];

 useEffect(() => {
    setSearchParams({ page: (currentPage + 1).toString() }); // Convert number to string

    if (data?.destinations) {
      // Create an array with { value, label } format
      const formattedDestinations = data.destinations.map((destination:any) => ({
        value: destination,
        label: destination,
      }));

      // Update state with the new array
      setAvailableDestinations(formattedDestinations);
    }

  }, [currentPage,data, setSearchParams]);



  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Něco se pokazilo , spolucety nebyly načteny </span>;
  }



  return (
    <div className='px-2 '>
      <div className='text-center text-blue-500 '>
          {!user ? 
            'Pouze přihlášení uživatelé mohou vkládat Vlogy' : 
        
              <Link to={'./createtour'}>Vytvoř spolucestu <span className="underline cursor-pointer text-blue-600" >zde</span></Link>
      
          }
        </div>

        <div className="wrapper  grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-20">
        <SearchComponent
             availableDestinations= {availableDestinations}
          />
          
        <SearchTourTypeComponent/>

        <SearchDateComponent/>

        </div>

      <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-20">

        {data &&
          data.tours
            .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
            .map((tour: any) => (
              <Tour key={tour.id} tour={tour} />
            ))}
      </div>

      <div className="flex items-center justify-center space-x-4 py-2">
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          Aktuální stránka: {currentPage + 1} of {data.totalPages}
        </span>
        <button
          onClick={() =>
            setSearchParams({ page: Math.max(currentPage, 1).toString() }) // Convert result to string
          }
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
            currentPage === 0
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500'
          }`}
        >
          Minulá stránka
        </button>
        <button
          onClick={() => setSearchParams({ page: (currentPage + 2).toString() })}
          disabled={isPlaceholderData || currentPage + 1 >= data.totalPages}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
            isPlaceholderData || currentPage + 1 >= data.totalPages
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500'
          }`}
        >
          Další stránka
        </button>
      </div>

      <p>{isError && backendError}</p>
    </div>
  );
}

export default Tours;
