import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '89fd91ab-9c27-48cd-914d-c7c4f26ec693',
    authority: 'https://login.microsoftonline.com/rizaasset.onmicrosoft.com',
    redirectUri:
      // import.meta.env.VITE_MSAL_REDIRECT_URI_WEB_STAFF_PORTAL || 'https://web-staff-portal.web.app',
      'http://localhost:8080/',
    // import.meta.env.VITE_MSAL_REDIRECT_URI_WEB_STAFF_PORTAL || 'http://localhost:8080/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ['User.Read'],
};

export const protectedResources = {
  graphMe: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['User.Read'],
  },
  graphPhoto: {
    endpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value',
    scopes: ['User.Read'],
  },
};
