const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

console.log("[CORS] FRONTEND_ORIGIN:", FRONTEND_ORIGIN);

// Simple CORS middleware - just allow everything for now
const simpleCors = (req, res, next) => {
    const origin = req.get("origin") || "*";
    console.log("[CORS] Incoming origin:", origin);

    // Set CORS headers
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "false");

    // Handle preflight
    if (req.method === "OPTIONS") {
        console.log("[CORS] Handling OPTIONS preflight");
        return res.sendStatus(200);
    }

    next();
};

app.use(simpleCors);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () =>
    console.log(`Bulk-mailer backend listening on ${HOST}:${PORT}`),
);
