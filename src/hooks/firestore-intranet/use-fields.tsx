import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { IField } from '@/models/instruments-registration.model';
import { SubCollection } from '@/enums/firestoreIntranet.enum';

export const useFields = (): UseQueryResult<IField[], Error> => {
  return useQuery({
    queryKey: [SubCollection.Fields],
    queryFn: async (): Promise<IField[]> =>
      await firestoreService.getFieldsOrBlocks<IField>(SubCollection.Fields),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
