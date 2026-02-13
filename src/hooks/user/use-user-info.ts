import { AccountInfo } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';

export const useUserInfo = () => {
  const { accounts } = useMsal();
  const account: AccountInfo = accounts[0];
  return {
    isAuthenticated: !!account,
    name: account?.name,
    email: account?.username,
    id: account?.localAccountId,
    claims: account?.idTokenClaims,
    fullAccount: account,
  };
};
