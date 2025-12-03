const nodemailer = require("nodemailer");
const pLimit = require("p-limit");

function getShortErrorMessage(error) {
    const message = (
        error.message ||
        error.toString() ||
        error.response ||
        ""
    ).toLowerCase();
    const code = error.code || error.responseCode;

    // Authentication errors
    if (
        code === 535 ||
        message.includes("535") ||
        message.includes("badcredentials") ||
        message.includes("invalid credentials")
    ) {
        return "Invalid email or app password - please check your credentials";
    }

    // Invalid recipient
    if (
        code === 550 ||
        message.includes("550") ||
        message.includes("user unknown")
    ) {
        return "Invalid recipient email address";
    }

    // Rate limiting
    if (
        code === 421 ||
        message.includes("421") ||
        message.includes("too many")
    ) {
        return "Rate limit exceeded - Gmail is throttling requests";
    }

    // Message rejected
    if (
        code === 554 ||
        message.includes("554") ||
        message.includes("message rejected")
    ) {
        return "Message was rejected by Gmail";
    }

    // Connection/timeout errors
    if (
        message.includes("timeout") ||
        message.includes("etimedout") ||
        message.includes("econnrefused")
    ) {
        return "Connection timeout - unable to reach Gmail SMTP server";
    }

    // TLS errors
    if (
        message.includes("tls") ||
        message.includes("ssl") ||
        message.includes("certificate")
    ) {
        return "TLS/SSL connection error - check Gmail security settings";
    }

    // Network errors
    if (message.includes("enotfound") || message.includes("enetunreach")) {
        return "Network error - unable to reach Gmail";
    }

    // Generic fallback with actual error
    return error.message || "Email sending failed";
}

async function sendBatch({
    senderEmail,
    senderPass,
    subject,
    body,
    recipients,
    concurrency = 6,
    fromName,
}) {
    // Allow enabling insecure TLS for debugging via env var (use only for testing)
    const insecureTls = process.env.ALLOW_INSECURE_TLS === "true";

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: senderEmail,
            pass: senderPass,
        },
        connectionTimeout: 3000,
        socketTimeout: 3000,
        greetingTimeout: 3000,
        // Useful for debugging SMTP connections - logs protocol traffic to console
        logger: true,
        debug: true,
        tls: insecureTls ? { rejectUnauthorized: false } : undefined,
    });

    // Skip verify - just try to send directly
    console.log(
        "[EMAIL] Starting batch send for",
        recipients.length,
        "recipients",
    );

    const limit = pLimit(concurrency);

    const sendOne = async (to) => {
        const mailOptions = {
            from: fromName ? `${fromName} <${senderEmail}>` : senderEmail,
            to,
            subject,
            html: body,
        };

        const maxAttempts = 2;
        let attempt = 0;
        while (attempt < maxAttempts) {
            try {
                attempt++;
                const info = await transporter.sendMail(mailOptions);
                console.log(`[EMAIL] ✓ Sent to ${to}`);
                return { to, success: true, info };
            } catch (err) {
                // Log full error for debugging
                console.error(
                    `[EMAIL] ✗ Failed to send to ${to} (attempt ${attempt}):`,
                    err,
                );

                // Build a helpful error payload for frontend / logs
                const short = getShortErrorMessage(err);
                const detailed = {
                    message: err && err.message,
                    code: err && (err.code || err.responseCode),
                    response: err && err.response,
                };

                if (attempt >= maxAttempts)
                    return {
                        to,
                        success: false,
                        error: short,
                        errorDetails: detailed,
                    };

                // Shorter backoff to fail fast
                const backoff = 200 * attempt;
                await new Promise((r) => setTimeout(r, backoff));
            }
        }
    };

    const results = [];
    const tasks = recipients.map((r, index) =>
        limit(async () => {
            const result = await sendOne(r);
            results.push(result);
            return result;
        }),
    );

    await Promise.all(tasks);
    return results;
}

module.exports = { sendBatch, getShortErrorMessage };
