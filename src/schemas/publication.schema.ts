import { z } from 'zod';


export const publicationSchema = z.object({
  theme: z.string().nonempty('O tema é obrigatório'),
  type: z.string().nonempty('O tipo é obrigatório'),
  publicationDate: z
    .string()
    .nonempty('A data é obrigatória')
    .transform((date) => formatDateString(date)),
  mediaOutlet: z.string().nonempty('O meio de comunicação é obrigatório'),
  link: z.string().nonempty('O link é obrigatório'),
  description: z
    .string()
    .min(100, { message: 'A descrição deve ter no mínimo 100 caracteres.' })
    .max(300, { message: 'A descrição deve ter no máximo 300 caracteres.' })
    .nonempty('A descrição é obrigatória'),
  isPublic: z.boolean({
    required_error: 'Você deve escolher se a publicação será pública ou não.',
  }),
});

export const mediaOutletSchema = z.object({
  name: z.string().nonempty('O nome do arquivo é obrigatório'),
  file: z.any().refine((files) => files?.length > 0, 'Arquivo é obrigatório'),
});

export const typeSchema = z.object({
  typename: z.string().nonempty('O nome do tipo é obrigatorio'),
});

export type MediaOutletSchema = z.infer<typeof mediaOutletSchema>;
export type TypeSchema = z.infer<typeof typeSchema>;
export type PublicationsSchema = z.infer<typeof publicationSchema>;

export const defaultValues = {
  theme: '',
  type: '',
  publicationDate: '',
  mediaOutlet: '',
  link: '',
  description: '',
  isPublic: false,
};

export const defaulValuesMediaOutlet = {
  name: '',
  file: null,
};

export const defaulValuesType = {
  typename: '',
};

export const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateString = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const convertToInputDateFormat = (date: string): string => {
  const cleanDate = date.trim().replace(/^\//, '');
  const [year, month, day] = cleanDate.split('/');
  return `${day}-${month}-${year}`;
};
