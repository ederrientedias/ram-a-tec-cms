import { z } from 'zod';


/**
 * Schema - Formulário para criar Grupo de Instrumentos
 */
export const createInstrumentGroupSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  nickname: z.string().min(1, 'A Abreviação é obrigatória'),
  group: z.string().min(1, 'O Grupo é obrigatório'),
  description: z.string().min(1, 'A Descrição é obrigatória'),
});

export type CreateInstrumentGroupSchema = z.infer<typeof createInstrumentGroupSchema>;
export const defaultValues: CreateInstrumentGroupSchema = {
  name: '',
  nickname: '',
  group: '',
  description: '',
};
