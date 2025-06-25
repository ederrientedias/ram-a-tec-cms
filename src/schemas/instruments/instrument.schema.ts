import { z } from 'zod';

export const instrument = z.object({
  nickname: z.string().nonempty('A NickName do instrumento é obrigatória'),
  name: z.string().nonempty('O nome do instrumento é obrigatório'),
  instrumentGroup: z.string().nonempty('O grupo do instrumento é obrigatório'),
  reference: z.string().nonempty('A referência do instrumento é obrigatória'),
});

export type InstrumentSchema = z.infer<typeof instrument>;

export const defaultValues: InstrumentSchema = {
  nickname: '',
  name: '',
  instrumentGroup: '',
  reference: '',
};
