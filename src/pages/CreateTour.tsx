import React, { useState, FormEvent, ChangeEvent ,useRef, useEffect} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DOMPurify from 'dompurify';
import { typeOfTour } from '../constants/constantsData';
import { countryNames } from '../constants/constantsData';
import { useAuthContext } from '../context/authContext';
import { useTourContext } from '../context/tourContext';
import { useNavigate } from "react-router-dom";
import { initialToureState, TourProps } from '../types';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  Flip, toast } from 'react-toastify';


function CreateTour() {
    const queryClient = useQueryClient();
    const {yourToursLength } = useTourContext();
    const { user } = useAuthContext();
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

    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value); // Sanitize the value
      
        setTour(prevState => {
          const newState = { ...prevState, [name]: sanitizedValue };
      
          const hasCompleted = !newState.destination || selectedTypes.length === 0 || !newState.fellowtraveler || !newState.aboutme || !selectedDate ;
        
          setAllowSubmitButton(!hasCompleted);
      
          return newState;
        });
      };

      const handleDateChange = (date: Date | null) => {
        setSelectedDate(date); 
        setSelectedDateEnd(date);// Update selectedDate state with the selected date
        setTour(prevState => ({ ...prevState, tourdate: date || new Date(), tourdateEnd:  date || new Date()})); // Update tourdate property in the tour state with the selected date
      
        if (date && selectedDateEnd) {
          if
           (new Date(date) >= new Date(selectedDateEnd) ) {
              setSelectedDateEnd(date)
           };
        }
    
    
      };
      const filterPastMonths = (date: Date | null)  => {
        // Disable dates before the selectedDate or in the past
        if (date && selectedDate) {
    
      
        return date >= selectedDate;
        }else {
          return false
        }
      };
    
      const handleDateEndChange = (date: Date | null) => {
        setSelectedDateEnd(date); // Update selectedDate state with the selected date
        setTour(prevState => ({ ...prevState, tourdateEnd: date || new Date() })); // Update tourdate property in the tour state with the selected date
      };
    
      const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSelectedTypes(prevSelectedTypes => {
          if (prevSelectedTypes.includes(value)) {
            return prevSelectedTypes.filter(type => type !== value);
          } else {
            return [...prevSelectedTypes, value];
          }
        });
      };

    
      const createTourMutation = useMutation({
        mutationFn: async (tour: any) => {
            const response = await fetch(`${BASE_URL}/tour`, {
              ...HTTP_CONFIG,
              method: 'POST',
              body: JSON.stringify(tour),  // Just passing the tour object
              credentials: 'include',
            });
          
            if (!response.ok) throw new Error('Error occurred while creating tour');
            return response.json();
          },   

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
          ...tour, 
          tourtype: selectedTypes,
          user_id:user?.id  // Assuming selectedTypes is the updated value for tourtype
        };
      
        const hasCompleted = !newTour.destination || newTour.tourtype.length === 0 || !newTour.fellowtraveler || !newTour.aboutme || !selectedDate ;
        if (hasCompleted) { setErrors('Nejsou vyplněna všechna pole')}
   
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
        setTour(prevState => ({ ...prevState, destination: country}));
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

          if (yourToursLength && yourToursLength >= 4) {
            setTimeout(function () {
                navigate(`../yourtours`);
            }, 1000); // Navigate after 1 second
            return (
              <div className='flex h-screen justify-center items-center'>
                <span>Již máš vytvořené 4 spolucesty, což je maximální počet...

                </span>
              </div>);
        }
        
    
  return (
    <div className="text-black dark:text-white">
          <div className='flex justify-end p-4'>
      <button className='bg-gray-200 hover:bg-gray-300 darK:bg-gray-700 darK:hover:bg-gray-800 px-4 py-2 dark:text-black rounded-md'
              onClick={()=>navigate(-1)}>Zpět</button>
    </div>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Jak vytvořit Spolucestu</h1>
      <h2 className="text-xl font-semibold mb-4">1. Začněte Registrací:</h2>
      <p className="mb-4">Pokud jste již zaregistrovaní uživatelé, můžete tento krok přeskočit. Pokud ne, zaregistrujte se na našem webu a vytvořte si účet. Tím se vám umožní spravovat vaše nabídky spolucesty a komunikovat s ostatními uživateli.</p>
      <h2 className="text-xl font-semibold mb-4">2. Přihlaste se:</h2>
      <p className="mb-4">Po registraci nebo pokud už máte účet, přihlaste se pomocí svého uživatelského jména a hesla.</p>
      <h2 className="text-xl font-semibold mb-4">3. Vyplňte Formulář:</h2>
      <p className="mb-4">Po přihlášení klikněte na tlačítko "Vytvořit novou nabídku spolucesty". Vyplňte formulář s následujícími informacemi:</p>
      <ul className="list-disc ml-8 mb-4">
        <li><strong>Destinace:</strong> Kam se chystáte? Uveďte místo, které plánujete navštívit.</li>
        <li><strong>Příbližný termín</strong> Kdy plánujete odjet? Uveďte příbližný termín.</li>
        <li><strong>Typ cesty:</strong> Jaký druh cesty plánujete? Moře, hory, výlety, atd. Zde můžete specifikovat typ vaší dobrodružné plánované cesty.</li>
        <li><strong>Koho hledáte:</strong> Jakého spolucestujícího hledáte? Zadejte požadavky na pohlaví, věk, zájmy, atd.</li>
        <li><strong>Informace o sobě:</strong> Napište krátký popis o sobě. Zahrňte vaše zájmy, preference a vše, co si myslíte, že by měli ostatní uživatelé vědět.</li>
      </ul>
    </div>
    
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Vytvoř spolucestu</h1>
        <div>
          <form onSubmit={onSubmitFunction}>
            <div className="mb-4">
            
            <label className="block text-sm font-bold mb-2" htmlFor="destination">Destinace:</label>
<div className="relative w-full px-2">
<input
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
)}
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
                value={tour.fellowtraveler ?? ""}
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
                value={tour.aboutme ?? ""}
                onChange={handleChange}
                style={{ resize: "none" }} 
              ></textarea>
            </div>
            <div className='text-lightError pb-4 text-xl '>{errors ? errors : ''}</div>
            <button
             className={` ${allowSubmitButton ? ':hover:bg-blue-700  cursor-pointer':' opacity-30  cursor-default py-2 px-4 pointer-events-none ' } bg-blue-500 min-w-[150px]  text-whitefont-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline `}
              type="submit"
            >
              Odeslat
            </button>

          </form>
{backendError ? <p className='text-red-500'>{backendError}</p>: null}
          
        </div>
      </div>
    </div>
  </div>
);
}

export default CreateTour