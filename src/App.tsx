
import './App.css';
import {Routes,Route} from "react-router-dom";
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { useThemeContext } from './context/themeContext';
import Footer from './components/Footer';

function App() {

  const { theme } = useThemeContext();

  return (
    <div className={`relative ${theme === 'dark' ? 'bg-darkBackground text-white' : 'bg-lightBackground text-black'}`}>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Layout />} >
            <Route index element={<Home />}/> 
         
        </Route>
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
