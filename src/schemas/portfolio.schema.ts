import { z } from 'zod';

export const portfolioSchema = z.object({
  fundName: z.string().nonempty('O nome do fundo é obrigatório'),
  file: z.any().refine((files) => files?.length > 0, 'Arquivo é obrigatório'),
});
export type PortfolioSchema = z.infer<typeof portfolioSchema>;
export const defaultValues: PortfolioSchema = {
  fundName: '',
  file: null,
};
