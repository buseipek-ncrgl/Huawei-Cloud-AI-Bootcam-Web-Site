// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff0000", // Örn: özel bir kırmızı
        },
      },
    },
  },
  plugins: [],
};
