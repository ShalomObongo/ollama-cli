/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ollama } from 'ollama';
import {
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensResponse,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  Content,
  ContentListUnion,
  Part,
  PartUnion,
  FinishReason,
} from '@google/genai';
import { ContentGenerator } from './contentGenerator.js';

export class OllamaContentGenerator implements ContentGenerator {
  private ollama: Ollama;
  private model: string;

  constructor(config: { baseUrl?: string; model: string; apiKey?: string }) {
    const ollamaConfig: Record<string, unknown> = {};

    if (config.baseUrl) {
      ollamaConfig['host'] = config.baseUrl;
    }

    if (config.apiKey) {
      ollamaConfig['headers'] = {
        Authorization: `Bearer ${config.apiKey}`,
      };
    }

    this.ollama = new Ollama(ollamaConfig);
    this.model = config.model;
  }

  async generateContent(
    request: GenerateContentParameters,
    _userPromptId: string,
  ): Promise<GenerateContentResponse> {
    try {
      // Convert Gemini format to Ollama format
      const prompt = this.convertToOllamaPrompt(request.contents);

      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      // Convert Ollama response to Gemini format
      return this.convertToGeminiResponse(response as unknown as Record<string, unknown>);
    } catch (error) {
      throw new Error(
        `Ollama API error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async generateContentStream(
    request: GenerateContentParameters,
    _userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    return (async function* (generator: OllamaContentGenerator) {
      try {
        // Convert Gemini format to Ollama format
        const prompt = generator.convertToOllamaPrompt(request.contents);

        const response = await generator.ollama.chat({
          model: generator.model,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        });

        let buffer = '';
        let lastYieldTime = Date.now();
        const MIN_CHUNK_SIZE = 3; // Minimum characters before yielding
        const MAX_DELAY_MS = 50; // Maximum delay between yields

        for await (const chunk of response) {
          if (chunk.message?.content) {
            buffer += chunk.message.content;

            const currentTime = Date.now();
            const shouldYield =
              buffer.length >= MIN_CHUNK_SIZE ||
              currentTime - lastYieldTime >= MAX_DELAY_MS ||
              chunk.done; // Always yield on final chunk

            if (shouldYield && buffer.length > 0) {
              yield generator.convertToGeminiResponseWithContent(
                buffer,
                Boolean(chunk.done),
              );
              buffer = '';
              lastYieldTime = currentTime;
            }
          }
        }

        // Yield any remaining buffered content
        if (buffer.length > 0) {
          yield generator.convertToGeminiResponseWithContent(buffer, true);
        }
      } catch (error) {
        throw new Error(
          `Ollama API error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    })(this);
  }

  async countTokens(
    request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    try {
      // Ollama doesn't have a direct token counting API, so we'll estimate
      const prompt = this.convertToOllamaPrompt(request.contents);

      // Simple estimation: ~4 characters per token (rough approximation)
      const estimatedTokens = Math.ceil(prompt.length / 4);

      return {
        totalTokens: estimatedTokens,
      };
    } catch (error) {
      throw new Error(
        `Token counting error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async embedContent(
    request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    try {
      // Convert content to string format for embedding
      const text = this.convertToOllamaPrompt(request.contents);

      const response = await this.ollama.embeddings({
        model: request.model || 'nomic-embed-text:latest',
        prompt: text,
      });

      return {
        embeddings: [
          {
            values: response.embedding,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Ollama embedding error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private convertToOllamaPrompt(contents: ContentListUnion): string {
    // Handle different content types
    if (typeof contents === 'string') {
      return contents;
    }

    if (Array.isArray(contents)) {
      if (contents.length === 0) return '';

      // Check if it's an array of Content objects
      if (typeof contents[0] === 'object' && 'parts' in contents[0]) {
        return (contents as Content[])
          .map((content) => this.convertContentToText(content))
          .join('\n');
      } else {
        // Array of PartUnion
        return (contents as PartUnion[])
          .map((part) => this.convertPartToText(part))
          .join(' ');
      }
    }

    // Single Content object
    if (typeof contents === 'object' && 'parts' in contents) {
      return this.convertContentToText(contents as Content);
    }

    // Single PartUnion
    return this.convertPartToText(contents as PartUnion);
  }

  private convertContentToText(content: Content): string {
    if (!content.parts) return '';

    return content.parts.map((part) => this.convertPartToText(part)).join(' ');
  }

  private convertPartToText(part: PartUnion): string {
    if (typeof part === 'string') {
      return part;
    }

    const partObj = part as Part;

    // Handle text parts
    if ('text' in partObj && partObj.text) {
      return partObj.text;
    }

    // Handle inline data (images, etc.)
    if ('inlineData' in partObj && partObj.inlineData) {
      // For now, we'll just indicate that there's media content
      return `[Media content: ${partObj.inlineData.mimeType}]`;
    }

    // Handle file data (URIs)
    if ('fileData' in partObj && partObj.fileData) {
      return `[File: ${partObj.fileData.fileUri}]`;
    }

    // Handle function calls
    if ('functionCall' in partObj && partObj.functionCall) {
      return `[Function call: ${partObj.functionCall.name}]`;
    }

    // Handle function responses
    if ('functionResponse' in partObj && partObj.functionResponse) {
      return `[Function response: ${partObj.functionResponse.name}]`;
    }

    // Handle executable code
    if ('executableCode' in partObj && partObj.executableCode) {
      return `[Code: ${partObj.executableCode.code}]`;
    }

    // Handle code execution results
    if ('codeExecutionResult' in partObj && partObj.codeExecutionResult) {
      return `[Code result: ${partObj.codeExecutionResult.output}]`;
    }

    return '';
  }

  private convertToGeminiResponseWithContent(
    content: string,
    isDone: boolean = false,
  ): GenerateContentResponse {
    let finishReason: FinishReason | undefined;
    if (isDone) {
      finishReason = 'STOP' as FinishReason;
    } else {
      finishReason = undefined; // Still generating
    }

    const responseData = {
      candidates: [
        {
          content: {
            parts: [{ text: content }],
            role: 'model',
          },
          finishReason,
          index: 0,
          safetyRatings: [], // Ollama doesn't provide safety ratings
        },
      ],
      promptFeedback: {
        safetyRatings: [],
      },
    };

    // Create a new GenerateContentResponse instance
    const response = new GenerateContentResponse();
    Object.assign(response, responseData);
    return response;
  }

  private convertToGeminiResponse(
    ollamaResponse: Record<string, unknown>,
  ): GenerateContentResponse {
    const ollamaMessage = ollamaResponse['message'] as Record<string, unknown> | undefined;
    const content =
      ollamaMessage?.['content'] || ollamaResponse['response'] || '';

    let finishReason: FinishReason | undefined;
    if (ollamaResponse['done']) {
      finishReason = 'STOP' as FinishReason;
    } else {
      finishReason = undefined; // Still generating
    }

    const responseData = {
      candidates: [
        {
          content: {
            parts: [{ text: content }],
            role: 'model',
          },
          finishReason,
          index: 0,
          safetyRatings: [], // Ollama doesn't provide safety ratings
        },
      ],
      promptFeedback: {
        safetyRatings: [],
      },
    };

    // Create a new GenerateContentResponse instance
    const response = new GenerateContentResponse();
    Object.assign(response, responseData);
    return response;
  }
}
