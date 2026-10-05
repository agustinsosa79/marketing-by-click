import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { blogPlugin } from './vite-plugin-blog.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [blogPlugin(), react(), tailwindcss()],
})
