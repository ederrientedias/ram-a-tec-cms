import { useQuery, UseQueryResult } from '@tanstack/react-query';
import complianceService from '@/services/compliance.service';
import { ITab } from '@/models/compliance.model';
import { Field } from '@/enums/firestore.enum';

export const useTabs = (): UseQueryResult<ITab[], Error> => {
  return useQuery({
    queryKey: [Field.TABS],
    queryFn: async (): Promise<ITab[]> => await complianceService.getTabs(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
