import { useQuery, UseQueryResult } from '@tanstack/react-query';
import fundsService from '@/services/funds.service';
import { IGenericType } from '@/models/funds.model';

export const useTypes = (): UseQueryResult<IGenericType[], Error> => {
  return useQuery({
    queryKey: ['types', 'type'],
    queryFn: async (): Promise<IGenericType[]> => await fundsService.getUniqueValues('type'),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
