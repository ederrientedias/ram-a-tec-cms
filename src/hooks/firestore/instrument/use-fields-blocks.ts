import fieldsBlocksService from '@/services/instruments/fields-blocks.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { IFieldAndBlock } from '@/models/instruments.model';
import { FirestoreDocument } from '@/enums/firestore.enum';

export const useFieldsBlocks = (): UseQueryResult<IFieldAndBlock[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.FIELDS_BLOCKS],
    queryFn: async (): Promise<IFieldAndBlock[] | []> =>
      await fieldsBlocksService.getAllFieldsBlocks(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
