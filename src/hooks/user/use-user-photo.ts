import { protectedResources } from '@/config/msal.config';
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';

export const useUserPhoto = () => {
  const { instance, accounts } = useMsal();
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // const generateInitials = () => {
  //   const nameParts = accounts[0].name.split(' ');
  //   if (nameParts.length >= 2) {
  //     const initials =
  //       nameParts[0].charAt(0).toUpperCase() +
  //       nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  //     return initials;
  //   } else if (nameParts.length === 1) {
  //     const initials = nameParts[0].charAt(0).toUpperCase();
  //     return initials;
  //   } else {
  //     return '';
  //   }
  // };

  useEffect(() => {
    const getPhoto = async () => {
      try {
        if (accounts.length > 0) {
          const response = await instance.acquireTokenSilent({
            scopes: protectedResources.graphPhoto.scopes,
            account: accounts[0],
          });

          const photoResponse = await fetch(protectedResources.graphPhoto.endpoint, {
            headers: {
              Authorization: `Bearer ${response.accessToken}`,
            },
          });

          if (photoResponse.ok) {
            const photoBlob = await photoResponse.blob();
            const photoUrl = URL.createObjectURL(photoBlob);
            setPhoto(photoUrl);
          } else {
            setPhoto(null);
          }
        }
      } catch (err) {
        console.error('Error fetching user photo:', err);
        setError(err as Error);
        setPhoto(null);
      } finally {
        setLoading(false);
      }
    };

    getPhoto();
  }, [accounts, instance]);

  return { photo, loading, error };
};
