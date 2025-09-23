import { IField } from '@/models/instrumentsRegistration.model';
import { z } from 'zod';

import { sanitizeString } from './format-string';

export const generateSchema = (fields: IField[]) => {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    let validator: any;

    switch (field.type) {
      case 'text':
        validator = field.isRequire
          ? z.string().min(1, { message: `${field.label} é obrigatório` })
          : z.string().optional().nullable();
        break;
      case 'number':
        validator = z.preprocess(
          (val) => (val === '' ? undefined : Number(val)),
          field.isRequire
            ? z.number({ message: `${field.label} é obrigatório` })
            : z.number().optional().nullable()
        );
        break;
      case 'select':
        validator = field.isRequire
          ? z.string().min(1, { message: `${field.label} é obrigatório` })
          : z.string().optional().nullable();
        break;
      case 'date':
        validator = field.isRequire
          ? z
              .string()
              .min(1, { message: `${field.label} é obrigatório` })
              .refine(
                (val) => {
                  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
                  return regex.test(val);
                },
                {
                  message: `${field.label} deve estar no formato completo DD/MM/AAAA`,
                }
              )
          : z
              .string()
              .optional()
              .nullable()
              .refine(
                (val) => {
                  if (!val) return true;
                  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
                  return regex.test(val);
                },
                {
                  message: `${field.label} deve estar no formato completo DD/MM/AAAA`,
                }
              );
        break;
      case 'checkbox':
        validator = field.isRequire
          ? z.boolean({ message: `${field.label} é obrigatório` })
          : z.boolean().optional().nullable();
        break;
      default:
        validator = field.isRequire
          ? z.string().min(1, { message: `${field.label} é obrigatório` })
          : z.string().optional().nullable();
    }

    shape[sanitizeString(field.fieldName)] = validator;
  });

  return z.object(shape);
};
