import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If you prefer same-origin calls during dev, you can proxy /api to your backend:
//
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:8080",
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });

export default defineConfig({
  plugins: [react()],
});
