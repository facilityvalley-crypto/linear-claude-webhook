const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const LINEAR_API_TOKEN = process.env.LINEAR_API_TOKEN;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

app.post('/webhook', async (req, res) => {
  console.log('✅ Webhook received');
  
  try {
    const event = req.body;
    
    // Check if it's a comment event
    if (event.type !== 'Comment') {
      console.log('Not a comment event, ignoring');
      return res.json({ ignored: true });
    }

    const commentBody = event.data.body || '';
    const issueId = event.data.issueId;

    // Check for "execute" command
    if (!commentBody.toLowerCase().includes('execute')) {
      console.log('No execute command found');
      return res.json({ ignored: true });
    }

    console.log(`Processing execute command for issue ${issueId}`);

    // Fetch issue from Linear
    const issueQuery = `query { issue(id: "${issueId}") { id title description } }`;
    const linearRes = await axios.post('https://api.linear.app/graphql',
      { query: issueQuery },
      { headers: { Authorization: `Bearer ${LINEAR_API_TOKEN}` } }
    );

    const issue = linearRes.data.data.issue;
    console.log(`Executing task: ${issue.title}`);

    // Call Claude to execute
    const claudeRes = await axios.post('https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-1',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Execute this task: ${issue.title}\n${issue.description || ''}`
        }]
      },
      { headers: { 'x-api-key': CLAUDE_API_KEY } }
    );

    const result = claudeRes.data.content[0].text;
    console.log('Claude response:', result);

    // Post result back to Linear
    const commentMutation = `mutation { commentCreate(input: { issueId: "${issueId}", body: "✅ **Executed**\n\n${result}" }) { comment { id } } }`;
    await axios.post('https://api.linear.app/graphql',
      { query: commentMutation },
      { headers: { Authorization: `Bearer ${LINEAR_API_TOKEN}` } }
    );

    console.log('✅ Task executed and result posted to Linear');
    res.json({ success: true });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
