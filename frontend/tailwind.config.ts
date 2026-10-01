/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        amiriQuran: ["Amiri Quran", "serif"], // ✅ الاسم الصح + serif أفضل
      },
    },
  },
  plugins: [],
};
