import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCQKk6H9JdF1DJyqTzNxUEVSDkoTx3o73E',
  authDomain: 'intranet-45bad.firebaseapp.com',
  projectId: 'intranet-45bad',
  storageBucket: 'intranet-45bad.firebasestorage.app',
  messagingSenderId: '417201141785',
  appId: '1:417201141785:web:43bb5f5fe2bac6af9d9288',
  measurementId: 'G-Q8D1QCZLPW'
}

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)
const db = getFirestore(app)

export { db, storage }
