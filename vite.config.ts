import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Arcana-Shadow-Profile/',
  plugins: [
    tailwindcss(),
  ],
})