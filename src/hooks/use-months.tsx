import { useMemo } from 'react';

export const useMonths = () => {
  const months = useMemo(
    () => [
      { name: 'Janeiro', month: '01' },
      { name: 'Fevereiro', month: '02' },
      { name: 'Março', month: '03' },
      { name: 'Abril', month: '04' },
      { name: 'Maio', month: '05' },
      { name: 'Junho', month: '06' },
      { name: 'Julho', month: '07' },
      { name: 'Agosto', month: '08' },
      { name: 'Setembro', month: '09' },
      { name: 'Outubro', month: '10' },
      { name: 'Novembro', month: '11' },
      { name: 'Dezembro', month: '12' },
    ],
    []
  );

  return months;
};
