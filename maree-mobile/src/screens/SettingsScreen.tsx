import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useMaréeStore} from '../core/store';

export const SettingsScreen: React.FC = () => {
  const settings = useMaréeStore((state) => state.settings);
  const updateSettings = useMaréeStore((state) => state.updateSettings);

  const toggleSensor = (sensor: 'location' | 'calendar' | 'weather') => {
    updateSettings({
      sensors: {
        ...settings.sensors,
        [sensor]: !settings.sensors[sensor],
      },
    });
  };

  const clearAllData = () => {
    Alert.alert(
      'Effacer toutes les données ?',
      'Cette action supprimera toutes vos entrées de manière irréversible',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement data clearing
            Alert.alert('Données effacées');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contexte automatique</Text>
        <Text style={styles.sectionDescription}>
          Marée peut enrichir vos entrées avec des informations contextuelles
        </Text>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Localisation</Text>
            <Text style={styles.settingDescription}>Ajouter votre position</Text>
          </View>
          <Switch
            value={settings.sensors.location}
            onValueChange={() => toggleSensor('location')}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Calendrier</Text>
            <Text style={styles.settingDescription}>Ajouter les événements du jour</Text>
          </View>
          <Switch
            value={settings.sensors.calendar}
            onValueChange={() => toggleSensor('calendar')}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Météo</Text>
            <Text style={styles.settingDescription}>Ajouter les conditions météo</Text>
          </View>
          <Switch
            value={settings.sensors.weather}
            onValueChange={() => toggleSensor('weather')}
            disabled={true}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode de capture</Text>
        
        <View style={styles.captureModes}>
          {(['voice', 'text'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.captureMode,
                settings.captureMode === mode && styles.captureModeActive,
              ]}
              onPress={() => updateSettings({captureMode: mode})}>
              <Text
                style={[
                  styles.captureModeText,
                  settings.captureMode === mode && styles.captureModeTextActive,
                ]}>
                {mode === 'voice' ? '🎤 Vocal' : '✍️ Texte'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <View style={styles.aboutBox}>
          <Text style={styles.aboutText}>Marée v0.0.1</Text>
          <Text style={styles.aboutSubtext}>Journal de bord personnel</Text>
          <Text style={styles.quote}>"Even if the world forgets, I'll remember for you."</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
        <Text style={styles.dangerButtonText}>Effacer toutes les données</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  captureModes: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  captureMode: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  captureModeActive: {
    backgroundColor: '#007AFF',
  },
  captureModeText: {
    fontSize: 15,
    color: '#666',
  },
  captureModeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  aboutBox: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quote: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 12,
  },
  dangerButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '600',
  },
});
