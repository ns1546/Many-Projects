import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login-sliding.html'),
        register: resolve(__dirname, 'register.html'),
        owner: resolve(__dirname, 'owner-panel.html'),
        admin: resolve(__dirname, 'admin-panel.html'),
        customer: resolve(__dirname, 'customer-panel.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        findCars: resolve(__dirname, 'find-cars.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      },
      format: {
        comments: false // Remove comments
      }
    }
  },
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
