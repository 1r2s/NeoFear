import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    // IMPORTANT: Replace 'neo-fear' with your GitHub repository name.
    base: '/neo-fear/',
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})