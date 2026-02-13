import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuração do primeiro projeto (intranet-e34a3)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY_INTRANET || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_INTRANET || '',
  projectId: 'intranet-e34a3',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_INTRANET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_INTRANET || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID_INTRANET || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_INTRANET || '',
};

// Configuração do segundo projeto (riza-asset-site)
const firebaseSiteConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY_SITE || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_SITE || '',
  projectId: 'riza-asset-site',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_SITE || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_SITE || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID_SITE || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_SITE || '',
};

// Inicializar os dois aplicativos Firebase com nomes diferentes
const appIntranet = initializeApp(firebaseConfig, 'intranet');
const appSite = initializeApp(firebaseSiteConfig, 'site');

// Inicializar serviços para o projeto intranet-e34a3
const authIntranet = getAuth(appIntranet);
const firestoreIntranet = getFirestore(appIntranet);
const storageIntranet = getStorage(appIntranet);

// Inicializar serviços para o projeto riza-asset-site
const authSite = getAuth(appSite);
const firestoreSite = getFirestore(appSite);
const storageSite = getStorage(appSite);

// Exportar os serviços
export { authIntranet, firestoreIntranet, storageIntranet, authSite, firestoreSite, storageSite };
