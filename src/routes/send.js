const express = require("express");
const { parse } = require("csv-parse/sync");
const validateEmail = require("../utils/validateEmail");
const { sendBatch, getShortErrorMessage } = require("../emailSender");

const router = express.Router();

// Handle preflight OPTIONS requests
router.options("/", (req, res) => {
    res.sendStatus(200);
});

router.post("/", async (req, res) => {
    try {

        const masterKey = process.env.MASTER_API_KEY;
        if (masterKey && req.body.apiKey !== masterKey) {
            return res.status(401).json({ error: "Invalid API key" });
        }

        const { senderEmail, senderPass, fromName, subject, body, smtpHost, smtpPort, smtpSecure } = req.body;
        let { recipientsCsv, recipientsArray } = req.body;

        if (!senderEmail || !senderPass)
            return res
                .status(400)
                .json({ error: "senderEmail and senderPass required" });
        if (!subject)
            return res.status(400).json({ error: "subject required" });

        let recipients = [];
        if (Array.isArray(recipientsArray)) recipients = recipientsArray;
        else if (recipientsCsv) {
            const records = parse(recipientsCsv, {
                columns: false,
                relax_column_count: true,
                skip_empty_lines: true,
            });
            recipients = records
                .map((r) => (Array.isArray(r) ? r[0] : r))
                .filter(Boolean)
                .map((s) => String(s).trim());
        }

        if (!recipients || recipients.length === 0)
            return res.status(400).json({ error: "No recipients provided" });

        const invalid = recipients.filter((r) => !validateEmail(r));
        if (invalid.length)
            return res.status(400).json({
                error: "Invalid emails present",
                invalid: invalid.slice(0, 20),
            });

        if (recipients.length > 5000)
            return res
                .status(400)
                .json({ error: "Too many recipients in one request" });

        const concurrency = Number(req.body.concurrency) || 6;

        try {
            const results = await sendBatch({
                senderEmail,
                senderPass,
                subject,
                body,
                recipients,
                concurrency,
                fromName,
                smtpHost,
                smtpPort,
                smtpSecure,
            });

            const summary = {
                total: recipients.length,
                success: results.filter((r) => r.success).length,
                failed: results.filter((r) => !r.success).length,
            };

            return res.json({ summary, results });
        } catch (sendError) {
            const shortError = getShortErrorMessage(sendError);
            return res.status(400).json({ error: shortError });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
