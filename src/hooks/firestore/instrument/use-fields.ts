import fieldsBlocksService from '@/services/instruments/fields-blocks.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IField } from '@/models/instruments.model';

export const useFields = (): UseQueryResult<IField[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.FIELDS],
    queryFn: async (): Promise<IField[] | []> => await fieldsBlocksService.getFields(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
