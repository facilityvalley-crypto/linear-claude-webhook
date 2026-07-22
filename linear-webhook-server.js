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
    
    if (event.type !== 'Comment' || !event.action === 'create') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const comment = event.data;
    const commentBody = comment.body;
    const issueId = comment.issueId;

    if (!commentBody.toLowerCase().includes('execute')) {
      return res.status(200).json({ message: 'No execute command found' });
    }

    console.log(`Executing task: ${issueId}`);

    const issueQuery = `
      query {
        issue(id: "${issueId}") {
          id
          title
          description
          status {
            name
          }
        }
      }

cat > package.json << 'EOF'
{
  "name": "linear-claude-webhook",
  "version": "1.0.0",
  "description": "Webhook server to trigger Claude execution from Linear comments",
  "main": "linear-webhook-server.js",
  "scripts": {
    "start": "node linear-webhook-server.js",
    "dev": "nodemon linear-webhook-server.js"
  },
  "keywords": ["linear", "claude", "webhook"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0"
  },
  "engines": {
    "node": "18.x"
  }
}
