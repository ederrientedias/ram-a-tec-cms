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

/* SCHEMA - Formulario para criação de Aba */
export const createCollectionMapSchema = z.object({
  collectionName: z.string().nonempty('A coleção é obrigatória'),
});
export type CreateCollectionMapSchema = z.infer<typeof createCollectionMapSchema>;
export const createCollectionMapDefaultValues: CreateCollectionMapSchema = {
  collectionName: '',
};

/* SCHEMA - Formulário para criação da Landing Page  */
// Schema para os feeders
const feederSchema = z.object({
  corporateName: z.string().optional(),
  feeder: z.string().optional(),
  cnpj: z.string().optional(),
  eventName: z.string().optional(),
  id: z.number().optional(),
  feederName: z.string().optional(),
});

// Schema principal
export const createLandingPageSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  idName: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  ticker: z.string().optional(),
  productType: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  redirectUrl: z.string().url('URL deve ser válida'),
  displayInFundList: z.boolean().default(false),
  collectionName: z.string().min(1, 'Nome da coleção é obrigatório'),
  feeders: z.array(feederSchema).min(1, 'Pelo menos um feeder é obrigatório'),
});

// Tipos TypeScript inferidos do schema
export type CreateLandingPageData = z.infer<typeof createLandingPageSchema>;
export type FeederData = z.infer<typeof feederSchema>;
export const defaultValues: CreateLandingPageData = {
  id: '',
  idName: '',
  name: '',
  ticker: '',
  productType: '',
  type: '',
  category: '',
  redirectUrl: '',
  displayInFundList: false,
  collectionName: '',
  feeders: [
    {
      corporateName: '',
      feeder: '',
      cnpj: '',
      eventName: '',
      id: 0,
      feederName: '',
    },
  ],
};
