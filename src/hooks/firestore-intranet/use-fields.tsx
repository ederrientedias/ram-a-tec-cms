import { useQuery, UseQueryResult } from '@tanstack/react-query';

import firestoreService from '../../services/firestore-intranet/firestore.service';
import { IField } from '../../models/instrumentsRegistration.model';
import { Documents } from '../../enums/firestoreIntranet.enum';


export const useFields = (): UseQueryResult<IField[], Error> => {
  return useQuery({
    queryKey: [Documents.Fields],
    queryFn: async (): Promise<IField[]> => await firestoreService.getFields(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
