const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const LINEAR_API_TOKEN = process.env.LINEAR_API_TOKEN;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const PORT = process.env.PORT || 8080;

app.post('/webhook', async (req, res) => {
  console.log('📨 Webhook received at', new Date().toISOString());
  
  try {
    const event = req.body;
    console.log('Event type:', event.type);
    
    if (event.type !== 'Comment') {
      console.log('Not a comment event, ignoring');
      return res.json({ ignored: true });
    }

    const comment = event.data;
    const commentBody = comment.body || '';
    const issueId = comment.issueId;

    if (!commentBody.toLowerCase().includes('execute')) {
      console.log('No execute command, ignoring');
      return res.json({ ignored: true });
    }

    console.log(`✅ Executing task for issue ${issueId}`);
    res.json({ processing: true });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
