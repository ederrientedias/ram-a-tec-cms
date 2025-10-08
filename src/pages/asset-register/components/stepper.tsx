import { FieldValues, FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { ICollectionFields } from '@/models/instruments-registration.model';
import { ArrowLeft, ArrowRight, Check, FileCheck2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SubCollection } from '@/enums/firestoreIntranet.enum';
import { generateSchema } from '@/utils/generate-schema';
import { defineStepper } from '@/components/ui/stepper';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Form } from './form';


enum StepStatus {
  NOT_STARTED = 'Não iniciado',
  IN_PROGRESS = 'Em andamento',
  COMPLETED = 'Concluído',
}

export const Stepper = ({ customSteps, forms, formMapRef, editingData, isComplete }) => {
  const STEPS = !editingData ? customSteps : editingData.steps;
  const { useStepper, steps, utils } = defineStepper(...STEPS);
  const stepper = useStepper();
  const currentStepId = !editingData ? stepper?.current?.id : editingData.currentStepId;
  const [currentStepIndex, setCurrentStepIndex] = useState(utils.getIndex(currentStepId));
  const [stepData, setStepData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<any | null>(null);
  const hasSetEditingDataRef = useRef(false);
  const schema = generateSchema(forms[currentStepIndex]?.fields || []);
  const methods = useForm({ resolver: zodResolver(schema), mode: 'onChange' });

  const handleEdditingData = useCallback(() => {
    if (!editingData || hasSetEditingDataRef.current) return;
    setAssetData(editingData);
    stepper.goTo(utils.getAll()[currentStepIndex].id);
    hasSetEditingDataRef.current = true;
  }, [editingData, stepper, utils, currentStepIndex]);

  useEffect(() => handleEdditingData(), [handleEdditingData]);
  useEffect(() => setAssetId(crypto.randomUUID()), []);

  const handleStepData = async (formName: string) => {
    const { fields } = forms[currentStepIndex];
    const fieldIds = fields.map((f: any) => f.idName);

    if (!(await methods.trigger())) {
      toast.error('Por favor, corrija os erros no formulário antes de mudar de etapa.');
      await highlightFormErrors(methods);
      return;
    }

    const data = processFieldValues(fieldIds);
    const keys = fields.map((f: any) => ({ label: f.label, key: f.idName }));

    const metadata = {
      metadataKey: formName,
      keys,
      step: currentStepIndex,
      isCompleted: true,
      updatedAt: Date.now(),
      isValid: methods.formState.isValid,
    };

    const newStepData = {
      ...stepData,
      [formName]: {
        id: stepper.current.id,
        data,
        metadata,
        order: currentStepIndex,
      },
    };

    // const currentAssetData = {
    //   id: !editingData ? assetId : editingData.id,
    //   formId: formMapRef.formId,
    //   forms: { ...assetData?.forms, ...newStepData },
    //   currentStepId: getCurrentStepId(),
    //   currentStepIndex: getCurrentStepIndex(),
    //   formValid: methods.formState.isValid ?? false,
    //   steps: steps,
    //   stepsLength: steps.length,
    //   status: steps[currentStepIndex].id === 'complete' ? StepStatus.COMPLETED : StepStatus.IN_PROGRESS,
    //   createdAt: assetData?.createdAt ?? Date.now(),
    //   updatedAt: Date.now(),
    // };

    // if (editingData?.forms[formName]?.data) {
    //   editingData.forms[formName].data = data;
    // }
    const currentAssetData = createAssetData(newStepData);
    setStepData(newStepData);
    setAssetData(currentAssetData);
    return currentAssetData;
  };

  const processFieldValues = (fields: any[]) => {
    const currentValues = methods.getValues(fields);

    return fields.reduce((acc, field, index) => {
      const key = field;
      const value = currentValues[index];
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        acc[key] = JSON.parse(value);
      } else {
        acc[key] = value instanceof Date ? value.getTime() : value ?? null;
      }

      return acc;
    }, {} as Record<string, any>);
  };

  const createAssetData = (newStepData: any) => {
    const isEditing = !!assetData;
    const isCompleteStep = steps[currentStepIndex + 1].id === 'complete';

    return {
      id: isEditing ? assetData.id : assetId,
      formId: formMapRef.formId,
      forms: { ...assetData?.forms, ...newStepData },
      currentStepId: getCurrentStepId(),
      currentStepIndex: getCurrentStepIndex(),
      formValid: methods.formState.isValid ?? false,
      steps,
      stepsLength: steps.length,
      status: isCompleteStep ? StepStatus.COMPLETED : StepStatus.IN_PROGRESS,
      createdAt: assetData?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
  };

  const getCurrentStepId = () => {
    return assetData && currentStepIndex < assetData?.currentStepIndex
      ? assetData.currentStepId
      : utils.getNext(stepper.current.id)?.id;
  };

  const getCurrentStepIndex = () => {
    return assetData && currentStepIndex < assetData?.currentStepIndex
      ? assetData.currentStepIndex
      : currentStepIndex + 1;
  };

  const handleNext = async (formName: string, currenetStepIndex: number) => {
    const nextStepId = utils.getNext(stepper.current.id)?.id;
    const isFormValid = await methods.trigger();

    if (!isFormValid) {
      toast.error('Por favor, corrija os erros no formulário antes de mudar de etapa.');
      await highlightFormErrors(methods);
      return;
    }

    await handleStepData(formName);
    setCurrentStepIndex(currenetStepIndex + 1);

    if (nextStepId === 'complete') {
      stepper.goTo(nextStepId);
    } else {
      stepper.next();
    }
  };

  const handlePrev = async () => {
    setCurrentStepIndex(currentStepIndex - 1);
    stepper.prev();
  };

  const handleStepChange = async (targetIndex: number, targetStepId: string) => {
    const validation = validateStepNavigation(targetIndex);
    const isValid = await methods.trigger();

    if (!isValid && targetIndex > currentStepIndex) {
      toast.error('Por favor, corrija os erros no formulário antes de mudar de etapa.');
      await highlightFormErrors(methods);
      return;
    }

    if (!validation.isValid) {
      toast.warning(validation.message!);
      return;
    }

    setCurrentStepIndex(targetIndex);
    stepper.goTo(targetStepId);
  };

  const saveCurrentStepData = async (formName: string) => {
    setIsLoading(true);

    try {
      const assetData = await handleStepData(formName);
      await saveAssetToFirestore(assetData);
      toast.success('Os dados foram salvos com sucesso.');
    } catch (error) {
      toast.error('Erro ao salvar o ativo. Tente novamente.');
    } finally {
      setIsLoading(false);
      goToStep();
    }
  };

  const validateStepNavigation = (targetIndex: number): { isValid: boolean; message?: string } => {
    const isEditing = !!assetData;
    const isExceedingEditLimit = isEditing && targetIndex > assetData.currentStepIndex;
    const isSkippingSteps = !isEditing && targetIndex - currentStepIndex > 1;

    if (isExceedingEditLimit) {
      return { isValid: false, message: 'Você não pode avançar além da etapa em andamento!' };
    }

    if (isSkippingSteps) {
      return { isValid: false, message: 'Complete as etapas anteriores primeiro!' };
    }

    return { isValid: true };
  };

  const goToStep = () => {
    const isEditingPastStep = assetData && currentStepIndex < assetData?.currentStepIndex;
    if (isEditingPastStep) {
      goToCurrentStep();
    } else {
      goToNextStep();
    }
  };

  const goToCurrentStep = () => {
    setCurrentStepIndex(assetData.currentStepIndex);
    stepper.goTo(assetData.currentStepId);
  };

  const goToNextStep = () => {
    const index = currentStepIndex + 1 > steps.length - 1 ? currentStepIndex : currentStepIndex + 1;
    stepper.next();
    setCurrentStepIndex(index);
  };

  const handleSubmit = async (): Promise<void> => {
    const isFormValid = await methods.trigger();
    setIsLoading(true);

    if (!isFormValid || !assetData) {
      setIsLoading(false);
      toast.error('Por favor, corrija os erros no formulário antes de enviar.');
      return;
    }

    await handleAddRegisteredAsset(assetData);
  };

  const handleAddRegisteredAsset = async (assetData: any): Promise<void> => {
    try {
      await saveAssetToFirestore(assetData);
      toast.success('O Ativo foi salvo com sucesso.');
      isComplete(true);
    } catch (error) {
      toast.error('Erro ao salvar o ativo. Tente novamente.');
      isComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAssetToFirestore = async (assetData: any): Promise<void> => {
    const response = await firestoreService.setRegisteredAsset(SubCollection.Assets, assetData);

    if (!response) {
      toast.error('Não foi possível salvar o ativo. Tente novamente.');
    }
  };

  const highlightFormErrors = async (
    methods: UseFormReturn<FieldValues, any, FieldValues>
  ): Promise<boolean> => {
    const errorFields = Object.keys(methods.formState.errors);

    if (errorFields.length === 0) return true;

    const isValid = await methods.trigger(errorFields, { shouldFocus: true });

    return isValid;
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between">
        <h2 className="text-lg font-medium">
          Cadastro de{' '}
          {formMapRef ? (
            <span>
              {formMapRef.nickname} ({formMapRef.name})
            </span>
          ) : (
            ''
          )}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Etapa {currentStepIndex + 1} de {steps.length}
          </span>
          <div />
        </div>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <nav aria-label="Cadastro de Ativo" className="group my-4">
            <ol className="flex items-center  gap-2" aria-orientation="horizontal">
              {stepper.all.map((step, index, array) => {
                return (
                  <div key={step.id}>
                    <li className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        type="button"
                        role="tab"
                        aria-current={stepper.current.id === step.id ? 'step' : undefined}
                        aria-posinset={index + 1}
                        aria-setsize={steps.length}
                        aria-selected={stepper.current.id === step.id}
                        className={`flex size-10 items-center justify-center rounded-full group
                            ${
                              index <= currentStepIndex
                                ? 'bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600'
                            }
                            ${
                              index < currentStepIndex
                                ? 'bg-green-100 hover:bg-green-200 hover:text-green-600'
                                : ''
                            }
                        `}
                        onClick={() => handleStepChange(index, step.id)}
                      >
                        {index < currentStepIndex ? (
                          <Check className="size-5 text-green-500" />
                        ) : stepper.isLast ? (
                          <FileCheck2 />
                        ) : (
                          index + 1
                        )}
                      </Button>
                      {stepper.current.id === step.id ? (
                        <span className="text-base font-normal animate-in duration-300 slide-in-from-left-2 whitespace-nowrap">
                          {step.title}
                        </span>
                      ) : (
                        index < array.length - 1 && (
                          <div className="animate-out fade-out-0 zoom-out-95 duration-300">
                            <Separator
                              orientation="horizontal"
                              className={`min-w-[50px] h-[1px] transition-colors duration-300 ${
                                index < currentStepIndex
                                  ? 'bg-green-100'
                                  : index === currentStepIndex
                                  ? 'bg-blue-100'
                                  : 'bg-muted'
                              }`}
                            />
                          </div>
                        )
                      )}
                    </li>
                  </div>
                );
              })}
            </ol>
          </nav>
          {/* Conteudo do Step */}
          <div className="flex-1 mx-0 mt-14 mb-12">
            {forms.length > 0 &&
              stepper?.switch(
                Object.fromEntries(
                  forms?.map((item: ICollectionFields, index: number) => [
                    item.id,
                    () => (
                      <div className="w-full h-auto flex flex-col gap-3  animate-in  duration-500 slide-in-from-top-2 ">
                        <Form
                          key={item.id}
                          formFields={item.fields}
                          editingData={assetData?.forms[item.name]?.data}
                        />
                        {!stepper.isLast && (
                          <div className="flex items-center gap-2 justify-end p-4">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handlePrev}
                              disabled={stepper.isFirst}
                            >
                              <ArrowLeft />
                              Voltar
                            </Button>
                            <Button
                              type="button"
                              disabled={!methods.formState.isValid}
                              onClick={() => saveCurrentStepData(item.name)}
                            >
                              {isLoading ? (
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Enviando...
                                </span>
                              ) : (
                                'Salvar Etapa'
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={!methods.formState.isValid}
                              onClick={() => handleNext(item.name, index)}
                            >
                              Continuar
                              <ArrowRight />
                            </Button>
                          </div>
                        )}
                      </div>
                    ),
                  ])
                )
              )}
          </div>
          <div className="space-y-4">
            {stepper.isLast && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-blue-100 p-4 mb-4">
                    <FileCheck2 className="text-blue-500 w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Tudo pronto!</h2>
                  <p className="text-gray-600 mb-6 max-w-lg">
                    As informações do seu cadastro estão completas. Clique em
                    <strong>Salvar e concluir</strong> para finalizar e registrar o ativo.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={stepper.prev}
                    disabled={stepper.isFirst}
                  >
                    <ArrowLeft />
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      currentStepIndex + 1 === steps.length && stepper.current.id === 'complete'
                        ? false
                        : true
                    }
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      'Salvar e concluir'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
