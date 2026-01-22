import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';

const firebaseConfig = {
  apiKey: "AIzaSyB1qs3bd-Shbu2_cZ56A0CWDrCzGNPH-ng",
  authDomain: "plenum-2026.firebaseapp.com",
  projectId: "plenum-2026",
  storageBucket: "plenum-2026.firebasestorage.app",
  messagingSenderId: "953498041240",
  appId: "1:953498041240:web:e6ded337f9e742040389ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Remote Config
const remoteConfig = getRemoteConfig(app);

// Set default values
remoteConfig.defaultConfig = {
  'openai_api_key': '',
  'google_maps_api_key': ''
};

// Configure Remote Config
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1 hour
};

export { remoteConfig, fetchAndActivate, getValue };
export default app;