import firestoreService from '@/services/firestore-intranet/firestore.service';
import { ICollectionFields } from '@/models/instrumentsRegistration.model';
import { generateSchema } from '@/utils/generate-schema';
import { FormProvider, useForm } from 'react-hook-form';
import { defineStepper } from '@/components/ui/stepper';
import { sanitizeString } from '@/utils/format-string';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Check, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

import { Form } from './form';

export const Stepper = ({ customSteps, forms, formMapRef }) => {
  const { useStepper, steps, utils } = defineStepper(...customSteps);
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper?.current?.id);
  const [formData, setFormData] = useState<any>({});
  const schema = generateSchema(forms[currentIndex]?.fields || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const handleNext = async (formName: string) => {
    const fields = forms[currentIndex]?.fields.map((f) => sanitizeString(f.fieldName)) || [];
    const valid = await methods.trigger(fields);

    if (!valid) {
      toast.error('Corrija os erros no formulário antes de continuar.');
      console.log('Campos com erro:', methods.formState.errors);
      return;
    }

    handleSaveStepData(fields, formName);

    stepper.next();
  };

  const handleSaveStepData = (fields: any, formName: string) => {
    const currentValues = methods.getValues(fields);

    const data = fields.reduce((acc: any, field: any, index: number) => {
      return {
        ...acc,
        [sanitizeString(field)]:
          currentValues[index] instanceof Date
            ? new Date(currentValues[index]).getTime()
            : currentValues[index],
      };
    }, {});

    setFormData((prev: any) => ({
      ...prev,
      ...{ [formName]: data },
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const valid = await methods.trigger();

    if (!valid) {
      setIsLoading(false);
      toast.error('Por favor, corrija os erros no formulário antes de enviar.');
      console.log('Campos com erro:', methods.formState.errors);
      return;
    }

    const registeredAsset = { id: crypto.randomUUID(), ...formData };
    await handleAddRegisteredAsset(registeredAsset);
  };

  const handleAddRegisteredAsset = async (data: any) => {
    try {
      const response = await firestoreService.setRegistredAsset(data);

      if (!response) {
        toast.error('Não foi possível salvar o ativo. Tente novamente.');
        return;
      }

      toast.success('O Ativo foi salvo com sucesso.');
    } catch (error) {
      console.log('Catch error:', error);
      toast.error('Erro ao salvar o ativo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6  w-full">
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
            Etapa {currentIndex + 1} de {steps.length}
          </span>
          <div />
        </div>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <nav aria-label="Cadastro de Ativo" className="group my-4">
            <ol className="flex flex-col gap-2" aria-orientation="vertical">
              {stepper.all.map((step, index, array) => (
                <div key={step.id}>
                  <li className="flex items-center gap-4 flex-shrink-0">
                    <Button
                      type="button"
                      role="tab"
                      aria-current={stepper.current.id === step.id ? 'step' : undefined}
                      aria-posinset={index + 1}
                      aria-setsize={steps.length}
                      aria-selected={stepper.current.id === step.id}
                      className={`flex size-10 items-center justify-center rounded-full group
                            ${
                              index <= currentIndex
                                ? 'bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600'
                            }
                            ${
                              index < currentIndex
                                ? 'bg-green-100 hover:bg-green-200 hover:text-green-600'
                                : ''
                            }
                        `}
                      onClick={() => stepper.goTo(step.id)}
                    >
                      {index < currentIndex ? (
                        <Check className="size-5 text-green-500" />
                      ) : stepper.isLast ? (
                        <FileCheck2 />
                      ) : (
                        index + 1
                      )}
                    </Button>
                    <span className="text-base font-normal">{step.title}</span>
                  </li>
                  <div className="flex gap-4">
                    {index < array.length - 1 && (
                      <div className="flex justify-center ps-5">
                        <Separator
                          orientation="vertical"
                          className={`w-[1px] h-full
                                ${
                                  index < currentIndex
                                    ? 'bg-green-100'
                                    : index === currentIndex
                                    ? 'bg-blue-100'
                                    : 'bg-muted'
                                }
                            `}
                        />
                      </div>
                    )}

                    {/* Conteudo do Step */}
                    <div className="flex-1 my-4">
                      {forms.length > 0 &&
                        stepper.current.id === step.id &&
                        stepper.switch(
                          Object.fromEntries(
                            forms.map((item: ICollectionFields) => [
                              item.id,
                              () => (
                                <div className="w-full h-auto flex flex-col gap-3 ">
                                  <Form key={item.id} fields={item.fields} />
                                  {!stepper.isLast && (
                                    <div className="flex items-center gap-2 justify-end p-4">
                                      <Button
                                        variant="secondary"
                                        onClick={stepper.prev}
                                        disabled={stepper.isFirst}
                                      >
                                        Voltar
                                      </Button>
                                      <Button type="submit" onClick={() => handleNext(item.name)}>
                                        Continuar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ),
                            ])
                          )
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </ol>
          </nav>
          <div className="space-y-4">
            {stepper.isLast && (
              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={stepper.prev} disabled={stepper.isFirst}>
                  Voltar
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={!methods.formState.isValid}>
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
                    'Salvar'
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
