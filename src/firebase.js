import { provide } from "vue";

import { initializeApp } from 'firebase/app'
import * as firestore from 'firebase/firestore'

const { getFirestore } = firestore


// ... other firebase imports

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyDICIrxQCMOPzfDnRo1XS4ScoKyc5_1n0Y',
  authDomain: 'connected-mirror-91cb7.firebaseapp.com',
  projectId: 'connected-mirror-91cb7',
  storageBucket: 'connected-mirror-91cb7.appspot.com',
  messagingSenderId: '111172689510',
  appId: '1:111172689510:web:aee0b505696a7e89a897a7',
  measurementId: 'G-X34HXJ0LQ2'
})

const db = getFirestore(initializeApp)


export default {

  install: (app, options) => {

    const getFirestoreDb = () => db
    app.provide('firebase', {
      getFirestoreDb,
      firestore
    });
  },
};
