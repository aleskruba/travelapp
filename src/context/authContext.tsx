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
        // Send a request to the server to set a cookie
        await fetch(`${BASE_URL}/test`, {
            method: 'GET',
            credentials: 'include', // Ensure cookies are sent and received
        });

        // Delay checking the cookie to give the browser time to process it
        await new Promise((resolve) => setTimeout(resolve, 500)); // 100ms delay

        // Check if the test cookie is stored in the browser
        const cookies = document.cookie;
        console.log('document.cookie',document.cookie)
        if (cookies.includes('sessionTest')) {
            // Cookie exists in the browser
            return { ok: true };
        } else {
            // Cookie was not stored (likely blocked by the browser)
            return { ok: false, error: 'Cookies are blocked or third-party cookies are disabled.' };
        }
    } catch (error) {
        console.error('Error during cookie check:', error);
        return { ok: false, error: 'An error occurred while testing cookies.' };
    }
};



useEffect(() => {
  const initializeApp = async () => {
      const response = await checkCookiesBlocked();

      if (response.ok) {
          // Cookies are enabled, proceed with fetching user data
          const getUserData = async () => {
              setIsLoading(true);
              const userData = await fetchUserData();
              setUser(userData);
              setUpdateUser(userData);
              setIsLoading(false);
          };
          getUserData();
      } else {
          // Cookies are blocked, alert the user
          alert(response.error);
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

