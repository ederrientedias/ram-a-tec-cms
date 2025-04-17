import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCw8PTt0iABfRS1las0vZJVDrWW8qSjVmA",
  authDomain: "riza-asset-site.firebaseapp.com",
  projectId: "riza-asset-site",
  storageBucket: "riza-asset-site.appspot.com",
  messagingSenderId: "707951436413",
  appId: "1:707951436413:web:da4acd2c718a31b6cb0714",
  measurementId: "G-LW299P7B16"
}

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db, storage }
