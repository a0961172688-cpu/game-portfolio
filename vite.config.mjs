import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

const playableRoots = {
  "jian-deng": "B:/简历作品/缄灯：归渡/源文件/网站",
  "company-war": "B:/简历作品/公司战争/网站",
  sanxingdui: "B:/简历作品/三星堆展馆/网站",
  "water-park": "B:/简历作品/水上乐园/WebGL Builds",
  "data-roam": "B:/简历作品/数据漫游/网站",
  plane: "B:/简历作品/飞机大战/网页",
};

function contentTypeFor(filePath) {
  const normalized = filePath.endsWith(".br") || filePath.endsWith(".gz")
    ? filePath.replace(/\.(br|gz)$/i, "")
    : filePath;
  if (normalized.endsWith(".html")) return "text/html; charset=utf-8";
  if (normalized.endsWith(".js")) return "application/javascript";
  if (normalized.endsWith(".wasm")) return "application/wasm";
  if (normalized.endsWith(".data")) return "application/octet-stream";
  if (normalized.endsWith(".json")) return "application/json";
  if (normalized.endsWith(".css")) return "text/css";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function playableStaticServer() {
  return {
    name: "playable-static-server",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/play/")) {
          next();
          return;
        }

        const pathname = decodeURIComponent(req.url.split("?")[0]);
        const match = pathname.match(/^\/play\/([^/]+)\/?(.*)$/);
        if (!match) {
          next();
          return;
        }

        const root = playableRoots[match[1]];
        if (!root) {
          res.statusCode = 404;
          res.end("Unknown playable build");
          return;
        }

        const requested = match[2] || "index.html";
        const absoluteRoot = path.resolve(root);
        const targetPath = path.resolve(absoluteRoot, requested);

        if (!targetPath.startsWith(absoluteRoot)) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
          res.statusCode = 404;
          res.end("Playable asset not found");
          return;
        }

        if (targetPath.endsWith(".br")) {
          res.setHeader("Content-Encoding", "br");
          res.setHeader("Vary", "Accept-Encoding");
        } else if (targetPath.endsWith(".gz")) {
          res.setHeader("Content-Encoding", "gzip");
          res.setHeader("Vary", "Accept-Encoding");
        }

        res.setHeader("Content-Type", contentTypeFor(targetPath));
        res.setHeader("Cache-Control", "no-cache");

        if (req.method === "HEAD") {
          res.statusCode = 200;
          res.end();
          return;
        }

        fs.createReadStream(targetPath).pipe(res);
      });
    },
  };
}

function unityCompressionHeaders() {
  return {
    name: "unity-compression-headers",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url || "").split("?")[0]);
        const rawPath = pathname.endsWith(".br")
          ? pathname.slice(0, -3)
          : pathname.endsWith(".gz")
            ? pathname.slice(0, -3)
            : pathname;

        if (pathname.endsWith(".br")) {
          res.setHeader("Content-Encoding", "br");
          res.setHeader("Vary", "Accept-Encoding");
        }

        if (pathname.endsWith(".gz")) {
          res.setHeader("Content-Encoding", "gzip");
          res.setHeader("Vary", "Accept-Encoding");
        }

        if (rawPath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        } else if (rawPath.endsWith(".wasm")) {
          res.setHeader("Content-Type", "application/wasm");
        } else if (rawPath.endsWith(".data")) {
          res.setHeader("Content-Type", "application/octet-stream");
        }

        next();
      });
    },
  };
}

export default defineConfig({
  assetsInclude: ["**/*.br", "**/*.gz", "**/*.unityweb", "**/*.data", "**/*.wasm", "**/*.mem"],
  optimizeDeps: {
    include: ["react", "react-dom/client", "@phosphor-icons/react"],
  },
  server: {
    fs: {
      allow: ["B:/简历作品"],
    },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [playableStaticServer(), unityCompressionHeaders(), react()],
});
