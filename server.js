/**
 * Server local pentru deep work depot.
 * Servește aplicația și salvează datele în data.json pe disc.
 * Rulează: node server.js
 * Deschide: http://localhost:3847
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3847;
const WIP_API = "https://api.wip.co";
const DATA_FILE = path.join(__dirname, "data.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return { days: {}, settings: {}, activeTimer: null };
    return { days: {}, settings: {}, activeTimer: null };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (pathname === "/api/data" && req.method === "GET") {
    const data = readData();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
    return;
  }

  if (pathname === "/api/data" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const current = readData();
        const merged = {
          days: data.days != null ? data.days : current.days,
          settings: data.settings != null ? data.settings : current.settings,
          activeTimer: data.activeTimer !== undefined ? data.activeTimer : current.activeTimer,
        };
        writeData(merged);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(merged));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Bad request");
      }
    });
    return;
  }

  if (pathname === "/api/wip-post" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { body: todoBody, apiKey } = JSON.parse(body);
        if (!todoBody || !apiKey) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "body and apiKey required" }));
          return;
        }
        const payload = JSON.stringify({ body: todoBody });
        const apiUrl = new URL("/v1/todos", WIP_API);
        apiUrl.searchParams.set("api_key", apiKey);
        const opts = {
          hostname: apiUrl.hostname,
          path: apiUrl.pathname + "?" + apiUrl.searchParams.toString(),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload, "utf8"),
          },
        };
        const wipReq = https.request(opts, (wipRes) => {
          let data = "";
          wipRes.on("data", (chunk) => (data += chunk));
          wipRes.on("end", () => {
            res.writeHead(wipRes.statusCode, { "Content-Type": "application/json" });
            res.end(data || "{}");
          });
        });
        wipReq.on("error", () => {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "WIP request failed" }));
        });
        wipReq.write(payload, "utf8");
        wipReq.end();
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad request" }));
      }
    });
    return;
  }

  const filePath =
    pathname === "/" || pathname === ""
      ? path.join(__dirname, "index.html")
      : path.join(__dirname, pathname);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end();
    return;
  }

  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log("deep work depot – server local");
  console.log("  Deschide în browser: http://localhost:" + PORT);
  console.log("  Date salvate în: " + DATA_FILE);
});
