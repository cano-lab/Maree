/**
 * Marée Mobile - Main App Entry
 * Navigation setup with Native Stack
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, useColorScheme} from 'react-native';

import {HomeScreen} from './src/screens/HomeScreen';
import {CaptureScreen} from './src/screens/CaptureScreen';
import {EntryScreen} from './src/screens/EntryScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Capture: {mode: 'voice' | 'text'};
  Entry: {entryId: string};
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            },
            headerTintColor: isDarkMode ? '#fff' : '#000',
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f5',
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Marée', headerShown: false}}
          />
          <Stack.Screen
            name="Capture"
            component={CaptureScreen}
            options={{title: 'Nouvelle entrée', headerShown: false}}
          />
          <Stack.Screen
            name="Entry"
            component={EntryScreen}
            options={{title: 'Entrée'}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{title: 'Paramètres'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
