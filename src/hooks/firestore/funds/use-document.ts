import { useQuery, UseQueryResult } from '@tanstack/react-query';
import productService from '@/services/product.service';

export const useDocumentKeys = ({ fundName }): UseQueryResult<string[], Error> => {
    return useQuery({
        queryKey: ['document-keys', fundName],
        queryFn: async (): Promise<string[]> => await productService.getDocumentKeys(fundName),
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        enabled: true,
    });
};