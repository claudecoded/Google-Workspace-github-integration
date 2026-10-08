# GitHub Integration for Google Workspace (Docs, Sheets, Slides, Vids, Gemini)

This enterprise-grade open-source integration merges GitHub management pipelines straight into the Google Workspace interface ecosystem. Authors, reviewers, and engineering teams can commit tracking code, serialize workspace files into raw file system branches, and synchronize repository lifecycle loops.

## Core Architectural Layout
* `src/Code.gs` - Microservice handler processing Workspace runtime state maps and GitHub API connections.
* `src/Sidebar.html` - Core HTML5/CSS Add-on application display layout for workspace sidebar integration.
* `src/appsscript.json` - Security definitions file establishing proper scopes for Google API authorizations.
* `server.js` - Production middleware server providing endpoints for Gemini Extensions API routing and GitHub Webhooks.

## Getting Started (For End Users)

### Prerequisites
Before running automation configurations, ensure you have the following components installed on your local operating environment:
1. **Node.js (LTS version)** & **NPM package manager** (Download from [nodejs.org](https://nodejs.org)).
2. A valid **Google Workspace / Gmail Account** with adequate cloud storage capacity available.
3. A **GitHub Personal Access Token (PAT)** generated via GitHub Settings with full `repo` visibility access privileges.

### Deployment Walkthrough

#### Step 1: Initialize System Toolchain
Clone this repository locally, navigate to the target directory inside your terminal command interface, and run:
```bash
make setup
```
*Note: A browser routing window will open instantly. Provide full authorization scopes for your target Google account credentials.*

#### Step 2: Push Applications to the Cloud Environment
Execute the build sequence pipeline deployment script by processing:
```bash
make deploy
```
This automated task securely maps your files to a cloud deployment instance inside your Google developer repository profile.

#### Step 3: Configure Project Execution Properties
1. Navigate directly to your newly created Google Apps Script management console interface.
2. Select **Project Settings** (Gear icon inside the navigation column menu layout).
3. Access the **Script Properties** dashboard layout block and supply the configuration variables:
   * `GITHUB_TOKEN`: *[Your Personal Access Security Token]*
   * `GITHUB_REPO`: *[Your Account Name/Target Project Name, e.g., octocat/hello-world]*
   * `GITHUB_BRANCH`: *[main]*
4. Refresh your Google sheet, doc, or presentation window view canvas layout. The operational **GitHub Sync** top container dropdown bar is immediately deployed and live!

### Troubleshooting & Technical Architecture Constraints
* **Storage Allocation Errors:** If you experience operational write execution limits or storage allocation errors during deployment steps, review storage bounds at `://google.com` to ensure quota compliance constraints are not exceeded.

## Why does this structure ensure it will work for anyone who clones the repository?

1. Standardization via Makefile: Mac and Linux users can run the commands natively. Windows users can utilize the Git Bash terminal or WSL, avoiding syntax issues associated with .bat or .sh files.
2. Environment Independence: The core code files (Code.gs and Sidebar.html) remain intact and properly assigned within the official Google manifest. The repository now self-configures as soon as the user runs the make commands.
