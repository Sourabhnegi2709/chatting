/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chat: {
          'sidebar-bg': '#F0F2F5', // Light grey sidebar
          'sidebar-active': '#EBEBEC', // Sidebar active contact
          'window-bg': '#E5DDD5',   // Classic chat window background
          'header-bg': '#F0F2F5',    // Chat window header
          'bubble-sent': '#DCF8C6',  // Standard sent bubble color
          'bubble-rec': '#FFFFFF',   // Standard received bubble color
        }
      }
    },
  },
  plugins: [],
}