export const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR').toString();
};

export const isValidDate = (date: Date | undefined): boolean => {
  if (!date) return false;
  return !isNaN(date.getTime());
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const dateTimeFormat = (timestamp: number) => {
  const date = new Date(timestamp);
  const dateFormated = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  return dateFormated;
};
