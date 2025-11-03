import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customred: '#f87957',
        customblue: '#3688fa',
        custombluedark:'#2c6f9c',
        paleblue: '#9cc9f5',
        bgheader: '#2d394b',
        customyellow: '#ffae1f',
        customgreen: '#26ba4f',
        customgreendark: '#1f8f3f',
        blacktboldtext: 'rgb(33, 37, 41)',
      },
      fontFamily: {
        admin: ['System-ui', 'sans-serif'],
        // sans: ['Graphik', 'sans-serif'],
        // serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
