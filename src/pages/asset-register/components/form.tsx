import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSelectOptions } from '@/hooks/firestore-intranet/use-select-options';
import { IField } from '@/models/instrumentsRegistration.model';
import { Controller, useFormContext } from 'react-hook-form';
import { sanitizeString } from '@/utils/format-string';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const Form = ({ fields }) => {
  const { data: selectOptins } = useSelectOptions();
  const {
    control,
    formState: { errors, touchedFields },
  } = useFormContext();

  const fecthSelectOptions = (optionRef: string) => {
    return selectOptins?.find((option) => option.id === optionRef)?.options ?? [];
  };

  const dateFormat = (date: Date) => {
    return date.toLocaleDateString('pt-BR').toString();
  };

  return (
    <div className="grid grid-cols-3 gap-y-5 gap-x-2">
      {fields?.map((item: IField) => {
        const fieldName = sanitizeString(item.fieldName);
        return (
          <div key={item.id}>
            {/* Tipo texto */}
            {item.type === 'text' && (
              <div className="flex flex-col gap-2">
                <Label className={!item.label ? 'text-transparent' : null}>{item.label}</Label>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <Input type={item.type} placeholder={item.placeholder} {...field} />
                  )}
                />
              </div>
            )}

            {/* Tipo numero */}
            {item.type === 'number' && (
              <div className="flex flex-col gap-2">
                <Label className={!item.label ? 'text-transparent' : null}>{item.label}</Label>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <Input type={item.type} placeholder={item.placeholder} {...field} />
                  )}
                />
              </div>
            )}

            {/* tipo lista */}
            {item.type === 'select' && (
              <div className="flex flex-col gap-2">
                <Label className={!item.label ? 'text-transparent' : null}>
                  {item.label ?? 'empty'}
                </Label>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={item.placeholder ?? 'Selecione uma opção'} />
                      </SelectTrigger>
                      <SelectContent>
                        {fecthSelectOptions(item.optionsRef).map((option) => (
                          <SelectItem
                            key={option['ID'].toString()}
                            value={option['ID'].toString() ?? ''}
                          >
                            {option['NOME'] ?? option['CLASSE'] ?? option['COD']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Tipo data */}
            {item.type === 'date' && (
              <div className="flex flex-col gap-2">
                <Label className={!item.label ? 'text-transparent' : null}>
                  {item.label ?? 'empty'}
                </Label>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="w-full justify-between font-normal"
                        >
                          {field.value
                            ? dateFormat(field.value)
                            : item.placeholder
                            ? item.placeholder
                            : 'Selecione a data'}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          captionLayout="dropdown"
                          onSelect={(date) => field.onChange(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            )}

            {errors[fieldName] && touchedFields[fieldName] && (
              <small className="text-red-500">{errors[fieldName]?.message?.toString()}</small>
            )}
          </div>
        );
      })}
    </div>
  );
};
