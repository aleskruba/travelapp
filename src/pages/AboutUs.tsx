import React from 'react'
import { aboutUsConstants } from '../constants/constantsHome'
import { useLanguageContext } from '../context/languageContext';

function AboutUs() {
    const { language} = useLanguageContext();

  return (
    <div className='px-10 pt-12 pb-24 text-xl text-justify '>
             <div
        dangerouslySetInnerHTML={{ __html: aboutUsConstants[language] }}
      />

    </div>
  )
}

export default AboutUs