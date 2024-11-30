import React from 'react'
import { cookiesConstants } from '../constants/constantsHome'
import { useLanguageContext } from '../context/languageContext';
function Cookies() {
    const { language} = useLanguageContext();

  return (
    <div className='px-10 pt-12 pb-24 text-xl text-justify '>
             <div
        dangerouslySetInnerHTML={{ __html: cookiesConstants[language] }}
      />

    </div>
  )
}

export default Cookies