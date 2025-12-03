require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({ origin: FRONTEND_ORIGIN }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Bulk-mailer backend listening on ${PORT}`));
