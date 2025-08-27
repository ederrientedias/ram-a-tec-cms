import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IFieldsBlock } from '@/models/instrumentsRegistration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Documents } from '@/enums/firestoreIntranet.enum';

export const useFieldsBlock = (): UseQueryResult<IFieldsBlock[], Error> => {
  return useQuery({
    queryKey: [Documents.FieldsBlock],
    queryFn: async (): Promise<IFieldsBlock[]> => await firestoreService.getFieldsBlock(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
