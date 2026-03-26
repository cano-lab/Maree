// iOS Calendar Bridge - wraps EventKit

import {NativeModules, Platform} from 'react-native';

const {MaréeCalendarBridge} = NativeModules;

export interface CalendarBridge {
  requestPermission(): Promise<boolean>;
  getTodaysEvents(): Promise<Array<{title: string; startDate: string; endDate?: string}>>;
  getEventsForDate(date: Date): Promise<Array<{title: string; startDate: string; endDate?: string}>>;
}

// Native module interface will be implemented in Swift
export const iOSCalendarBridge: CalendarBridge = {
  requestPermission: async () => {
    if (Platform.OS !== 'ios') return false;
    return MaréeCalendarBridge?.requestPermission?.() ?? false;
  },
  
  getTodaysEvents: async () => {
    if (Platform.OS !== 'ios') return [];
    return MaréeCalendarBridge?.getTodaysEvents?.() ?? [];
  },
  
  getEventsForDate: async (date) => {
    if (Platform.OS !== 'ios') return [];
    return MaréeCalendarBridge?.getEventsForDate?.(date.toISOString()) ?? [];
  },
};
