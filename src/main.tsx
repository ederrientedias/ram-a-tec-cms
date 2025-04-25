import './index.css';

import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/config/msal.config.ts';
import { MsalProvider } from '@azure/msal-react';
import { createRoot } from 'react-dom/client';
import React from 'react';

import App from './App.tsx';

const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>
);
