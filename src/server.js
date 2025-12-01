// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const rawOrigins = process.env.FRONTEND_ORIGIN || "";
const ALLOWED_ORIGINS = rawOrigins
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

console.log("ALLOWED_ORIGINS:", ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : "[empty]");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server / curl

    if (ALLOWED_ORIGINS.length === 0) {
      return callback(new Error("CORS not configured: set FRONTEND_ORIGIN"), false);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    console.warn("Blocked CORS request from origin:", origin);
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: false,
  optionsSuccessStatus: 200,
};

// apply CORS globally
app.use(cors(corsOptions));

// handle preflight for all routes — use regex instead of "*"
app.options(/.*/, cors(corsOptions));

// debug incoming origin
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.originalUrl, "Origin:", req.headers.origin || "none");
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Bulk-mailer backend listening on ${PORT}`));
