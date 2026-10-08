#!/bin/bash
# Complete Setup and Deployment Script for GitHub Google Workspace Integration
# This script automates installing clasp, authenticating, and pulling/pushing code.

echo "=== Initializing GitHub Google Workspace Integration Setup ==="

# Check for Node.js and NPM
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Error: Node.js and NPM are required to run Google CLASP. Please install them first."
    exit 1
fi

echo "1. Installing Google @google/clasp globally..."
npm install -g @google/clasp

echo "2. Logging into your Google Account via CLASP..."
echo "Please follow the instructions in your browser to authorize access."
clasp login

echo "3. Would you like to (C)reate a new Apps Script project or (C)lone an existing one? [c/l]"
read -r choice

if [[ "$choice" =~ ^[Cc]$ ]]; then
    echo "Creating new script project..."
    clasp create --title "GitHub Workspace Integration" --rootDir "./src"
else
    echo "Enter your existing Script ID (found in Apps Script Project Settings):"
    read -r script_id
    clasp clone "$script_id" --rootDir "./src"
fi

echo "4. Structuring directory layout..."
mkdir -p src
mv -v appsscript.json src/ 2>/dev/null || true
mv -v Code.gs src/ 2>/dev/null || true
mv -v Sidebar.html src/ 2>/dev/null || true

echo "5. Pushing all codebase elements straight to Google Cloud ecosystem..."
clasp push

echo "=== Setup complete! Your integration is live in your Google Workspace Development Space ==="
