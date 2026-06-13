import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // host: true - מאזין על כל כתובות הרשת כדי שאפשר יהיה לגשת מהטלפון
    // דרך ה-WiFi הביתי (לדוגמה http://192.168.1.20:5173)
    host: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
