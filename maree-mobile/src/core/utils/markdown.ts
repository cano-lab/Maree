// Markdown file utilities

import RNFS from 'react-native-fs';
import {Entry, EntryMetadata} from '../types';

const MARÉE_DIR = `${RNFS.DocumentDirectoryPath}/Marée`;

export async function ensureMaréeDir(): Promise<void> {
  const exists = await RNFS.exists(MARÉE_DIR);
  if (!exists) {
    await RNFS.mkdir(MARÉE_DIR);
  }
}

export function generateFilePath(metadata: EntryMetadata): string {
  const date = new Date(metadata.createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const dir = `${MARÉE_DIR}/${year}/${month}`;
  return `${dir}/${day}-${metadata.id}.md`;
}

export function entryToMarkdown(entry: Entry): string {
  const {metadata, body, voiceTranscript} = entry;
  
  const frontmatter = `---
id: ${metadata.id}
created_at: ${metadata.createdAt}
source: ${metadata.source}${metadata.location ? `
location:
  lat: ${metadata.location.lat}
  lon: ${metadata.location.lon}${metadata.location.name ? `
  name: ${metadata.location.name}` : ''}` : ''}${metadata.weather ? `
weather:
  temp: ${metadata.weather.temp}
  condition: ${metadata.weather.condition}` : ''}${metadata.calendarContext?.length ? `
calendar_context:
${metadata.calendarContext.map((c) => `  - ${c}`).join('\n')}` : ''}${metadata.moodTag ? `
mood_tag: ${metadata.moodTag}` : ''}
---

${body}${voiceTranscript ? `

---

## Voice Transcript

${voiceTranscript}` : ''}
`;
  
  return frontmatter;
}

export async function saveEntry(entry: Entry): Promise<string> {
  await ensureMaréeDir();
  
  const filePath = generateFilePath(entry.metadata);
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  
  const dirExists = await RNFS.exists(dir);
  if (!dirExists) {
    await RNFS.mkdir(dir);
  }
  
  const content = entryToMarkdown(entry);
  await RNFS.writeFile(filePath, content, 'utf8');
  
  return filePath;
}

export async function loadEntry(filePath: string): Promise<Entry | null> {
  try {
    const content = await RNFS.readFile(filePath, 'utf8');
    return parseMarkdownEntry(content, filePath);
  } catch {
    return null;
  }
}

export function parseMarkdownEntry(content: string, filePath?: string): Entry | null {
  // Simple YAML frontmatter parser
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    return null;
  }
  
  const [, frontmatter, body] = frontmatterMatch;
  const metadata: Partial<EntryMetadata> = {};
  
  // Parse simple key-value pairs
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'id') metadata.id = value;
      if (key === 'created_at') metadata.createdAt = value;
      if (key === 'source') metadata.source = value as EntryMetadata['source'];
      if (key === 'mood_tag') metadata.moodTag = value;
    }
  }
  
  // Extract voice transcript if present
  const voiceMatch = body.match(/---\n\n## Voice Transcript\n\n([\s\S]+)$/);
  const mainBody = voiceMatch ? body.substring(0, body.indexOf('---')).trim() : body.trim();
  const voiceTranscript = voiceMatch?.[1]?.trim();
  
  if (!metadata.id || !metadata.createdAt) {
    return null;
  }
  
  return {
    metadata: metadata as EntryMetadata,
    body: mainBody,
    voiceTranscript,
  };
}

export async function deleteEntry(entryId: string): Promise<boolean> {
  await ensureMaréeDir();
  
  try {
    // Find the file with this entry ID
    const years = await RNFS.readDir(MARÉE_DIR);
    
    for (const yearDir of years.filter((d) => d.isDirectory())) {
      const months = await RNFS.readDir(yearDir.path);
      
      for (const monthDir of months.filter((d) => d.isDirectory())) {
        const files = await RNFS.readDir(monthDir.path);
        
        for (const file of files.filter((f) => f.name.endsWith('.md'))) {
          if (file.name.includes(entryId)) {
            await RNFS.unlink(file.path);
            return true;
          }
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting entry:', error);
    return false;
  }
}

export async function listEntries(): Promise<Entry[]> {
  await ensureMaréeDir();
  
  const entries: Entry[] = [];
  
  try {
    const years = await RNFS.readDir(MARÉE_DIR);
    
    for (const yearDir of years.filter((d) => d.isDirectory())) {
      const months = await RNFS.readDir(yearDir.path);
      
      for (const monthDir of months.filter((d) => d.isDirectory())) {
        const files = await RNFS.readDir(monthDir.path);
        
        for (const file of files.filter((f) => f.name.endsWith('.md'))) {
          const entry = await loadEntry(file.path);
          if (entry) {
            entries.push(entry);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error listing entries:', error);
  }
  
  // Sort by date, newest first
  return entries.sort((a, b) => 
    new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
  );
}
