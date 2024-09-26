
import './App.css';
import {Routes,Route,useLocation } from "react-router-dom";
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { useThemeContext } from './context/themeContext';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgottenPassword from './pages/ForgottenPassword';
import Test from './pages/Test';
import ResetPassword from './pages/ResetPassword';
import Profil from './pages/Profil';
import Modal from './components/Modal';
import ScrollToTop from './components/ScrollToTop';
import TravelTips from './pages/TravelTips';
import YourVlogs from './components/traveltips/YourVlogs';
import ProtectedRoutes from './components/ProtectedRoutes';
import Tours from './pages/Tours';
import CreateTour from './pages/CreateTour';
import YourTours from './pages/YourTours';
import UpdateTour from './pages/UpdateTour';

function App() {

  const { theme,modal } = useThemeContext();
  const location = useLocation();

  return (
    <div className={`relative ${theme === 'dark' ? 'bg-darkBackground text-white' : 'bg-lightBackground text-black'}`}>
{modal && <Modal/>}
      <Navbar/>
      <ScrollToTop />
      <Routes>
 
        <Route path="/" element={<Layout />} >
            <Route index element={<Home />}/> 
            <Route path="/login" element={<Login />}/> 
            <Route path="/register" element={<Register />}/> 
            <Route path="/forgottenpassword" element={<ForgottenPassword />}/> 
            <Route path="/resetpassword" element={<ResetPassword />}/> 

            <Route path="/traveltips" element={<TravelTips />}/> 
            <Route path="/traveltips/:id" element={<TravelTips />}/> 
            <Route path="/tours" element={<Tours />}/> 
            
            
            <Route element={<ProtectedRoutes />}>
              <Route path="/profil" element={<Profil />}/> 
              <Route path="/createtour" element={<CreateTour />}/> 
              <Route path="/yourvlogs" element={<YourVlogs />}/> 
              <Route path="/yourtours" element={<YourTours />}/> 
              <Route path="/yourtours/:id" element={<UpdateTour />}/> 
              
            </Route>
            
            <Route path="/test" element={<Test />}/> 
         
        </Route>
      </Routes>
      {(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgottenpassword') && <Home />}
      <Footer/>
    </div>
  );
}

export default App;
