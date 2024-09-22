import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/authContext';
import { BASE_URL } from '../constants/config';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Tour from '../components/tours/Tour';
import SearchComponent from '../components/tours/SearchComponent';
import SearchTourTypeComponent from '../components/tours/SearchTourTypeComponent';
import SearchDateComponent from '../components/tours/SearchDateComponent';
import SearchDebounceComponent from '../components/tours/SearchDebounceComponent';
import useDebounce from '../hooks/useDebounce';

interface CountryOption {
  readonly value: string;
  readonly label: string;
}

function Tours() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableDestinations, setAvailableDestinations] = useState<CountryOption[]>([]);
  const [text, setText] = useState<string>('');
  const { debouncedValue, debounceLoading } = useDebounce(text, 1000);
  
  const [countries, setCountries] = useState<any[] | undefined>();
  const [tourTypes, setTourTypes] = useState<any[] | undefined>();
  const [tourDates, setTourDates] = useState<any | undefined>();

  // Get the current page from URL query params; default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;

  useEffect(() => {
    // Update the searchParams whenever countries or search text changes
    const params = new URLSearchParams();
    
    // Add countries to the params
    if (countries && countries.length > 0) {
      const countryValues = countries.map(country => country.value).join(',');
      params.set('countries', countryValues);
    }

    if (tourTypes && tourTypes.length > 0) {
      const tourTypesValues = tourTypes.map(type => type.value).join(',');
      params.set('tourtypes', tourTypesValues);
    }

    if (tourDates) {
      params.set('tourdates', tourDates.value);
    }
    
    // Add the search text
    if (debouncedValue) {
      params.set('search', debouncedValue);
    }

    // Add the current page
    params.set('page', (currentPage + 1).toString());

    // Update the URL with the new parameters
    setSearchParams(params);
  }, [countries, tourTypes,tourDates,debouncedValue, currentPage, setSearchParams]);

  const fetchTours = async (page = 0) => {
    const params = new URLSearchParams();
  
    // Set the page parameter
    params.set('page', (page + 1).toString());
  
    // Set the search parameter if debouncedValue exists
    if (debouncedValue) {
      params.set('search', debouncedValue);
    }
  
    // Set the countries parameter if countries array is defined
    if (countries && countries.length > 0) {
      const countryValues = countries.map(country => country.value).join(',');
      params.set('countries', countryValues);
    }

    if (tourTypes && tourTypes.length > 0) {
      const tourTypesValues = tourTypes.map(t => t.value).join(',');
      params.set('tourtypes', tourTypesValues);
    }

    if (tourDates) {
      params.set('tourdates', tourDates.value);
    }
    // Construct the full URL with the base URL and the query string
    const url = `${BASE_URL}/tours/?${params.toString()}`;
 
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error('Něco se pokazilo, spolucesty nebyly načteny');
      }
  
      backendError && setBackendError(null);
      return await response.json();
    } catch (error: any) {
      setBackendError(error.message);
      return null;
    }
  };
  
  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryFn: () => fetchTours(currentPage),
    queryKey: ['tours', currentPage, debouncedValue, countries,tourTypes,tourDates],
    retry: 2,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 100000,
  });

  useEffect(() => {
    if (data?.allDestinations) {
      // Create an array with { value, label } format
      const formattedDestinations = data.allDestinations.map((destination: any) => ({
        value: destination,
        label: destination,
      }));
  
      // Update state with the new array
      setAvailableDestinations(formattedDestinations);
    }
  }, [data]);

  if (isError) {
    return <span>Něco se pokazilo , spolucety nebyly načteny</span>;
  }

  const userDataFiltered = data?.tours.filter((keyword: any) =>
    keyword.destination.toLowerCase().includes(debouncedValue ? debouncedValue.toLowerCase() : '')
  ) || [];

  return (
    <div className='px-2 '>
      <div className='text-center text-blue-500 '>
        {!user ? 
          'Pouze přihlášení uživatelé mohou vkládat Vlogy' :
          <Link to={'./createtour'}>Vytvoř spolucestu <span className="underline cursor-pointer text-blue-600" >zde</span></Link>
        }
      </div>

      <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-20">
        <div className={`${(!text) ? '' : 'opacity-30 pointer-events-none'}`}>
          <SearchComponent availableDestinations={availableDestinations} 
                          countries={countries}
                          setCountries={setCountries}
          />
        </div>     

        <div className={`${(!countries || countries.length < 1) ? '' : 'opacity-30 pointer-events-none'}`}>
          <SearchDebounceComponent 
                          text={text} 
                          setText={setText} />
        </div>

        <SearchTourTypeComponent 
                          tourTypes={tourTypes}
                          setTourTypes={setTourTypes}
                          />
        <SearchDateComponent
                        tourDates={tourDates}
                        setTourDates={setTourDates}
                      />
      </div>

      {isLoading || debounceLoading && 'Moment prosim'}

      <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-20">
        {userDataFiltered
          .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
          .map((tour: any) => (
            <Tour key={tour.id} tour={tour} />
          ))}
      </div>

      <div className="flex items-center justify-center space-x-4 py-2">
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          Aktuální stránka: {currentPage + 1} of {data?.totalPages}
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
          disabled={isPlaceholderData || currentPage + 1 >= data?.totalPages}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
            isPlaceholderData || currentPage + 1 >= data?.totalPages 
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
