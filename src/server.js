const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

// More robust CORS handling: allow explicit origins (comma-separated) or allow all when
// FRONTEND_ORIGIN is not set. This also handles preflight requests and common headers.
const corsOptions = {
    origin: (origin, callback) => {
        // allow non-browser requests like curl/postman (no origin)
        if (!origin) return callback(null, true);

        if (!FRONTEND_ORIGIN || FRONTEND_ORIGIN === "*")
            return callback(null, true);

        const allowed = FRONTEND_ORIGIN.split(",").map((s) => s.trim());
        if (allowed.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Note: global `app.use(cors(corsOptions))` above handles preflight requests for supported routes.

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () =>
    console.log(`Bulk-mailer backend listening on ${HOST}:${PORT}`),
);

