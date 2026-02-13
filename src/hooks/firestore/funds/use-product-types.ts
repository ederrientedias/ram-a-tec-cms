import { useQuery, UseQueryResult } from '@tanstack/react-query';
import fundsService from '@/services/funds.service';
import { IGenericType } from '@/models/funds.model';

export const useProductTypes = (): UseQueryResult<IGenericType[], Error> => {
  return useQuery({
    queryKey: ['product-types', 'productType'],
    queryFn: async (): Promise<IGenericType[]> => await fundsService.getUniqueValues('productType'),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
