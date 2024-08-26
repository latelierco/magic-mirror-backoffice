import { provide } from "vue";
import { initializeApp } from 'firebase/app'
import * as firestore from 'firebase/firestore'

import { firebaseCredentials } from '../security/firebase-credentials.js'



const firebaseApp = initializeApp(firebaseCredentials)

export default {

  install: (app, options) => {

    const getFirestoreDb = () => db
    app.provide('firestore', firestore);
  },
};
