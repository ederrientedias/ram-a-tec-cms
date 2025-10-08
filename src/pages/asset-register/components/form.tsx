import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { useSelectOptions } from '@/hooks/firestore-intranet/use-select-options';
import { IField } from '@/models/instruments-registration.model';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CleaveInput from 'cleave.js/react';
import { useEffect } from 'react';


export const Form = ({ formFields, editingData }) => {
  const { data: selectOptins } = useSelectOptions();
  const {
    control,
    reset,
    formState: { errors, touchedFields },
  } = useFormContext();

  useEffect(() => {
    if (!editingData) return;
    reset(editingData);
  }, [editingData, reset]);

  const fecthSelectOptions = (optionRef: string) => {
    return selectOptins?.find((option) => option.id === optionRef)?.options ?? [];
  };

  return (
    <div className="w-full grid grid-cols-3 gap-y-5 gap-x-2">
      {formFields?.map((item: IField) => {
        return (
          <div key={item.id}>
            {/* Tipo texto */}
            {item.type === 'text' && (
              <div className="flex flex-col gap-2">
                <Label className={!item.label ? 'text-transparent' : null}>{item.label}</Label>
                <Controller
                  name={item.idName}
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
                  name={item.idName}
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
            {(item.type === 'select' || item.type === 'custom-list') && (
              <div className="flex flex-col gap-2">
                <Label className={!item.label ? 'text-transparent' : null}>
                  {item.label ?? 'empty'}
                </Label>
                <Controller
                  name={item.idName}
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
                        {/* Ajustar a base de dados para ter chaves diferentes nos arrays */}
                        {fecthSelectOptions(item.optionsRef).map((option) => {
                          const id = option['ID']?.toString() ?? option.id;
                          const name =
                            option['NOME'] ??
                            option['CLASSE'] ??
                            option['COD'] ??
                            option['name'] ??
                            option['NICKNAME'];
                          return (
                            <SelectItem key={id} value={JSON.stringify(option) ?? ''}>
                              {name}
                            </SelectItem>
                          );
                        })}
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
                  name={item.idName}
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

            {item.isRequired && errors[item.idName] && (
              <small role="alert" className="text-red-500">
                {errors[item.idName]?.message?.toString()}
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
};
