require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sendRoute = require("./routes/send");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://ultra-pro-mailer-frontend-production.up.railway.app";
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Ultra Pro Mailer backend is running!");
});

app.use("/send", sendRoute);

