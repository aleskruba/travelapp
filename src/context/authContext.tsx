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

  useEffect(() => {
    const getUserData = async () => {
      setIsLoading(true);
      const userData = await fetchUserData();
      setUser(userData);
      setUpdateUser(userData);
      setIsLoading(false);
    };

    getUserData();
  }, []);

  useEffect(() => {
    if (backendServerError) {
      console.error('Error fetching user data');
    }
  }, [backendServerError]);

/*   function checkCookiesBlocked() {
    // Attempt a test fetch with credentials (cookies)
    fetch(`${BASE_URL}/api/test`, {
        method: 'GET',
        credentials: 'include', // Ensure cookies are included in the request
    })
    .then(response => {
        if (response.ok) {
            return response.json().then(data => {
                if (data.message === 'Cookies are enabled.') {
                    console.log('Cookies are enabled.');
                } else {
                    alert('Cookies might be blocked or a CORS issue occurred.');
                }
            });
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error);
        alert('Cookies are blocked or a CORS error occurred. Please enable third-party cookies.');
    });
}

useEffect(() => {
  checkCookiesBlocked() 
},[]) */

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

