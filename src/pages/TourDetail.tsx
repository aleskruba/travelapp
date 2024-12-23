import  { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { useThemeContext } from "../context/themeContext";
import { BASE_URL } from "../constants/config";
import { fetchData } from "../hooks/useFetchData";
import moment from "moment";
import { countriesData } from "../constants/constantsData";
import TourMessages from "../components/tours/TourMessages";
import Button from "../components/customButton/Button";
import { travelTipsConstants } from '../constants/constantsTravelTips';
import { tourConstants } from '../constants/constantsTours';
import { useLanguageContext } from '../context/languageContext';
import { typeOfTourObject ,countryNames,countryNamesEs,countryNamesEn} from "../constants/constantsData";


function TourDetail() {
  const [backendError, setBackendError] = useState<string | null>(null);
  let { id } = useParams<string>();
  const { toggleModal } = useThemeContext();
  const { language} = useLanguageContext();
  const url = `${BASE_URL}/tour/${id}`;

  const navigate = useNavigate();
  let { state } = useLocation();

  const [updatedUrl, setUpdatedUrl] = useState<string>();

  useEffect(() => {
    if (state) {
      let url = new URL(state.some);
      // Combine "../" with the pathname and search part
      let updatedStr = ".." + url.pathname + url.search;
      setUpdatedUrl(updatedStr);
    }
  }, []);

  const fetchTour = async () => {
    try {
      const response = await fetchData(url, "GET");

      return response.json();
    } catch (err: any) {
      console.error(err);
      setBackendError(err ? err.message : travelTipsConstants.somethingWentWrong[language]);
    }
  };
  const { data, isSuccess, isFetching, isError } = useQuery({
    queryFn: () => fetchTour(),
    queryKey: ["tour"],
/*     retry: 2,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 100000, */
  });

  const [flag, setFlag] = useState("");
/*   const convert = JSON.parse(data?.tour.tourtype )
 */
  useEffect(() => {
    if (isSuccess) {
      const foundCountry = countriesData.find(
        (country) => country.name === data.tour.destination
      );
      if (foundCountry) {
        setFlag(foundCountry.flag);
      }
    }
  }, [isSuccess, countriesData, data?.tour.destination]);

  // This will log the flag every time it changes
  useEffect(() => {}, [flag]);

  const monthsToTranslate = {
    cz: [
      "leden",
      "únor",
      "březen",
      "duben",
      "květen",
      "červen",
      "červenec",
      "srpen",
      "září",
      "říjen",
      "listopad",
      "prosinec",
    ],
    en: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    es: [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ]
  };
  
  
  const formatTourDate = (startDate: any, endDate: any) => {
    const start = moment(startDate);
    const end = moment(endDate);

    const startMonthName = monthsToTranslate[language][start.month()];
    const endMonthName = monthsToTranslate[language][end.month()];

    const year = start.year();

    if (start.isSame(end, "month")) {
      return `${year} ${startMonthName}`;
    } else {
      return `${year} ${startMonthName} - ${endMonthName}`;
    }
  };

  if (isError) {
    return <span>{travelTipsConstants.somethingWentWrong[language]}</span>;
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span>{travelTipsConstants.momentPlease[language]}</span>
      </div>
    );
  }


  

  const destinationIndex = typeof data?.tour?.destination === 'string' ? countryNames.indexOf(data?.tour.destination) : -1;
  

  return (
    <div className="h-full md:px-20 dark:text-gray-300 text-gray-900 bg-gradient-to-b from-gray-200  via-gray-100 via-30%  to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:via-30%  dark:to-gray-900  ">
      <div className="flex justify-end pt-4">
        <Button onClick={() => navigate(`${updatedUrl}`)} color="gray">
        {tourConstants.backToList[language]}
        </Button>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <div className="text-2xl font-thin text-center">
        {tourConstants.joinTrip[language]}{" "}
          <span className="font-medium	dark:text-yellow-300 text-yellow-600">
          {language === 'cz' && data.tour.destination}
        {language === 'en' && destinationIndex !== -1 && countryNamesEn[destinationIndex]}
        {language === 'es' && destinationIndex !== -1 && countryNamesEs[destinationIndex]}
          </span>
        </div>
        <div>
          <img src={flag} alt="flag" className="w-16 h-auto rounded-sm" />
        </div>
      </div>
      <div className="flex justify-center ">
        <div className="bg-inherit p-8 w-full flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-14 h-14 hover:scale-110 transition-all 1s "
                onClick={() => toggleModal(data.tour.user.image)}
              >
                <img
                  src={data.tour.user.image}
                  alt="profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="text-xl">{data.tour.user.firstName}</div>
            </div>
            <div>
              <h1 className="font-thin md:text-base text-xs">
              {tourConstants.added[language]}{" "}
                <span>{moment(data.tour.date).format("MM.DD YYYY")}</span>
              </h1>
            </div>
          </div>
          <div>
            <h1 className="flex gap-2 font-bold text-lg ">
            {tourConstants.date[language]}{" "}
              {" "}
              <span className="font-medium	dark:text-yellow-300 text-yellow-600">
                {" "}
                {formatTourDate(data.tour.tourdate, data.tour.tourdateEnd)}{" "}
              </span>
            </h1>
          </div>

          <div className="flex gap-2 flex-col md:flex-row md:items-center font-bold text-lg">
            {" "}
            {tourConstants.tourType[language]}
            {typeOfTourObject.map((t: any, idx: number) => {
       
                const key = Object.keys(t)[0];  // Extract the key (e.g., `1` or `2`)
            
                const tourType = t[key];        // Access the translations object
  
  // Check if any value in `convert` array matches the current `key`
  if (JSON.parse(data?.tour.tourtype).includes((key))) {
    const translatedText = tourType ? tourType[language] || 'Unknown' : 'Unknown';
  
    return (
      <span key={idx} className="text-xs font-thin italic pl-4 md:pl-0">
        {translatedText} {" "}
      
      </span>
    );
  }

  // If `convert` does not match, return nothing or you can add a fallback
  return null; // or you could return a default value if needed
})}


          </div>

          <div className="pt-4 flex flex-col">
            <div className="font-bold text-lg"> {tourConstants.aboutMe[language]}</div>
            <div className="text-justify pl-4">{data.tour.aboutme}</div>
          </div>
          <div className="pt-4 flex flex-col">
            <div className="font-bold text-lg">         {tourConstants.travelWith[language]}</div>
            <div className="text-justify pl-4"> {data.tour.fellowtraveler}</div>
          </div>
        </div>
      </div>
      {backendError && <div>{backendError} </div>}
         
      <TourMessages tourID={data.tour.id}/>
          
    </div>
  );
}

export default TourDetail;
