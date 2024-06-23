import { useThemeContext } from '../context/themeContext';
import { FaRegSun } from "react-icons/fa";
import { FaMoon } from "react-icons/fa";

function ThemeComponent() {
    const { theme, setTheme} = useThemeContext();
    const themeOptions = ['light' , 'dark'];

    return (
    <div> 
      <button
          key={theme}
          onClick={() => setTheme(theme === themeOptions[0] ? 'dark' : 'light')}
          className={`flex items-center justify-center h-8 rounded-full hover:text-sky600 `}
        >
          
          {theme === 'light' ? <FaMoon /> : <FaRegSun />}
        </button>
</div>
  
)
}

export default ThemeComponent