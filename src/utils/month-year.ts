export const getMonthAndYear = (): { month: string; year: number } => {
  const date = new Date();
  const currentMonth = date.toLocaleString('default', { month: 'long' });
  const month = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
  const year = date.getFullYear();
  return { month, year };
};
