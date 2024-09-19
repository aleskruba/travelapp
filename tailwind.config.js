/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ['./src/**/*.{js,jsx,ts,tsx}',],
  theme: {
    extend: {
      colors: {
        darkBackground: "#1f2937", 
        lightBackground: "#f3f4f6",
      
      
      },    
       borderWidth: {
        '1.5': '1.5px', // Adds a custom 1.5px border
      },
      height: {
        '9.5': '2.375rem', // Adds a custom 9.5 height (2.375rem = 9.5/4rem)
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        fadeOut: 'fadeOut 1.5s ease-in-out',
      },
    }
  },
  plugins: [],
}

