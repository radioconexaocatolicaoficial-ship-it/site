import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { newsCardsApiPlugin } from "./vite-plugins/newsCardsApi";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function proxyImageRequest(
  req: { url?: string },
  res: {
    statusCode: number;
    setHeader: (k: string, v: string) => void;
    end: (b?: string | Buffer) => void;
  },
  referer: string,
) {
  try {
    const u = new URL(req.url || "", "http://localhost");
    const target = u.searchParams.get("u");
    if (!target || !/^https?:\/\//i.test(target)) {
      res.statusCode = 400;
      res.end("missing u");
      return;
    }
    const upstream = await fetch(target, {
      headers: {
        "User-Agent": UA,
        Referer: (() => {
          try {
            return new URL(target).origin + "/";
          } catch {
            return referer;
          }
        })(),
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!upstream.ok || !upstream.body) {
      res.statusCode = upstream.status || 502;
      res.end("upstream error");
      return;
    }
    const ct = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=3600");
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch {
    res.statusCode = 502;
    res.end("proxy failed");
  }
}

function attachLocalApi(server: {
  middlewares: {
    use: (
      path: string,
      fn: (
        req: { url?: string },
        res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string | Buffer) => void },
      ) => Promise<void>,
    ) => void;
  };
}) {
  server.middlewares.use("/api/ig-img", async (req, res) => {
    await proxyImageRequest(req, res, "https://www.instagram.com/");
  });

  server.middlewares.use("/api/img", async (req, res) => {
    await proxyImageRequest(req, res, "https://www.google.com/");
  });

  server.middlewares.use("/api/rss", async (req, res) => {
    try {
      const u = new URL(req.url || "", "http://localhost");
      const target = u.searchParams.get("u");
      if (!target || !/^https?:\/\//i.test(target)) {
        res.statusCode = 400;
        res.end("missing u");
        return;
      }
      const upstream = await fetch(target, {
        headers: {
          "User-Agent": UA,
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!upstream.ok) {
        res.statusCode = upstream.status || 502;
        res.end("upstream error");
        return;
      }
      const text = await upstream.text();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=120");
      res.end(text);
    } catch {
      res.statusCode = 502;
      res.end("proxy failed");
    }
  });

  server.middlewares.use("/api/html", async (req, res) => {
    try {
      const u = new URL(req.url || "", "http://localhost");
      const target = u.searchParams.get("u");
      if (!target || !/^https?:\/\//i.test(target)) {
        res.statusCode = 400;
        res.end("missing u");
        return;
      }
      const upstream = await fetch(target, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!upstream.ok) {
        res.statusCode = upstream.status || 502;
        res.end("upstream error");
        return;
      }
      const text = await upstream.text();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=60");
      res.end(text);
    } catch {
      res.statusCode = 502;
      res.end("proxy failed");
    }
  });
}

function localApiProxyPlugin(): Plugin {
  return {
    name: "local-api-proxy",
    configureServer(server) {
      attachLocalApi(server);
    },
    configurePreviewServer(server) {
      attachLocalApi(server);
    },
  };
}

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
      "/api/yt-padreph": {
        target: "https://www.youtube.com",
        changeOrigin: true,
        rewrite: () => "/feeds/videos.xml?channel_id=UC1F-NuywrrTYVUq370yR9WQ",
        headers: { "User-Agent": UA },
      },
    },
  },
  plugins: [react(), localApiProxyPlugin(), newsCardsApiPlugin()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
