import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAxfgXrlbPP8b9orrTeyRHll2ibcT6fdhY',
  authDomain: 'bellissima-435b7.firebaseapp.com',
  projectId: 'bellissima-435b7',
  storageBucket: 'bellissima-435b7.firebasestorage.app',
  messagingSenderId: '994744790967',
  appId: '1:994744790967:web:4c89e7be00654634d90232',
  measurementId: 'G-L8YSFVV73H',
};

export const app = initializeApp(firebaseConfig);

// Firestore — ყველა მონაცემი ინახება აქ (არასდროს ლოკალურად)
export const db = getFirestore(app);

// Analytics მუშაობს მხოლოდ მხარდაჭერილ გარემოში (https); ლოკალურად ჩუმად გამოტოვდება
isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {});
