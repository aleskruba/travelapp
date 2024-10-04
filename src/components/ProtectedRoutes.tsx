import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';
import Login from '../pages/Login';

const ProtectedRoutes = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Navigate back to the previous page
/*       navigate(-1);
 */      // Redirect to login after navigating back
      navigate('/login');
    }
  }, [user, navigate]);

  return user ? <Outlet /> : null;  // Render Outlet if user exists, otherwise nothing since useEffect will handle navigation
};

export default ProtectedRoutes;
