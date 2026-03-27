// Local AI Provider - On-device inference
// Uses ONNX Runtime for React Native with small LLMs (3B parameters)
// Models: Llama 3.2 3B, Qwen 2.5 3B (quantized)

import {AIProvider, Entry, Reflection, PatternObservation} from '../../core/types';

export class LocalProvider implements AIProvider {
  name = 'local';
  private modelLoaded = false;
  private session: any = null; // ONNX session

  async isAvailable(): Promise<boolean> {
    // Check if model files exist in app bundle
    // For now, always return false until implemented
    return false;
  }

  async loadModel(modelPath: string): Promise<void> {
    // TODO: Load ONNX model
    // const ort = require('onnxruntime-react-native');
    // this.session = await ort.InferenceSession.create(modelPath);
    this.modelLoaded = true;
  }

  async generate(prompt: string, context?: string[]): Promise<string> {
    if (!this.modelLoaded) {
      return this.fallbackResponse(prompt);
    }

    // TODO: Tokenize, run inference, decode
    return this.fallbackResponse(prompt);
  }

  async reflect(entries: Entry[]): Promise<Reflection> {
    if (entries.length === 0) {
      return {
        summary: 'Pas encore assez d\'entrées pour une réflexion',
        patterns: [],
        suggestions: ['Commencez à écrire pour voir apparaître des patterns'],
      };
    }

    // Simple pattern detection without AI (for MVP)
    const patterns = this.detectSimplePatterns(entries);

    return {
      summary: `Vous avez écrit ${entries.length} entrées récemment.`,
      patterns,
      suggestions: [
        'Essayez de noter vos pensées le matin',
        'Regardez ce qui ressort comme thème récurrent',
      ],
    };
  }

  private detectSimplePatterns(entries: Entry[]): PatternObservation[] {
    const patterns: PatternObservation[] = [];

    // Mood pattern detection
    const moodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.metadata.moodTag) {
        moodCounts[e.metadata.moodTag] = (moodCounts[e.metadata.moodTag] || 0) + 1;
      }
    });

    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (topMood && topMood[1] >= 2) {
      patterns.push({
        type: 'mood',
        description: `Vous vous sentez souvent "${topMood[0]}" ces derniers temps`,
        confidence: 0.6,
      });
    }

    // Time pattern
    const hourCounts: Record<number, number> = {};
    entries.forEach((e) => {
      const hour = new Date(e.metadata.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (topHour && Number(topHour[1]) >= 2) {
      patterns.push({
        type: 'temporal',
        description: `Vous écrivez souvent vers ${topHour[0]}h`,
        confidence: 0.5,
      });
    }

    return patterns;
  }

  private fallbackResponse(prompt: string): string {
    // Simple keyword-based responses when AI is unavailable
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('résume') || lowerPrompt.includes('summary')) {
      return 'Résumé non disponible sans modèle local chargé.';
    }
    
    if (lowerPrompt.includes('mood') || lowerPrompt.includes('humeur')) {
      return 'Analyse d\'humeur non disponible sans modèle local.';
    }

    return 'Réponse par défaut - le modèle local n\'est pas encore chargé.';
  }
}

// Singleton instance
export const localProvider = new LocalProvider();
