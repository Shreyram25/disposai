import { remoteConfig, fetchAndActivate, getValue } from '../config/firebase';

class ApiKeyService {
  private static instance: ApiKeyService;
  private keys: { [key: string]: string } = {};
  private initialized = false;

  private constructor() {}

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Fetch and activate remote config
      await fetchAndActivate(remoteConfig);
      
      // Get API keys from remote config
      this.keys.openai = getValue(remoteConfig, 'openai_api_key').asString();
      this.keys.googleMaps = getValue(remoteConfig, 'google_maps_api_key').asString();
      
      this.initialized = true;
      console.log('API keys loaded from Firebase Remote Config');
    } catch (error) {
      console.error('Failed to load API keys from Firebase:', error);
      
      // Fallback to environment variables for local development
      this.keys.openai = import.meta.env.VITE_OPENAI_API_KEY || '';
      this.keys.googleMaps = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      
      this.initialized = true;
    }
  }

  getOpenAIKey(): string {
    if (!this.initialized) {
      throw new Error('ApiKeyService not initialized. Call initialize() first.');
    }
    return this.keys.openai;
  }

  getGoogleMapsKey(): string {
    if (!this.initialized) {
      throw new Error('ApiKeyService not initialized. Call initialize() first.');
    }
    return this.keys.googleMaps;
  }
}

export default ApiKeyService;