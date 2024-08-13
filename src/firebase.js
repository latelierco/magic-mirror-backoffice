import { initializeApp } from 'firebase/app'
import { getFirestore, collection } from 'firebase/firestore'
// ... other firebase imports

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyDICIrxQCMOPzfDnRo1XS4ScoKyc5_1n0Y',
  authDomain: 'connected-mirror-91cb7.firebaseapp.com',
  projectId: 'connected-mirror-91cb7',
  storageBucket: 'connected-mirror-91cb7.appspot.com',
  messagingSenderId: '111172689510',
  appId: '1:111172689510:web:aee0b505696a7e89a897a7',
  measurementId: 'G-X34HXJ0LQ2'
})
