import { db, doc, getDoc } from '../config/firebase';

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
      // Try to fetch API keys from Firestore
      const configDoc = await getDoc(doc(db, 'config', 'api-keys'));
      
      if (configDoc.exists()) {
        const data = configDoc.data();
        this.keys.openai = data.openai_api_key || '';
        this.keys.googleMaps = data.google_maps_api_key || '';
        
        this.initialized = true;
        console.log('API keys loaded from Firestore');
        return;
      }
    } catch (error) {
      console.error('Failed to load API keys from Firestore:', error);
    }

    // Fallback to environment variables for local development
    this.keys.openai = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.keys.googleMaps = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    this.initialized = true;
    console.log('Using local environment variables for API keys');
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