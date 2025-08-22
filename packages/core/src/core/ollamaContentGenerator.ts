/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OllamaClient,
  OllamaMessage,
  createOllamaClient,
} from './ollamaClient.js';
import { Config } from '../config/config.js';
import { getErrorMessage } from '../utils/errors.js';

/**
 * Simulated types to maintain compatibility with Gemini interfaces
 */
export interface GenerateContentParameters {
  contents: Content[];
  tools?: Tool[];
  systemInstruction?: Content;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

export interface Content {
  parts: Part[];
  role?: 'user' | 'model' | 'system';
}

export interface Part {
  text?: string;
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, unknown>;
  };
  inlineData?: {
    mimeType: string;
    data: string;
  };
  fileData?: {
    mimeType: string;
    fileUri: string;
  };
}

export interface Tool {
  functionDeclarations: FunctionDeclaration[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface GenerateContentResponse {
  candidates?: Candidate[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export interface Candidate {
  content: Content;
  finishReason?: string;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
  citationMetadata?: {
    citationSources?: Array<{
      startIndex?: number;
      endIndex?: number;
      uri?: string;
      license?: string;
    }>;
  };
}

export interface CountTokensParameters {
  contents: Content[];
}

export interface CountTokensResponse {
  totalTokens: number;
}

export interface EmbedContentParameters {
  content: Content;
  taskType?: string;
  title?: string;
}

export interface EmbedContentResponse {
  embedding: {
    values: number[];
  };
}

/**
 * Ollama-based content generator that implements the same interface as Gemini
 */
export class OllamaContentGenerator {
  private client: OllamaClient;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.client = createOllamaClient(config);
  }

  /**
   * Convert Gemini-style content to Ollama messages
   */
  private convertToOllamaMessages(contents: Content[]): OllamaMessage[] {
    const messages: OllamaMessage[] = [];

    for (const content of contents) {
      const role = content.role === 'model' ? 'assistant' : content.role || 'user';
      const textParts = content.parts.filter(part => part.text).map(part => part.text!);
      
      if (textParts.length > 0) {
        messages.push({
          role: role as 'user' | 'assistant' | 'system',
          content: textParts.join('\n'),
        });
      }

      // Handle function calls (convert to text for Ollama)
      const functionCalls = content.parts.filter(part => part.functionCall);
      if (functionCalls.length > 0) {
        const functionCallTexts = functionCalls.map(part => 
          `Function Call: ${part.functionCall!.name}(${JSON.stringify(part.functionCall!.args)})`
        );
        messages.push({
          role: role as 'user' | 'assistant' | 'system',
          content: functionCallTexts.join('\n'),
        });
      }

      // Handle function responses (convert to text for Ollama)
      const functionResponses = content.parts.filter(part => part.functionResponse);
      if (functionResponses.length > 0) {
        const responseTexts = functionResponses.map(part =>
          `Function Response from ${part.functionResponse!.name}: ${JSON.stringify(part.functionResponse!.response)}`
        );
        messages.push({
          role: role as 'user' | 'assistant' | 'system',
          content: responseTexts.join('\n'),
        });
      }
    }

    return messages;
  }

  /**
   * Add system instruction to messages
   */
  private addSystemInstruction(messages: OllamaMessage[], systemInstruction?: Content): OllamaMessage[] {
    if (systemInstruction) {
      const systemText = systemInstruction.parts
        .filter(part => part.text)
        .map(part => part.text!)
        .join('\n');
      
      if (systemText) {
        return [
          { role: 'system', content: systemText },
          ...messages,
        ];
      }
    }
    return messages;
  }

  /**
   * Convert tools to text description for Ollama (since it doesn't have native function calling)
   */
  private convertToolsToText(tools?: Tool[]): string {
    if (!tools || tools.length === 0) {
      return '';
    }

    const toolDescriptions = tools.flatMap(tool =>
      tool.functionDeclarations.map(func => {
        const params = func.parameters
          ? `\nParameters: ${JSON.stringify(func.parameters, null, 2)}`
          : '';
        return `Function: ${func.name}\nDescription: ${func.description}${params}`;
      })
    );

    return toolDescriptions.length > 0
      ? `\nAvailable functions:\n${toolDescriptions.join('\n\n')}\n\nTo call a function, respond with: FUNCTION_CALL:function_name:{"param1": "value1", "param2": "value2"}`
      : '';
  }

  /**
   * Generate content using Ollama
   */
  async generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse> {
    try {
      let messages = this.convertToOllamaMessages(request.contents);
      messages = this.addSystemInstruction(messages, request.systemInstruction);

      // Add tool descriptions to the last user message
      const toolsText = this.convertToolsToText(request.tools);
      if (toolsText && messages.length > 0 && messages[messages.length - 1].role === 'user') {
        messages[messages.length - 1].content += toolsText;
      }

      const response = await this.client.chat(messages);

      // Convert back to Gemini-style response
      const candidate: Candidate = {
        content: {
          parts: [{ text: response }],
          role: 'model',
        },
        finishReason: 'STOP',
      };

      return {
        candidates: [candidate],
        usageMetadata: {
          totalTokenCount: this.estimateTokenCount(response),
        },
      };
    } catch (error) {
      throw new Error(`Ollama generation failed: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Generate streaming content using Ollama
   */
  async* generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): AsyncGenerator<GenerateContentResponse> {
    try {
      let messages = this.convertToOllamaMessages(request.contents);
      messages = this.addSystemInstruction(messages, request.systemInstruction);

      // Add tool descriptions to the last user message
      const toolsText = this.convertToolsToText(request.tools);
      if (toolsText && messages.length > 0 && messages[messages.length - 1].role === 'user') {
        messages[messages.length - 1].content += toolsText;
      }

      for await (const chunk of this.client.chatStream(messages)) {
        const candidate: Candidate = {
          content: {
            parts: [{ text: chunk }],
            role: 'model',
          },
        };

        yield {
          candidates: [candidate],
        };
      }

      // Final response to indicate completion
      yield {
        candidates: [{
          content: {
            parts: [{ text: '' }],
            role: 'model',
          },
          finishReason: 'STOP',
        }],
      };
    } catch (error) {
      throw new Error(`Ollama streaming generation failed: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Count tokens (estimated for Ollama)
   */
  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    // Since Ollama doesn't have a direct token counting API, 
    // we'll estimate based on text length
    const totalText = request.contents
      .flatMap(content => content.parts)
      .filter(part => part.text)
      .map(part => part.text!)
      .join(' ');

    const estimatedTokens = this.estimateTokenCount(totalText);
    
    return {
      totalTokens: estimatedTokens,
    };
  }

  /**
   * Embed content (not supported by Ollama API - return mock response)
   */
  async embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    // Ollama doesn't support embeddings in the same way Gemini does
    // Return a mock response or throw an error
    throw new Error('Embedding is not supported with Ollama. Use a dedicated embedding model.');
  }

  /**
   * Estimate token count based on text length
   * Rough approximation: 1 token ≈ 4 characters
   */
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.client.getModel();
  }

  /**
   * Check if model is available
   */
  async isModelAvailable(): Promise<boolean> {
    return this.client.isModelAvailable();
  }
}

/**
 * Factory function to create Ollama content generator
 */
export function createOllamaContentGenerator(config: Config): OllamaContentGenerator {
  return new OllamaContentGenerator(config);
}