import { useQuery, UseQueryResult } from '@tanstack/react-query';
import complianceService from '@/services/compliance.service';
import { IUploadRef } from '@/models/compliance.model';
import { Field } from '@/enums/firestore.enum';

export const useLastUploads = (): UseQueryResult<IUploadRef[], Error> => {
  return useQuery({
    queryKey: [Field.LAST_UPLOADS],
    queryFn: async (): Promise<IUploadRef[]> => await complianceService.getLastUploadsRef(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
