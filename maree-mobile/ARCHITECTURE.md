# Marée Mobile Architecture

## Directory Structure

```
src/
├── core/                 # Shared business logic
│   ├── components/       # UI components
│   ├── store/            # State management (Zustand)
│   ├── utils/            # Markdown, date, formatting
│   └── types/            # TypeScript definitions
├── platform/             # Platform-specific bridges
│   ├── ios/              # iOS native modules
│   │   ├── CalendarBridge.ts
│   │   ├── RemindersBridge.ts
│   │   ├── LocationBridge.ts
│   │   └── SpeechBridge.ts
│   └── android/          # Android native modules
│       ├── CalendarBridge.ts
│       ├── LocationBridge.ts
│       └── SpeechBridge.ts
├── ai/                   # AI provider abstraction
│   ├── providers/
│   │   ├── LocalProvider.ts      # On-device 3B model
│   │   ├── SelfHostedProvider.ts # Your future Kimi 2.5
│   │   └── CloudProvider.ts      # BYO API key
│   ├── hooks/
│   │   └── useAI.ts
│   └── models/
│       └── modelManager.ts
└── screens/              # App screens
    ├── HomeScreen.tsx
    ├── CaptureScreen.tsx
    ├── EntryScreen.tsx
    └── SettingsScreen.tsx
```

## Data Flow

1. **Capture**: Voice or text → save to filesystem → index in MMKV
2. **Context**: Platform bridges enrich with calendar/location/weather
3. **Storage**: Markdown files in `Documents/Marée/YYYY/MM/DD-{uuid}.md`
4. **Sync**: iCloud Drive (iOS) / Google Drive (Android)
5. **Reflection**: AI reads entries → suggests patterns → user validates

## AI Tiers

| Tier | Model | Condition | Status |
|------|-------|-----------|--------|
| 1 | Llama 3.2 3B / Qwen 2.5 3B | Always available | **MVP** |
| 2 | Kimi 2.5 / GLM-5 | Home server reachable | Future |
| 3 | OpenAI / Claude | User provides key | Optional |

## Key Libraries

- Storage: `react-native-mmkv` + `react-native-fs`
- Calendar: `react-native-calendar-events`
- Location: `@react-native-community/geolocation`
- Voice: `react-native-audio-recorder-player`
- AI (local): `onnxruntime-react-native` or native bridge
