import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  modal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  toggleModal: (imageUrl?: string) => void;
  image: string | null;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  setTheme: () => {},
  modal: false,
  setModal: () => {},
  toggleModal: () => {},
  image: null,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    return storedTheme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const [modal, setModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const element = document.documentElement;

  useEffect(() => {
    switch (theme) {
      case 'dark':
        element.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        break;
      case 'light':
        element.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        break;
      default:
        break;
    }
  }, [theme, element.classList]);

  useEffect(() => {
    const handleDeviceThemeChange = () => {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDarkMode ? 'dark' : 'light');
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleDeviceThemeChange);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleDeviceThemeChange);
    };
  }, []);

  const toggleModal = (imageUrl?: string) => {
    if (imageUrl !== undefined) {
      setImage(imageUrl);
    }
    setModal((prevModal) => !prevModal);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, modal, setModal, toggleModal, image }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
