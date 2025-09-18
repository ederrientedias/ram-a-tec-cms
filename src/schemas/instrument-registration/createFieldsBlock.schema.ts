import { z } from 'zod';

/**
 * Schema - Formulário para criar campo
 */
export const createfieldsBlockSchema = z.object({
  name: z.string().min(1, 'O nome do bloco é obrigatório'),
  group: z.array(z.string().min(1)).min(1, 'Selecione pelo menos um grupo'),
});

export type CreateFieldsBlockSchema = z.infer<typeof createfieldsBlockSchema>;
export const createFieldsBlockDefaultValues: CreateFieldsBlockSchema = {
  name: '',
  group: [],
};
