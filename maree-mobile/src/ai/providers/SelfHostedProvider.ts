// Self-hosted AI Provider - Your own Kimi 2.5 endpoint
// For when you have a home server running vLLM or similar

import {AIProvider, Entry, Reflection} from '../../core/types';

interface SelfHostedConfig {
  baseUrl: string; // e.g., "http://192.168.1.100:8000"
  apiKey?: string;
  model?: string;
}

export class SelfHostedProvider implements AIProvider {
  name = 'self-hosted';
  private config: SelfHostedConfig;

  constructor(config: SelfHostedConfig) {
    this.config = config;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, context?: string[]): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'Tu es un assistant de journaling bienveillant. Réponds en français.',
      },
      ...(context?.map((c) => ({role: 'user' as const, content: c})) || []),
      {role: 'user', content: prompt},
    ];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.config.model || 'kimi-2.5',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Self-hosted API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async reflect(entries: Entry[]): Promise<Reflection> {
    const prompt = this.buildReflectionPrompt(entries);
    const response = await this.generate(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return {
        summary: 'Réflexion générée par votre serveur local',
        patterns: [],
        suggestions: [response.slice(0, 500)],
      };
    }
  }

  private buildReflectionPrompt(entries: Entry[]): string {
    const entriesText = entries
      .map((e) => `[${new Date(e.metadata.createdAt).toLocaleDateString('fr-FR')}] ${e.body.slice(0, 200)}`)
      .join('\n\n');

    return `Analyse ces entrées de journal et fournis une réflexion au format JSON:

Entrées:
${entriesText}

Réponds avec ce format exact:
{
  "summary": "résumé général en 1-2 phrases",
  "patterns": [
    {"type": "mood|topic|temporal|language", "description": "...", "confidence": 0.8}
  ],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;
  }
}
