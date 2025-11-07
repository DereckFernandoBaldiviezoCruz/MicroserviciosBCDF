const express = require('express');
const bodyParser = require('body-parser');
const cfg = require('./config');
const { sendEmail } = require('./emailer');
const { startConsumer } = require('./consumer');


const app = express();
app.use(bodyParser.json());


app.get('/health', (_req, res) => {
res.json({ status: 'ok', service: cfg.serviceName });
});


// Endpoint de prueba para enviar email manual (no usa cola)
app.post('/test/send', async (req, res) => {
const { to, subject, html } = req.body || {};
if (!to || !subject || !html) return res.status(400).json({ error: 'to, subject, html son requeridos' });
try {
await sendEmail({ to, subject, html });
res.json({ sent: true });
} catch (e) {
console.error(e);
res.status(500).json({ sent: false, error: e.message });
}
});


app.listen(cfg.port, async () => {
console.log(`HTTP listo en :${cfg.port}`);
try {
await startConsumer();
} catch (e) {
console.error('No se pudo iniciar el consumidor:', e.message);
process.exit(1);
}
});