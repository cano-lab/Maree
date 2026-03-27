import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useMaréeStore} from '../core/store';
import {deleteEntry} from '../core/utils/markdown';

type EntryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entry'>;
type EntryScreenRouteProp = RouteProp<RootStackParamList, 'Entry'>;

export const EntryScreen: React.FC = () => {
  const navigation = useNavigation<EntryScreenNavigationProp>();
  const route = useRoute<EntryScreenRouteProp>();
  const {entryId} = route.params;

  const entry = useMaréeStore((state) =>
    state.entries.find((e) => e.metadata.id === entryId)
  );
  const removeEntry = useMaréeStore((state) => state.deleteEntry);

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text>Entrée non trouvée</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette entrée ?',
      'Cette action est irréversible',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(entryId);
            removeEntry(entryId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(entry.metadata.createdAt)}</Text>
        <View style={styles.tags}>
          {entry.metadata.moodTag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{entry.metadata.moodTag}</Text>
            </View>
          )}
          {entry.metadata.location?.name && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>📍 {entry.metadata.location.name}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.body}>{entry.body}</Text>

        {entry.voiceTranscript && (
          <View style={styles.transcriptSection}>
            <Text style={styles.transcriptLabel}>Transcription vocale</Text>
            <Text style={styles.transcript}>{entry.voiceTranscript}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Supprimer l'entrée</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  date: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    padding: 20,
    minHeight: 300,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: '#333',
  },
  transcriptSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  transcript: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '600',
  },
});
