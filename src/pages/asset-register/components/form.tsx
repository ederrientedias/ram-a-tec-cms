import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSelectOptions } from '@/hooks/firestore-intranet/use-select-options';
import { IField } from '@/models/instrumentsRegistration.model';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import { sanitizeString } from '@/utils/format-string';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CleaveInput from 'cleave.js/react';

export const Form = ({ fields }) => {
  const { data: selectOptins } = useSelectOptions();
  const {
    control,
    formState: { errors, touchedFields },
  } = useFormContext();

  const fecthSelectOptions = (optionRef: string) => {
    return selectOptins?.find((option) => option.id === optionRef)?.options ?? [];
  };

  return (
    <div className="w-full grid grid-cols-3 gap-y-5 gap-x-2">
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
                  render={({ field }) => {
                    if (!item.inputMaskOptions) {
                      return (
                        <Input
                          type={item.type}
                          placeholder={
                            item.placeholder.length > 0 ? item.placeholder : `Digite ${item.label}`
                          }
                          {...field}
                        />
                      );
                    }
                    return (
                      <CleaveInput
                        {...field}
                        key={item.id}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        placeholder={item.placeholder}
                        options={item.inputMaskOptions}
                        onChange={(e: any) => field.onChange(e.target.rawValue)}
                      />
                    );
                  }}
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
                  render={({ field }) => {
                    if (!item.inputMaskOptions) {
                      return <Input type={item.type} placeholder={item.placeholder} {...field} />;
                    }
                    return (
                      <CleaveInput
                        {...field}
                        key={item.id}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        placeholder={item.placeholder}
                        options={item.inputMaskOptions}
                        onChange={(e: any) => field.onChange(e.target.rawValue)}
                      />
                    );
                  }}
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
                        <SelectValue
                          placeholder={
                            item.placeholder.length > 0 ? item.placeholder : 'Selecione uma opção'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {fecthSelectOptions(item.optionsRef).map((option) => (
                          <SelectItem
                            key={option['ID'].toString()}
                            value={option['ID'].toString() ?? ''}
                          >
                            {option['NOME'] ?? option['CLASSE'] ?? option['COD'] ?? option['name']}
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
                  render={({ field }) => <DatePicker field={field} />}
                />
              </div>
            )}

            {/* Tipo Checkbox */}
            {item.type === 'checkbox' && (
              <div className="flex flex-col gap-2">
                <Label className="text-transparent">{item.label}</Label>
                <Label className="w-full h-10 flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50 md:text-sm has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 hover:bg-accent/50 cursor-pointer ">
                  <Checkbox
                    id="toggle-2"
                    defaultChecked
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=unchecked]:border-input"
                  />
                  {item.label}
                </Label>
              </div>
            )}

            {item.isRequire && errors[fieldName] && touchedFields[fieldName] && (
              <small className="text-red-500">{errors[fieldName]?.message?.toString()}</small>
            )}
          </div>
        );
      })}
    </div>
  );
};
