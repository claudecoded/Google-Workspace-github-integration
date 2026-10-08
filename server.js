/**
 * Webhook Server & Google Gemini Component Endpoint
 * This file can be hosted on Cloud Run, Vercel, or AWS Lambda to orchestrate 
 * streaming operations, Gemini Extensions API callbacks, and GitHub Webhooks.
 */

const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');

const app = express();
app.use(express.json());

const SCRIPT_ID = process.env.GOOGLE_SCRIPT_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// 1. Google Gemini Extensions Target Endpoint
app.post('/api/gemini/execute', async (req, res) => {
  const { action, repo, fileContent, path, filename } = req.body;
  
  try {
    console.log(`Executing Gemini request for action: ${action}`);
    
    // Setup authenticated access to Google Apps Script API
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://googleapis.com']
    });
    const script = google.script({ version: 'v1', auth });

    // Directly call the Google Apps Script functions over execution API
    const response = await script.scripts.run({
      scriptId: SCRIPT_ID,
      resource: {
        function: action === 'sync' ? 'syncCurrentFileToGit' : 'fetchGitHubIssues',
        parameters: [repo, path, filename, fileContent],
        devMode: true
      }
    });

    return res.status(200).json({ success: true, result: response.data });
  } catch (error) {
    console.error('Gemini Extension Framework Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. GitHub Webhook Listener Endpoint (Triggers Workspace Automations on Push)
app.post('/api/github/webhook', async (req, res) => {
  const event = req.headers['x-github-event'];
  if (event === 'push') {
    const payload = req.body;
    console.log(`Received GitHub push event from repository: ${payload.repository.full_name}`);
    // Code to broadcast or record synchronization actions goes here
  }
  return res.status(200).send('Event logged.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Integration Server mapping live on port ${PORT}`));
