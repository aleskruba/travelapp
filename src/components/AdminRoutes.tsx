import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';

function AdminRoutes() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      // Navigate back to the previous page
/*       navigate(-1);
 */      // Redirect to login after navigating back
      navigate('/');
    }
  }, [user, navigate]);

  return user ? <Outlet /> : null;  // Render Outlet if user exists, otherwise nothing since useEffect will handle navigation
};

export default AdminRoutes