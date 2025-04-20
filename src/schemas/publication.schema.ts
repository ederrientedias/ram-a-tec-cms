import { z } from 'zod';

export const publicationSchema = z.object({
  theme: z.string().min(1).nonempty('Ex: Riza Terrax, Riza Lotus, Riza Meyenii...'),
  product: z.string().min(1).nonempty('Ex: Fundo Multimercado...'),
  type: z.string().min(1).nonempty('Ex: Entrevista, Artigo, Notícia...'),
  category: z.string().min(1).nonempty('Agronegócio, Imobiliário, Renda Fixa...'),
  publicationDate: z.string().transform((date) => formatDate(date)),
  mediaOutlet: z.string().min(1).nonempty('Ex: Riza Asset, InfoMoney, Valor...'),
  mediaLogo: z.string().min(1).nonempty('https://exemplo.com/logo'),
  link: z.string().min(1).nonempty('https://exemplo.com/materia'),
  description: z.string().min(100).max(300).nonempty('Breve descrição sobre a publicação...'),
});

export type PublicationsSchema = z.infer<typeof publicationSchema>;

const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};
