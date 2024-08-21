import React, { useEffect,useState } from 'react';
import { useNavigate,Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';
import Home from '../pages/Home';


const ProtectedRoutes = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(()=>{
    
  },[user])

  return user ? <Outlet/> : <Home/>;
};

export default ProtectedRoutes;