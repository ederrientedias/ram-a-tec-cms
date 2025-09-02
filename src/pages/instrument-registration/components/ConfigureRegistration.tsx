import {
  IField,
  IFieldsBlock,
  IForm,
  IFormsMap,
  IInstrument,
} from '@/models/instrumentsRegistration.model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useInstrumentsGroup } from '@/hooks/firestore-intranet/use-instruments-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { ChevronDown, Check, CircleAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type selectedItem = { id: string; name: string; fields: IField[] };
export const ConfigureRegistration = () => {
  const [instruments, setInstruments] = useState<IInstrument[]>([]);
  const [fieldsBlock, setFieldsBlock] = useState<IFieldsBlock[]>([]);
  const [data, setData] = useState<selectedItem[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<IFieldsBlock[]>([]);
  const [seletectedInstrumentGroup, setSelectedInstrumentGroup] = useState<string | null>(null);
  const [seletectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [emptyFields, setEmptyFields] = useState<
    { id: string; name: string; index: number; isEmpty: boolean }[] | null
  >(null);
  const [groupRef, setGroupRef] = useState<string | null>(null);
  const [instrumentRef, setInstrumentRef] = useState<IInstrument | null>(null);
  const [forms, setForms] = useState<selectedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    data: instrumentsGroup,
    error: instrumentGroupErro,
    isLoading: InstrumentsGroupLoading,
  } = useInstrumentsGroup();

  const loadInstruments = useCallback(async () => {
    setFieldsBlock([]);
    if (!seletectedInstrumentGroup) return;
    const instruments = await firestoreService.getInstrumentsById(seletectedInstrumentGroup);
    setInstruments(instruments);
  }, [seletectedInstrumentGroup]);

  const loadFieldsBlock = useCallback(async () => {
    if (!seletectedInstrument && !groupRef) return;

    const fieldsBlock = await firestoreService.getFieldsBlockByGroup(groupRef);
    setFieldsBlock(fieldsBlock);
  }, [seletectedInstrument, groupRef]);

  const handleFields = useCallback(
    (fields: IField[]) => {
      const data = selectedOptions.map((item) => {
        return {
          id: item.id,
          name: item.name,
          fields: fields.filter((field) => item.id === field.fieldBlockRef),
        };
      });

      setData(data);
    },
    [selectedOptions]
  );

  const loadFields = useCallback(async () => {
    if (!seletectedInstrument) return;
    const fields = await firestoreService.getFields();
    handleFields(fields);
  }, [seletectedInstrument, handleFields]);

  useEffect(() => {
    loadInstruments();
  }, [loadInstruments]);

  useEffect(() => {
    loadFieldsBlock();
  }, [loadFieldsBlock]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const handleInstrumentGroupChange = (value: string) => {
    setSelectedInstrumentGroup(value);
    handleGroupRef(value);
  };

  const handleGroupRef = (id: string) => {
    const data = instrumentsGroup.find((inst) => inst.id === id);
    setGroupRef(data.group);
  };

  const handleInstrumentChange = (value: string) => {
    setSelectedInstrument(value);
    setData([]);
    setSelectedOptions([]);
    handleInstrumentRef(value);
  };

  const handleInstrumentRef = (id: string) => {
    if (instruments.length === 0) return;
    const itemRef = instruments?.find((item) => item.id === id);
    setInstrumentRef(itemRef);
  };

  const handleOptionSelect = (selectedItem: IFieldsBlock, checked: boolean | 'indeterminate') => {
    const isChecked = checked;
    setSelectedOptions((prev) => {
      const exists = prev.some((item) => item.id === selectedItem.id);

      if (isChecked && !exists) {
        setForms([
          ...forms,
          {
            id: selectedItem.id,
            name: selectedItem.name,
            fields: [],
          },
        ]);

        return [...prev, selectedItem];
      }

      if (!isChecked && exists) {
        const filtered = data?.filter((d) => d.id !== selectedItem.id);
        const emptys = emptyFields?.filter((e) => e.id !== selectedItem.id);
        setEmptyFields(emptys);
        setData(filtered);
        return prev.filter((item) => item.id !== selectedItem.id);
      }

      return prev;
    });
  };

  const handleSelectedField = (
    itemId: string,
    field: IField,
    checked: boolean | 'indeterminate'
  ) => {
    const isChecked = checked;
    setForms((prev) => {
      const exists = prev.some((s) => s.id === itemId);
      if (!exists) return prev;

      if (!isChecked) {
        return prev.map((p) => {
          if (p.id === itemId) {
            p.fields = p.fields.filter((f) => f.id !== field.id);
          }
          return p;
        });
      }

      return prev.map((p) => (p.id === itemId ? { ...p, fields: [...p.fields, field] } : p));
    });
  };

  const handleSelectedAll = (item: selectedItem, checked: boolean | 'indeterminate') => {
    const isChecked = checked;
    setForms((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, fields: isChecked ? item.fields : [] } : p))
    );

    console.log(forms);
  };

  const handleEmptyValues = () => {
    const emptyFields = forms.map((item, index) => ({
      id: item.id,
      name: item.name,
      index,
      isEmpty: item.fields.length === 0,
    }));
    const allFilled = emptyFields.every((item) => item.isEmpty === false);
    setEmptyFields(emptyFields);
    return { allFilled };
  };

  const onSubmit = async () => {
    const { allFilled } = handleEmptyValues();

    if (allFilled) {
      setIsLoading(true);
      return await handleCreateForm();
    }
  };

  const handleCreateForm = async () => {
    const form = {
      id: crypto.randomUUID(),
      forms,
    };

    const formMap = {
      formId: form.id,
      instrumentId: seletectedInstrument,
      name: instrumentRef.name,
      nickname: instrumentRef.nickname,
      instrumentGroupRef: {
        id: seletectedInstrumentGroup,
        group: groupRef,
      },
    };

    await addForm(form, formMap);
  };

  const addForm = async (form: IForm, formMap: IFormsMap) => {
    try {
      const response = await firestoreService.setFormMap(formMap);

      if (!response) {
        toast.error('Não foi possível criar o mapa de formulários.');
        return;
      }

      const setFormResponse = await firestoreService.setForm(form);

      if (!setFormResponse) {
        toast.error('Não foi possível criar o formulário de cadastro.');
        return;
      }

      toast.success('O formulário foi criado com sucesso.');
      resetFormConfig();
    } catch (error) {
      toast.error('Não foi possível criar o formulário');
      console.log('Log de Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormConfig = () => {
    setSelectedOptions([]);
    setSelectedInstrumentGroup(null);
    setGroupRef(null);
    setEmptyFields([]);
    setFieldsBlock([]);
    setForms([]);
    setInstruments([]);
    setInstrumentRef(null);
  };

  const clearConfig = () => {
    setSelectedInstrumentGroup(null);
    loadInstruments();
    setData([]);
    setForms([]);
    setSelectedOptions([]);
    setInstrumentRef(null);
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-end gap-2">
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="fund">Grupo de Instrumentos</Label>
          <Select onValueChange={handleInstrumentGroupChange}>
            <SelectTrigger>
              {instrumentGroupErro ? (
                <SelectValue placeholder="Não foi possível carregar os dados." />
              ) : (
                <SelectValue
                  placeholder={
                    InstrumentsGroupLoading ? 'Carregando...' : 'Selecione um grupo de instrumento'
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {instrumentsGroup?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="fund">Instrumento</Label>
          <Select onValueChange={handleInstrumentChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={!instruments ? 'Carregando...' : 'Selecione um instrumento'}
              />
            </SelectTrigger>
            <SelectContent>
              {instruments?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[300px] min-w-72 space-y-2">
          <Label className="flex items-center justify-between" htmlFor="optionsRef">
            Bloco de Campos
            <Tooltip>
              <TooltipTrigger>
                <CircleAlert className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-normal">
                  Os formulários serão exibidos conforme a ordem dos blocos selecionados.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Popover>
            <PopoverTrigger className="w-full h-10 border rounded-lg py-2 px-3 bg-background">
              <div className="flex items-center justify-between">
                <span className="text-sm">Selecione o bloco de campo</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="min-w-[475px]">
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {fieldsBlock?.map((block) => {
                  return (
                    <div
                      key={block.id}
                      className="flex items-center gap-2 text-zinc-900 text-sm font-medium"
                    >
                      <Checkbox
                        checked={selectedOptions.some((item) => item.id === block.id)}
                        onCheckedChange={(checked) => handleOptionSelect(block, checked)}
                      />
                      {block.name}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-7">
        <div className="flex items-center gap-2">
          <h1 className="font-medium">Configuração do Cadastro</h1>
          {instrumentRef && (
            <>
              <h1>
                - {instrumentRef?.nickname} ({instrumentRef?.name})
              </h1>
            </>
          )}
        </div>
        {selectedOptions && (
          <div className="flex flex-col items-start">
            {/* <h2>Blocos de Campos</h2> */}
            {data.map((item: any, i: number) => {
              return (
                <Accordion key={item.id} type="single" collapsible className="w-full">
                  <AccordionItem value={item.id}>
                    <AccordionTrigger>{item.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center gap-2 flex-wrap my-4">
                        <Label
                          key={item.id}
                          className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 cursor-pointer"
                        >
                          <Checkbox
                            id={item.id}
                            checked={data[i].fields.length === forms[i]?.fields.length}
                            onCheckedChange={(checked) => handleSelectedAll(item, checked)}
                            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                          />
                          <div className="grid gap-1.5 font-normal">
                            <p className="text-sm leading-none font-medium">Todos</p>
                          </div>
                        </Label>
                        {item.fields.map((field: IField) => (
                          <Label
                            key={field.id}
                            className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 cursor-pointer"
                          >
                            <Checkbox
                              id={field.id}
                              checked={forms[i]?.fields.some((s) => s.id === field.id)}
                              onCheckedChange={(checked) =>
                                handleSelectedField(item.id, field, checked)
                              }
                              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                            />
                            <div className="grid gap-1.5 font-normal">
                              <p className="text-sm leading-none font-medium">{field.label}</p>
                            </div>
                          </Label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-end">
          <div className="w-full flex flex-col items-start gap-2">
            {emptyFields?.map((e) => {
              return (
                e.isEmpty &&
                forms[e.index].fields.length === 0 && (
                  <small key={e.id} className="text-red-400 flex items-center gap-1">
                    O bloco
                    <span className="font-bold">{e.name}</span>
                    deve conter ao menos um campo.
                  </small>
                )
              );
            })}
          </div>
          {selectedOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => clearConfig()}>
                Cancelar
              </Button>
              <Button onClick={() => onSubmit()}>
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
      </div>
    </div>
  );
};
