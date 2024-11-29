import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['emoji-picker-react'],
      output: {
        globals: {
          'emoji-picker-react': 'EmojiPicker'
        }
      }
    }
  }
})
