import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
    auth: {
        clientId: 'SEU_CLIENT_ID',
        authority: 'https://login.microsoftonline.com/SEU_TENANT_ID',
        redirectUri: 'http://localhost:3000', // Ou a URL do seu aplicativo
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
};

const msalInstance = new PublicClientApplication(msalConfig);