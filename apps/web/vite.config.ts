import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Sorted",
        short_name: "Sorted",
        description: "You do the work. We track the money.",
        theme_color: "#14532d",
        background_color: "#fafaf7",
        display: "standalone",
        start_url: "/",
        icons: [
          // TODO(M8): real icons. pwa-asset-generator makes these from one svg.
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    proxy: { "/api": "http://localhost:3001" },
  },
});
