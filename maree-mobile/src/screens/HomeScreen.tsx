import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useMaréeStore} from '../core/store';
import {Entry} from '../core/types';
import {listEntries} from '../core/utils/markdown';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const entries = useMaréeStore((state) => state.entries);
  const addEntry = useMaréeStore((state) => state.addEntry);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const loadedEntries = await listEntries();
      // Only add entries that aren't already in the store
      const existingIds = new Set(entries.map((e) => e.metadata.id));
      loadedEntries.forEach((entry) => {
        if (!existingIds.has(entry.metadata.id)) {
          addEntry(entry);
        }
      });
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const renderEntry = ({item}: {item: Entry}) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigation.navigate('Entry', {entryId: item.metadata.id})}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {new Date(item.metadata.createdAt).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}
        </Text>
        {item.metadata.moodTag && (
          <View style={styles.moodTag}>
            <Text style={styles.moodText}>{item.metadata.moodTag}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.entryPreview} numberOfLines={2}>
        {item.body.slice(0, 120)}{item.body.length > 120 ? '...' : ''}
      </Text>
      
      {(item.metadata.location || item.metadata.calendarContext?.length) && (
        <View style={styles.contextRow}>
          {item.metadata.location?.name && (
            <Text style={styles.contextText}>📍 {item.metadata.location.name}</Text>
          )}
          {item.metadata.calendarContext && item.metadata.calendarContext.length > 0 && (
            <Text style={styles.contextText}>📅 {item.metadata.calendarContext.length}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Marée</Text>
          <Text style={styles.subtitle}>Journal de bord</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.captureButtons}>
        <TouchableOpacity
          style={[styles.captureButton, styles.voiceButton]}
          onPress={() => navigation.navigate('Capture', {mode: 'voice'})}
        >
          <Text style={styles.captureButtonIcon}>🎤</Text>
          <Text style={styles.captureButtonText}>Vocal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.captureButton, styles.textButton]}
          onPress={() => navigation.navigate('Capture', {mode: 'text'})}
        >
          <Text style={styles.captureButtonIcon}>✍️</Text>
          <Text style={styles.captureButtonText}>Texte</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.metadata.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌊</Text>
            <Text style={styles.emptyTitle}>Pas encore d'entrées</Text>
            <Text style={styles.emptyText}>
              Commencez à capturer vos pensées
            </Text>
          </View>
        }
      />
    </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  captureButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  voiceButton: {
    backgroundColor: '#007AFF',
  },
  textButton: {
    backgroundColor: '#34C759',
  },
  captureButtonIcon: {
    fontSize: 20,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  entryCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  moodTag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  moodText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
  entryPreview: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  contextRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  contextText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});
