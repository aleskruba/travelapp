import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter,Routes,Route } from "react-router-dom";
import { ThemeProvider } from './context/themeContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(

  <BrowserRouter >
    <ThemeProvider>
        <Routes>
            <Route path="/*" element={<App/>} />
        </Routes>
    </ThemeProvider>
  </BrowserRouter>
);


