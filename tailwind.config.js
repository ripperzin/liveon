/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          light: '#A29BFE',
          dark: '#4A3DB8',
        },
        secondary: {
          DEFAULT: '#00D2FF',
          light: '#74E4FF',
          dark: '#00A3CC',
        },
        accent: {
          gold: '#FDCB6E',
          coral: '#FF6B6B',
          green: '#00B894',
        },
        surface: {
          DEFAULT: '#1B2838',
          light: '#243447',
          dark: '#0D1B2A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B2BEC3',
          muted: '#636E72',
        },
      },
    },
  },
  plugins: [],
};
