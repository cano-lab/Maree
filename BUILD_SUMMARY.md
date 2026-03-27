# Marée - Build Summary

## ✅ What Was Built

### Dependencies Installed
```
zustand                          # State management
@react-native-async-storage/async-storage  # Persistent storage
react-native-fs                  # File system operations
@react-navigation/native         # Navigation
@react-navigation/native-stack   # Native stack navigator
react-native-screens             # Screen optimization
react-native-safe-area-context   # Safe area handling
react-native-gesture-handler     # Gestures
react-native-audio-recorder-player  # Voice recording
@react-native-community/geolocation  # Location services
uuid                             # UUID generation
@types/uuid                      # TypeScript types
```

### App Structure

```
maree-mobile/
├── App.tsx                      # Main app with navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Entry list + capture buttons
│   │   ├── CaptureScreen.tsx    # Voice/text capture
│   │   ├── EntryScreen.tsx      # View single entry
│   │   └── SettingsScreen.tsx   # App settings
│   ├── core/
│   │   ├── store/
│   │   │   └── index.ts         # Zustand store with persistence
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   └── utils/
│   │       └── markdown.ts      # Markdown save/load/delete
│   ├── platform/
│   │   ├── LocationBridge.ts    # Location permission + fetch
│   │   └── CalendarBridge.ts    # Calendar permission + fetch (stub)
│   └── ai/
│       ├── providers/
│       │   ├── LocalProvider.ts      # On-device AI (3B model stub)
│       │   ├── CloudProvider.ts      # OpenAI/Claude integration
│       │   ├── SelfHostedProvider.ts # Home server Kimi 2.5
│       │   └── index.ts
│       └── hooks/
│           └── useAI.ts              # React hook for AI
```

### Features Implemented

1. **Navigation**
   - Native stack navigator
   - 4 screens: Home, Capture, Entry, Settings

2. **Data Model**
   - Entries with YAML frontmatter
   - Markdown storage: `Documents/Marée/YYYY/MM/DD-{uuid}.md`
   - Zustand store with AsyncStorage persistence

3. **Capture Flow**
   - Voice recording with react-native-audio-recorder-player
   - Text input
   - Mood tags
   - Context awareness (location, calendar)

4. **Settings**
   - Toggle sensors (location, calendar, weather)
   - Default capture mode
   - About section

5. **AI Providers**
   - Local (3B model stub)
   - Cloud (OpenAI/Claude)
   - Self-hosted (vLLM/Kimi 2.5)

## ⚠️ Known Issues / TODO

### iOS Setup Required
```bash
cd ios && pod install
```

### Android Setup Required
May need to add permissions to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

### Native Modules Not Fully Implemented
- CalendarBridge uses stubs (needs react-native-calendar-events)
- LocationBridge uses @react-native-community/geolocation but needs proper iOS/Android setup
- Local AI provider is a stub (needs ONNX Runtime integration)

### Missing Features
- Audio transcription (needs AI integration)
- Weather context (needs weather API)
- File sync (iCloud/Google Drive)
- Weekly reflection UI
- Search/filter entries

## 🚀 Next Steps

1. Run `pod install` in ios/ directory
2. Add permissions to Info.plist (iOS) and AndroidManifest.xml
3. Test on device/simulator
4. Implement native calendar module or add react-native-calendar-events
5. Add audio transcription service
6. Build weekly reflection screen

## 📱 Running the App

```bash
cd maree-mobile

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```
