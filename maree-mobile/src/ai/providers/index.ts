// AI Provider abstraction layer

import {AIProvider, Entry, Reflection, PatternObservation} from '../../core/types';

// Tier 1: On-device small model (MVP)
export class LocalProvider implements AIProvider {
  name = 'Local (Llama 3.2 3B)';
  
  async isAvailable(): Promise<boolean> {
    // Check if local model is downloaded and loaded
    // TODO: Implement with onnxruntime-react-native or native bridge
    return false; // Placeholder until model integration
  }
  
  async generate(prompt: string, context?: string[]): Promise<string> {
    // Run inference on device
    // TODO: Implement local inference
    return 'Local model not yet implemented';
  }
  
  async reflect(entries: Entry[]): Promise<Reflection> {
    // Simple pattern detection without heavy LLM
    const patterns = this.detectSimplePatterns(entries);
    
    return {
      summary: `Analyzed ${entries.length} entries`,
      patterns,
      suggestions: ['Keep capturing daily moments'],
    };
  }
  
  private detectSimplePatterns(entries: Entry[]): PatternObservation[] {
    const patterns: PatternObservation[] = [];
    
    // Detect mood word frequency
    const moodWords = ['fine', 'tired', 'good', 'bad', 'stressed', 'calm'];
    const wordCounts: Record<string, number> = {};
    
    entries.forEach((entry) => {
      const text = entry.body.toLowerCase();
      moodWords.forEach((word) => {
        if (text.includes(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });
    
    const frequentWords = Object.entries(wordCounts)
      .filter(([, count]) => count >= 3)
      .map(([word]) => word);
    
    if (frequentWords.length > 0) {
      patterns.push({
        type: 'language',
        description: `Frequent words: ${frequentWords.join(', ')}`,
        confidence: 0.7,
      });
    }
    
    return patterns;
  }
}

// Tier 2: Self-hosted large model (Kimi 2.5, GLM-5)
export class SelfHostedProvider implements AIProvider {
  name = 'Self-Hosted';
  private baseUrl: string;
  private modelName: string;
  
  constructor(baseUrl: string, modelName: string = 'kimi-2.5') {
    this.baseUrl = baseUrl;
    this.modelName = modelName;
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  async generate(prompt: string, context?: string[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          ...(context?.map((c) => ({role: 'system', content: c})) ?? []),
          {role: 'user', content: prompt},
        ],
      }),
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content ?? '';
  }
  
  async reflect(entries: Entry[]): Promise<Reflection> {
    const entriesText = entries
      .map((e) => `[${e.metadata.createdAt}] ${e.body}`)
      .join('\n\n');
    
    const prompt = `Analyze these journal entries and provide:\n1. A brief summary\n2. 2-3 observed patterns (language, mood, or topic)\n3. 2 gentle suggestions for reflection\n\nEntries:\n${entriesText}`;
    
    const response = await this.generate(prompt, [
      'You are a reflective assistant. Be gentle, suggestive, not diagnostic.',
    ]);
    
    // Parse response into structured format
    // TODO: Better parsing or structured output
    return {
      summary: response.slice(0, 200),
      patterns: [],
      suggestions: ['Consider what patterns emerge over time'],
    };
  }
}

// Tier 3: Cloud API (BYO key)
export class CloudProvider implements AIProvider {
  name = 'Cloud (BYO Key)';
  private apiKey: string;
  private provider: 'openai' | 'anthropic';
  
  constructor(apiKey: string, provider: 'openai' | 'anthropic' = 'openai') {
    this.apiKey = apiKey;
    this.provider = provider;
  }
  
  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.startsWith('sk-');
  }
  
  async generate(prompt: string, context?: string[]): Promise<string> {
    const baseUrl = this.provider === 'openai' 
      ? 'https://api.openai.com/v1' 
      : 'https://api.anthropic.com/v1';
    
    // Implementation similar to SelfHostedProvider
    // with appropriate API differences
    return 'Cloud provider not yet implemented';
  }
  
  async reflect(entries: Entry[]): Promise<Reflection> {
    // Similar to SelfHostedProvider but using cloud API
    return {
      summary: 'Cloud reflection not yet implemented',
      patterns: [],
      suggestions: [],
    };
  }
}
