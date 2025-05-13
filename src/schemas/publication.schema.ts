import { z } from 'zod';

export const publicationSchema = z.object({
  theme: z.string().nonempty('O tema é obrigatório'),
  product: z.string().nonempty('O produto é obrigatório'),
  type: z.string().nonempty('O tipo é obrigatório'),
  category: z.string().nonempty('A categoria é obrigatória'),
  publicationDate: z
    .string()
    .nonempty('A data é obrigatória')
    .transform((date) => formatDate(date)),
  mediaOutlet: z.string().nonempty('O meio de comunicação é obrigatório'),
  mediaLogo: z.string().nonempty(' O logo do meio de comunicação é obrigatório'),
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

export type PublicationsSchema = z.infer<typeof publicationSchema>;
export const defaultValues = {
  theme: '',
  product: '',
  type: '',
  category: '',
  publicationDate: '',
  mediaOutlet: '',
  mediaLogo: '',
  link: '',
  description: '',
  isPublic: false,
};

const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

export const convertToInputDateFormat = (date: string): string => {
  const cleanDate = date.trim().replace(/^\//, '');
  const [year, month, day] = cleanDate.split('/');
  return `${day}-${month}-${year}`;
};
