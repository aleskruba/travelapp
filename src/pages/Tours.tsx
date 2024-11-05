import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/authContext';
import { BASE_URL } from '../constants/config';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery ,useQueryClient} from '@tanstack/react-query';
import Tour from '../components/tours/Tour';
import SearchComponent from '../components/tours/SearchComponent';
import SearchTourTypeComponent from '../components/tours/SearchTourTypeComponent';
import SearchDateComponent from '../components/tours/SearchDateComponent';
import SearchDebounceComponent from '../components/tours/SearchDebounceComponent';
import useDebounce from '../hooks/useDebounce';
import { fetchData } from '../hooks/useFetchData';
import Button from '../components/customButton/Button';

interface CountryOption {
  readonly value: string;
  readonly label: string;
}

function Tours() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendServerError, setBackendServerError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableDestinations, setAvailableDestinations] = useState<CountryOption[]>([]);
  const [text, setText] = useState<string>('');
  const { debouncedValue } = useDebounce(text, 500);

  const countriesParam = searchParams.get('countries');
  const tourTypesParam = searchParams.get('tourtypes');
  const tourDatesParam = searchParams.get('tourdates');


  const [countries, setCountries] = useState<any[]>(countriesParam ? 
    countriesParam.split(',').map(value => ({ value, label: value })) : []);
  const [tourTypes, setTourTypes] = useState<any[]>(tourTypesParam ? 
      tourTypesParam.split(',').map(value => ({ value, label: value })) : []
  );
  const [tourDates, setTourDates] = useState<any>(
    tourDatesParam ? { value: tourDatesParam, label: tourDatesParam } : null
  );

  const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;

  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ['tour'] })


  useEffect(() => {

    const searchParam = searchParams.get('search');

    if (countriesParam) {
      setCountries(countriesParam.split(',').map(value => ({ value, label: value })));
    }

    if (tourTypesParam) {
      setTourTypes(tourTypesParam.split(',').map(value => ({ value, label: value })));
    }

    if (tourDatesParam) {
      setTourDates({ value: tourDatesParam, label:tourDatesParam });

    }

    if (searchParam) {
      setText(searchParam);
    }
  }, [searchParams,countriesParam, tourDatesParam, tourTypesParam]);

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
    
    if (debouncedValue) {
      params.set('search', debouncedValue);
    }

    params.set('page', (currentPage + 1).toString());

    setSearchParams(params);
  }, [countries, tourTypes, tourDates, debouncedValue, currentPage, setSearchParams]);

  const fetchTours = async (page = 0) => {
    const params = new URLSearchParams();
  
    params.set('page', (page + 1).toString());
  
    if (debouncedValue) {
      params.set('search', debouncedValue);
    }
  
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
    
    const url = `${BASE_URL}/tours/?${params.toString()}`;

    try {
     const response = await fetchData(url,'GET');

      if (!response.ok) {
        const errorData = await response.json();
        setBackendError(errorData.error);
    
        }

      backendError && setBackendError(null);
      return await response.json();
    } catch (error: any) {
      setBackendServerError('SERVER ERROR')
      return null;
    }
  };



  
  const { data, isLoading, isFetching, isError} = useQuery({
    queryFn: () => fetchTours(currentPage),
    queryKey: ['tours', currentPage, debouncedValue, countries, tourTypes, tourDates],
    retry: 2,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 100000,
  });

  useEffect(() => {
    if (data?.allDestinations) {
      const formattedDestinations = data.allDestinations.map((destination: any) => ({
        value: destination,
        label: destination,
      }));
  
      setAvailableDestinations(formattedDestinations);
    }
  }, [data]);

  if (isLoading || isFetching) {
    return <div className='flex justify-center items-center h-screen'>Moment prosim...</div>;
  }

  if (isError) {
    return <span>Něco se pokazilo , spolucety nebyly načteny</span>;
  }

  const userDataFiltered = data?.tours.filter((keyword: any) =>
    keyword.destination.toLowerCase().startsWith(debouncedValue ? debouncedValue.toLowerCase() : '')
  ) || [];
  
  const currentUrl = window.location.href;

  return (
    <div className='px-2 '>

      <div className='text-center text-blue-500 pt-4'>
        {!user ? 
          'Pouze přihlášení uživatelé mohou vkládat Vlogy' :
          <Link to={'../createtour'}>Vytvoř spolucestu <span className="underline cursor-pointer text-blue-600" >zde</span></Link>
        }
      </div>

      <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 mt-20 dark:text-gray-600 md:px-20">
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
      {backendServerError && !backendError &&<div className='pt-8 text-center text-xl font-extrabold dark:text-red-200 text-red-600'>{backendServerError}</div>}
      {backendError && <div className='pt-8 text-center text-xl font-extrabold dark:text-red-200 text-red-600'>{backendError}</div>}
      <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-20 md:px-20">
     
        {userDataFiltered.length === 0 ? (
          <div className='flex justify-center items-center pb-10'>Žádná shoda</div>
        ) : (
          userDataFiltered
            .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
            .map((tour: any) => (
              <Link to={`../tours/${tour.id}`} key={tour.id} state={{ some: currentUrl}}>
                <Tour tour={tour} />
              </Link>
            ))
        )}
      </div>

      <div className="flex flex-col gap-2 items-center justify-center  space-x-4 py-2 pt-12 pb-12">
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          Aktuální stránka: {currentPage + 1} of {data?.totalPages}
        </span>
        <div className='flex gap-2'>
  <Button
    onClick={() => currentPage > 0 && navigate(`?page=${currentPage}`)}
    color="gray" // Use gray color for the button
    className={`rounded-md px-4 py-2 w-28 ${currentPage === 0 ? 'opacity-30 pointer-events-none' : ''}`}
    disabled={currentPage === 0}
  >
    Předchozí
  </Button>

  <Button
    onClick={() =>
      currentPage < (data?.totalPages - 1) && navigate(`?page=${currentPage + 2}`)
    }
    color="gray" // Use gray color for the button
    className={`rounded-md px-4 py-2 w-28 ${currentPage >= data?.totalPages - 1 ? 'opacity-30 pointer-events-none' : ''}`}
    disabled={currentPage >= data?.totalPages - 1}
  >
    Další
  </Button>
</div>

      </div>
    </div>
  );
}

export default Tours;
