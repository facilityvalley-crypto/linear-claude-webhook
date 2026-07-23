const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const LINEAR_API_TOKEN = process.env.LINEAR_API_TOKEN;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const PORT = process.env.PORT || 3000;

const LINEAR_ENDPOINT = 'https://api.linear.app/graphql';
const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';

app.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    if (event.type !== 'Comment' || event.action !== 'create') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const comment = event.data;
    const commentBody = comment.body;
    const issueId = comment.issueId;

    if (!commentBody.toLowerCase().includes('execute')) {
      return res.status(200).json({ message: 'No execute command found' });
    }

    console.log(`Processing webhook for issue: ${issueId}`);
    
    const issueQuery = `query { issue(id: "${issueId}") { id title description status { name } } }`;

    const linearResponse = await axios.post(LINEAR_ENDPOINT, 
      { query: issueQuery },
      { headers: { Authorization: `Bearer ${LINEAR_API_TOKEN}` } }
    );

    const issue = linearResponse.data.data.issue;
    console.log(`Issue: ${issue.title}`);

    const claudeResponse = await axios.post(CLAUDE_ENDPOINT,
      {
        model: 'claude-opus-4-1',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Execute this task: ${issue.title}\n${issue.description}`
        }]
      },
      { headers: { 'x-api-key': CLAUDE_API_KEY } }
    );

    const claudeMessage = claudeResponse.data.content[0].text;
    console.log(`Claude response: ${claudeMessage}`);

    res.status(200).json({ 
      success: true, 
      issue: issue.id,
      response: claudeMessage 
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
