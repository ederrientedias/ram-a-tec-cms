import { useQuery, UseQueryResult } from '@tanstack/react-query';
import salesforceService from '@/services/salesforce.service';
import { Data } from '@/models/salesforce.model';

const QUERY_KEY = ['riza-funds'];

const fetchRizaFunds = async (): Promise<Data[]> => {
  return await salesforceService.getAllRizaFunds();
};

export const useRizaFunds = (): UseQueryResult<Data[], Error> => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRizaFunds,
    staleTime: Infinity, // Nunca considera os dados "obsoletos"
    gcTime: Infinity, // Mantém os dados no cache para sempre (até reload da página)
    refetchOnWindowFocus: false, // Não refaz chamadas ao voltar à aba
    refetchInterval: false,
  });
};
