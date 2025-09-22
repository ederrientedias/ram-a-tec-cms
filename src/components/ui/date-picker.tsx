import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate, isValidDate } from '@/utils/format-date';
import { useCallback, useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import CleaveInput from 'cleave.js/react';

export const DatePicker = ({ field }) => {
  const [month, setMonth] = useState<Date | null>(new Date());

  const formatDateBr = (dataString: string): Date | undefined => {
    if (!dataString || typeof dataString !== 'string') return undefined;

    try {
      const [dia, mes, ano] = dataString.split('/').map(Number);
      const date = new Date(ano, mes - 1, dia);
      return isValidDate(date) ? date : undefined;
    } catch {
      return undefined;
    }
  };

  const getSelectedDate = useCallback((): Date | undefined => {
    if (!field.value) return undefined;

    if (field.value instanceof Date) {
      return isValidDate(field.value) ? field.value : undefined;
    }

    if (typeof field.value === 'string') {
      return formatDateBr(field.value);
    }

    return undefined;
  }, [field]);

  useEffect(() => {
    const selectedDate = getSelectedDate();
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [field.value, getSelectedDate]);

  return (
    <div className="relative flex gap-2">
      <CleaveInput
        {...field}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        placeholder={new Date().toLocaleDateString()}
        options={{
          date: true,
          delimiter: '/',
          datePattern: ['d', 'm', 'Y'],
        }}
        onChange={(e: any) => field.onChange(e.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Selecione a Data</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="center">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            selected={getSelectedDate()}
            onSelect={(date) => field.onChange(formatDate(date))}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
