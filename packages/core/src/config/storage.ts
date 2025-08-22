/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'node:path';
import * as os from 'os';
import * as crypto from 'crypto';
import * as fs from 'fs';

export const OLLAMA_DIR = '.ollama';
export const GEMINI_DIR = '.gemini'; // Keep for backwards compatibility
export const GOOGLE_ACCOUNTS_FILENAME = 'google_accounts.json';
const TMP_DIR_NAME = 'tmp';

export class Storage {
  private readonly targetDir: string;

  constructor(targetDir: string) {
    this.targetDir = targetDir;
  }

  static getGlobalOllamaDir(): string {
    const homeDir = os.homedir();
    if (!homeDir) {
      return path.join(os.tmpdir(), '.ollama');
    }
    return path.join(homeDir, OLLAMA_DIR);
  }

  static getGlobalGeminiDir(): string {
    const homeDir = os.homedir();
    if (!homeDir) {
      return path.join(os.tmpdir(), '.gemini');
    }
    return path.join(homeDir, GEMINI_DIR);
  }

  static getMcpOAuthTokensPath(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(
      Storage.getGlobalOllamaDir(),
      'mcp-oauth-tokens.json',
    );
    const geminiPath = path.join(
      Storage.getGlobalGeminiDir(),
      'mcp-oauth-tokens.json',
    );

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  static getGlobalSettingsPath(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(Storage.getGlobalOllamaDir(), 'settings.json');
    const geminiPath = path.join(Storage.getGlobalGeminiDir(), 'settings.json');

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  static getInstallationIdPath(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(
      Storage.getGlobalOllamaDir(),
      'installation_id',
    );
    const geminiPath = path.join(
      Storage.getGlobalGeminiDir(),
      'installation_id',
    );

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  static getGoogleAccountsPath(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(
      Storage.getGlobalOllamaDir(),
      GOOGLE_ACCOUNTS_FILENAME,
    );
    const geminiPath = path.join(
      Storage.getGlobalGeminiDir(),
      GOOGLE_ACCOUNTS_FILENAME,
    );

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  static getUserCommandsDir(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(Storage.getGlobalOllamaDir(), 'commands');
    const geminiPath = path.join(Storage.getGlobalGeminiDir(), 'commands');

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  static getGlobalMemoryFilePath(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(Storage.getGlobalOllamaDir(), 'memory.md');
    const geminiPath = path.join(Storage.getGlobalGeminiDir(), 'memory.md');

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  static getGlobalTempDir(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(Storage.getGlobalOllamaDir(), TMP_DIR_NAME);
    const geminiPath = path.join(Storage.getGlobalGeminiDir(), TMP_DIR_NAME);

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  getOllamaDir(): string {
    return path.join(this.targetDir, OLLAMA_DIR);
  }

  getGeminiDir(): string {
    return path.join(this.targetDir, GEMINI_DIR);
  }

  // Check for .ollama directory first, fall back to .gemini
  getConfigDir(): string {
    const ollamaDir = this.getOllamaDir();
    const geminiDir = this.getGeminiDir();

    if (fs.existsSync(ollamaDir)) {
      return ollamaDir;
    } else if (fs.existsSync(geminiDir)) {
      return geminiDir;
    }
    return ollamaDir; // Default to .ollama for new installations
  }

  getProjectTempDir(): string {
    const hash = this.getFilePathHash(this.getProjectRoot());
    const tempDir = Storage.getGlobalTempDir();
    return path.join(tempDir, hash);
  }

  ensureProjectTempDirExists(): void {
    fs.mkdirSync(this.getProjectTempDir(), { recursive: true });
  }

  static getOAuthCredsPath(): string {
    // Try .ollama first, fall back to .gemini for backwards compatibility
    const ollamaPath = path.join(
      Storage.getGlobalOllamaDir(),
      'oauth_creds.json',
    );
    const geminiPath = path.join(
      Storage.getGlobalGeminiDir(),
      'oauth_creds.json',
    );

    if (fs.existsSync(ollamaPath)) {
      return ollamaPath;
    } else if (fs.existsSync(geminiPath)) {
      return geminiPath;
    }
    return ollamaPath; // Default to .ollama for new installations
  }

  getProjectRoot(): string {
    return this.targetDir;
  }

  private getFilePathHash(filePath: string): string {
    return crypto.createHash('sha256').update(filePath).digest('hex');
  }

  getHistoryDir(): string {
    const hash = this.getFilePathHash(this.getProjectRoot());
    const historyDir = path.join(Storage.getGlobalOllamaDir(), 'history');
    return path.join(historyDir, hash);
  }

  getWorkspaceSettingsPath(): string {
    return path.join(this.getConfigDir(), 'settings.json');
  }

  getProjectCommandsDir(): string {
    return path.join(this.getConfigDir(), 'commands');
  }

  getProjectTempCheckpointsDir(): string {
    return path.join(this.getProjectTempDir(), 'checkpoints');
  }

  getExtensionsDir(): string {
    return path.join(this.getConfigDir(), 'extensions');
  }

  getExtensionsConfigPath(): string {
    return path.join(this.getExtensionsDir(), 'ollama-extension.json');
  }

  getHistoryFilePath(): string {
    return path.join(this.getProjectTempDir(), 'shell_history');
  }
}
