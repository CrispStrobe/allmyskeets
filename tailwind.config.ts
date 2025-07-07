// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Point to all files in the app, components, and lib directories inside src
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;