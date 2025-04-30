import { z } from 'zod';

export const landingPageSchema = z.object({
  fundName: z.string().nonempty('O nome do fundo é obrigatório.'),
  tabName: z.string().nonempty('Aba correspondente é obrigatória.'),
  fileName: z
    .string()
    .min(1, 'O nome do arquivo é obrigatório.')
    .nonempty('O nome do arquivo é obrigatório.'),
  year: z.string().nonempty('O ano é obrigatório.'),
  month: z.string().nonempty('O mês é obrigatório.'),
  file: z.any().refine((files) => files?.length > 0, 'Arquivo é obrigatório'),
  // .refine((file) => file?.size <= 1024 * 1024, "O arquivo é muito grande. O tamanho máximo permitido é 1MB."),
});

export type LandingPageSchema = z.infer<typeof landingPageSchema>;
