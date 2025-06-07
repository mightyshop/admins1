import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBe1LD0CsflOniBJQI44qDtzvPwpJl4OQY",
  authDomain: "exnay-a6d8d.firebaseapp.com",
  databaseURL: "https://exnay-a6d8d-default-rtdb.firebaseio.com",
  projectId: "exnay-a6d8d",
  storageBucket: "exnay-a6d8d.firebasestorage.app",
  messagingSenderId: "881157721637",
  appId: "1:881157721637:web:23f6c2fce4707e37ec39cc",
  measurementId: "G-5YYRSP9VT7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

export default app;