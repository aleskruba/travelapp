import React from 'react'
import { privacyConstants } from '../constants/constantsHome'
import { useLanguageContext } from '../context/languageContext';

function Privacy() {
    const { language} = useLanguageContext();

  return (
    <div className='px-10 pt-12 pb-24 text-xl text-justify '>
             <div
        dangerouslySetInnerHTML={{ __html: privacyConstants[language] }}
      />

    </div>
  )
}

export default Privacy