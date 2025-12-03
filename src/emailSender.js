const nodemailer = require("nodemailer");
const pLimit = require("p-limit");

function getShortErrorMessage(error) {
    if (error.code === 535 || error.responseCode === 535) {
        return "Username and Password not accepted";
    }
    if (error.code === 550 || error.responseCode === 550) {
        return "Invalid recipient";
    }
    if (error.code === 421 || error.responseCode === 421) {
        return "Rate limit exceeded";
    }
    if (error.code === 554 || error.responseCode === 554) {
        return "Message rejected";
    }

    const message = error.message || error.toString() || error.response || "";

    if (
        message.includes("535") ||
        message.includes("BadCredentials") ||
        message.includes("Username and Password not accepted")
    ) {
        return "Username and Password not accepted";
    }
    if (
        message.includes("550") ||
        message.includes("User unknown") ||
        message.includes("Invalid recipient")
    ) {
        return "Invalid recipient";
    }
    if (message.includes("421") || message.includes("Too many")) {
        return "Rate limit exceeded";
    }
    if (message.includes("554") || message.includes("Message rejected")) {
        return "Message rejected";
    }
    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
        return "Connection timeout";
    }

    return "Sending failed";
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
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: senderEmail,
            pass: senderPass,
        },
    });
    await transporter.verify();

    const limit = pLimit(concurrency);

    const sendOne = async (to) => {
        const mailOptions = {
            from: fromName ? `${fromName} <${senderEmail}>` : senderEmail,
            to,
            subject,
            html: body,
        };

        const maxAttempts = 3;
        let attempt = 0;
        while (attempt < maxAttempts) {
            try {
                attempt++;
                const info = await transporter.sendMail(mailOptions);
                return { to, success: true, info };
            } catch (err) {
                if (attempt >= maxAttempts)
                    return {
                        to,
                        success: false,
                        error: getShortErrorMessage(err),
                    };
                const backoff = 500 * Math.pow(2, attempt);
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
