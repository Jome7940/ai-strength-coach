import { createClient, AsyncStorageAdapter } from '@blinkdotnew/sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

// CRITICAL: Connecting to the existing backend
export const blink = createClient({
  projectId: 'ai-strength-coach-puuldf2v',
  auth: {
    mode: 'managed',
    webBrowser: WebBrowser,
  },
  storage: new AsyncStorageAdapter(AsyncStorage),
});
