import publicationsService from '@/services/publications.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { IType } from '@/models/publication.model';


export const useType = (): UseQueryResult<IType[], Error> => {
  return useQuery({
    queryKey: ['types'],
    queryFn: async (): Promise<IType[]> => await publicationsService.getTypes(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
