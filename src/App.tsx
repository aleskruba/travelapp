
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
import TourDetail from './pages/TourDetail';
import NotFound404 from './pages/NotFound404';
import AdminRoutes from './components/AdminRoutes';
import AdminPage from './pages/AdminPage';
import UserDetail from './components/admin/UserDetail';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';


function App() {

  const { theme,modal } = useThemeContext();
  const location = useLocation();

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-darkBackground text-white' : 'bg-lightBackground text-black'}`}>
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

            <Route path="/about" element={<AboutUs />}/> 
            <Route path="/contact" element={<Contact />}/> 
            <Route path="/terms" element={<Terms />}/> 
            <Route path="/privacy" element={<Privacy />}/> 
            <Route path="/cookies" element={<Cookies />}/> 
            
            
            <Route element={<ProtectedRoutes />}>
              <Route path="/profil" element={<Profil />}/> 
              <Route path="/createtour" element={<CreateTour />}/> 
              <Route path="/yourvlogs" element={<YourVlogs />}/> 
              <Route path="/yourtours" element={<YourTours />}/> 
              <Route path="/yourtours/:id" element={<UpdateTour />}/> 
              <Route path="/tours/:id" element={<TourDetail />}/> 
            </Route>

            <Route element={<AdminRoutes />}>
             <Route path="/admin" element={<AdminPage />}/> 
             <Route path="/admin/users/:id" element={<UserDetail />}/> 
            </Route>

            <Route path="/test" element={<Test />}/> 
            <Route path='*' element={<NotFound404 />} />
         
        </Route>
      </Routes>
      {(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgottenpassword') && <Home />}
      <Footer/>
    </div>
  );
}

export default App;
