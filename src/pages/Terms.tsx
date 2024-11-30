import React from 'react'
import { termsConstants } from '../constants/constantsHome'
import { useLanguageContext } from '../context/languageContext';

function Terms() {
    const { language} = useLanguageContext();

  return (
    <div className='px-10 pt-12 pb-24 text-xl text-justify '>
             <div
        dangerouslySetInnerHTML={{ __html: termsConstants[language] }}
      />

    </div>
  )
}

export default Terms