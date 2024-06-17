import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // build: {
  //   outDir: './frontend', // Make sure this path is correct relative to your frontend folder
  //   emptyOutDir: true,
  // },
});
