// Core types for Marée

export interface Location {
  lat: number;
  lon: number;
  name?: string;
}

export interface Weather {
  temp: number;
  condition: string;
}

export interface CalendarEvent {
  title: string;
  startTime: string;
  endTime?: string;
}

export interface EntryMetadata {
  id: string;
  createdAt: string;
  location?: Location;
  weather?: Weather;
  calendarContext?: string[];
  moodTag?: string;
  source: 'maree-ios' | 'maree-android';
}

export interface Entry {
  metadata: EntryMetadata;
  body: string;
  voiceTranscript?: string;
}

export interface AIProvider {
  name: string;
  isAvailable: () => Promise<boolean>;
  generate: (prompt: string, context?: string[]) => Promise<string>;
  reflect: (entries: Entry[]) => Promise<Reflection>;
}

export interface Reflection {
  summary: string;
  patterns: PatternObservation[];
  suggestions: string[];
}

export interface PatternObservation {
  type: 'language' | 'mood' | 'topic' | 'temporal';
  description: string;
  confidence: number;
}

export type CaptureMode = 'voice' | 'text' | 'quick';

export interface UserSettings {
  aiTier: 'local' | 'self-hosted' | 'cloud';
  selfHostedUrl?: string;
  cloudApiKey?: string;
  captureMode: CaptureMode;
  sensors: {
    location: boolean;
    calendar: boolean;
    weather: boolean;
  };
  language: 'fr' | 'en' | 'auto';
}
