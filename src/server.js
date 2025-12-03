const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

// Robust CORS configuration for production
const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (no origin)
        if (!origin) return callback(null, true);

        // Allow all if FRONTEND_ORIGIN is "*"
        if (!FRONTEND_ORIGIN || FRONTEND_ORIGIN === "*")
            return callback(null, true);

        // Check if origin is in allowed list (comma-separated)
        const allowed = FRONTEND_ORIGIN.split(",").map((s) => s.trim());
        if (allowed.includes(origin)) return callback(null, true);

        // Reject disallowed origins
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () =>
    console.log(`Bulk-mailer backend listening on ${HOST}:${PORT}`),
);
