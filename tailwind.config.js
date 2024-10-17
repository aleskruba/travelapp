/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        darkBackground: "#1f2937",
        lightBackground: "#f3f4f6",
        Submit: {
          DEFAULT: '#1e3a8a',  // bg-blue-800
          hover: '#1d4ed8',    // hover:bg-blue-700
        },
        Cancel: {
          DEFAULT: '#374151',  // bg-gray-800
          hover: '#4b5563',    // hover:bg-gray-700
        },
        Delete: {
          DEFAULT: '#991b1b',  // bg-red-800
          hover: '#b91c1c',    // hover:bg-red-700
        },
      },
      backgroundImage: {
        shinyDarkBackground: "linear-gradient(180.2deg, rgb(120, 85, 137) -6.9%, rgb(35, 9, 31) 76.7%)",
        shinyLightBackground:"linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)"
      },
      borderWidth: {
        '1.5': '1.5px',  // Adds a custom 1.5px border
      },
      height: {
        '9.5': '2.375rem',  // Adds a custom 9.5 height (2.375rem = 9.5/4rem)
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
    },
  },
  plugins: [],
}
