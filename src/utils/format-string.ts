// Função auxiliar para normalizar string
const normalizeString = (str: string): string => {
  return str
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
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
