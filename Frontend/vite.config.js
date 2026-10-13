import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; 
import fs from 'fs';

// Los certificados SSL solo existen en local; si no estan, no se usa HTTPS
let https;
try {
  https = {
    key: fs.readFileSync('certs/private.key'),
    cert: fs.readFileSync('certs/certificate.crt'),
  };
} catch {
  https = undefined;
}

export default defineConfig({
  plugins: [react()], 
  server: {
    host: `localhost`,
    port: 5173,
    https,
    proxy: {
      "/api": {
        target: "https://ahorrapp-react-pkj9.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});