# Ollama CLI

A powerful command-line interface for interacting with Ollama models. Originally based on Google's Gemini CLI, this tool has been transformed to work seamlessly with Ollama's local and remote model deployment.

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)
[![Version](https://img.shields.io/npm/v/@google/gemini-cli)](https://www.npmjs.com/package/@google/gemini-cli)
[![License](https://img.shields.io/github/license/google-gemini/gemini-cli)](https://github.com/google-gemini/gemini-cli/blob/main/LICENSE)

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

Gemini CLI is an open-source AI agent that brings the power of Gemini directly into your terminal. It provides lightweight access to Gemini, giving you the most direct path from your prompt to our model.

## 🚀 Why Gemini CLI?

- **🎯 Free tier**: 60 requests/min and 1,000 requests/day with personal Google account
- **🧠 Powerful Gemini 2.5 Pro**: Access to 1M token context window
- **🔧 Built-in tools**: Google Search grounding, file operations, shell commands, web fetching
- **🔌 Extensible**: MCP (Model Context Protocol) support for custom integrations
- **💻 Terminal-first**: Designed for developers who live in the command line
- **🛡️ Open source**: Apache 2.0 licensed

## 📦 Installation

### Quick Install

#### Run instantly with npx

```bash
# Using npx (no installation required)
npx https://github.com/google-gemini/gemini-cli
```

#### Install globally with npm

```bash
npm install -g @google/gemini-cli
```

#### Install globally with Homebrew (macOS/Linux)

```bash
brew install gemini-cli
```

#### System Requirements

- Node.js version 20 or higher
- macOS, Linux, or Windows

## Release Cadence and Tags

See [Releases](./docs/releases.md) for more details.

### Preview

New preview releases will be published each week at UTC 2359 on Tuesdays. These releases will not have been fully vetted and may contain regressions or other outstanding issues. Please help us test and install with `preview` tag.

```bash
npm install -g @google/gemini-cli@preview
```

### Stable

- New stable releases will be published each week at UTC 2000 on Tuesdays, this will be the full promotion of last week's `preview` release + any bug fixes and validations. Use `latest` tag.

```bash
npm install -g @google/gemini-cli@latest
```

### Nightly

- New releases will be published each week at UTC 0000 each day, This will be all changes from the main branch as represented at time of release. It should be assumed there are pending validations and issues. Use `nightly` tag.

```bash
npm install -g @google/gemini-cli@nightly
```

## 📋 Key Features

### Code Understanding & Generation

- Query and edit large codebases
- Generate new apps from PDFs, images, or sketches using multimodal capabilities
- Debug issues and troubleshoot with natural language

### Automation & Integration

- Automate operational tasks like querying pull requests or handling complex rebases
- Use MCP servers to connect new capabilities, including [media generation with Imagen, Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Run non-interactively in scripts for workflow automation

### Advanced Capabilities

- Conversation checkpointing to save and resume complex sessions
- Custom context files (OLLAMA.md) to tailor behavior for your projects
- Support for multiple Ollama models with easy switching
- Local and remote Ollama deployment support

### GitHub Integration

Integrate Ollama CLI directly into your GitHub workflows:

- **Pull Request Reviews**: Automated code review with contextual feedback and suggestions
- **Issue Triage**: Automated labeling and prioritization of GitHub issues based on content analysis  
- **Custom Workflows**: Build automated, scheduled and on-demand workflows tailored to your team's needs

## 🔐 Authentication Options

Choose the authentication method that best fits your needs:

### Option 1: Local Ollama (Recommended)

**✨ Best for:** Developers who want full control over their AI models and data privacy.

**Benefits:**

- **Completely local**: Your code and conversations never leave your machine
- **Multiple models**: Choose from llama3.2, codellama, and many other models
- **No API keys required** - works with local Ollama installation
- **Fast responses** with locally hosted models

#### Start Ollama CLI with local authentication

```bash
ollama-cli
```

### Option 2: Ollama with API Key

**✨ Best for:** Teams using hosted Ollama deployments or Ollama cloud services.

**Setup:**

```bash
# Set your Ollama API key
export OLLAMA_API_KEY="your-api-key"
export OLLAMA_BASE_URL="https://your-ollama-instance.com"  # Optional, defaults to localhost

ollama-cli
```

### Option 3: Google/Gemini Compatibility (Legacy)

For backwards compatibility, you can still use Gemini authentication methods:

```bash
# Gemini API Key
export GEMINI_API_KEY="YOUR_API_KEY"
ollama-cli

# Or Google Cloud/Vertex AI
export GOOGLE_API_KEY="YOUR_API_KEY"
export GOOGLE_GENAI_USE_VERTEXAI=true
ollama-cli
```

For more authentication options, see the [authentication guide](./docs/cli/authentication.md).

## 🚀 Getting Started

### Basic Usage

#### Start in current directory

```bash
ollama-cli
```

#### Include multiple directories

```bash
ollama-cli --include-directories ../lib,../docs
```

#### Use specific model

```bash
ollama-cli -m llama3.2:latest
```

#### Non-interactive mode for scripts

```bash
ollama-cli -p "Explain the architecture of this codebase"
```

### Quick Examples

#### Start a new project

```bash
cd new-project/
ollama-cli
> Write me a Discord bot that answers questions using a FAQ.md file I will provide
```

#### Analyze existing code

```bash
git clone https://github.com/your-repo/project
cd project
ollama-cli
> Give me a summary of all of the changes that went in yesterday
```

## 📚 Documentation

### Getting Started

- [**Quickstart Guide**](./docs/cli/index.md) - Get up and running quickly
- [**Authentication Setup**](./docs/cli/authentication.md) - Detailed auth configuration
- [**Configuration Guide**](./docs/cli/configuration.md) - Settings and customization
- [**Keyboard Shortcuts**](./docs/keyboard-shortcuts.md) - Productivity tips

### Core Features

- [**Commands Reference**](./docs/cli/commands.md) - All slash commands (`/help`, `/chat`, `/mcp`, etc.)
- [**Checkpointing**](./docs/checkpointing.md) - Save and resume conversations
- [**Memory Management**](./docs/tools/memory.md) - Using GEMINI.md context files
- [**Token Caching**](./docs/cli/token-caching.md) - Optimize token usage

### Tools & Extensions

- [**Built-in Tools Overview**](./docs/tools/index.md)
  - [File System Operations](./docs/tools/file-system.md)
  - [Shell Commands](./docs/tools/shell.md)
  - [Web Fetch & Search](./docs/tools/web-fetch.md)
  - [Multi-file Operations](./docs/tools/multi-file.md)
- [**MCP Server Integration**](./docs/tools/mcp-server.md) - Extend with custom tools
- [**Custom Extensions**](./docs/extension.md) - Build your own commands

### Advanced Topics

- [**Architecture Overview**](./docs/architecture.md) - How Ollama CLI works
- [**IDE Integration**](./docs/ide-integration.md) - VS Code companion
- [**Sandboxing & Security**](./docs/sandbox.md) - Safe execution environments
- [**Enterprise Deployment**](./docs/deployment.md) - Docker, system-wide config
- [**Telemetry & Monitoring**](./docs/telemetry.md) - Usage tracking
- [**Tools API Development**](./docs/core/tools-api.md) - Create custom tools

### Configuration & Customization

- [**Settings Reference**](./docs/cli/configuration.md) - All configuration options
- [**Theme Customization**](./docs/cli/themes.md) - Visual customization
- [**.ollama Directory**](./docs/ollama-ignore.md) - Project-specific settings
- [**Environment Variables**](./docs/cli/configuration.md#environment-variables)

### Troubleshooting & Support

- [**Troubleshooting Guide**](./docs/troubleshooting.md) - Common issues and solutions
- [**FAQ**](./docs/troubleshooting.md#frequently-asked-questions) - Quick answers
- Use `/bug` command to report issues directly from the CLI

### Using MCP Servers

Configure MCP servers in `~/.ollama/settings.json` to extend Ollama CLI with custom tools:

```text
> @github List my open pull requests
> @slack Send a summary of today's commits to #dev channel
> @database Run a query to find inactive users
```

See the [MCP Server Integration guide](./docs/tools/mcp-server.md) for setup instructions.

## 🤝 Contributing

We welcome contributions! Ollama CLI is fully open source (Apache 2.0), and we encourage the community to:

- Report bugs and suggest features
- Improve documentation
- Submit code improvements
- Share your MCP servers and extensions

See our [Contributing Guide](./CONTRIBUTING.md) for development setup, coding standards, and how to submit pull requests.

## 📖 Resources

- **[GitHub Repository](https://github.com/ShalomObongo/ollama-cli)** - Source code and issues
- **[GitHub Issues](https://github.com/ShalomObongo/ollama-cli/issues)** - Report bugs or request features
- **[Security Advisories](https://github.com/ShalomObongo/ollama-cli/security/advisories)** - Security updates

### Uninstall

See the [Uninstall Guide](docs/Uninstall.md) for removal instructions.

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Terms of Service**: [Terms & Privacy](./docs/tos-privacy.md)
- **Security**: [Security Policy](SECURITY.md)

---

<p align="center">
  Built with ❤️ for the Ollama community
</p>
