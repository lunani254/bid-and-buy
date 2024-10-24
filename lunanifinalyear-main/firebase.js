// firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdHcpLq8tfKXse0wAJgR50OmQhOpu1WSI",
  authDomain: "finalyearbackend-6a245.firebaseapp.com",
  projectId: "finalyearbackend-6a245",
  storageBucket: "finalyearbackend-6a245.appspot.com",
  messagingSenderId: "889679938732",
  appId: "1:889679938732:web:c4b75810dd96b281878b09",
  measurementId: "G-H3DQ9ZHCNP"
};

let app;
let auth;
let database;
let storage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage) 
  });
  database = getDatabase(app);
  storage = getStorage(app);
} else {
  app = getApp();
  auth = getAuth(app);
  database = getDatabase(app);
  storage = getStorage(app);
}

export { app, auth, database, storage };
