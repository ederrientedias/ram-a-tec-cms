import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormsMap } from '@/hooks/firestore-intranet/use-forms-map';
import { IFormsMap } from '@/models/instrumentsRegistration.model';
import { useFormSteps } from '@/hooks/stepper/use-form-steps';
import { useCallback, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';

import { Stepper } from './components/stepper';

export const AssetRegister = () => {
  const { data: formsMap, error: formsMapError, isLoading: formsMapLoading } = useFormsMap();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formMapRef, setFormMapRef] = useState<IFormsMap | null>(null);
  const [forms, setForms] = useState([]);

  const {
    customSteps,
    isLoading: formLoading,
    error: formError,
    formData,
  } = useFormSteps(selectedForm);

  const loadForm = useCallback(async () => {
    if (!selectedForm) return;
    setForms(formData);
  }, [selectedForm, formData]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const handleFormMapChange = (id: string) => {
    const formMap = formsMap.find((f) => f.formId === id);
    setFormMapRef(formMap);
    setSelectedForm(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cadastro de Ativo</h1>
        <div className="w-[300px] min-w-72 space-y-2">
          {/* <Label htmlFor="fund">Formulário de instrumento</Label> */}
          <Select onValueChange={(value) => handleFormMapChange(value)}>
            <SelectTrigger>
              <SelectValue
                placeholder={formsMapLoading ? 'Carregando...' : 'Selecione um instrumento'}
              />
            </SelectTrigger>
            <SelectContent>
              {formsMap?.map((item) => (
                <SelectItem key={item.formId} value={item.formId}>
                  {item.nickname} - {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        {customSteps && forms && formMapRef ? (
          <Stepper customSteps={customSteps} forms={forms} formMapRef={formMapRef} />
        ) : (
          <div className="w-full h-[400px] flex flex-col items-center justify-center">
            {formsMapError ? (
              <h2 className="text-xl text-red-500">Erro ao carregar os instrumentos.</h2>
            ) : (
              <h2 className="text-xl">
                Para cadastrar um ativo, primeiro selecione um instrumento.
              </h2>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
