import { z } from 'zod';

export const instrumentGroup = z.object({
  name: z.string().nonempty('O nome do grupo é obrigatório'),
  nickname: z.string().nonempty('A Abreviação do grupo é obrigatório'),
  group: z.string().nonempty('O grupo é obrigatório'),
  description: z.string().nonempty('A descrição do grupo é obrigatória'),
});

export type InstrumentGroupSchema = z.infer<typeof instrumentGroup>;

export const defaultValues: InstrumentGroupSchema = {
  name: '',
  nickname: '',
  group: '',
  description: '',
};
