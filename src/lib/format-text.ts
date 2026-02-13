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
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, ' ') // substitui _ por espaço
    .replace(/\b(de|da|do|das|dos|ao|a|e|em|para|por|com)\b/g, '') // Remove preposições
    .replace(/\s+/g, ' ') // Remove espaços duplos gerados
    .trim() // Remove espaços extras nas pontas
    .replace(/\s/g, '-'); // Troca espaço por hífen
};
