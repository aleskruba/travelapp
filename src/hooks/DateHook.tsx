import { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { dateConstants } from '../constants/constantsDate';
import { useLanguageContext } from '../context/languageContext';

const useRelativeDate = (date: Moment) => {
    const [relativeDate, setRelativeDate] = useState<any>('');
    const { language} = useLanguageContext();

  useEffect(() => {
    const currentDate = moment();
    const messageDate = moment(date);
    const diffMinutes = currentDate.diff(messageDate, 'minutes');
    const diffDays = currentDate.diff(messageDate, 'days');
    const diffMonths = currentDate.diff(messageDate, 'months');
    let displayText;

    if (diffMinutes < 1) {
      displayText = dateConstants.justNow[language];
    } else if (diffDays === 0) { // Check if it's today
      displayText = dateConstants.today[language];
    } else if (diffDays === 1) { // Check if it's yesterday
      displayText = dateConstants.yesterday[language];
    } else if (diffDays > 1) { // Check for other past days
      displayText = (language === 'cz' || language === 'es') 
      ? `${dateConstants.ago[language]} ${diffDays} ${dateConstants.days[language]}`
      : (language === 'en' 
          ? `${diffDays} ${dateConstants.days[language]} ${dateConstants.ago[language]}`
          : ''); // Add a fallback for other languages if needed
    

    } else if (diffMonths === 1) { // Check if it's one month ago
      displayText = dateConstants.monthAgo[language];
    } else if (diffMonths > 1) { // Check for other past months
      displayText = (language === 'cz' || language === 'es') 
      ? `${dateConstants.ago[language]} ${diffDays} ${dateConstants.months[language]}`
      : (language === 'en' 
          ? `${diffDays} ${dateConstants.months[language]} ${dateConstants.ago[language]}`
          : ''); // Add a fallback if necessary for other languages
    
    } else { // For dates in the future or more than a day ago
      displayText = moment(date).format('YY DD-MM HH:mm');
    }

    setRelativeDate(displayText);
  }, [date]);

  return relativeDate;
};

export default useRelativeDate;
