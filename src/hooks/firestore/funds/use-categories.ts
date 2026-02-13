import { useQuery, UseQueryResult } from '@tanstack/react-query';
import fundsService from '@/services/funds.service';
import { IGenericType } from '@/models/funds.model';

export const useCategories = (): UseQueryResult<IGenericType[], Error> => {
  return useQuery({
    queryKey: ['categories', 'category'],
    queryFn: async (): Promise<IGenericType[]> => await fundsService.getUniqueValues('category'),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
