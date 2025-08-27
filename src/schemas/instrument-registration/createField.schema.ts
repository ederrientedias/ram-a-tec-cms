import { z } from 'zod';


/**
 * Schema - Formulário para criar campo
 */
export const createfieldSchema = z.object({
  fieldName: z.string().min(1, 'O nome do campo é obrigatório'),
  label: z.string().min(1, 'A label é obrigatória'),
  type: z.string().min(1, 'O tipo do campo é obrigatório'),
  placeholder: z.string().nullable(),
  fieldBlockRef: z.string().min(1, 'O Bloco de Campos é obrigatório'),
  optionsRef: z.string().nullable(),
  collectionData: z.string().nullable(),
  isRequire: z.boolean(),
});

export type CreateFieldSchema = z.infer<typeof createfieldSchema>;
export const createFieldDefaultValues: CreateFieldSchema = {
  fieldName: '',
  label: '',
  type: '',
  placeholder: '',
  fieldBlockRef: '',
  optionsRef: '',
  collectionData: '',
  isRequire: false,
};
