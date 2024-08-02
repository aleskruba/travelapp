import { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';

const useRelativeDate = (date: Moment) => {
    const [relativeDate, setRelativeDate] = useState<any>('');

  useEffect(() => {
    const currentDate = moment();
    const messageDate = moment(date);
    const diffMinutes = currentDate.diff(messageDate, 'minutes');
    const diffDays = currentDate.diff(messageDate, 'days');
    const diffMonths = currentDate.diff(messageDate, 'months');
    let displayText;

    if (diffMinutes < 1) {
      displayText = 'před chvílí';
    } else if (diffDays === 0) { // Check if it's today
      displayText = 'a dnes';
    } else if (diffDays === 1) { // Check if it's yesterday
      displayText = 'vcera';
    } else if (diffDays > 1) { // Check for other past days
      displayText = `pred ${diffDays} dny`;
    } else if (diffMonths === 1) { // Check if it's one month ago
      displayText = 'pred mesicem';
    } else if (diffMonths > 1) { // Check for other past months
      displayText = `pred ${diffMonths} mesici`;
    } else { // For dates in the future or more than a day ago
      displayText = moment(date).format('YY DD-MM HH:mm');
    }

    setRelativeDate(displayText);
  }, [date]);

  return relativeDate;
};

export default useRelativeDate;
