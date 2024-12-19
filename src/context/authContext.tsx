import React, { createContext, useState, ReactNode, useContext, Dispatch, SetStateAction, useEffect } from 'react';
import { UserProps } from '../types';
import { BASE_URL } from '../constants/config';
import { fetchData } from '../hooks/useFetchData';


interface AuthContextProps {
  user: UserProps | null;
  setUser: Dispatch<SetStateAction<UserProps | null>>;
  updateUser: UserProps | null;
  setUpdateUser: Dispatch<SetStateAction<UserProps | null>>;
  isLoading: boolean;
  setBackendServerError: Dispatch<SetStateAction<boolean>>;
  backendServerError: boolean;
  showModal: boolean;  // Add modal visibility state
  setShowModal: Dispatch<SetStateAction<boolean>>;
  handleConfirm: () => Promise<void>; 
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProps | null >(null);
  const [updateUser, setUpdateUser] = useState<UserProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendServerError, setBackendServerError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchUserData = async (): Promise<UserProps | null> => {
    try {
      setBackendServerError(false);
      const response = await fetchData(`${BASE_URL}/checksession`, 'GET');
  
      if (!response.ok) {
        return null;
      }
      const responseData = await response.json();
      return responseData?.user || null;
    } catch (err) {
      setBackendServerError(true);
      console.error('Error fetching user data:', err);
      return null;
    }
  };
  
  const checkCookiesBlocked = async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      // Step 1: Set the cookie
      const setCookieResponse = await fetchData(`${BASE_URL}/setcookietest`, 'GET');
  
      if (!setCookieResponse.ok) {
        return { ok: false, error: 'Failed to set cookies.' };
      }
  
      // Step 2: Wait for a small delay to allow the cookie to be set properly (optional, adjust as needed)
      await new Promise((resolve) => setTimeout(resolve, 300)); // Delay of 300ms to allow cookie setting
  
      // Step 3: Check if the cookie is blocked
      const getCookieResponse = await fetchData(`${BASE_URL}/getcookietest`, 'GET');
  
      if (!getCookieResponse.ok) {
        return { ok: false, error: 'Failed to validate cookies.' };
      }
  
      const responseData = await getCookieResponse.json();

  
      if (responseData.status === 'blocked') {
        return { ok: false, error: 'Third-party cookies are blocked in your browser.' };
      }
  
      return { ok: true };
    } catch (error) {
      console.error('Error while checking cookies:', error);
      return { ok: false, error: 'An error occurred while checking cookies.' };
    }
  };
  
  useEffect(() => {
    const initializeApp = async () => {
      const response = await checkCookiesBlocked();
      if (response.ok) {
        // Cookies are enabled, proceed with fetching user data
        setShowModal(false);
        setIsLoading(true);
        const userData = await fetchUserData();
        setUser(userData);
        setUpdateUser(userData);
        setIsLoading(false);
      } else {
        setShowModal(true);
        console.log(response.error);
      }
    };

    initializeApp();

    const intervalId = setInterval(() => {
      // Check every 15 seconds if cookies are blocked
      checkCookiesBlocked().then(response => {
        if (!response.ok) {
          setShowModal(true);
        }
      });
    }, 15000);

    return () => clearInterval(intervalId); // Clean up the interval when component unmounts
  }, []);
  
  



/*   useEffect(() => {
    const getUserData = async () => {
      setIsLoading(true);
      const userData = await fetchUserData();
      setUser(userData);
      setUpdateUser(userData);
      setIsLoading(false);
    };

    getUserData();
  }, []); */

  useEffect(() => {
    if (backendServerError) {
      console.error('Error fetching user data');
    }
  }, [backendServerError]);

  const handleConfirm = async () => {
    const response = await checkCookiesBlocked();
    console.log(response);

    if (response.ok) {
      // Cookies are enabled, fetch user data again
      setShowModal(false);
      setIsLoading(true);
      const userData = await fetchUserData();
      setUser(userData);
      setUpdateUser(userData);
      setIsLoading(false);
    } else {
      // If cookies are still blocked, log the error and keep the modal open
      console.log(response.error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, setUpdateUser, isLoading, backendServerError, setBackendServerError, handleConfirm, showModal, 
      setShowModal  }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

