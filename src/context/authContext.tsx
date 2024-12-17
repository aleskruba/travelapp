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

  const fetchUserData = async (): Promise<UserProps | null> => {
    try {
      setBackendServerError(false);
      const response = await fetchData(`${BASE_URL}/checksession`,'GET')

      if (!response.ok) {
        return null;
      }
      const responseData = await response.json();
      if (responseData && responseData.user) {
        return responseData.user;
      } else {
        return null;
      }
    } catch (err) {
      setBackendServerError(true);
      console.error('Error fetching user data:', err);
      return null;
    }
  };


  const checkCookiesBlocked = async () => {
    try {
        const response = await fetch(`${BASE_URL}/test`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        });
        return response; // Return the response to the caller
    } catch (error) {
        console.error('Error during cookie test:', error);
        throw error; // Rethrow the error for the caller to handle
    }
};


useEffect(() => {
  const initializeApp = async () => {
      try {
          // First, check if cookies are blocked
          const response = await checkCookiesBlocked();
          if (response.ok) {
              // If cookies are enabled, fetch user data
              const getUserData = async () => {
                  setIsLoading(true);
                  const userData = await fetchUserData();
                  setUser(userData);
                  setUpdateUser(userData);
                  setIsLoading(false);
              };
              getUserData();
          } else {
              // Handle cookies blocked scenario
              alert('Cookies are blocked. Please enable third-party cookies to continue.');
          }
      } catch (error) {
          console.error('Error during initialization:', error);
          alert('An error occurred. Please check your browser settings.');
      }
  };

  initializeApp();
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



  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, setUpdateUser, isLoading, backendServerError, setBackendServerError }}>
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

