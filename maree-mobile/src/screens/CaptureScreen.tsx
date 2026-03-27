import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {v4 as uuidv4} from 'uuid';

import {RootStackParamList} from '../../App';
import {useMaréeStore} from '../core/store';
import {Entry, EntryMetadata} from '../core/types';
import {saveEntry} from '../core/utils/markdown';
import {requestLocationPermission, getCurrentLocation} from '../platform/LocationBridge';
import {requestCalendarPermission, getTodayEvents} from '../platform/CalendarBridge';

type CaptureScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Capture'>;
type CaptureScreenRouteProp = RouteProp<RootStackParamList, 'Capture'>;

const audioRecorderPlayer = new AudioRecorderPlayer();

export const CaptureScreen: React.FC = () => {
  const navigation = useNavigation<CaptureScreenNavigationProp>();
  const route = useRoute<CaptureScreenRouteProp>();
  const {mode} = route.params;

  const settings = useMaréeStore((state) => state.settings);
  const addEntry = useMaréeStore((state) => state.addEntry);

  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [contextData, setContextData] = useState<{
    location?: {lat: number; lon: number; name?: string};
    calendarEvents?: string[];
  }>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch context on mount
  useEffect(() => {
    fetchContext();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchContext = async () => {
    const newContext: typeof contextData = {};

    if (settings.sensors.location) {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const location = await getCurrentLocation();
        if (location) {
          newContext.location = location;
        }
      }
    }

    if (settings.sensors.calendar) {
      const hasPermission = await requestCalendarPermission();
      if (hasPermission) {
        const events = await getTodayEvents();
        if (events.length > 0) {
          newContext.calendarEvents = events.map((e) => e.title);
        }
      }
    }

    setContextData(newContext);
  };

  const startRecording = async () => {
    try {
      const path = Platform.select({
        ios: 'marée_recording.m4a',
        android: `${Date.now()}.mp3`,
      });
      
      await audioRecorderPlayer.startRecorder(path);
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordingDuration(e.currentPosition / 1000);
      });
      
      setIsRecording(true);
      setAudioPath(path || null);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setAudioPath(result);
      
      // TODO: Transcribe audio when AI provider is ready
      // For now, just mark that we have audio
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const save = async () => {
    if (!content.trim() && !audioPath) {
      Alert.alert('Contenu vide', 'Ajoutez du texte ou un enregistrement audio');
      return;
    }

    setIsProcessing(true);

    try {
      const metadata: EntryMetadata = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        source: Platform.select({ios: 'maree-ios', android: 'maree-android'}) || 'maree-ios',
        location: contextData.location,
        calendarContext: contextData.calendarEvents,
        moodTag: moodTag || undefined,
      };

      const entry: Entry = {
        metadata,
        body: content.trim() || '(Entrée vocale)',
        voiceTranscript: audioPath ? '(Transcription en attente...)' : undefined,
      };

      // Save to filesystem
      await saveEntry(entry);

      // Add to store
      addEntry(entry);

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'entrée');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancel = () => {
    if (content.trim() || audioPath) {
      Alert.alert(
        'Abandonner ?',
        'Votre entrée sera perdue',
        [
          {text: 'Continuer', style: 'cancel'},
          {text: 'Abandonner', style: 'destructive', onPress: () => navigation.goBack()},
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'voice' ? '🎤 Vocal' : '✍️ Texte'}
        </Text>
        <TouchableOpacity
          onPress={save}
          style={[styles.headerButton, (!content.trim() && !audioPath) && styles.disabledButton]}
          disabled={!content.trim() && !audioPath}>
          <Text style={[styles.headerButtonText, styles.saveButtonText]}>Sauver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Context indicators */}
        <View style={styles.contextBar}>
          {contextData.location && (
            <View style={styles.contextChip}>
              <Text style={styles.contextChipText}>📍 {contextData.location.name || 'Ici'}</Text>
            </View>
          )}
          {contextData.calendarEvents && contextData.calendarEvents.length > 0 && (
            <View style={styles.contextChip}>
              <Text style={styles.contextChipText}>
                📅 {contextData.calendarEvents.length} événement(s)
              </Text>
            </View>
          )}
        </View>

        {/* Voice recording UI */}
        {mode === 'voice' && (
          <View style={styles.voiceContainer}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}>
              <Text style={styles.recordButtonText}>
                {isRecording ? '⏹' : '🎤'}
              </Text>
            </TouchableOpacity>
            
            {isRecording && (
              <Text style={styles.recordingDuration}>
                {formatDuration(recordingDuration)}
              </Text>
            )}
            
            {audioPath && !isRecording && (
              <Text style={styles.audioSaved}>✓ Audio enregistré</Text>
            )}
          </View>
        )}

        {/* Text input */}
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Qu'est-ce qui traverse votre esprit ?"
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          autoFocus={mode === 'text'}
          textAlignVertical="top"
        />

        {/* Mood tag */}
        <View style={styles.moodSection}>
          <Text style={styles.moodLabel}>Humeur (optionnel)</Text>
          <View style={styles.moodTags}>
            {['calme', 'agité', 'joyeux', 'triste', 'fatigué', 'excité'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.moodChip, moodTag === tag && styles.moodChipActive]}
                onPress={() => setMoodTag(moodTag === tag ? '' : tag)}>
                <Text style={[styles.moodChipText, moodTag === tag && styles.moodChipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Sauvegarde...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contextBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  contextChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  contextChipText: {
    fontSize: 12,
    color: '#666',
  },
  voiceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  recordButtonText: {
    fontSize: 32,
  },
  recordingDuration: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#ff4444',
  },
  audioSaved: {
    marginTop: 12,
    fontSize: 14,
    color: '#4CAF50',
  },
  textInput: {
    flex: 1,
    minHeight: 150,
    fontSize: 17,
    lineHeight: 24,
    color: '#333',
    textAlignVertical: 'top',
  },
  moodSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  moodLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  moodChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  moodChipText: {
    fontSize: 14,
    color: '#666',
  },
  moodChipTextActive: {
    color: '#fff',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});
