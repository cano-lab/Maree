// Cloud AI Provider - External API integration
// Supports: OpenAI GPT, Anthropic Claude, Google Gemini

import {AIProvider, Entry, Reflection, PatternObservation} from '../../core/types';

interface CloudProviderConfig {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  model?: string;
}

export class CloudProvider implements AIProvider {
  name = 'cloud';
  private config: CloudProviderConfig;

  constructor(config: CloudProviderConfig) {
    this.config = config;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.config.apiKey;
  }

  async generate(prompt: string, context?: string[]): Promise<string> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(prompt, context);
      case 'anthropic':
        return this.callAnthropic(prompt, context);
      default:
        throw new Error(`Provider ${this.config.provider} not implemented`);
    }
  }

  async reflect(entries: Entry[]): Promise<Reflection> {
    const prompt = this.buildReflectionPrompt(entries);
    const response = await this.generate(prompt);
    
    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if parsing fails
      return {
        summary: 'Réflexion générée',
        patterns: [],
        suggestions: [response],
      };
    }
  }

  private async callOpenAI(prompt: string, context?: string[]): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'Tu es un assistant de journaling bienveillant qui aide à la réflexion. Réponds en français.',
      },
      ...(context?.map((c) => ({role: 'user' as const, content: c})) || []),
      {role: 'user', content: prompt},
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callAnthropic(prompt: string, context?: string[]): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${context?.join('\n\n') || ''}\n\n${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
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
