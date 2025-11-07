require('dotenv').config();


const cfg = {
serviceName: process.env.SERVICE_NAME || 'notifier-email-node',
logLevel: process.env.LOG_LEVEL || 'info',


// RabbitMQ
rabbitUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672/',
queueName: process.env.QUEUE_NAME || 'notify_purchase_paid',
prefetch: parseInt(process.env.PREFETCH_COUNT || '16', 10),


// SMTP
smtpHost: process.env.SMTP_HOST || 'mailhog',
smtpPort: parseInt(process.env.SMTP_PORT || '1025', 10),
smtpUser: process.env.SMTP_USERNAME || undefined,
smtpPass: process.env.SMTP_PASSWORD || undefined,
smtpSecure: (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true', // true = 465
smtpStartTLS: (process.env.SMTP_STARTTLS || 'false').toLowerCase() === 'true',
senderEmail: process.env.SENDER_EMAIL || 'no-reply@tickets.example',
senderName: process.env.SENDER_NAME || 'Ticketing Notifications',


// HTTP
port: parseInt(process.env.PORT || '8000', 10),
};


module.exports = cfg;