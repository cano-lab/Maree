// useAI hook - React hook for AI interactions

import {useState, useCallback, useEffect} from 'react';
import {useMaréeStore} from '../../core/store';
import {AIProvider, Entry, Reflection} from '../../core/types';
import {LocalProvider, CloudProvider, SelfHostedProvider} from '../providers';

interface UseAIOptions {
  provider?: 'local' | 'cloud' | 'self-hosted';
}

export function useAI(options: UseAIOptions = {}) {
  const settings = useMaréeStore((state) => state.settings);
  const [provider, setProvider] = useState<AIProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider based on settings
  useEffect(() => {
    const providerType = options.provider || settings.aiTier;
    
    let newProvider: AIProvider;
    
    switch (providerType) {
      case 'cloud':
        if (settings.cloudApiKey) {
          newProvider = new CloudProvider({
            provider: 'openai',
            apiKey: settings.cloudApiKey,
          });
        } else {
          setError('Clé API cloud non configurée');
          return;
        }
        break;
        
      case 'self-hosted':
        if (settings.selfHostedUrl) {
          newProvider = new SelfHostedProvider({
            baseUrl: settings.selfHostedUrl,
          });
        } else {
          setError('URL du serveur auto-hébergé non configurée');
          return;
        }
        break;
        
      case 'local':
      default:
        newProvider = new LocalProvider();
        break;
    }
    
    setProvider(newProvider);
    setError(null);
  }, [settings.aiTier, settings.cloudApiKey, settings.selfHostedUrl, options.provider]);

  const generate = useCallback(
    async (prompt: string, context?: string[]): Promise<string> {
      if (!provider) {
        throw new Error('AI provider not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await provider.generate(prompt, context);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  const reflect = useCallback(
    async (entries: Entry[]): Promise<Reflection> {
      if (!provider) {
        throw new Error('AI provider not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await provider.reflect(entries);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  const checkAvailability = useCallback(async (): Promise<boolean> {
    if (!provider) return false;
    return provider.isAvailable();
  }, [provider]);

  return {
    generate,
    reflect,
    checkAvailability,
    isLoading,
    error,
    provider,
  };
}
