import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This should be the name of your GitHub repository.
  // It is case-sensitive.
  base: '/NeoFear/',
})