import { useQuery, UseQueryResult } from '@tanstack/react-query';
import publicationsService from '@/services/publications.service';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IPublication } from '@/models/publication.model';

export const usePublications = (): UseQueryResult<IPublication[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.PUBLICATIONS],
    queryFn: async (): Promise<IPublication[]> => await publicationsService.getPublications(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
