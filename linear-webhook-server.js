const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const LINEAR_API_TOKEN = process.env.LINEAR_API_TOKEN;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const PORT = process.env.PORT || 3000;

app.post('/webhook', async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body, null, 2));
  
  try {
    const event = req.body;
    
    if (!event.data || !event.data.body) {
      console.log('Not a comment event, ignoring');
      return res.status(200).json({ message: 'Event ignored' });
    }

    const commentBody = event.data.body;
    const issueId = event.data.issueId;

    if (!commentBody.toLowerCase().includes('execute')) {
      console.log('No execute command found');
      return res.status(200).json({ message: 'No execute command' });
    }

    console.log(`Processing webhook for issue: ${issueId}`);
    res.status(200).json({ success: true, message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
