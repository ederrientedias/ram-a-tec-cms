import publicationsService from '@/services/publications.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IMediaOutlet } from '@/models/publication.model';


export const useMediaOutlet = (): UseQueryResult<IMediaOutlet[], Error> => {
  return useQuery({
    queryKey: ['media_outlet'],
    queryFn: async (): Promise<IMediaOutlet[]> => await publicationsService.getMediaOutlet(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
