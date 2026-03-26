import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Entry, EntryMetadata, UserSettings, AIProvider} from '../types';

interface MaréeState {
  // Entries
  entries: Entry[];
  addEntry: (entry: Entry) => void;
  updateEntry: (id: string, updates: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  
  // Current capture
  currentCapture: {
    mode: 'voice' | 'text' | null;
    content: string;
    audioUri?: string;
  } | null;
  setCapture: (capture: MaréeState['currentCapture']) => void;
  clearCapture: () => void;
  
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // AI Provider
  currentProvider: AIProvider | null;
  setProvider: (provider: AIProvider) => void;
}

export const useMaréeStore = create<MaréeState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({
        entries: [entry, ...state.entries],
      })),
      updateEntry: (id, updates) => set((state) => ({
        entries: state.entries.map((e) =>
          e.metadata.id === id ? {...e, ...updates} : e
        ),
      })),
      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter((e) => e.metadata.id !== id),
      })),
      
      currentCapture: null,
      setCapture: (capture) => set({currentCapture: capture}),
      clearCapture: () => set({currentCapture: null}),
      
      settings: {
        aiTier: 'local',
        captureMode: 'voice',
        sensors: {
          location: false,
          calendar: false,
          weather: false,
        },
        language: 'auto',
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: {...state.settings, ...newSettings},
      })),
      
      currentProvider: null,
      setProvider: (provider) => set({currentProvider: provider}),
    }),
    {
      name: 'marée-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
