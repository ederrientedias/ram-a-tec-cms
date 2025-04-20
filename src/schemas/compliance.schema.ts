import { z } from 'zod';

export const complianceSchema = z.object({
  company: z.string().nonempty('Selecione uma empresa'),
  docName: z
    .string()
    .nonempty('Nome que será exibido para o documento')
    .min(1, 'O nome do documento é obrigatório'),
  file: z.any().refine((files) => files?.length > 0, 'Arquivo é obrigatório'),
  // .refine((file) => file?.size <= 1024 * 1024, "O arquivo é muito grande. O tamanho máximo permitido é 1MB."),
});

export type ComplianceSchema = z.infer<typeof complianceSchema>;
