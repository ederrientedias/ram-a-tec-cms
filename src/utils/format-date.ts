export const formatDate = (date: Date | undefined) => {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR').toString();
};

export const isValidDate = (date: Date | undefined) => {
  if (!date) return false;
  return !isNaN(date.getTime());
};
