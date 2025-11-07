const nodemailer = require('nodemailer');
const cfg = require('./config');


let transporter;


function getTransporter() {
if (!transporter) {
transporter = nodemailer.createTransport({
host: cfg.smtpHost,
port: cfg.smtpPort,
secure: cfg.smtpSecure, // true para 465
auth: cfg.smtpUser && cfg.smtpPass ? { user: cfg.smtpUser, pass: cfg.smtpPass } : undefined,
// STARTTLS se negocia automáticamente cuando secure=false y el servidor lo ofrece.
tls: cfg.smtpStartTLS ? { rejectUnauthorized: false } : undefined,
});
}
return transporter;
}


async function sendEmail({ to, subject, html }) {
const t = getTransporter();
const from = `${cfg.senderName} <${cfg.senderEmail}>`;
await t.sendMail({ from, to, subject, html, text: 'Tu cliente de correo no soporta HTML.' });
}


function buildTicketEmail(payload) {
const subject = `✅ Pago confirmado: ${payload.event_name}`;
const html = `
<div style="font-family:Arial,sans-serif">
<h2>Pago confirmado</h2>
<p>Hola,</p>
<p>Tu compra para <strong>${payload.event_name}</strong> fue confirmada.</p>
<ul>
<li><strong>Cantidad:</strong> ${payload.quantity}</li>
<li><strong>Total:</strong> ${payload.total_amount} ${payload.currency || 'USD'}</li>
<li><strong>ID Compra:</strong> ${payload.purchase_id}</li>
<li><strong>Fecha de pago:</strong> ${payload.paid_at}</li>
</ul>
<p>¡Gracias por tu compra!</p>
</div>`;
return { subject, html };
}


module.exports = { sendEmail, buildTicketEmail };