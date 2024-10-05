import React, { useState, FormEvent, ChangeEvent ,useRef, useEffect} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DOMPurify from 'dompurify';
import { typeOfTour } from '../constants/constantsData';
import { countryNames } from '../constants/constantsData';
import { useAuthContext } from '../context/authContext';
import { useNavigate } from "react-router-dom";
import { initialToureState, TourProps } from '../types';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import {  Flip, toast } from 'react-toastify';
import { useParams} from 'react-router-dom';
import { keepPreviousData, useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { spawn } from 'child_process';
import { fetchData } from '../hooks/useFetchData';

function UpdateTour() {

    let { id } = useParams<string>();

    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const [isChanged, setIsChanged] = useState(false);
    const [allowSubmitButton, setAllowSubmitButton] = useState(false);
    const [errors, setErrors] = useState('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [chosenCountry, setChosenCountry] = useState('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDateEnd, setSelectedDateEnd] = useState<Date | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [backendError,setBackendError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [tour, setTour] = useState<TourProps>(initialToureState);
    const [updateTour, setUpdateTour] = useState<TourProps>(initialToureState);

    const url = `${BASE_URL}/tour/${id}`;

    const fetchTour = async () => {

      try {
      const response = await fetchData(url,'GET');
  
      if (!response.ok) {
            setBackendError('Chyba při získaní dat');
           return null;
      }

      backendError && setBackendError(null);
      
      return response.json();
      }catch (err) {
        setBackendError('Chyba při získaní dat');
        return null;
      }
        };

/*     const fetchTour = async () => {
      const url = `${BASE_URL}/tour/${id}`;
      try {
        const response = await fetch(url, {
          credentials: 'include', // Include cookies in the request
        });
    
        if (!response.ok) {
          throw new Error('Něco se pokazilo, spolucesta nebyla načtena');
        }
    
        backendError && setBackendError(null);
        return await response.json();
      } catch (error: any) {
        setBackendError(error.message);
        return null;
      }
  };
 */
  queryClient.invalidateQueries({ queryKey: ['yourtour'] })

  const { data, isSuccess ,isLoading, isError,isFetching } = useQuery({
      queryFn: () => fetchTour(),
      queryKey: ['yourtour'],
      retry: 2,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: true,
      staleTime: 100000,
  });


  useEffect(() => {
    if (isSuccess) {
         setUpdateTour(data.tour)
         setSelectedTypes(JSON.parse(data.tour.tourtype))
         setSelectedDate(new Date(data.tour.tourdate))
         setSelectedDateEnd(new Date(data.tour.tourdateEnd))
         setChosenCountry(data.tour.destination)
  
    }

  },[data])




  const checkDestinationChanges = (updatedText: TourProps, originalText: TourProps): boolean =>{ 
    return updatedText.destination !== originalText.destination || updatedText.destination !== originalText.destination;

}

const checkTourTypeChanges = (updatedState: TourProps, oldState: TourProps): boolean => { 

  const oldTourtypeArray: string[] = typeof oldState.tourtype === 'string'
      ? JSON.parse(oldState.tourtype)
      : oldState.tourtype || [];


  const updatedTourtypeArray: string[] = Array.isArray(updatedState.tourtype)
      ? updatedState.tourtype
      : JSON.parse(updatedState.tourtype as unknown as string);


  const isChanged = updatedTourtypeArray.length !== oldTourtypeArray.length ||
      !updatedTourtypeArray.every(type => oldTourtypeArray.includes(type));



  return isChanged;
};


  const checkTextChanges = (updatedText: TourProps, originalText: TourProps): boolean =>{ 
    return updatedText.aboutme !== originalText.aboutme || updatedText.fellowtraveler !== originalText.fellowtraveler;


  }

  const checkDateChanges = (updatedDate: TourProps, originalDate: TourProps): boolean => {

    if (!updatedDate.tourdate || !updatedDate.tourdateEnd || !originalDate.tourdate || !originalDate.tourdateEnd) {
        return false;
    }

    const updatedStartYear = new Date(updatedDate.tourdate).getFullYear();
    const updatedStartMonth = new Date(updatedDate.tourdate).getMonth();

    const originalStartYear = new Date(originalDate.tourdate).getFullYear();
    const originalStartMonth = new Date(originalDate.tourdate).getMonth();

    const updatedEndYear = new Date(updatedDate.tourdateEnd).getFullYear();
    const updatedEndMonth = new Date(updatedDate.tourdateEnd).getMonth();

    const originalEndYear = new Date(originalDate.tourdateEnd).getFullYear();
    const originalEndMonth = new Date(originalDate.tourdateEnd).getMonth();

 
    const endDateChanged = updatedEndYear+updatedEndMonth!==originalEndYear+originalEndMonth
    const dateChanged = updatedStartYear+updatedStartMonth!==originalStartYear+originalStartMonth
  
    return  dateChanged || endDateChanged;
};

const checkAllField = (updatedDate: TourProps) =>{
  if(!updatedDate.destination || selectedTypes.length === 0 || !updatedDate.fellowtraveler || !updatedDate.aboutme || !selectedDate ) {
    setAllowSubmitButton(false)
  }
  else {
    setAllowSubmitButton(true)
  }

}
const checkChanges = (updated: TourProps, original: TourProps): boolean=> {
  
  return checkTextChanges(updated, original) || 
         checkDateChanges(updated, original) || 
         checkDestinationChanges(updated, original) ||
         checkTourTypeChanges(updated, original);
         
};

useEffect(() => {
  if (isSuccess) {
  setIsChanged(checkChanges(updateTour, data?.tour));
  checkAllField(updateTour)
  }
}, [updateTour]);


const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  const sanitizedValue = DOMPurify.sanitize(value); // Sanitize the value


 
  setUpdateTour(prevState => {
      const newState = { ...prevState, [name]: sanitizedValue };

      setIsChanged(checkTextChanges(newState, data.tour));

      return newState;
  });
};


      const handleDateChange = (date: Date | null) => {
        setSelectedDate(date); 
        setSelectedDateEnd(date);// Update selectedDate state with the selected date
        setUpdateTour(prevState => ({ ...prevState, tourdate: date || new Date(), tourdateEnd:  date || new Date()})); // Update tourdate property in the tour state with the selected date

   
        if (date && selectedDateEnd) {
          if
           (new Date(date) >= new Date(selectedDateEnd) ) {
              setSelectedDateEnd(date)
           };
        }
    
    
      };

      const filterPastMonths = () => {
        if (selectedDate && selectedDateEnd) {
          const dateObj1 = new Date(selectedDate);
          const dateObj2 = new Date(selectedDateEnd);
      
          // Extract year and month for both dates
          const year1 = dateObj1.getFullYear();
          const month1 = dateObj1.getMonth(); // getMonth returns 0-based month (0 = January, 11 = December)
      
          const year2 = dateObj2.getFullYear();
          const month2 = dateObj2.getMonth();
      
          // Compare year and month
          if (year2 > year1 || (year2 === year1 && month2 >= month1)) {
            return true;
          } else {
            return false;
          }
        } else {
          console.log('Something went wrong');
          return false;
        }
      };
      

    const handleDateEndChange = (date: Date | null) => {

      setUpdateTour(prevState => {
        const newState = { 
          ...prevState, 
          tourdateEnd: date || new Date() 
        };
        setSelectedDateEnd(date); 
       
        return newState;
      });
    };
    
      const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        
        setSelectedTypes(prevSelectedTypes => {
          let newSelectedTypes: string[];
            
            if (prevSelectedTypes.includes(value)) {
                newSelectedTypes = prevSelectedTypes.filter(type => type !== value);
            } else {
                newSelectedTypes = [...prevSelectedTypes, value];
            }

            setUpdateTour(prevState => ({
              ...prevState,
              tourtype: newSelectedTypes
            }));
            
            return newSelectedTypes;
        });
    };

    const updateTourFunction = async ( tour:any) =>{
        try {
      const response = await fetchData(url,'PUT',tour);
  
      if (!response.ok) {
            setBackendError('Chyba při získaní dat');
           return null;
      }

      backendError && setBackendError(null);
      
      return response.json();
      }catch (err) {
        setBackendError('Chyba při získaní dat');
        return null;
      }
    }
      const createTourMutation = useMutation({
        mutationFn: updateTourFunction,   

        onSuccess: () => {
          setBackendError(null);
          setTour(initialToureState);
          queryClient.invalidateQueries({ queryKey: ['tours'] });
          queryClient.invalidateQueries({ queryKey: ['yourtours'] });
          toast.success('Spoluceta byla úspěšně uložena', {
            position: "top-left",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Flip,
          });
          navigate('/yourtours');  // Adjust this to your desired route after success
        },
        onError: (err) => {
          setBackendError('Něco se pokazilo, tour nebyla vytvořena');
          toast.error('Chyba při ukládání spolucesty', {
            position: "top-left",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Flip,
          });
        },
      });
    
      const onSubmitFunction = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
      
        const newTour = { 
          ...updateTour, 
          tourtype: selectedTypes,
          user_id:user?.id  // Assuming selectedTypes is the updated value for tourtype
        };
      
        const hasCompleted = !newTour.destination || newTour.tourtype.length === 0 || !newTour.fellowtraveler || !newTour.aboutme || !selectedDate ;
        if (hasCompleted) { setErrors('Nejsou vyplněna všechna pole')}
        console.log(newTour);  // This should log the correctly updated tour object
      
        // Ensure that you're passing both the tour and user_id if needed
        createTourMutation.mutate({ tour: newTour, user_id: tour.user_id });
      };
      
    const handleDropdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
    
      const handleSelectCountry = (country: string) => {

        setChosenCountry(country);
        setIsOpen(false);
        setSearchTerm('');
        setUpdateTour(prevState => ({ ...prevState, destination: country}));

      };
      
      const maxDisplayedCountries = 15;

      let filteredCountries = countryNames.filter((country) => {
        const normalizedCountry = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedSearchTerm = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return (
            normalizedCountry.toLowerCase().startsWith(normalizedSearchTerm.toLowerCase()) ||
            country.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
    });
    
    
      if (filteredCountries.length > maxDisplayedCountries) {
        filteredCountries = filteredCountries.slice(0, maxDisplayedCountries);
      }

      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (isOpen) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((prevIndex) =>
                prevIndex === filteredCountries.length - 1 ? 0 : prevIndex + 1
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex((prevIndex) =>
                prevIndex === 0 ? filteredCountries.length - 1 : prevIndex - 1
              );
            } else if (e.key === "Enter" && highlightedIndex !== -1) {
              handleSelectCountry(filteredCountries[highlightedIndex]);
            }
          }
        };
    
        document.addEventListener("keydown", handleKeyDown);
    
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }, [isOpen, highlightedIndex, filteredCountries]);
    
      // Add event listener to handle clicks outside of the dropdown
      useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setIsOpen(false);
            setSearchTerm('')
          }
        };
    
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, []);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            setIsOpen(true)
            
            setHighlightedIndex(-1); // Reset highlighted index when input changes
        
          };

          if (isLoading ) {
            return <span>Moment prosím ...</span>;
        }
      
        if (isError) {
            return <span>Něco se pokazilo, spolucesty nebyly načteny</span>;
        }

  return (
    <div className="text-black dark:text-white">
    <div className='flex justify-end p-4'>
      <button className='bg-gray-200 hover:bg-gray-300 darK:bg-gray-700 darK:hover:bg-gray-800 p-2 dark:text-black rounded-md'
              onClick={()=>navigate('../yourtours')}>Zpět na tvoje spolucesty</button>
    </div>
   
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Uprav spolucestu</h1>
        <div>
          <form onSubmit={onSubmitFunction}>
            <div className="mb-4">
            
            <div className='flex flex-col '>
              <h1 className="block text-xl font-bold mb-2">Destinace: {data.tour.destination}</h1>
              <span className='text-xs dark:text-red-200 text-red-500 leading-tight '>Destinace nelze měnit </span>
            </div>
<div className="relative w-full px-2">
{/* <input
  type="text"
  placeholder={chosenCountry ? chosenCountry : "vyber zemi"}
  maxLength={8}
  value={searchTerm}
  onChange={handleInputChange}
 // onClick={handleInputClick} // Toggle dropdown when clicking on input
  className="w-full border rounded px-4 py-2 focus:outline-none text-black font-bold bg-blue-100 focus:bg-white"
/>
{isOpen && (
  <div
    className="absolute px-4 z-10 mt-1 w-[97%] md:w-[94%]  bg-white text-black border rounded shadow-lg"
    ref={dropdownRef}
    onClick={handleDropdownClick}
  >
    {filteredCountries.length === 0 ? (
      <div className="px-4 py-2">Žádná shoda</div>
    ) : (
      filteredCountries.map((country, index) => (
        <div
          key={index}
          onClick={() => {
            handleSelectCountry(country);
            setSearchTerm(country); // Update search term to selected country
          }}
          className={`px-4 py-2 hover:bg-gray-300 cursor-pointer ${
            index === highlightedIndex ? "bg-gray-300" : ""
          }`}
        >
          {country}
        </div>
      ))
    )}
    {countryNames.length > filteredCountries.length && (
      <div className="flex items-center justify-center opacity-50 italic">
        + dalších {countryNames.length - filteredCountries.length} zemí
      </div>
    )}
  </div>
)} */}
</div>




            </div>



            <div className='flex gap-4 items-center mt-4'>
            <label className="block text-sm font-bold " htmlFor="date">Začátek cesty:</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              minDate={new Date()}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />

                 {selectedDate &&  <>
                 <label className="block text-sm font-bold " htmlFor="dateend">do:</label>
            <DatePicker

              selected={selectedDateEnd}
              onChange={handleDateEndChange}
              dateFormat="MM/yyyy"
              minDate={selectedDate}
              showMonthYearPicker
              filterDate={filterPastMonths}
              className={` shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            /> </>}
     </div>
    {/*  checkboxes */}

     <div className="mb-4 text-sm mt-4	">

      <label className="block text-sm font-bold mb-2" htmlFor="journey-type">Typ cesty:</label>
      <div className="flex flex-wrap gap-3">

        {typeOfTour.map((type, index) => (
          index % 2 === 0 && (
            <div key={index} className="mb-2 flex items-center   w-[180px]">
          <input
            className="mr-2 hidden"
            id={`journey-type-${index}`}
            type="checkbox"
            value={type}
            checked={selectedTypes.includes(type)}
            onChange={handleCheckboxChange}
          />
          <label htmlFor={`journey-type-${index}`} className="relative flex cursor-pointer">
            <div className="w-6 h-6 border border-gray-300 rounded-md flex items-center justify-center bg-white mr-2">
              {selectedTypes.includes(type) && (
                    <svg className="w-4 h-4 text-red-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" />
                  </svg>
              )}
            </div>
            {type}
          </label>
            </div>
          )
        ))}

  {typeOfTour.map((type, index) => (
            index % 2 !== 0 && (
              <div key={index} className="mb-2 flex items-center   w-[180px]">
      <input
        className="mr-2 hidden"
        id={`journey-type-${index}`}
        type="checkbox"
        value={type}
        checked={selectedTypes.includes(type)}
        onChange={handleCheckboxChange}
      />
      <label htmlFor={`journey-type-${index}`} className="relative flex cursor-pointer">
        <div className="w-6 h-6 border border-gray-300 rounded-md flex items-center justify-center bg-white mr-2">
          {selectedTypes.includes(type) && (
                <svg className="w-4 h-4 text-red-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" />
              </svg>
          )}
        </div>
        {type}
      </label>
              </div>
            )
          ))}
        </div>
      </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="looking-for">Koho hledáte:</label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                id="looking-for"
                rows={5}
                placeholder="Jakého spolucestujícího hledáte? Zadejte požadavky na pohlaví, věk, zájmy, atd. Omezte se na 500 znaků."
                maxLength={500}
                name="fellowtraveler"
                value={updateTour.fellowtraveler ?? ""}
                onChange={handleChange}
                style={{ resize: "none" }} 
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="about-you">Informace o sobě:</label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200  leading-tight focus:outline-none focus:shadow-outline"
                id="about-you"
                rows={5}
                placeholder="Napište krátký popis o sobě. Zahrňte vaše zájmy, preference a vše, co si myslíte, že by měli ostatní uživatelé vědět. Omezte se na 500 znaků."
                maxLength={500}
                name="aboutme"
                value={updateTour.aboutme ?? ""}
                onChange={handleChange}
                style={{ resize: "none" }} 
              ></textarea>
            </div>
            <div className='text-lightError pb-4 text-xl '>{errors ? errors : ''}</div>
            <div className='flex gap-4'>
            <button
             className={` ${ isChanged && allowSubmitButton ? ':hover:bg-blue-700  cursor-pointer':' opacity-30  cursor-default py-2 px-4 pointer-events-none ' } bg-blue-500 min-w-[150px]  text-whitefont-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline `}
              type="submit"
            >
              Odeslat
            </button>
            <button
             className={` hover:bg-gray-700  bg-gray-500 text-white cursor-pointer  min-w-[150px]  text-whitefont-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ' `}
              type="button"
              onClick={()=>navigate('../yourtours')}
            >
              Zpět
            </button>
            </div>

          </form>
      { !isChanged  ? <span className='dark:text-red-200 text-red-500 '>Nebyla provedena žádná změna</span> : '' }
      { !allowSubmitButton  ? <span className='dark:text-red-200 text-red-500 '>Nejsou vyplněna všechna pole</span> : '' }
{backendError ? <p className='text-red-500'>{backendError}</p>: null}
          
        </div>
      </div>
    </div>
  </div>
);
}

export default UpdateTour