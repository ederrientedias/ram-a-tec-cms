import { IField } from '@/models/instrumentsRegistration.model';
import { z } from 'zod';

import { sanitizeString } from './format-string';

export const generateSchema = (fields: IField[]) => {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    let validator: any;

    switch (field.type) {
      case 'text':
        validator = z.string().min(1, { message: `${field.label} é obrigatório` });
        break;
      case 'number':
        validator = z.preprocess(
          (val) => (val === '' ? undefined : Number(val)),
          z.number().optional()
        );
        break;
      case 'select':
        validator = z.string();
        break;
      case 'date':
        validator = z.date();
        break;
      case 'checkbox':
        validator = z.boolean();
        break;
    }

    if (field.isRequire) {
      validator = validator.refine((val) => val !== undefined && val !== '', {
        message: `${field.label} é obrigatório`,
      });
    } else {
      validator = validator.optional();
    }

    shape[sanitizeString(field.fieldName)] = validator;
  });

  return z.object(shape);
};
