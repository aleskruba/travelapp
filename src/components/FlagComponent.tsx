import React, { useContext } from 'react';
import { CZ, GB, ES } from 'country-flag-icons/react/3x2';
import { useLanguageContext } from '../context/languageContext';
import { Language } from '../types';

function FlagDisplay() {
    const { setLanguage} = useLanguageContext();

  // Explicitly type the function to accept a string parameter
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <CZ
        title="Czech Republic"
        className="flag-icon cursor-pointer"
        onClick={() => handleLanguageChange('cz')}
      />
      <GB
        title="United Kingdom"
        className="flag-icon cursor-pointer"
        onClick={() => handleLanguageChange('en')}
      />
      <ES
        title="Spain"
        className="flag-icon cursor-pointer"
        onClick={() => handleLanguageChange('es')}
      />
    </div>
  );
}

export default FlagDisplay;
