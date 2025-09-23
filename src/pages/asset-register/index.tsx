import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingFindDataAnimation from '@/components/animations/loadingFinddata';
import { IFieldRef, IFormsMap } from '@/models/instrumentsRegistration.model';
import { useFormsMap } from '@/hooks/firestore-intranet/use-forms-map';
import { useFormStepper } from '@/hooks/stepper/use-form-stepper';
import { useFields } from '@/hooks/firestore-intranet/use-fields';
import { useCallback, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';

import { Stepper } from './components/stepper';

export const AssetRegister = () => {
  const { data: formsMap, error: formsMapError, isLoading: formsMapLoading } = useFormsMap();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formMapRef, setFormMapRef] = useState<IFormsMap | null>(null);
  const [forms, setForms] = useState([]);
  const { data: fieldsData } = useFields();
  const {
    customSteps,
    isLoading: formLoading,
    error: formError,
    formData,
  } = useFormStepper(selectedForm);

  const loadFields = useCallback(
    (fields: IFieldRef[]) => {
      return fields
        .map((field) => {
          const f = fieldsData.find((fd) => fd.id === field.id);
          return f ? { ...f } : null;
        })
        .filter(Boolean);
    },
    [fieldsData]
  );

  const loadForm = useCallback(async () => {
    if (!selectedForm) return;
    const data = formData?.map((f) => ({ ...f, fields: loadFields(f.fields) }));
    setForms(data);
  }, [selectedForm, formData, loadFields]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const handleFormMapChange = (id: string) => {
    const formMap = formsMap.find((f) => f.formId === id);
    setFormMapRef(formMap);
    setSelectedForm(id);
  };

  const handleCompleteForm = (isComplete: boolean) => {
    if (isComplete) {
      setSelectedForm(null);
      setForms([]);
      requestAnimationFrame(() => requestAnimationFrame(() => setSelectedForm(formMapRef.formId)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cadastro de Ativo</h1>
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="fund">Formulário de instrumento</Label>
          <Select onValueChange={(value) => handleFormMapChange(value)}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  formsMapLoading ? 'Carregando...' : 'Selecione o formulário do instrumento'
                }
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
        {!formLoading && formMapRef && forms ? (
          <Stepper
            customSteps={customSteps}
            forms={forms}
            formMapRef={formMapRef}
            isComplete={handleCompleteForm}
          />
        ) : formLoading ? (
          <LoadingFindDataAnimation />
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
