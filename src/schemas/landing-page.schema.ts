import { z } from 'zod';

export const landingPageSchema = z
  .object({
    fundName: z.string().nonempty('O nome do fundo é obrigatório.'),
    tabName: z.string().optional(),
    createNewTab: z.boolean(),
    newTabName: z.string().optional(),
    fileName: z
      .string()
      .min(1, 'O nome do arquivo é obrigatório.')
      .nonempty('O nome do arquivo é obrigatório.'),
    year: z.string().nonempty('O ano é obrigatório.'),
    month: z.string().nonempty('O mês é obrigatório.'),
    file: z.any().refine((files) => files?.length > 0, 'Arquivo é obrigatório'),
    // .refine((file) => file?.size <= 1024 * 1024, "O arquivo é muito grande. O tamanho máximo permitido é 1MB."),
  })
  .refine(
    (data) => {
      // Se createNewTab for false, tabName deve ser preenchido
      if (!data.createNewTab) {
        return data.tabName && data.tabName.trim() !== '';
      }
      return true; // Se createNewTab for true, tabName não é necessário
    },
    {
      message: 'A aba correspondente é obrigatória.',
      path: ['tabName'], // Aponta o erro para o campo tabName
    }
  )
  .refine(
    (data) => {
      // Se createNewTab for true, newTabName deve ser preenchido
      if (data.createNewTab) {
        return data.newTabName && data.newTabName.trim() !== '';
      }
      return true; // Se createNewTab for false, ignora a validação
    },
    {
      message: 'O nome da nova aba é obrigatório.',
      path: ['newTabName'], // Aponta o erro para o campo newTabName
    }
  );

export type LandingPageSchema = z.infer<typeof landingPageSchema>;
export const defaultValues: LandingPageSchema = {
  fundName: '',
  tabName: '',
  createNewTab: false,
  newTabName: '',
  fileName: '',
  year: '',
  month: '',
  file: null,
};
