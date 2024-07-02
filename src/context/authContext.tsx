import React, { createContext, useState, ReactNode, useContext, Dispatch, SetStateAction, useEffect } from 'react';
import { UserProps } from '../types';
import { BASE_URL,HTTP_CONFIG } from '../constants/config';
import axios from 'axios';

interface AuthContextProps {
  user: UserProps | null;
  setUser: Dispatch<SetStateAction<UserProps | null>>;
  updateUser: UserProps | null;
  setUpdateUser: Dispatch<SetStateAction<UserProps | null>>;
  isLoading: boolean;
  setBackendServerError: Dispatch<SetStateAction<boolean>>;
  backendServerError:boolean
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  updateUser: null,
  setUpdateUser: () => {},
  isLoading: true, 
  setBackendServerError: () => {},
  backendServerError:false
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const [updateUser, setUpdateUser] = useState<UserProps | null>(null);
  const [backendServerError,setBackendServerError] = useState(false)

/*   useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/`);
        if (!response.ok) {
          throw new Error('Server error');
        }
        setBackendServerError(false);
      } catch (error) {
        setBackendServerError(true);
      }
    };

    const intervalId = setInterval(checkServerStatus, 5000); // Check server status every 5 seconds

    return () => clearInterval(intervalId); // Cleanup the interval when the component unmounts
  }, []);
   */

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setBackendServerError(false);
        const url = `${BASE_URL}/checksession`;
        const response = await axios.get(url, { withCredentials: true });
        const responseData = response.data;
        setUser(responseData.user);
        setUpdateUser(responseData.user)
      } catch (err) {
        console.log('Error fetching user data:', err);
        
      } finally {
        setIsLoading(false); 
      }
    };

    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading,updateUser, setUpdateUser,backendServerError,setBackendServerError }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
