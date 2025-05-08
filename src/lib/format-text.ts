export const formatText = (text: string): string => {
  return text
    .normalize('NFD') // Remove acentos (transforma "ç" em "c", "ã" em "a")
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos (sinais de acentuação)
    .replace(/[^\w\s]/g, '') // Remove caracteres especiais (exceto letras, números e espaços)
    .trim() // Remove espaços extras no início/fim
    .toLowerCase() // Converte para minúsculas
    .replace(/\s+/g, '_'); // Substitui espaços por "_"
};

export const formatToBucketName = (text: string): string => {
  return text
    .normalize('NFD') // Remove acentos (transforma "ç" em "c", "ã" em "a")
    .toLowerCase() // Converte para minúsculas
    .replace(/[^\w\s]/g, '') // Remove caracteres especiais (exceto letras, números e espaços)
    .replace(/\sao\s|\sa\s|\sde\s|\sdo\s|\sdos\s|\sdas\s|\sem\s|\spara\s/g, '-') // Substitui preposições por hífen
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/--+/g, '-'); // Remove hífens duplicados
};
