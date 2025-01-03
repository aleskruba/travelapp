import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter,Routes,Route } from "react-router-dom";
import { ThemeProvider } from './context/themeContext';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AuthProvider } from './context/authContext';
import { CountryProvider } from './context/countryContext';
import { TourProvider } from './context/tourContext';
import { LanguageProvider } from './context/languageContext';

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter >
    <GoogleOAuthProvider clientId="85802491961-b7t13blg4rkgqbira2i00fni49cg8rmm.apps.googleusercontent.com">
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
          <TourProvider>
            <CountryProvider>
                <Routes>
                    <Route path="/*" element={<App/>} />
                </Routes>
              </CountryProvider>
              <ToastContainer /> 
            </TourProvider>
           </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);


