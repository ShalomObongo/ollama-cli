# Ollama CLI - Local Development Setup Guide

This guide provides detailed step-by-step instructions for setting up the Ollama CLI project locally, from cloning the repository to having it running in development mode.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Building the Project](#building-the-project)
- [Running the CLI](#running-the-cli)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** 
   - **Development**: Node.js `~20.19.0` (specific version required due to upstream dependency issues)
   - **Production**: Any version `>=20.0.0` works for running the built CLI
   - **Recommendation**: Use [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) to manage Node versions

2. **Git** 
   - Any recent version for cloning and version control

3. **npm** 
   - Comes bundled with Node.js
   - Version 9+ recommended for workspace support

### Optional (Recommended)

4. **Ollama** 
   - Install [Ollama](https://ollama.ai/download) for local AI model support
   - Required for the default authentication method (`USE_OLLAMA`)

5. **Docker or Podman** (Optional)
   - For container-based sandboxing
   - Only needed if you want to use sandboxed execution

### System Requirements

- **Operating System**: macOS, Linux, or Windows
- **Memory**: 4GB+ RAM recommended
- **Storage**: 1GB+ free space for dependencies and build artifacts

## Quick Start

For experienced developers who want to get up and running quickly:

```bash
# Clone the repository
git clone https://github.com/ShalomObongo/ollama-cli.git
cd ollama-cli

# Install Node.js 20.19.0 (if using nvm)
nvm install 20.19.0
nvm use 20.19.0

# Install dependencies
npm install

# Build the project
npm run build

# Start the CLI
npm start
```

## Detailed Setup

### Step 1: Install Node.js

#### Using Node Version Manager (Recommended)

**On macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or run:
source ~/.bashrc

# Install and use Node.js 20.19.0
nvm install 20.19.0
nvm use 20.19.0
nvm alias default 20.19.0
```

**On Windows:**
```bash
# Install nvm-windows from: https://github.com/coreybutler/nvm-windows
# Then run:
nvm install 20.19.0
nvm use 20.19.0
```

#### Direct Installation

Alternatively, download Node.js 20.19.0 directly from the [official website](https://nodejs.org/).

### Step 2: Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v20.19.0

# Check npm version
npm --version
# Should output: 10.x.x or higher
```

### Step 3: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/ShalomObongo/ollama-cli.git

# Navigate to the project directory
cd ollama-cli

# Verify you're in the right directory
ls -la
# Should see package.json, README.md, packages/, etc.
```

### Step 4: Install Dependencies

```bash
# Install all dependencies (root + workspaces)
npm install

# This will:
# - Install root dependencies
# - Install dependencies for all packages in packages/*
# - Set up workspaces properly
```

**Expected output:** You should see dependency installation for the root project and each workspace (cli, core, test-utils, vscode-ide-companion).

## Building the Project

The Ollama CLI uses a multi-package architecture with several build options:

### Option 1: Basic Build (Recommended for Development)

```bash
# Build all packages
npm run build

# This compiles TypeScript and prepares all packages
```

### Option 2: Complete Build (Includes Sandbox)

```bash
# Build everything including sandbox container
npm run build:all

# This includes:
# - All packages (npm run build)
# - Sandbox container for secure execution
# - VS Code companion extension
```

### Option 3: Bundle for Distribution

```bash
# Create a standalone bundle
npm run bundle

# This creates:
# - bundle/ollama-cli.js (standalone executable)
# - All necessary assets
```

### Build Verification

After building, verify the build was successful:

```bash
# Check build output
ls -la packages/cli/dist/
ls -la packages/core/dist/

# If you ran npm run bundle:
ls -la bundle/
```

## Running the CLI

### Method 1: Development Mode (Recommended)

```bash
# Start from source (after npm run build)
npm start

# This runs the CLI in development mode with:
# - Hot reloading capabilities
# - Debug information
# - Development environment variables
```

### Method 2: Direct Execution

```bash
# Run the built CLI directly
node packages/cli/dist/ollama-cli.js

# Or if you created a bundle:
node bundle/ollama-cli.js
```

### Method 3: Global Installation (For Testing)

```bash
# Link the local build globally
npm link

# Now you can run from anywhere:
ollama-cli

# To unlink later:
npm unlink -g ollama-cli
```

### Initial CLI Setup

When you first run the CLI, it will prompt you to choose an authentication method:

1. **Local Ollama** (Default - Recommended)
   - Requires Ollama to be installed and running locally
   - No API keys needed
   - Complete privacy - nothing leaves your machine

2. **Ollama with API Key**
   - For hosted Ollama instances
   - Set `OLLAMA_API_KEY` and optionally `OLLAMA_BASE_URL`

3. **Legacy Gemini/Google** (Backward Compatibility)
   - For existing users with Gemini API keys
   - Set `GEMINI_API_KEY` or `GOOGLE_API_KEY`

### Setting Up Ollama (Recommended)

```bash
# Install Ollama (macOS)
brew install ollama

# Or download from https://ollama.ai/download

# Start Ollama service
ollama serve

# Pull a model (in another terminal)
ollama pull llama3.2

# Verify it's working
ollama list
```

## Development Workflow

### Code Quality Checks

Before making changes, run the full preflight check:

```bash
# Run all checks (lint, test, build, typecheck)
npm run preflight

# This is equivalent to:
npm run clean && npm ci && npm run format && npm run lint:ci && npm run build && npm run typecheck && npm run test:ci
```

### Individual Commands

```bash
# Formatting
npm run format

# Linting
npm run lint
npm run lint:fix  # Auto-fix issues

# Type checking
npm run typecheck

# Building
npm run build
npm run build:all

# Testing
npm run test
npm run test:ci
npm run test:e2e
```

### Development with Live Reload

```bash
# Start in development mode with debugging
npm run debug

# Start with React DevTools support
DEV=true npm start

# Build and start together
npm run build-and-start
```

### Git Hooks (Optional but Recommended)

Set up a pre-commit hook to ensure code quality:

```bash
# Create pre-commit hook
echo '#!/bin/sh
if ! npm run preflight; then
  echo "Preflight checks failed. Commit aborted."
  exit 1
fi' > .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests for specific package
npm run test --workspace=packages/cli
npm run test --workspace=packages/core
```

### Integration Tests

```bash
# Run end-to-end tests
npm run test:e2e

# Run all integration test types
npm run test:integration:all

# Run with different sandbox options
npm run test:integration:sandbox:none
npm run test:integration:sandbox:docker
npm run test:integration:sandbox:podman
```

### Test Configuration

Integration tests require an API key. For local testing:

```bash
# Set environment variable for tests
export GEMINI_API_KEY="your-api-key-here"

# Or create a .env file in the root:
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

## Debugging

### VS Code Debugging

1. **Interactive Debugging**: Press `F5` in VS Code to start debugging
2. **Debug Mode**: Run `npm run debug` and attach VS Code debugger
3. **Launch Configuration**: Use the configurations in `.vscode/launch.json`

### React DevTools (For UI Debugging)

```bash
# Start CLI with React DevTools support
DEV=true npm start

# In another terminal, start React DevTools
npx react-devtools@4.28.5
```

### Sandbox Debugging

```bash
# Debug with sandbox enabled
DEBUG=1 ollama-cli

# Or set in environment
export DEBUG=1
npm start
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clean and reinstall dependencies
npm run clean
npm install
npm run build
```

#### Issue: Node.js version conflicts

**Solution:**
```bash
# Check current version
node --version

# Switch to correct version (if using nvm)
nvm use 20.19.0

# Or install the correct version
nvm install 20.19.0
nvm use 20.19.0
```

#### Issue: Build failures

**Solution:**
```bash
# Clean build cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### Issue: CLI won't start - "Ollama not found"

**Solution:**
```bash
# Install Ollama
# macOS: brew install ollama
# Or visit: https://ollama.ai/download

# Start Ollama service
ollama serve

# Pull a model
ollama pull llama3.2

# Or use alternative authentication
export GEMINI_API_KEY="your-key"
npm start
```

#### Issue: Permission denied on Linux/macOS

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use a Node version manager like nvm
```

#### Issue: Tests failing with authentication errors

**Solution:**
```bash
# Set test API key
export GEMINI_API_KEY="your-test-api-key"

# Or create .env file
echo "GEMINI_API_KEY=your-test-api-key" > .env

# Run tests
npm run test
```

#### Issue: Bundle not found

**Solution:**
```bash
# Create bundle
npm run bundle

# Verify bundle exists
ls -la bundle/ollama-cli.js
```

### Getting Help

If you encounter issues not covered here:

1. **Check existing issues**: [GitHub Issues](https://github.com/ShalomObongo/ollama-cli/issues)
2. **Create a new issue**: Provide detailed error messages and system info
3. **Review documentation**: Check the [docs/](./docs/) directory for specific topics
4. **Use the `/bug` command**: Report issues directly from the CLI

### System Information for Bug Reports

When reporting issues, include this information:

```bash
# System info
node --version
npm --version
git --version

# OS information
uname -a  # Linux/macOS
# or
systeminfo  # Windows

# Project info
cd ollama-cli
git status
git log --oneline -5
npm ls --depth=0
```

---

## Next Steps

After successfully setting up the development environment:

1. **Read the documentation**: Explore the [docs/](./docs/) directory
2. **Review the architecture**: Check [docs/architecture.md](./docs/architecture.md)
3. **Understand the codebase**: See [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **Try the examples**: Follow the examples in [README.md](./README.md)
5. **Join development**: Read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

## Helpful Commands Reference

```bash
# Development lifecycle
npm install          # Install dependencies
npm run build        # Build all packages
npm start           # Start CLI in dev mode
npm run test        # Run tests
npm run preflight   # Full quality check

# Bundling and distribution
npm run bundle      # Create standalone bundle
npm run prepare     # Prepare for publishing

# Code quality
npm run format      # Format code
npm run lint        # Check linting
npm run typecheck   # Type checking

# Debugging
npm run debug       # Start with debugger
DEV=true npm start  # Start with React DevTools

# Cleaning
npm run clean       # Clean build artifacts
```

Happy coding! 🚀