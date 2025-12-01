// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

// Read FRONTEND_ORIGIN from env. Support comma-separated list for multiple origins.
const rawOrigins = process.env.FRONTEND_ORIGIN || "";
const ALLOWED_ORIGINS = rawOrigins
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Debug logs (remove in production if you want)
console.log("ALLOWED_ORIGINS:", ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : "[empty]");

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // If no origin (curl, server-to-server), allow it
    if (!origin) return callback(null, true);

    // If ALLOWED_ORIGINS empty -> deny, unless you want debug open allow (not recommended)
    if (ALLOWED_ORIGINS.length === 0) {
      return callback(new Error("CORS not configured: set FRONTEND_ORIGIN"), false);
    }

    // Allow if origin matches any allowed origin
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Not allowed
    console.warn("Blocked CORS request from origin:", origin);
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  // Set this to true ONLY if you are using cookies (sessions) across domains.
  credentials: false,
  optionsSuccessStatus: 200,
};

// Apply CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Small middleware to log incoming origin for debugging
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.originalUrl, "Origin:", req.headers.origin || "none");
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Bulk-mailer backend listening on ${PORT}`));
