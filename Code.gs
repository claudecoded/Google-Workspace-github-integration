/**
 * GitHub Integration for Google Workspace
 * Comprehensive Apps Script codebase for an Add-on integrating GitHub across Workspace apps.
 * File: Code.gs
 */

const GITHUB_API_URL = 'https://github.com';

/**
 * OnOpen trigger for Google Sheets, Docs, Slides, and Forms.
 */
function onOpen(e) {
  createMenu();
}

/**
 * Create custom menu in the active Google App.
 */
function createMenu() {
  const ui = getAppUi();
  if (!ui) return;
  
  ui.createMenu('GitHub Sync')
    .addItem('Open Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('Sync Current File to Repository', 'syncCurrentFileToGit')
    .addItem('Check Repository Issues', 'fetchGitHubIssues')
    .addToUi();
}

/**
 * Helper to get the correct UI depending on the host application context.
 */
function getAppUi() {
  try { return DocumentApp.getUi(); } catch(e) {}
  try { return SpreadsheetApp.getUi(); } catch(e) {}
  try { return SlidesApp.getUi(); } catch(e) {}
  try { return FormApp.getUi(); } catch(e) {}
  return null;
}

/**
 * Display the Sidebar UI.
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('GitHub Integration')
      .setWidth(300);
  
  const ui = getAppUi();
  if (ui) {
    ui.showSidebar(html);
  } else {
    return createCardLayout();
  }
}

/**
 * Basic Card builder for non-sidebar contexts (Google Drive, Gmail, Vids).
 */
function createCardLayout() {
  if (typeof CardService === 'undefined') return;
  
  const card = CardService.newCardBuilder();
  const header = CardService.newCardHeader().setTitle('GitHub Workspace Integration');
  
  const section = CardService.newCardSection()
    .setHeader('Repository Actions')
    .addWidget(CardService.newTextParagraph().setText('Sync documents, view issues, and manage commits directly from Google Workspace.'))
    .addWidget(CardService.newTextButton()
      .setText('Sync to GitHub')
      .setOnClickAction(CardService.newAction().setFunctionName('syncCurrentFileToGit')));
      
  card.setHeader(header).addSection(section);
  return card.build();
}

/**
 * Returns GitHub authorization headers using stored Script Properties.
 */
function getGitHubHeaders() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('GITHUB_TOKEN');
  if (!token) {
    throw new Error('GitHub Personal Access Token (GITHUB_TOKEN) is not configured in Script Properties.');
  }
  return {
    'Authorization': 'token ' + token,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Google-Workspace-GitHub-Integration-Addon'
  };
}

/**
 * Fetches issues from the configured GitHub repository.
 */
function fetchGitHubIssues() {
  const props = PropertiesService.getScriptProperties();
  const repo = props.getProperty('GITHUB_REPO'); // Expected format: "owner/repo"
  if (!repo) throw new Error('GITHUB_REPO property is missing.');

  const url = `${GITHUB_API_URL}/repos/${repo}/issues?state=open`;
  const options = {
    'method': 'get',
    'headers': getGitHubHeaders(),
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    throw new Error('Failed to fetch GitHub issues: ' + response.getContentText());
  }
  return JSON.parse(response.getContentText());
}

/**
 * Core Synchronization Engine: Detects host app data, formats content, and pushes to Git.
 */
function syncCurrentFileToGit() {
  const props = PropertiesService.getScriptProperties();
  const repo = props.getProperty('GITHUB_REPO');
  if (!repo) return 'Error: Please configure GITHUB_REPO script property.';
  
  let content = '';
  let filename = '';
  const activeApp = getActiveAppContext();

  try {
    if (activeApp === 'Docs') {
      const doc = DocumentApp.getActiveDocument();
      filename = doc.getName() + '.md';
      content = doc.getBody().getText();
    } else if (activeApp === 'Sheets') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet();
      filename = sheet.getName() + '.csv';
      content = convertSheetToCsv(sheet.getActiveSheet());
    } else if (activeApp === 'Slides') {
      const presentation = SlidesApp.getActivePresentation();
      filename = presentation.getName() + '.txt';
      content = presentation.getSlides().map((slide, i) => `--- Slide ${i+1} ---\n` + slide.getNotesPage().getNotesBody().getText()).join('\n\n');
    } else {
      return 'Context not directly supported for auto-serialization. Try manual export.';
    }

    const path = 'workspace-sync/' + filename;
    const sha = getFileSha(repo, path);
    
    const payload = {
      message: 'Syncing updates from Google Workspace',
      content: Utilities.base64Encode(content, Utilities.Charset.UTF_8),
      branch: props.getProperty('GITHUB_BRANCH') || 'main'
    };
    if (sha) payload.sha = sha;

    const url = `${GITHUB_API_URL}/repos/${repo}/contents/${path}`;
    const options = {
      method: 'put',
      headers: getGitHubHeaders(),
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200 || res.getResponseCode() === 201) {
      return 'Successfully synchronized to path: ' + path;
    } else {
      return 'Sync error: ' + res.getContentText();
    }
  } catch(e) {
    return 'Execution failure: ' + e.toString();
  }
}

function getActiveAppContext() {
  try { if (DocumentApp.getActiveDocument()) return 'Docs'; } catch(e) {}
  try { if (SpreadsheetApp.getActiveSpreadsheet()) return 'Sheets'; } catch(e) {}
  try { if (SlidesApp.getActivePresentation()) return 'Slides'; } catch(e) {}
  return 'Drive';
}

function getFileSha(repo, path) {
  const url = `${GITHUB_API_URL}/repos/${repo}/contents/${path}`;
  const options = { method: 'get', headers: getGitHubHeaders(), muteHttpExceptions: true };
  const res = UrlFetchApp.fetch(url, options);
  if (res.getResponseCode() === 200) {
    return JSON.parse(res.getContentText()).sha;
  }
  return null;
}

function convertSheetToCsv(sheet) {
  const data = sheet.getDataRange().getValues();
  return data.map(row => row.map(cell => {
    let str = cell.toString();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }).join(',')).join('\n');
}
