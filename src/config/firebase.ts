import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';

const firebaseConfig = {
  apiKey: "your-firebase-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
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