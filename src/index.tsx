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

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter >
    <GoogleOAuthProvider clientId="85802491961-b7t13blg4rkgqbira2i00fni49cg8rmm.apps.googleusercontent.com">
      <ThemeProvider>
          <Routes>
              <Route path="/*" element={<App/>} />
          </Routes>
          <ToastContainer 
                /> 
      </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);


