# Security & Privacy Components

## 🔒 Security & Privacy Features

• **Environment Variable Protection** - API keys stored in `.env` file with `VITE_` prefix, preventing exposure in client-side bundle code.

• **Client-Side OCR Processing** - Tesseract.js runs entirely in the browser using WebAssembly, ensuring medicine images never leave the user's device before text extraction.

• **Local Data Storage** - All user data (inventory, scan history, game progress) stored exclusively in browser localStorage, never transmitted to external servers.

• **Permission-Based Geolocation** - Location access requires explicit user consent via browser permission API, with graceful fallback to city-based search if denied.

• **Opt-In Notifications** - Browser notifications for medicine expiry require explicit user permission and can be disabled at any time through app settings.

• **Image Format Validation** - Canvas-based image conversion validates and sanitizes image formats before API transmission, preventing malicious file uploads.

• **Error Handling & Fallbacks** - Comprehensive try-catch blocks and fallback mechanisms ensure sensitive data isn't exposed in error messages or console logs.

• **No User Authentication** - Application operates anonymously without user accounts, eliminating risks associated with credential storage, password management, or user data breaches.

• **API Key Validation** - Runtime checks ensure API keys are present before making requests, with clear warnings if keys are missing to prevent failed API calls.

• **CORS Protection** - Proper handling of cross-origin resource sharing errors prevents unauthorized data access and provides secure fallback mechanisms when external APIs fail.

