import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DOMPurify from "dompurify";
import { useAuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { initialToureState, TourProps } from "../types";
import { BASE_URL } from "../constants/config";
import { useParams } from "react-router-dom";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchData } from "../hooks/useFetchData";
import Button from "../components/customButton/Button";
import { useLanguageContext } from "../context/languageContext";
import { typeOfTourObject } from "../constants/constantsData";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { tourConstants } from '../constants/constantsTours';
import { countryTranslationsEn } from "../constants/constantsData";


function UpdateTour() {
  let { id } = useParams<string>();
  const { language } = useLanguageContext();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const [isChanged, setIsChanged] = useState(false);
  const [allowSubmitButton, setAllowSubmitButton] = useState(false);
  const [errors, setErrors] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEnd, setSelectedDateEnd] = useState<Date | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [tour, setTour] = useState<TourProps>(initialToureState);
  const [updateTour, setUpdateTour] = useState<TourProps>(initialToureState);
  const [translatedLanguage,setTranslatedLanguage] = useState<string>()
  const [dateInPast, setDateInPast] = useState(false);

  const url = `${BASE_URL}/tour/${id}`;
  queryClient.invalidateQueries({ queryKey: ["yourtour"] });

  const fetchTour = async () => {
    try {
      const response = await fetchData(url, "GET");

      if (!response.ok) {
        setBackendError("Chyba při získaní dat");
        return null;
      }

      backendError && setBackendError(null);

      return response.json();
    } catch (err) {
      setBackendError("Chyba při získaní dat");
      return null;
    }
  };

  const { data, isSuccess, isLoading, isError } = useQuery({
    queryFn: () => fetchTour(),
    queryKey: ["yourtour"],
    retry: 2,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 100000,
  });

  const checkDestinationChanges = (
    updatedText: TourProps,
    originalText: TourProps
  ): boolean => {
    return (
      updatedText.destination !== originalText.destination ||
      updatedText.destination !== originalText.destination
    );
  };

  const checkTourTypeChanges = (
    updatedState: TourProps,
    oldState: TourProps
  ): boolean => {
    const oldTourtypeArray: string[] =
      typeof oldState.tourtype === "string"
        ? JSON.parse(oldState.tourtype)
        : oldState.tourtype || [];

    const updatedTourtypeArray: string[] = Array.isArray(updatedState.tourtype)
      ? updatedState.tourtype
      : JSON.parse(updatedState.tourtype as unknown as string);

    const isChanged =
      updatedTourtypeArray.length !== oldTourtypeArray.length ||
      !updatedTourtypeArray.every((type) => oldTourtypeArray.includes(type));

    return isChanged;
  };

  const checkTextChanges = (
    updatedText: TourProps,
    originalText: TourProps
  ): boolean => {
    return (
      updatedText.aboutme !== originalText.aboutme ||
      updatedText.fellowtraveler !== originalText.fellowtraveler
    );
  };

  const checkDateChanges = (
    updatedDate: TourProps,
    originalDate: TourProps
  ): boolean => {
    if (
      !updatedDate.tourdate ||
      !updatedDate.tourdateEnd ||
      !originalDate.tourdate ||
      !originalDate.tourdateEnd
    ) {
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

    const endDateChanged =
      updatedEndYear + updatedEndMonth !== originalEndYear + originalEndMonth;
    const dateChanged =
      updatedStartYear + updatedStartMonth !==
      originalStartYear + originalStartMonth;

    return dateChanged || endDateChanged;
  };

  const checkAllField = (updatedDate: TourProps) => {
    if (
      !updatedDate.destination ||
      selectedTypes.length === 0 ||
      !updatedDate.fellowtraveler ||
      !updatedDate.aboutme ||
      !selectedDate
    ) {
      setAllowSubmitButton(false);
    } else {
      setAllowSubmitButton(true);
    }
  };
  const checkChanges = (updated: TourProps, original: TourProps): boolean => {
    return (
      checkTextChanges(updated, original) ||
      checkDateChanges(updated, original) ||
      checkDestinationChanges(updated, original) ||
      checkTourTypeChanges(updated, original)
    );
  };

  useEffect(() => {
    if (isSuccess && data?.tour) {
      try {
        const parsedData = JSON.parse(data.tour.tourtype);
        const stringArray = parsedData.map((num: number) => num.toString()); // ["1", "2", "3"]
        setTranslatedLanguage(data.tour.destination)
        setUpdateTour(data.tour);
        setSelectedTypes(stringArray);
        setSelectedDate(new Date(data.tour.tourdate));
        setSelectedDateEnd(new Date(data.tour.tourdateEnd));
        setIsChanged(checkChanges(data.tour, updateTour));
        checkAllField(data.tour);
      } catch (error) {
        console.error("Error parsing tourtype:", error);
      }
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isSuccess) {
      setIsChanged(checkChanges(updateTour, data?.tour));
      checkAllField(updateTour);
    }
  }, [updateTour]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const sanitizedValue = DOMPurify.sanitize(value); // Sanitize the value
    setUpdateTour((prevState) => {
      const newState = { ...prevState, [name]: sanitizedValue };

      setIsChanged(checkTextChanges(newState, data.tour));

      return newState;
    });
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (selectedDateEnd) {
      if (data < selectedDateEnd)
        setSelectedDateEnd(date); 
      }
// Update selectedDate state with the selected date
    setUpdateTour((prevState) => ({
      ...prevState,
      tourdate: date || new Date(),
      tourdateEnd: date || new Date(),
    })); // Update tourdate property in the tour state with the selected date

    if (date && selectedDateEnd) {
      if (new Date(date) >= new Date(selectedDateEnd)) {
        setSelectedDateEnd(date);
      }
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
      console.log("Something went wrong");
      return false;
    }
  };

  const handleDateEndChange = (date: Date | null) => {
    setUpdateTour((prevState) => {
      const newState = {
        ...prevState,
        tourdateEnd: date || new Date(),
      };

      const selectedMonth = selectedDate?.getMonth();
      const selectedYear = selectedDate?.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      if (selectedYear&& selectedMonth) {
      if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth )) {


        setSelectedDate(date);
      }
    }
      setSelectedDateEnd(date);

      return newState;
    });
  };


  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    console.log(value);

    setSelectedTypes((prevSelectedTypes) => {
      let newSelectedTypes: string[];

      if (prevSelectedTypes.includes(value)) {
        newSelectedTypes = prevSelectedTypes.filter((type) => type !== value);
      } else {
        newSelectedTypes = [...prevSelectedTypes, value];
      }

      setUpdateTour((prevState) => ({
        ...prevState,
        tourtype: newSelectedTypes,
      }));

      return newSelectedTypes;
    });
  };

  const updateTourFunction = async (tour: any) => {

    console.log(tour)
    try {
      const response = await fetchData(url, "PUT", tour);

      if (!response.ok) {
        setBackendError("Chyba při získaní dat");
        return null;
      }

      backendError && setBackendError(null);

      return response.json();
    } catch (err) {
      setBackendError("Chyba při získaní dat");
      return null;
    }
  };
  const createTourMutation = useMutation({
    mutationFn: updateTourFunction,

    onSuccess: () => {
      setBackendError(null);
      setTour(initialToureState);
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.invalidateQueries({ queryKey: ["yourtour"] });
      queryClient.invalidateQueries({ queryKey: ["yourtours"] });
      showSuccessToast("Spoluceta byla úspěšně uložena");
      navigate("/yourtours"); // Adjust this to your desired route after success
    },
    onError: (err) => {
      setBackendError("Něco se pokazilo, tour nebyla vytvořena");
      showErrorToast("Chyba při ukládání spolucesty");
    },
  });

  const onSubmitFunction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTour = {
      ...updateTour,
      tourtype: selectedTypes,
      user_id: user?.id,
    };

    const hasCompleted =
      !newTour.destination ||
      newTour.tourtype.length === 0 ||
      !newTour.fellowtraveler ||
      !newTour.aboutme ||
      !selectedDate;
    if (hasCompleted) {
      setErrors("Nejsou vyplněna všechna pole");
    }

    // Ensure that you're passing both the tour and user_id if needed
    createTourMutation.mutate({ tour: newTour, user_id: tour.user_id });
    queryClient.invalidateQueries({ queryKey: ["tours"] });
  };


  const currentDate = new Date();
 
 
  // Function to check if a date is in the past
  const isDateInPast = (date: Date | null): boolean => {
    if (!date) return false; // Null or invalid date is treated as not in the past
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
  
    return selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth);
  };

  useEffect(() => {
    if (isDateInPast(selectedDate) || isDateInPast(selectedDateEnd)) {
      setDateInPast(true);
    } else {
      setDateInPast(false);
    }
  }, [selectedDate, selectedDateEnd]);
  


  useEffect(()=>{
    if (data?.tour)  {

    if (language === 'cz') {
        setTranslatedLanguage(data.tour?.destination)
     }

    if (language === 'en'){
      countryTranslationsEn.map(country=>{
        if (country.cz === data.tour?.destination ) {
          setTranslatedLanguage(country.en);
        }
      })
    }
    if (language === 'es'){
      countryTranslationsEn.map(country=>{
        if (country.cz === data.tour?.destination ) {
          setTranslatedLanguage(country.en);
        }
      })
    }
  }

  },[language])

  if (isLoading) {
    return <span>  {tourConstants.waitplease[language] }</span>;
  }

  if (isError) {
    return <span>  {tourConstants.somethingWentWrong[language] }</span>;
  }


  


  return (
    <div className="text-black dark:text-white">
      <div className="flex justify-end p-4">
        <Button
          color="gray" // Set to gray to correspond with your styling
          className="gray hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-md"
          type="button" // Button type set to button
          onClick={() => navigate("../yourtours")}
        >
          {tourConstants.backToYourTours[language] }
        </Button>
      </div>

      <div>
        <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 uppercase ">
  {tourConstants.updateYourTour[language]}
</h1>

          <div>
            <form onSubmit={onSubmitFunction}>
              <div className="mb-4">
                <div className="flex flex-col ">
                  <h1 className="block text-xl font-bold mb-2 leading-tight">
                  {tourConstants.destination[language] } {translatedLanguage}
                  </h1>
                  <span className="text-xs dark:text-blue-400 text-blue-600 leading-tight ">
                  {tourConstants.cannotChangeDestination[language] }{" "}
                  </span>
                </div>
                <div className="relative w-full px-2"></div>
              </div>

              <div className="flex gap-4 items-center mt-4">
                <label className="block text-sm font-bold " htmlFor="date">
                {tourConstants.tourBeginning[language] }
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  minDate={new Date()}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />

                {selectedDate && (
                  <>
                    <label
                      className="block text-sm font-bold "
                      htmlFor="dateend"
                    >
                  {tourConstants.until[language] }
                    </label>
                    <DatePicker
                      selected={selectedDateEnd}
                      onChange={handleDateEndChange}
                      dateFormat="MM/yyyy"
                      minDate={selectedDate < currentDate ? currentDate : selectedDate}
                      showMonthYearPicker
                      filterDate={filterPastMonths}
                      className={` shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    />{" "}
                  </>
                )}
            {  dateInPast && 
   <div className='flex justify-center items-center p-2 rounded-full bg-red-600 text-white text-sm font-bold'  >
                {tourConstants.dateInPast[language] }
              </div>
}
                
              </div>
              {/*  checkboxes */}

              <div className="mb-4 text-sm mt-4	">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="journey-type"
                >
                     {tourConstants.tourType[language] }
                </label>
                <div className="flex flex-wrap gap-3">
                  {typeOfTourObject.map((type, index) => {
                    const typeKey = Object.keys(type)[0]; // Get the key (e.g., '1' or '2')
                    const typeName = type[parseInt(typeKey)]; // Get the object with language translations

                    return (
                      index % 2 === 0 && ( // Optionally keep this condition for rendering only even index items
                        <div
                          key={index}
                          className="mb-2 flex items-center w-[180px]"
                        >
                          <input
                            className="mr-2 hidden"
                            id={`journey-type-${index}`}
                            type="checkbox"
                            value={typeKey} // Use typeKey as the value of the checkbox
                            // Make the checkbox checked only if the value is in selectedTypes
                            checked={selectedTypes.includes(typeKey)}
                            onChange={handleCheckboxChange}
                          />
                          <label
                            htmlFor={`journey-type-${index}`}
                            className="relative flex cursor-pointer"
                          >
                            <div className="w-6 h-6 border border-gray-300 rounded-md flex items-center justify-center bg-white mr-2">
                              {/* Show a checkmark if the type is selected */}
                              {selectedTypes.includes(typeKey) && (
                                <svg
                                  className="w-4 h-4 text-red-900"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="5"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            {/* Render the translated value based on the selected language */}
                            {typeName[language]}
                          </label>
                        </div>
                      )
                    );
                  })}

                  {typeOfTourObject.map((type, index) => {
                    const typeKey = Object.keys(type)[0]; // Get the key (e.g., '1' or '2')
                    const typeName = type[parseInt(typeKey)]; // Get the object with language translations

                    return (
                      index % 2 !== 0 && ( // Optionally keep this condition for rendering only even index items
                        <div
                          key={index}
                          className="mb-2 flex items-center w-[180px]"
                        >
                          <input
                            className="mr-2 hidden"
                            id={`journey-type-${index}`}
                            type="checkbox"
                            value={typeKey} // Use typeKey as the value of the checkbox
                            // Make the checkbox checked only if the value is in selectedTypes
                            checked={selectedTypes.includes(typeKey)}
                            onChange={handleCheckboxChange}
                          />
                          <label
                            htmlFor={`journey-type-${index}`}
                            className="relative flex cursor-pointer"
                          >
                            <div className="w-6 h-6 border border-gray-300 rounded-md flex items-center justify-center bg-white mr-2">
                              {/* Show a checkmark if the type is selected */}
                              {selectedTypes.includes(typeKey) && (
                                <svg
                                  className="w-4 h-4 text-red-900"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="5"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            {/* Render the translated value based on the selected language */}
                            {typeName[language]}
                          </label>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="looking-for"
                >
                   {tourConstants.whoLookFor[language] }
                </label>
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
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="about-you"
                >
                  {tourConstants.aboutMe[language] }
                </label>
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
              <div className="text-lightError pb-4 text-xl ">
                {errors ? errors : ""}
              </div>
              <div className="flex gap-4">
                <Button
                  color={isChanged && allowSubmitButton ? "blue" : "blue"} // Use 'blue' for both states; styling is managed through className
                  className={`min-w-[150px] py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    isChanged && allowSubmitButton
                      ? "hover:bg-blue-700 cursor-pointer"
                      : "opacity-30 cursor-default pointer-events-none"
                  }`}
                  type="submit"
                >
                    {tourConstants.update[language] }
                </Button>

                <Button
                  color="gray" // Set color to gray for the back button
                  className="min-w-[150px] py-2 px-4 rounded focus:outline-none focus:shadow-outline bg-gray-500 text-white hover:bg-gray-700 cursor-pointer"
                  type="button"
                  onClick={() => navigate("../yourtours")}
                >
                 {tourConstants.back[language] }
                </Button>
              </div>
            </form>
            {!isChanged ? (
              <span className="dark:text-blue-400 text-blue-600">
                    {tourConstants.noChangeMade[language] }
              </span>
            ) : (
              ""
            )}
            {!allowSubmitButton ? (
              <span className="dark:text-red-300 text-red-600 ">
                  {tourConstants.allFieldsRequired[language] }              </span>
            ) : (
              ""
            )}
            {backendError ? (
              <p className="dark:text-red-300 text-red-600">{backendError}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateTour;
