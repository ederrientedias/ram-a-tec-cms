import { useQuery, UseQueryResult } from '@tanstack/react-query';
import logService from '@/services/logs.service';

/**
 * @description | Hook para buscar logs
 * @param param0 | Nome do log
 * @returns | UseQueryResult<T[], Error>
 */
export const useLog = <T>({ logName }: { logName: string }): UseQueryResult<T[], Error> => {
  return useQuery({
    queryKey: [logName],
    queryFn: async (): Promise<T[] | []> => await logService.getLogs<T>(logName),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
