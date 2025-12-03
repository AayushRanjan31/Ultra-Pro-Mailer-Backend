const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

console.log("[CORS] FRONTEND_ORIGIN:", FRONTEND_ORIGIN);

const corsOptions = {
    origin: (origin, callback) => {
        console.log("[CORS] Incoming origin:", origin);
        if (!origin) {
            console.log("[CORS] No origin (non-browser request) - ALLOWED");
            return callback(null, true);
        }
        if (FRONTEND_ORIGIN === "*") {
            console.log("[CORS] Wildcard origin - ALLOWED");
            return callback(null, true);
        }
        const allowed = FRONTEND_ORIGIN.split(",").map((s) => s.trim());
        if (allowed.includes(origin)) {
            console.log("[CORS] Origin matches whitelist - ALLOWED");
            return callback(null, true);
        }
        console.log("[CORS] Origin NOT in whitelist - REJECTED");
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
    credentials: false,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () =>
    console.log(`Bulk-mailer backend listening on ${HOST}:${PORT}`),
);
