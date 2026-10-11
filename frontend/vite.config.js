import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "ShelfLife",
        short_name: "ShelfLife",
        description: "Track your groceries and reduce food waste!",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display_override: ["fullscreen", "standalone"],
        display: "fullscreen",
        start_url: "/", 
        id: "/",   
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globIgnores: ['**/*.wasm', '**/classifier.worker-*.js'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.includes('huggingface.co'),
            handler: 'CacheFirst',
            options: { 
              cacheName: 'hf-models-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            // local ONNX runtime wasm + worker - caches on first use
            urlPattern: ({ url }) =>
              url.pathname.endsWith('.wasm') || /classifier\.worker.*\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'onnx-runtime-local',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: { exclude: ['@huggingface/transformers'] },
  server: {
    allowedHosts: ['dosage-matchless-suspend.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://backend:8000',
        changeOrigin: true,
      },
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless', 
    },
    host: true,

  }
});