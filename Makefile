# Makefile for GitHub Google Workspace Integration
# Provides cross-platform automation commands for end-users.

.PHONY: setup push deploy clean help

help:
	@echo "========================================================================"
	@echo " GitHub Google Workspace Integration - Automation Toolkit"
	@echo "========================================================================"
	@echo " Available commands:"
	@echo "  make setup   - Installs Google clasp framework globally and authenticates"
	@echo "  make deploy  - Automatically structures the build directory and pushes code"
	@echo "  make clean   - Removes local build artifacts and temporary directories"
	@echo "========================================================================"

setup:
	@echo "Installing Google @google/clasp toolchain globally..."
	npm install -g @google/clasp
	@echo "Triggering Google cloud authentication workflow..."
	clasp login

deploy:
	@echo "Structuring deployment environment components..."
	mkdir -p src
	@cp -v appsscript.json src/ 2>/dev/null || true
	@cp -v Code.gs src/ 2>/dev/null || true
	@cp -v Sidebar.html src/ 2>/dev/null || true
	@echo "Initializing production Google Apps Script Manifest container..."
	clasp create --title "GitHub Workspace Integration" --rootDir "./src" --type sheets
	@echo "Pushing code artifacts to Google Cloud Space..."
	clasp push
	@echo "Deployment successfully executed. Ready for usage in Google Workspace Context."

clean:
	@echo "Cleaning compiled workspace distribution files..."
	rm -rf src/
	rm -f .clasp.json
	@echo "Cleanup completed successfully."
