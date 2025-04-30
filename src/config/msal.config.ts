import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '89fd91ab-9c27-48cd-914d-c7c4f26ec693',
    authority: 'https://login.microsoftonline.com/rizaasset.onmicrosoft.com',
    redirectUri: 'http://localhost:8081/',
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
