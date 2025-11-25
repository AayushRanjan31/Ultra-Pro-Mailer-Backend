require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors());

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
if (require.main === module) {
    app.listen(PORT, () =>
        console.log(`Bulk-mailer backend listening on ${PORT}`),
    );
} else {
    module.exports = app;
}
