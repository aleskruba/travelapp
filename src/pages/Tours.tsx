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
import { useLanguageContext } from '../context/languageContext';
import { tourConstants } from '../constants/constantsTours';
import { countryTranslationsEn,countryTranslationsEs } from '../constants/constantsData';
import { monthNameObject } from '../constants/constantsData';

interface CountryOption {
  readonly value: string;
  readonly label: string;
}

function Tours() {
  const navigate = useNavigate();
  const {user} = useAuthContext()
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendServerError, setBackendServerError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableDestinations, setAvailableDestinations] = useState<CountryOption[]>([]);
  const [text, setText] = useState<string>('');
  const { debouncedValue } = useDebounce(text, 500);
  const { language} = useLanguageContext();

  const countriesParam = searchParams.get('countries');
  const tourTypesParam = searchParams.get('tourtypes');
  const tourDatesParam = searchParams.get('tourdates');


  const [countries, setCountries] = useState<any[]>(countriesParam 
    ? countriesParam.split(',').map(value => {
        if (language === 'en') {
            const country = countryTranslationsEn.find(c => c.cz === value);
          return { value, label: country ? country.en : value }; 
        } else if (language === 'es') {
          // Find the country translation in Spanish
          const country = countryTranslationsEs.find(c => c.cz === value);
          return { value, label: country ? country.es : value }; 
        }
        return { value, label: value }; 
      })
    : []);
  

  const [tourTypes, setTourTypes] = useState<any[]>(tourTypesParam ? 
    tourTypesParam.split(',').map(value => ({ value})) : []
);

  
  const [tourDates, setTourDates] = useState<any[]>(tourDatesParam 
    ? tourDatesParam.split(',').map(value => {
        const [month, year] = value.split('-'); 
        let label = `${month}-${year}`; 
  
        if (language === 'en') {
            const monthName = monthNameObject.find(c => c.cz === month);
          if (monthName) {
            label = `${monthName.en}-${year}`;
          }
        } else if (language === 'es') {
          const monthName = monthNameObject.find(c => c.cz === month);
          if (monthName) {
            label = `${monthName.es}-${year}`;
          }
        }
  
        return { value, label }; 
    })
    : []
  );
    
  const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ['tour'] })

 
  useEffect(() => {
    const searchParam = searchParams.get('search');

    if (countriesParam) {
  
      setCountries(
        countriesParam.split(',').map(value => ({
          value,
          label: language === 'en'
            ? countryTranslationsEn.find(c => c.cz === value)?.en
            : language === 'es'
            ? countryTranslationsEs.find(c => c.cz === value)?.es
            : value // Default to the country value if no translation is found
        }))
      );
            
    }

    if (tourTypesParam) {
      setTourTypes(tourTypesParam.split(',').map(value => ({ value, label: 'test' })));
    }

    if (tourDatesParam) {
        
      setTourDates(
        tourDatesParam.split(',').map(value => ({
          value,
          label: language === 'en'
            ? countryTranslationsEn.find(c => c.cz === value)?.en
            : language === 'es'
            ? countryTranslationsEs.find(c => c.cz === value)?.es
            : value // Default to the country value if no translation is found
        }))
      );
       }

    if (searchParam) {
      setText(searchParam);
    }
  }, [searchParams,language ,countriesParam, tourDatesParam, tourTypesParam]);

  const [url, setUrl] = useState('');

  const normalizeUrl = (url: string) => {
    const urlObj = new URL(url);
    urlObj.searchParams.delete('page');
    return urlObj.toString();
  };

  const updateSearchParams = (paramsObj: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const currentUrl = window.location.href;
    const normalizedCurrentUrl = normalizeUrl(currentUrl);

    if (url !== normalizedCurrentUrl) {
   
      setUrl(normalizedCurrentUrl);
      updateSearchParams({
        countries: countries.map(c => c.value).join(',') || undefined,
        tourtypes: tourTypes.map(t => t.value).join(',') || undefined,
        tourdates: tourDates[0]?.value || undefined,
        search: debouncedValue || undefined,
        page: '1',
      });
    } else {
      updateSearchParams({
        page: (currentPage + 1).toString(),
        countries: countries.map(c => c.value).join(',') || undefined,
        tourtypes: tourTypes.map(t => t.value).join(',') || undefined,
        tourdates: tourDates[0]?.value || undefined,
        search: debouncedValue || undefined,
      });
    }
  }, [ countries, tourTypes, tourDates, debouncedValue]);

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


    if (tourDates && tourDates.length > 0) {
                 params.set('tourdates', tourDates[0].value);
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
    queryKey: ['tours', currentPage, debouncedValue, countries, tourTypes, tourDates,language],
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
    return <div className='flex justify-center items-center h-screen'>{tourConstants.waitplease[language]}</div>;
  }

  if (isError) {
    return <span>{tourConstants.somethingWentWrong[language]}</span>;
  }


  let  userDataFiltered =   data?.tours.filter((keyword: any) =>
        keyword.destinationes.toLowerCase().includes(debouncedValue ? debouncedValue.toLowerCase() : '') || 
        keyword.destinationen.toLowerCase().includes(debouncedValue ? debouncedValue.toLowerCase() : '') ||
        keyword.destination.toLowerCase().includes(debouncedValue ? debouncedValue.toLowerCase() : '') 
   ) || [];

  
  const currentUrl = window.location.href;

  return (
    <div className='md:px-2'>

        <div className='flex justify-center pt-2 dark:text-lightBlue text-darkBlue'>
       {user   ? tourConstants.createTourInfo[language] : tourConstants.onlyRegistredUsersCreateTour[language]}
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
          <div className='flex justify-center items-center pb-10'>{tourConstants.noMatch[language]}</div>
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
        {tourConstants.currentPage[language]} {currentPage + 1} {tourConstants.of[language]} {data?.totalPages}
        </span>
        <div className='flex gap-2'>
  <Button
    onClick={() => currentPage > 0 && navigate(`?page=${currentPage}`)}
    color="gray" // Use gray color for the button
    className={`rounded-md px-4 py-2 w-28 ${currentPage === 0 ? 'opacity-30 pointer-events-none' : ''}`}
    disabled={currentPage === 0}
  >
  {tourConstants.previousPage[language]}
  </Button>

  <Button
    onClick={() =>
      currentPage < (data?.totalPages - 1) && navigate(`?page=${currentPage + 2}`)
    }
    color="gray" // Use gray color for the button
    className={`rounded-md px-4 py-2 w-28 ${currentPage >= data?.totalPages - 1 ? 'opacity-30 pointer-events-none' : ''}`}
    disabled={currentPage >= data?.totalPages - 1}
  >
  {tourConstants.next[language]} 
  </Button>
</div>

      </div>
    </div>
  );
}

export default Tours;

