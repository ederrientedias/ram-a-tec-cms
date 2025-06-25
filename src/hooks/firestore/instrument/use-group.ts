import instrumentService from '@/services/instruments/instrument-group.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IGroup } from '@/models/instruments.model';

export const useGroup = (): UseQueryResult<IGroup[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.GROUPS],
    queryFn: async (): Promise<IGroup[]> => await instrumentService.getGroups(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
