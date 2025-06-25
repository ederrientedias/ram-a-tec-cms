export const toCamelCase = (str: string): string => {
  const normalized = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[()[\]{}=?!.:,\-_+\\"#~/]/g, ' ') // Substitui símbolos por espaço
    .toLowerCase();

  let result = '';
  let capitalizeNext = false;

  for (const char of normalized) {
    if (/\s/.test(char)) {
      capitalizeNext = true;
    } else {
      result += capitalizeNext ? char.toUpperCase() : char;
      capitalizeNext = false;
    }
  }

  return result.replace(/\s+/g, '');
};
