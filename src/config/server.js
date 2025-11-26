import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weatherRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/weather", weatherRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Weather API Server Running" });
});

// HTTPS Setup
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "../../certs/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../../certs/cert.pem")),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS Server running on https://localhost:${PORT}`);
});
