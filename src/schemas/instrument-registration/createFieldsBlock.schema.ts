import { z } from 'zod';


/**
 * Schema - Formulário para criar campo
 */
export const createfieldsBlockSchema = z.object({
  name: z.string().min(1, 'O nome do bloco é obrigatório'),
  group: z.string().min(1, 'O Grupo é obrigatória'),
});

export type CreateFieldsBlockSchema = z.infer<typeof createfieldsBlockSchema>;
export const createFieldsBlockDefaultValues: CreateFieldsBlockSchema = {
  name: '',
  group: '',
};
