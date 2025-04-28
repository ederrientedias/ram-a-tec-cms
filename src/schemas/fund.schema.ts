import { z } from 'zod';

export const fundSchema = z.object({
  id: z
    .number()
    .min(1, { message: 'Id dever ter no minimo 1 caracter' })
    .nonnegative('ID deve ser um número positivo'),
  fundName: z.string().min(1).nonempty('Nome do fundo deve ser preenchido'),
  displayName: z.string().min(1).nonempty('Nome de exibição deve ser preenchido'),
  productType: z.string().min(1).nonempty('Tipo de produto deve ser preenchido'),
  type: z.string().min(1).nonempty('Ex: Entrevista, Artigo, Notícia...'),
  category: z.string().min(1).nonempty('Agronegócio, Imobiliário, Renda Fixa...'),
  //   publicationDate: z.string().transform((date) => formatDate(date)),
  mediaOutlet: z.string().min(1).nonempty('Ex: Riza Asset, InfoMoney, Valor...'),
  mediaLogo: z.string().min(1).nonempty('https://exemplo.com/logo'),
  link: z.string().min(1).nonempty('https://exemplo.com/materia'),
  description: z.string().min(100).max(300).nonempty('Breve descrição sobre a publicação...'),
});

export type FundSchema = z.infer<typeof fundSchema>;
