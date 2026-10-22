import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";

// Local preview only. Large release files stay outside Pages and the source repository.
const root = resolve("..");
const sources = {
  "play/jian-deng": resolve(root, "缄灯：归渡/源文件/网站"),
  "play/company-war": resolve(root, "公司战争/网站"),
  "play/sanxingdui": resolve(root, "三星堆展馆/网站"),
  "play/data-roam": resolve(root, "数据漫游/网站"),
};
const downloads = {
  "/downloads/dark-knight-windows.zip": resolve(
    root,
    "黑暗骑士_Windows试玩.zip",
  ),
  "/downloads/water-park-windows.zip": resolve(
    root,
    "水上乐园_Windows试玩.zip",
  ),
};
const mime = (path) =>
  path.match(/\.wasm(?:\.(?:br|gz))?$/)
    ? "application/wasm"
    : path.match(/\.js(?:\.(?:br|gz))?$/)
      ? "application/javascript"
      : path.endsWith(".html")
        ? "text/html; charset=utf-8"
        : path.endsWith(".css")
          ? "text/css"
          : path.endsWith(".json")
            ? "application/json"
            : path.endsWith(".png")
              ? "image/png"
              : path.endsWith(".jpg")
                ? "image/jpeg"
                : path.endsWith(".mp3")
                  ? "audio/mpeg"
                  : path.endsWith(".zip")
                    ? "application/zip"
                    : "application/octet-stream";
export function localPlayableBuilds() {
  const install = (server) => {
    server.middlewares.use((req, res, next) => {
      let path;
      try {
        path = decodeURIComponent((req.url || "").split("?")[0]);
      } catch {
        return next();
      }
      let file = downloads[path];
      if (!file) {
        for (const [prefix, source] of Object.entries(sources)) {
          if (!path.startsWith(`/${prefix}/`)) continue;
          const target = resolve(source, path.slice(prefix.length + 2));
          if (target.startsWith(source + sep)) file = target;
          break;
        }
      }
      if (!file || !existsSync(file) || !statSync(file).isFile()) return next();
      const size = statSync(file).size;
      res.setHeader("Content-Type", mime(file));
      res.setHeader("Accept-Ranges", "bytes");
      if (file.endsWith(".gz")) res.setHeader("Content-Encoding", "gzip");
      if (file.endsWith(".br")) res.setHeader("Content-Encoding", "br");
      let start = 0,
        end = size - 1;
      if (req.headers.range) {
        const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
        if (!match) {
          res.statusCode = 416;
          res.setHeader("Content-Range", `bytes */${size}`);
          return res.end();
        }
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), end) : end;
        if (start > end || start >= size) {
          res.statusCode = 416;
          res.setHeader("Content-Range", `bytes */${size}`);
          return res.end();
        }
        res.statusCode = 206;
        res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
      }
      res.setHeader("Content-Length", end - start + 1);
      if (req.method === "HEAD") return res.end();
      const stream = createReadStream(file, { start, end });
      stream.on("error", () => res.destroy());
      res.on("close", () => stream.destroy());
      stream.pipe(res);
    });
  };
  return {
    name: "portfolio-local-playable-builds",
    configureServer: install,
    configurePreviewServer: install,
  };
}
