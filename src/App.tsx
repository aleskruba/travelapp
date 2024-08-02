
import './App.css';
import {Routes,Route} from "react-router-dom";
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

function App() {

  const { theme,modal } = useThemeContext();

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
            <Route path="/profil" element={<Profil />}/> 
            <Route path="/traveltips" element={<TravelTips />}/> 
            <Route path="/traveltips/:id" element={<TravelTips />}/> 

            <Route path="/test" element={<Test />}/> 
         
        </Route>
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
