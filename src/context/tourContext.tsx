import React, { createContext, useState, ReactNode, useContext } from 'react';




interface TourContextProps {
  yourToursLength: number | null; 
  setYourToursLength: React.Dispatch<React.SetStateAction<number | null>>;
  isPrivate: number;
  setIsPrivate: React.Dispatch<React.SetStateAction<number>>;
  privateIdsArray: number[]; // Define as an array of numbers
  setPrivateIdsArray: React.Dispatch<React.SetStateAction<number[]>>; // Proper type for the setter
}

export const TourContext = createContext<TourContextProps>({
  yourToursLength: null,
  setYourToursLength: () => {},
  isPrivate: 0,
  setIsPrivate: () => {},
  privateIdsArray: [], // Provide an initial empty array
  setPrivateIdsArray: () => {},
});

interface TourProviderProps {
  children: ReactNode;
}




export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {


  const [yourToursLength, setYourToursLength] = useState<number | null>(null);

  const [isPrivate,setIsPrivate] = useState<number>(0)

  const [privateIdsArray, setPrivateIdsArray] = useState<number[]>([]);


  return (
    <TourContext.Provider value={{ yourToursLength, setYourToursLength,isPrivate,setIsPrivate,privateIdsArray, setPrivateIdsArray }}>
      {children}
    </TourContext.Provider>
  );
};

export function useTourContext() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTourContext must be used within a TourProvider");
  }
  return context;
}
