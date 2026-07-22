import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      // Feed Atom do YouTube sem CORS (só no `npm run dev`)
      "/api/yt-padreph": {
        target: "https://www.youtube.com",
        changeOrigin: true,
        rewrite: () => "/feeds/videos.xml?channel_id=UC1F-NuywrrTYVUq370yR9WQ",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
