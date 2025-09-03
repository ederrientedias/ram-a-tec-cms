// Função auxiliar para normalizar string
const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Retorna com hífen
export const toKebabCase = (str: string): string => {
  return normalizeString(str).replace(/\s+/g, '-');
};

// Retorna com underscore
export const toSnakeCase = (str: string): string => {
  return normalizeString(str).replace(/\s+/g, '_');
};

export const sanitizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
};
