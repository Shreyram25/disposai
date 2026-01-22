# Firebase Firestore Setup Instructions

## Step 1: Enable Firestore Database
1. Go to https://console.firebase.google.com/project/plenum-2026
2. Click on **"Firestore Database"** in the left sidebar
3. Click **"Create database"**
4. Choose **"Start in test mode"** (for now)
5. Select a location (choose closest to your users)
6. Click **"Done"**

## Step 2: Add API Keys to Firestore
1. In Firestore Database, click **"Start collection"**
2. Collection ID: `config`
3. Click **"Next"**
4. Document ID: `api-keys`
5. Add fields:
   - Field: `openai_api_key`, Type: `string`, Value: `[YOUR_OPENAI_API_KEY_HERE]`
   - Field: `google_maps_api_key`, Type: `string`, Value: `[YOUR_GOOGLE_MAPS_API_KEY_HERE]`
6. Click **"Save"**

**Note**: Replace the placeholder values with your actual API keys from your local `.env` file.

## Step 3: Update Security Rules (Important!)
1. Go to **"Rules"** tab in Firestore
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to config collection for API keys
    match /config/{document} {
      allow read: if true;
      allow write: if false; // Only allow writes from Firebase Console
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

## Step 4: Your Firestore Structure Should Look Like:
```
📁 config (collection)
  📄 api-keys (document)
    🔑 openai_api_key: "[YOUR_OPENAI_KEY]"
    🗺️ google_maps_api_key: "[YOUR_GOOGLE_MAPS_KEY]"
```

## Step 5: Test the Setup
Your app will now:
- Load API keys from Firestore in production
- Fall back to local .env variables during development
- Keep your keys secure and updatable

## Security Benefits
- API keys are stored securely in Firestore
- Keys are served over HTTPS
- You can update keys without redeploying
- Read-only access prevents unauthorized changes