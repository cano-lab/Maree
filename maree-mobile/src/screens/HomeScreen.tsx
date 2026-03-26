import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useMaréeStore} from '../store';
import {Entry} from '../types';

export const HomeScreen: React.FC = () => {
  const entries = useMaréeStore((state) => state.entries);
  const setCapture = useMaréeStore((state) => state.setCapture);
  
  const renderEntry = ({item}: {item: Entry}) => (
    <TouchableOpacity style={styles.entryCard}>
      <Text style={styles.entryDate}>
        {new Date(item.metadata.createdAt).toLocaleDateString('fr-FR')}
      </Text>
      <Text style={styles.entryPreview} numberOfLines={2}>
        {item.body.slice(0, 100)}...
      </Text>
      {item.metadata.moodTag && (
        <View style={styles.moodTag}>
          <Text style={styles.moodText}>{item.metadata.moodTag}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marée</Text>
      <Text style={styles.subtitle}>Journal de bord</Text>
      
      <View style={styles.captureButtons}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => setCapture({mode: 'voice', content: ''})}
        >
          <Text style={styles.buttonText}>🎤 Voice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => setCapture({mode: 'text', content: ''})}
        >
          <Text style={styles.buttonText}>✍️ Text</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.metadata.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No entries yet. Start capturing. </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  entryCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  entryPreview: {
    fontSize: 14,
  },
  moodTag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  moodText: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});
