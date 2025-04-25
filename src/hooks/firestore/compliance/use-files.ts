import { useQuery, UseQueryResult } from '@tanstack/react-query';
import complianceService from '@/services/compliance.service';
import { IFile } from '@/models/compliance.model';
import { Field } from '@/enums/firestore.enum';

export const useFiles = ({ collectionName }): UseQueryResult<IFile[], Error> => {
  return useQuery({
    queryKey: [Field.FILES, collectionName],
    queryFn: async (): Promise<IFile[]> => await complianceService.getFiles(collectionName),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
