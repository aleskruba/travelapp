import React, { createContext, useState, ReactNode, useContext, Dispatch, SetStateAction, useEffect } from 'react';
import { ChosenCountryData } from '../types';


type ChosenCountry = string;

interface CountryContextProps {
  chosenCountry: ChosenCountry;
  setChosenCountry: Dispatch<SetStateAction<ChosenCountry>>;
  chosenCountryTranslated: string;
  setChosenCountryTranslated: Dispatch<SetStateAction<string>>;
  chosenCountryData: ChosenCountryData | null; // Adjusted to accept null
  setChosenCountryData: Dispatch<SetStateAction<ChosenCountryData | null>>;
}

export const CountryContext = createContext<CountryContextProps>({
  chosenCountry: '',
  setChosenCountry: () => {},
  chosenCountryTranslated: '',
  setChosenCountryTranslated: () => {},
  chosenCountryData: {
    name: '',
    population: '',
    currency: '',
    language: '',
    capital: '',
    area: '',
    continent: '',
    flag: '',
  },
  setChosenCountryData: () => {},
});

interface CountryProviderProps {
  children: ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ children }) => {

  let storedCountry: string = localStorage.getItem('traveltipsCountry') || 'Česká republika';

  const [chosenCountry, setChosenCountry] = useState<ChosenCountry>(storedCountry);
  const [chosenCountryTranslated, setChosenCountryTranslated] = useState<string>('');
  const [chosenCountryData, setChosenCountryData] = useState<ChosenCountryData | null>({
    name: '',
    population: '',
    currency: '',
    language: '',
    capital: '',
    area: '',
    continent: '',
    flag: '',
  });

  useEffect(() => {
    if (chosenCountry) {
      localStorage.setItem('traveltipsCountry', chosenCountry);
    }
  }, [chosenCountry]);

  return (
    <CountryContext.Provider
      value={{
        chosenCountry,
        setChosenCountry,
        chosenCountryData,
        setChosenCountryData,
        chosenCountryTranslated,
        setChosenCountryTranslated,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export function useCountryContext() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountryContext must be used within a CountryProvider');
  }
  return context;
}
