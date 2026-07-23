const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  try {
    console.log('📨 Webhook body:', JSON.stringify(req.body, null, 2));
    res.json({ received: true });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
