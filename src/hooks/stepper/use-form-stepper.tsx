import firestoreService from '@/services/firestore-intranet/firestore.service';
import { ICollectionFields } from '@/models/instruments-registration.model';
import { SubCollection } from '@/enums/firestoreIntranet.enum';
import { useState, useEffect, useCallback } from 'react';


interface StepConfig {
  id: string;
  title: string;
  description?: string;
}

interface UseFormStepsReturn {
  customSteps: StepConfig[];
  isLoading: boolean;
  error: string | null;
  formData: ICollectionFields[] | null;
}

export const useFormStepper = (formId: string | null): UseFormStepsReturn => {
  const [formData, setFormData] = useState<ICollectionFields[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFormData = useCallback(async () => {
    if (!formId) {
      setFormData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const forms = await firestoreService.getRegisteredFormById<any>(SubCollection.Forms, formId);
      setFormData(forms.forms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar formulário');
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  const baseSteps: StepConfig[] = formData?.length
    ? formData.map(({ id, name }) => ({ id, title: name, description: '' }))
    : [];

  const steps: StepConfig[] = [
    ...baseSteps,
    ...(baseSteps.length > 0
      ? [{ id: 'complete', title: 'Cadastro Completo', description: '' }]
      : []),
  ];

  return { customSteps: steps, isLoading, error, formData };
};
