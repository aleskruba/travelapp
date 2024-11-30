import React from 'react'
import { contactUsConstants } from '../constants/constantsHome'
import { useLanguageContext } from '../context/languageContext';


function Contact() {
    const { language} = useLanguageContext();

  return (
    <div className='px-10 pt-12 pb-12 text-xl text-justify'>
             <div
        dangerouslySetInnerHTML={{ __html: contactUsConstants[language] }}
      />

    </div>
  )
}

export default Contact