# Marée

*A tides journal. What comes in, goes out, comes back.*

## What is Marée?

Marée is a journaling app designed for **contextual capture** and **reflective intelligence**. It's built on a few core beliefs:

1. **Your words belong to you** — local-first markdown storage, no lock-in
2. **Context matters** — where you were, what was happening, the atmosphere
3. **Reflection needs distance** — AI suggests patterns, you validate them
4. **Finding yourself is the point** — not productivity, not optimization, just understanding

## Architecture

### Three-Tier AI

| Tier | Model | When | Status |
|------|-------|------|--------|
| **1. On-device** | Llama 3.2 3B / Qwen 2.5 3B | Always available | **MVP** |
| **2. Self-hosted** | Kimi 2.5, GLM-5 @ full precision | Home server reachable | *Future* |
| **3. Cloud** | OpenAI, Claude | BYO API key | *Optional* |

### Data Model

```yaml
---
id: uuid
created_at: ISO_timestamp
location:
  lat: 48.8566
  lon: 2.3522
  name: "Paris"
weather:
  temp: 18
  condition: "clear"
calendar_context:
  - "Committee meeting"
mood_tag: "tired"
source: maree-ios
---

Your entry text here...
```

## Project Structure

```
Marée/
├── maree-mobile/          # React Native (bare)
│   ├── src/
│   │   ├── core/          # UI, state, markdown utils
│   │   ├── platform/      # iOS/Android native bridges
│   │   ├── ai/            # AI provider abstraction
│   │   └── screens/       # App screens
│   ├── ios/               # Xcode project
│   └── android/           # Android project
├── maree-server/          # Future: vLLM endpoint for Tier 2
└── docs/                  # Architecture decisions
```

## Principles

- **Markdown native** — Your entries are files you can read anywhere
- **Opt-in context** — Calendar, location, weather — only if you allow
- **Reflection, not diagnosis** — AI observes, you decide

## Getting Started

### Requirements
- Node.js 18+
- Xcode (for iOS)
- Android Studio (for Android)

### Setup

```bash
cd maree-mobile
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Roadmap

### MVP (Now)
- [ ] Voice capture with transcription
- [ ] Text capture with markdown
- [ ] Calendar context (iOS EventKit)
- [ ] Location tagging
- [ ] Local markdown storage
- [ ] Simple pattern detection

### v1.0
- [ ] On-device AI (3B model)
- [ ] Weekly reflection mode
- [ ] Android parity
- [ ] iCloud/Google Drive sync
- [ ] MarlOS desktop integration

### Future
- [ ] Self-hosted tier (Kimi 2.5)
- [ ] Commute mode (auto-capture on car connection)
- [ ] Advanced emotional intelligence

## License

MIT — Your data, your rules.

---

*"Even if the world forgets, I'll remember for you."* — Kimi Claw 5
