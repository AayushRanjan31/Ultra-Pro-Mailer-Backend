# Bulk Mailer Backend

A Node.js backend service for sending bulk emails using Gmail SMTP. This service provides a REST API endpoint for sending emails to multiple recipients concurrently.

## Features

-   **Bulk Email Sending**: Send emails to multiple recipients simultaneously
-   **Gmail SMTP Integration**: Uses Gmail's SMTP server for reliable email delivery
-   **Concurrent Processing**: Configurable concurrency for efficient sending
-   **Email Validation**: Validates recipient email addresses before sending
-   **Error Handling**: Comprehensive error handling with user-friendly error messages
-   **Rate Limiting**: Built-in retry logic with exponential backoff
-   **Security**: API key authentication for protected endpoints

## Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   Gmail account with App Password (for SMTP authentication)

## Installation

1. Clone the repository and navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the backend directory with the following variables:
    ```env
    PORT=8000
    FRONTEND_ORIGIN=http://localhost:5174
    MASTER_API_KEY=your_master_api_key_here
    ```

## Configuration

### Environment Variables

-   `PORT`: Server port (default: 8000)
-   `FRONTEND_ORIGIN`: Allowed CORS origin for the frontend (default: "\*")
-   `MASTER_API_KEY`: API key for authenticating requests (optional but recommended for production)

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
    - Go to Google Account settings
    - Security → 2-Step Verification → App passwords
    - Generate a password for "Mail"
3. Use your Gmail address and the generated App Password for authentication

## API Endpoints

### POST /send

Send bulk emails to multiple recipients.

**Request Body:**

```json
{
    "apiKey": "your_master_api_key",
    "senderEmail": "your-email@gmail.com",
    "senderPass": "your-app-password",
    "fromName": "Your Name",
    "subject": "Email Subject",
    "body": "<h1>Email Content</h1>",
    "recipientsArray": ["recipient1@example.com", "recipient2@example.com"],
    "recipientsCsv": "recipient1@example.com,recipient2@example.com",
    "concurrency": 6
}
```

**Parameters:**

-   `apiKey`: Master API key (if configured)
-   `senderEmail`: Gmail address for sending
-   `senderPass`: Gmail App Password
-   `fromName`: Display name for the sender (optional)
-   `subject`: Email subject (required)
-   `body`: HTML email body (required)
-   `recipientsArray`: Array of email addresses
-   `recipientsCsv`: Comma-separated email addresses
-   `concurrency`: Number of concurrent email sends (default: 6)

**Response:**

```json
{
    "summary": {
        "total": 100,
        "success": 95,
        "failed": 5
    },
    "results": [
        {
            "to": "recipient@example.com",
            "success": true,
            "info": "Email sent successfully"
        },
        {
            "to": "invalid@example.com",
            "success": false,
            "error": "Invalid recipient"
        }
    ]
}
```

**Error Responses:**

-   `400 Bad Request`: Invalid input, authentication failure, or validation errors
-   `401 Unauthorized`: Invalid API key
-   `500 Internal Server Error`: Server-side errors

## Usage Examples

### Using curl

```bash
curl -X POST http://localhost:8000/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderEmail": "your-email@gmail.com",
    "senderPass": "your-app-password",
    "subject": "Test Email",
    "body": "<h1>Hello World!</h1>",
    "recipientsArray": ["test@example.com"]
  }'
```

### Using JavaScript (Frontend Integration)

```javascript
const response = await fetch("http://localhost:8000/send", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        senderEmail: "your-email@gmail.com",
        senderPass: "your-app-password",
        subject: "Test Email",
        body: "<h1>Hello World!</h1>",
        recipientsArray: ["test@example.com"],
    }),
});

const result = await response.json();
console.log(result);
```

## Error Messages

The API returns user-friendly error messages for common issues:

-   **"Username and Password not accepted"**: Invalid Gmail credentials
-   **"Invalid recipient"**: Email address format is invalid
-   **"Rate limit exceeded"**: Too many emails sent too quickly
-   **"Message rejected"**: Email content was rejected by Gmail
-   **"Connection timeout"**: Network or server timeout
-   **"Sending failed"**: Generic sending error

## Development

### Running the Server

For development with auto-restart:

```bash
npm run dev
```

For production:

```bash
npm start
```

### Project Structure

```
backend/
├── src/
│   ├── server.js          # Main server file
│   ├── routes/
│   │   └── send.js        # Send email route
│   ├── emailSender.js     # Email sending logic
│   └── utils/
│       └── validateEmail.js # Email validation utility
├── package.json
├── README.md
└── .env                   # Environment variables (create this)
```

## Security Considerations

-   **API Keys**: Always use the `MASTER_API_KEY` in production
-   **App Passwords**: Use Gmail App Passwords instead of regular passwords
-   **Rate Limiting**: The service includes built-in rate limiting and retry logic
-   **Input Validation**: All inputs are validated before processing
-   **CORS**: Configure `FRONTEND_ORIGIN` appropriately for production

## Troubleshooting

### Common Issues

1. **Authentication Failed**

    - Verify your Gmail App Password is correct
    - Ensure 2FA is enabled on your Gmail account

2. **Rate Limiting**

    - Gmail has sending limits; reduce concurrency or add delays
    - Consider using multiple Gmail accounts for large sends

3. **Invalid Recipients**
    - Check email address formats
    - Remove any invalid addresses from your list

### Logs

Server logs are output to the console. Check the terminal for detailed error information during development.

## License

ISC License
