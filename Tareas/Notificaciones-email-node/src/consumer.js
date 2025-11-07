const amqplib = require('amqplib');
const cfg = require('./config');
const { sendEmail, buildTicketEmail } = require('./emailer');

async function connectWithRetry(maxRetries = 30, delayMs = 2000) {
  let attempt = 0;
  while (true) {
    try {
      const conn = await amqplib.connect(cfg.rabbitUrl);
      const ch = await conn.createChannel();
      await ch.assertQueue(cfg.queueName, { durable: true });
      await ch.prefetch(cfg.prefetch);
      return { conn, ch };
    } catch (err) {
      attempt++;
      console.error(`RabbitMQ no disponible (intento ${attempt}/${maxRetries}): ${err.message}`);
      if (attempt >= maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function startConsumer() {
  const { conn, ch } = await connectWithRetry();
  console.log(`📥 Escuchando cola: ${cfg.queueName}`);

  ch.consume(
    cfg.queueName,
    async (msg) => {
      if (!msg) return;
      try {
        const payloadStr = msg.content.toString('utf-8');
        const payload = JSON.parse(payloadStr);
        if (!payload.user_email || !payload.event_name) {
          throw new Error('Mensaje inválido: falta user_email o event_name');
        }
        const { subject, html } = buildTicketEmail(payload);
        await sendEmail({ to: payload.user_email, subject, html });
        console.log(`✉️  Email enviado a ${payload.user_email} (purchase_id=${payload.purchase_id || '?'})`);
        ch.ack(msg);
      } catch (err) {
        console.error('Error procesando mensaje:', err.message);
        ch.nack(msg, false, true); // requeue
      }
    },
    { noAck: false }
  );

  return { conn, ch };
}

module.exports = { startConsumer };
