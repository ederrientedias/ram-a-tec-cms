import firestoreService from '@/services/firestore-intranet/firestore.service';
// import { IFieldsBlock } from '@/models/instrumentsRegistration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

// import { Documents } from '@/enums/firestoreIntranet.enum';

export const useAssets = (): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: ['registred-asset'],
    queryFn: async (): Promise<any[]> => await firestoreService.getAllRegistredAssets(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
