import React, { createContext, useState, ReactNode, useContext } from 'react';




interface TourContextProps {
    yourToursLength :number | null; 
    setYourToursLength : React.Dispatch<React.SetStateAction<number | null>>;

}

export const TourContext = createContext<TourContextProps>({
  yourToursLength: null,
  setYourToursLength: () => {},

});

interface TourProviderProps {
  children: ReactNode;
}




export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {


  const [yourToursLength, setYourToursLength] = useState<number | null>(null);



  return (
    <TourContext.Provider value={{ yourToursLength, setYourToursLength }}>
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
