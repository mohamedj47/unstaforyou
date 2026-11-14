import express from "express";
import path from "path";
import fs from "fs";
import "dotenv/config";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT || 3000);
const app = express();
app.use(express.json({ limit: "25mb" }));

const mocks = [
  {
    "id": "mock-1794688970990-dmx90",
    "url": "/api/v1/items",
    "method": "GET",
    "description": "Simulated JSON response",
    "responseBody": "{\n  \"simulated\": true,\n  \"items\": [\n    {\n      \"id\": 1,\n      \"name\": \"Sample Item\"\n    }\n  ]\n}",
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "delayMs": 80,
    "enabled": true,
    "sourceType": "SIMULATED_MOCK"
  },
  {
    "id": "mock-1",
    "url": "/api/v1/user/profile",
    "method": "GET",
    "description": "User profile and authentication session payload",
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "delayMs": 120,
    "enabled": true,
    "responseBody": "{\n  \"status\": \"success\",\n  \"user\": {\n    \"id\": \"usr_98241\",\n    \"name\": \"Cloner Admin\",\n    \"email\": \"admin@intercept.local\",\n    \"role\": \"engineer\",\n    \"permissions\": [\n      \"read\",\n      \"write\",\n      \"clone\",\n      \"intercept\"\n    ],\n    \"avatar\": \"/assets/avatar-default.png\"\n  },\n  \"sessionExpiresAt\": \"2026-12-31T23:59:59Z\"\n}",
    "sourceType": "SIMULATED_MOCK"
  },
  {
    "id": "mock-2",
    "url": "/api/v1/analytics/metrics",
    "method": "GET",
    "description": "System traffic telemetry and crawl stats",
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "delayMs": 80,
    "enabled": true,
    "responseBody": "{\n  \"totalRequests\": 14290,\n  \"interceptedCount\": 842,\n  \"cacheHitRate\": \"94.2%\",\n  \"activeSessions\": 38,\n  \"bandwidthSavedKb\": 45290\n}",
    "sourceType": "SIMULATED_MOCK"
  },
  {
    "id": "mock-3",
    "url": "/api/v1/checkout/session",
    "method": "POST",
    "description": "Simulated e-commerce checkout response",
    "statusCode": 201,
    "headers": {
      "Content-Type": "application/json"
    },
    "delayMs": 250,
    "enabled": true,
    "responseBody": "{\n  \"status\": \"completed\",\n  \"transactionId\": \"tx_77391942\",\n  \"currency\": \"USD\",\n  \"amount\": 89.99,\n  \"items\": [\n    {\n      \"id\": \"item_1\",\n      \"name\": \"Standard Subscription\",\n      \"quantity\": 1\n    }\n  ]\n}",
    "sourceType": "SIMULATED_MOCK"
  },
  {
    "id": "mock-4",
    "url": "/api/v1/notifications",
    "method": "GET",
    "description": "Real-time alert notifications payload",
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "delayMs": 50,
    "enabled": true,
    "responseBody": "{\n  \"notifications\": [\n    {\n      \"id\": \"nt_1\",\n      \"title\": \"DOM Snapshot Completed\",\n      \"time\": \"2 mins ago\",\n      \"unread\": true\n    },\n    {\n      \"id\": \"nt_2\",\n      \"title\": \"14 Network Assets Captured\",\n      \"time\": \"12 mins ago\",\n      \"unread\": false\n    }\n  ]\n}",
    "sourceType": "SIMULATED_MOCK"
  }
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: "standalone-reconstructed", activeMocks: mocks.length });
});

app.get("/api/mocks", (_req, res) => {
  res.json({ success: true, source: "SIMULATED_MOCK_REGISTRY", mocks });
});

app.all("/api/mock/*", async (req, res) => {
  const reqPath = req.path.replace(/^\/api\/mock/, "") || "/";
  const method = req.method.toUpperCase();
  const matched = mocks.find(
    (m: any) => m.enabled !== false && m.method === method && (m.url === reqPath || m.url === "/" + reqPath)
  );
  if (!matched) {
    return res.status(404).json({ error: "No mock route matched", method, path: reqPath, simulated: true });
  }
  if (matched.delayMs > 0) await new Promise((r) => setTimeout(r, matched.delayMs));
  res.setHeader("X-Response-Origin", "SIMULATED_MOCK_SERVER");
  try {
    return res.status(matched.statusCode || 200).json(JSON.parse(matched.responseBody));
  } catch {
    return res.status(matched.statusCode || 200).send(matched.responseBody);
  }
});

app.use(express.static(path.join(process.cwd(), "public")));

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), "dist");
    app.use(express.static(dist));
    app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Standalone reconstructed app listening on http://0.0.0.0:${PORT}`);
  });
}

start();
