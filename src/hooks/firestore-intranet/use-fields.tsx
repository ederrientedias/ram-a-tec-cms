import firestoreService from '@/services/firestore-intranet/firestore.service';
import { Documents, SubCollection } from '@/enums/firestoreIntranet.enum';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { IField } from '@/models/instruments-registration.model';

export const useFields = (): UseQueryResult<IField[], Error> => {
  return useQuery({
    queryKey: [Documents.Fields],
    queryFn: async (): Promise<IField[]> =>
      await firestoreService.getFieldsOrBlocks<IField>(SubCollection.Fields),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
