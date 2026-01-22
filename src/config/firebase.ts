import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

// Initialize Firestore
const db = getFirestore(app);

export { db, doc, getDoc };
export default app;