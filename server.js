const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_PATH = path.join(__dirname, "data.json");

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Serve files
  if (req.method === "GET") {
    if (req.url === "/" || req.url === "/index.html") {
      return serveFile(res, path.join(__dirname, "index.html"), "text/html; charset=utf-8");
    }
    if (req.url === "/data.json") {
      return serveFile(res, DATA_PATH, "application/json; charset=utf-8");
    }
    if (req.url.startsWith("/assets/")) {
      const filePath = path.join(__dirname, req.url);
      return serveFile(res, filePath, "application/octet-stream");
    }
  }

  // Save endpoint
  if (req.method === "POST" && req.url === "/save") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const entry = JSON.parse(body);

        let list = [];
        if (fs.existsSync(DATA_PATH)) {
          const current = fs.readFileSync(DATA_PATH, "utf8").trim();
          list = current ? JSON.parse(current) : [];
        }

        // ensure it's an array
        if (!Array.isArray(list)) list = [list];

        list.push(entry);
        fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2), "utf8");

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Bad JSON" }));
      }
    });
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
