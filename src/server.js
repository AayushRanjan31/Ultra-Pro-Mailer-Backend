require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = "https://ultra-pro-mailer-frontend-production.up.railway.app/";
app.use(cors({ origin: FRONTEND_ORIGIN }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/send", sendRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Bulk-mailer backend listening on ${PORT}`));
