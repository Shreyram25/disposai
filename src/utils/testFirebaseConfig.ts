import ApiKeyService from '../services/apiKeys';

/**
 * Test Firebase Firestore setup
 * Run this to verify your API keys are loading correctly
 */
export async function testFirebaseConfig(): Promise<void> {
  console.log('🔥 Testing Firebase Firestore...');
  
  try {
    const apiKeyService = ApiKeyService.getInstance();
    await apiKeyService.initialize();
    
    const openaiKey = apiKeyService.getOpenAIKey();
    const googleMapsKey = apiKeyService.getGoogleMapsKey();
    
    console.log('✅ Firebase Firestore initialized successfully');
    console.log('🔑 OpenAI Key loaded:', openaiKey ? `${openaiKey.substring(0, 10)}...` : 'NOT FOUND');
    console.log('🗺️ Google Maps Key loaded:', googleMapsKey ? `${googleMapsKey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!openaiKey) {
      console.error('❌ OpenAI API key not found in Firestore');
      console.log('💡 Make sure you added API keys to Firestore collection "config" document "api-keys"');
    }
    
    if (!googleMapsKey) {
      console.error('❌ Google Maps API key not found in Firestore');
      console.log('💡 Make sure you added API keys to Firestore collection "config" document "api-keys"');
    }
    
    if (openaiKey && googleMapsKey) {
      console.log('🎉 All API keys loaded successfully from Firebase!');
    }
    
  } catch (error) {
    console.error('❌ Firebase Firestore test failed:', error);
    console.log('💡 Falling back to local environment variables...');
    
    // Test fallback to local env
    const localOpenAI = import.meta.env.VITE_OPENAI_API_KEY;
    const localGoogleMaps = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    console.log('🔑 Local OpenAI Key:', localOpenAI ? `${localOpenAI.substring(0, 10)}...` : 'NOT FOUND');
    console.log('🗺️ Local Google Maps Key:', localGoogleMaps ? `${localGoogleMaps.substring(0, 10)}...` : 'NOT FOUND');
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testFirebaseConfig();
}