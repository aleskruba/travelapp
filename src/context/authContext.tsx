import React, { createContext, useState, ReactNode, useContext, Dispatch, SetStateAction, useEffect } from 'react';
import { UserProps } from '../types';
import { BASE_URL, SOCKET_URL } from '../constants/config';
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
  isServerOn: boolean | null; // Add server status state
  setIsServerOn: Dispatch<SetStateAction<boolean | null>>
  isSocketServerOn: boolean | null; // Add server status state
  setIsSocketServerOn: Dispatch<SetStateAction<boolean | null>>
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
  const [isServerOn, setIsServerOn] = useState<null | boolean>(null);
  const [isSocketServerOn, setIsSocketServerOn] = useState<null | boolean>(null);

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
  


  // Function to check if the server is on
  const checkServer = async () => {
    try {
      const response = await fetchData(`${BASE_URL}/servertest`,  'GET' );

      if (!response.ok) {
        setIsServerOn(false);
        console.error('Server returned an error:', response.statusText);
      } else {
        const data = await response.json();
        if (data.status === 'success') {
          setIsServerOn(true);
          console.log('Server is On');
        } else {
          setIsServerOn(false);
          console.log('Server is Off');
        }
      }
    } catch (error) {
      setIsServerOn(false);
      console.error('Error checking server status:', error);
    }
  };


const checkSocketServer = async () => {
  try {
    const response = await fetch(`${SOCKET_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      setIsSocketServerOn(false);
      console.error('Socket Server returned an error:', response.statusText);
    } else {
      const data = await response.json();
      if (data.status === 'success') {
        setIsSocketServerOn(true);
        console.log('Socket server is On:', data.message);
      } else {
        setIsSocketServerOn(false);
        console.log('Socket server is Off');
      }
    }
  } catch (error) {
    setIsSocketServerOn(false);
    console.error('Error checking socket server status:', error);
  }
};

useEffect(()=>{
  checkSocketServer()
},[])

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
    // Step 1: Check server status first
    await checkServer();
    console.log('Checking server status');

    if (!isServerOn) {
      // If the server is offline, terminate further checks
      console.log('Server is offline. Skipping further checks.');
    /*   setShowModal(true);  */// Optionally show a modal indicating server is down
      return; // Exit early
    }

   console.log(isServerOn)
    // Step 2: Proceed only if the server is online
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

  // Step 3: Set up the interval to check cookies every 15 seconds only if the server is online
  if (isServerOn) {
    const intervalId = setInterval(() => {
      checkCookiesBlocked().then(response => {
        if (!response.ok) {
          setShowModal(true); // Show modal if cookies are blocked
        }
      });
    }, 15000);

    return () => {
      clearInterval(intervalId); // Clean up the interval when component unmounts
    };
  }
}, [isServerOn]); // This effect will now run whenever `isServerOn` changes

  



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
    <AuthContext.Provider value={{ user, setUser, updateUser, setUpdateUser, isLoading, backendServerError, setBackendServerError, handleConfirm, showModal,isServerOn,setIsServerOn, 
      setShowModal ,isSocketServerOn, setIsSocketServerOn }}>
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

