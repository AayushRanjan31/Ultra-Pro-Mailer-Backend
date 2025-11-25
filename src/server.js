require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://ultra-pro-mailer-backend.vercel.app";
app.use(cors({ origin: FRONTEND_ORIGIN }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors());

app.use("/send", sendRoute);

app.get("/", (req, res) => res.send("Bulk Mailer Backend is running"));

const PORT = process.env.PORT || 8000;
if (require.main === module) {
    app.listen(PORT, () =>
        console.log(`Bulk-mailer backend listening on ${PORT}`),
    );
} else {
    module.exports = app;
}
