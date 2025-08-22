import { z } from 'zod';


/**
 * Schema - Formulário para upload de Arquivo
 */

export const createfileMetadataSchema = z.object({
  filename: z.string().nonempty('O nome do arquivo é obrigatório'),
  file: z.any().refine((files) => files?.length > 0, 'Arquivo é obrigatório'),
});

export const updatefileMetadataSchema = z.object({
  filename: z.string().nonempty('O nome do arquivo é obrigatório'),
  file: z
    .any()
    .optional()
    .refine((files) => {
      if (!files) return true;
      return files.length > 0;
    }, 'Arquivo inválido'),
});

export type CreateFileMetadataSchema = z.infer<typeof createfileMetadataSchema>;
export type UpdateFileMetadataSchema = z.infer<typeof updatefileMetadataSchema>;
export const fileMetadataDefaultValues: CreateFileMetadataSchema = {
  filename: '',
  file: null,
};

/* SCHEMA - Formulario para criação de Empresa */
export const createCollectionMapSchema = z.object({
  collectionName: z.string().nonempty('A coleção é obrigatória'),
});
export type CreateCollectionMapSchema = z.infer<typeof createCollectionMapSchema>;
export const createCollectionMapDefaultValues: CreateCollectionMapSchema = {
  collectionName: '',
};
