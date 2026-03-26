---
id: {{uuid}}
created_at: {{iso_timestamp}}
location:
  lat: {{latitude}}
  lon: {{longitude}}
  name: {{location_name}}
weather:
  temp: {{temperature}}
  condition: {{weather_condition}}
calendar_context:
  - {{event_title_1}}
  - {{event_title_2}}
mood_tag: {{user_mood}}
source: maree-ios
---

{{entry_body}}

---
{{#if voice_transcript}}
## Voice Transcript

{{voice_transcript}}
{{/if}}
