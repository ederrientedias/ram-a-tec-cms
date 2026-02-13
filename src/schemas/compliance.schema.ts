import { z } from 'zod';

/**
 * Schema - Formulário para upload de Arquivo
 */

export const createfileMetadataSchema = z.object({
  filename: z.string().nonempty('O nome do arquivo é obrigatório'),
  fileMedatada: z.any().refine((files) => files?.length > 0, 'Arquivo é obrigatório'),
});

export const updatefileMetadataSchema = z.object({
  filename: z.string().nonempty('O nome do arquivo é obrigatório'),
  fileMedatada: z
    .any()
    .optional() // Torna o campo opcional
    .refine((files) => {
      // Se não foi fornecido, é válido
      if (!files) return true;
      // Se foi fornecido, deve ter pelo menos 1 arquivo
      return files.length > 0;
    }, 'Arquivo inválido'),
});

export type CreateFileMetadataSchema = z.infer<typeof createfileMetadataSchema>;
export type UpdateFileMetadataSchema = z.infer<typeof updatefileMetadataSchema>;
export const fileMetadataDefaultValues: CreateFileMetadataSchema = {
  filename: '',
  fileMedatada: null,
};

/* SCHEMA - Formulario para criação de Empresa */
export const createCompanySchema = z.object({
  companyName: z.string().nonempty('A empresa é obrigatória'),
});
export type CreateCompanySchema = z.infer<typeof createCompanySchema>;
export const createCompanyDefaultValues: CreateCompanySchema = {
  companyName: '',
};
