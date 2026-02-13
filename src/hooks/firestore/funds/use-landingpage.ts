import { useQuery, UseQueryResult } from '@tanstack/react-query';
import landinpageService from '@/services/landingpage.service';
import { IFund } from '@/models/funds.model';


export const useLandingPageFunds = (): UseQueryResult<IFund[], Error> => {
  return useQuery({
    queryKey: ['landingPageFunds'],
    queryFn: async (): Promise<IFund[]> => await landinpageService.getAllLandingPages(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
