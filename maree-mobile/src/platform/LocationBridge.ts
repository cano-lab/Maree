// Location Bridge - Cross-platform location services
// iOS: Uses CoreLocation via native module (future)
// For now: Web-like Geolocation API via @react-native-community/geolocation

import {Platform, PermissionsAndroid, PermissionStatus} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationData {
  lat: number;
  lon: number;
  name?: string;
  accuracy?: number;
}

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    // iOS uses Info.plist for permission description
    // Permission request happens automatically on first location request
    return true;
  }

  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Marée a besoin de votre localisation',
        message: 'Pour enrichir vos entrées avec le lieu où vous vous trouvez',
        buttonNeutral: 'Plus tard',
        buttonNegative: 'Refuser',
        buttonPositive: 'Autoriser',
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return false;
}

export function getCurrentLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy || undefined,
        });
      },
      (error) => {
        console.error('Location error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

// Reverse geocoding - get place name from coordinates
// This is a placeholder - would need native module or API
export async function getPlaceName(lat: number, lon: number): Promise<string | undefined> {
  // TODO: Implement reverse geocoding
  // Option 1: Native module using CLGeocoder (iOS) / Geocoder (Android)
  // Option 2: API call to a geocoding service
  return undefined;
}
