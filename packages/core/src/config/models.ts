/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Default Ollama models
export const DEFAULT_OLLAMA_MODEL = 'llama3.2:latest';
export const DEFAULT_OLLAMA_LARGE_MODEL = 'llama3.2:70b';
export const DEFAULT_OLLAMA_SMALL_MODEL = 'llama3.2:3b';
export const DEFAULT_OLLAMA_CODE_MODEL = 'codellama:latest';

// Keep Gemini constants for backward compatibility during transition
export const DEFAULT_GEMINI_MODEL = DEFAULT_OLLAMA_MODEL;
export const DEFAULT_GEMINI_FLASH_MODEL = DEFAULT_OLLAMA_SMALL_MODEL;
export const DEFAULT_GEMINI_FLASH_LITE_MODEL = DEFAULT_OLLAMA_SMALL_MODEL;

export const DEFAULT_GEMINI_EMBEDDING_MODEL = 'nomic-embed-text:latest';
