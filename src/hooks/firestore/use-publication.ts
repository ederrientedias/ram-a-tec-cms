import { useQuery, UseQueryResult } from '@tanstack/react-query';
import publicationService from '@/repositories/publication.repository';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IPublication } from '@/models/publication.model';

export const usePublications = (): UseQueryResult<IPublication[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.PUBLICATIONS],
    queryFn: async (): Promise<IPublication[]> => await publicationService.get(),
    refetchOnWindowFocus: false, // Não recarregar ao focar na janela
    staleTime: Infinity, // Mantém dados anteriores durante recarregamento
    enabled: true, // Controle condicional de execução
  });
};
