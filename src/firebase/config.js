import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAV_nvj7vrL5upO1wQO5i9JNodu9VmMby0",
  authDomain: "fundizen-7d5ba.firebaseapp.com",
  projectId: "fundizen-7d5ba",
  storageBucket: "fundizen-7d5ba.firebasestorage.app",
  messagingSenderId: "876757713562",
  appId: "1:876757713562:web:674efd2ce7a04b39a51523",
  measurementId: "G-FSWHNWRZXK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;