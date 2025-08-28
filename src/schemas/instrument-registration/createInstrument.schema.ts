import { z } from 'zod';


/**
 * Schema - Formulário para criar Instrumento
 */
export const createInstrumentSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  nickname: z.string().min(1, 'A Abreviação é obrigatória'),
  instrumentGroupRef: z.string().min(1, 'O Grupo é obrigatório'),
  legislation: z.string().min(1, 'A Descrição é obrigatória'),
});

export type CreateInstrumentSchema = z.infer<typeof createInstrumentSchema>;
export const defaultValues: CreateInstrumentSchema = {
  name: '',
  nickname: '',
  instrumentGroupRef: '',
  legislation: '',
};
