/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans"],
      },
      colors: {
        color1: "#399CC9",
        color2: "#8715F9",
        color3: "#AE54FF",
        color4: "#8E1AFA",
        txtColor: "#F3F5F6",
        gray: {
          1: "#A9ABAE",
          2: "#BDBFC1",
          3: "#727376",
          4: "#606062",
        },
      },
    },
  },
  plugins: [],
};
