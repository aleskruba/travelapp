import React, { createContext, useState, ReactNode, useContext, Dispatch, SetStateAction, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
import { UserProps } from '../types';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';


interface AuthContextProps {
  user: UserProps | null;
  setUser: Dispatch<SetStateAction<UserProps | null>>;
  updateUser: UserProps | null;
  setUpdateUser: Dispatch<SetStateAction<UserProps | null>>;
  isLoading: boolean;
  setBackendServerError: Dispatch<SetStateAction<boolean>>;
  backendServerError: boolean;

}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  updateUser: null,
  setUpdateUser: () => {},
  isLoading: true,
  setBackendServerError: () => {},
  backendServerError: false,

});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [updateUser, setUpdateUser] = useState<UserProps | null>(null);

  const [backendServerError, setBackendServerError] = useState(false);

  const fetchUserData = async (): Promise<UserProps | null> => {
    try {
      setBackendServerError(false);
      const url = `${BASE_URL}/checksession`;
    // const response = await axios.get(url, { withCredentials: true });
    // const responseData = response.data;

    const response = await fetch(url, {
      credentials: 'include', // Include cookies in the request
    });

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
      console.log('Error fetching user data:', err);
      throw err;
    }
  };

  const { status, data: userData, isLoading, isError } = useQuery<UserProps | null, Error>({
    queryKey: ["userkey"],
    queryFn: fetchUserData,
  });

  useEffect(() => {
    console.log('useEffect context runs')
    if (userData !== undefined) {
   // console.log(status)
      setUser(userData);
      setUpdateUser(userData);
      setBackendServerError(false);
    }
  }, [userData]);

  useEffect(() => {
    if (isError) {
      setBackendServerError(true);
      console.log('Error fetching user data');
    }
  }, [isError]);

  return (
    <AuthContext.Provider value={{ user,setUser, isLoading, updateUser, setUpdateUser, backendServerError, setBackendServerError }}>
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
