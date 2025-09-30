import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { IBlock, IField, IForm, IFormsMap, IInstrument, } from '@/models/instruments-registration.model';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from '@/components/ui/accordion';
import { Check, ChevronDown, ChevronsUpDown, CircleAlert, Pencil, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useFormsMap } from '@/hooks/firestore-intranet/use-forms-map';
import { useGroups } from '@/hooks/firestore-intranet/use-groups';
import { SubCollection } from '@/enums/firestoreIntranet.enum';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';


type SelectedItem = {
  id: string;
  name: string;
  fields: IField[];
};

type IFormRef = {
  id: string;
  name: string;
  fields: { id: string; fieldBlockRef: string }[];
};

type EmptyFields = { id: string; name: string; index: number; isEmpty: boolean };

export const ConfigureRegistration = () => {
  const queryClient = useQueryClient();
  const [instruments, setInstruments] = useState<IInstrument[]>([]);
  const [fieldsBlock, setFieldsBlock] = useState<IBlock[]>([]);
  const [data, setData] = useState<SelectedItem[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<IBlock[]>([]);
  const [forms, setForms] = useState<IFormRef[]>([]);
  const [seletectedInstrumentGroup, setSelectedInstrumentGroup] = useState<string | null>(null);
  const [seletectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [groupRef, setGroupRef] = useState<string | null>(null);
  const [emptyFields, setEmptyFields] = useState<EmptyFields[] | null>(null);
  const [instrumentRef, setInstrumentRef] = useState<IInstrument | null>(null);
  const [groupName, setGroupName] = useState('');
  const [instrumentName, setInstrumentName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: instrumentsGroup, isLoading: InstrumentsGroupLoading } = useGroups();
  const { data: formsMap } = useFormsMap();

  const loadInstruments = useCallback(async () => {
    setFieldsBlock([]);
    if (!seletectedInstrumentGroup) return;
    const ref = { key: 'instrumentGroupRef', id: seletectedInstrumentGroup };
    const instruments = await firestoreService.getAllInstrumentsOrGroupsById<IInstrument>(
      SubCollection.Instruments,
      ref
    );

    setInstruments(instruments);
  }, [seletectedInstrumentGroup]);

  const loadFieldsBlock = useCallback(async () => {
    if (!seletectedInstrument && !groupRef) return;

    const blocks = await firestoreService.getBlockByGroup(groupRef);
    setFieldsBlock(blocks);
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
    const fields = await firestoreService.getFieldsOrBlocks<IField>('fields');
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
    setGroupName(value);
    updateGroupState(value);
  };

  const updateGroupState = (value: string) => {
    const group = instrumentsGroup?.find((group) => group.name === value);
    setSelectedInstrumentGroup(group.id);
    setGroupRef(group.group);
    setInstrumentName('');
  };

  const handleInstrumentChange = (value: string) => {
    setInstrumentName(value);
    updateInstrumentState(value);
  };

  const updateInstrumentState = (value: string) => {
    if (instruments.length === 0) return;
    const instrument = instruments?.find((item) => item.name === value);
    setSelectedInstrument(instrument.id);
    setInstrumentRef(instrument);
    setData([]);
    setSelectedOptions([]);
  };

  const handleOptionSelect = (selectedItem: IBlock, checked: boolean | 'indeterminate') => {
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

      return prev.map((p) =>
        p.id === itemId
          ? {
              ...p,
              fields: [
                ...p.fields,
                {
                  id: field.id,
                  fieldBlockRef: field.fieldBlockRef,
                },
              ],
            }
          : p
      );
    });
  };

  const handleSelectedAll = (item: SelectedItem, checked: boolean | 'indeterminate') => {
    const isChecked = checked;
    setForms((prev) =>
      prev.map((p) =>
        p.id === item.id
          ? {
              ...p,
              fields: isChecked
                ? item.fields.map((f) => ({ id: f.id, fieldBlockRef: f.fieldBlockRef }))
                : [],
            }
          : p
      )
    );
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

      const isSetForm = await firestoreService.setRegisteredForm(SubCollection.Forms, form);

      if (!isSetForm) {
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

  const editForm = async (formMap: IFormsMap) => {
    console.log(formMap);
    // const form = await firestoreService.getRegisteredFormById('forms', formMap.formId);
    // console.log(form);
  };

  const resetFormConfig = () => {
    setSelectedInstrumentGroup(null);
    setSelectedInstrument(null);
    setInstrumentRef(null);
    setGroupRef(null);
    setGroupName('');
    setInstrumentName('');
    setEmptyFields([]);
    setFieldsBlock([]);
    setForms([]);
    setInstruments([]);
    setSelectedOptions([]);
    setData([]);
    loadFormsMap();
  };

  const loadFormsMap = async () => {
    await queryClient.invalidateQueries({ queryKey: ['formsMap'] });
  };

  const clearConfig = () => {
    resetFormConfig();
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-end gap-2">
        <div className="w-full min-w-72 space-y-2">
          <Label htmlFor="group">Grupo de Instrumentos</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                <span className="text-ellipsis truncate max-w-[300px]">
                  {groupName
                    ? instrumentsGroup?.find((group) => group.name === groupName)?.name
                    : InstrumentsGroupLoading
                    ? 'carregando...'
                    : 'Selecione o grupo de instrumento'}
                </span>
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {instrumentsGroup?.map((group) => (
                      <CommandItem
                        key={group.id}
                        value={group.name}
                        onSelect={handleInstrumentGroupChange}
                      >
                        {group.name}
                        <Check
                          className={cn(
                            'ml-auto',
                            groupName === group.name ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full min-w-72 space-y-2">
          <Label htmlFor="fund">Instrumentos</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                disabled={!seletectedInstrumentGroup}
              >
                <span className="text-ellipsis truncate max-w-[300px]">
                  {instrumentName
                    ? instruments?.find((group) => group.name === instrumentName)?.name
                    : !instruments
                    ? 'carregando...'
                    : 'Selecione o instrumento'}
                </span>
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {instruments?.map((instrument) => (
                      <CommandItem
                        key={instrument.id}
                        value={instrument.name}
                        onSelect={handleInstrumentChange}
                      >
                        {instrument.name}
                        <Check
                          className={cn(
                            'ml-auto',
                            instrumentName === instrument.name ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full min-w-72 space-y-2">
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
            <PopoverTrigger
              className={`${
                !seletectedInstrument
                  ? 'w-full h-10 bg-background border rounded-lg py-2 px-3 cursor-not-allowed opacity-50'
                  : 'w-full h-10 bg-background border rounded-lg py-2 px-3'
              }`}
              disabled={!seletectedInstrument}
            >
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
          {groupName && instrumentName ? (
            <>
              <h1 className="font-medium">Configuração do Cadastro</h1>
              <h1>
                {' '}
                - {instrumentRef?.nickname} ({instrumentRef?.name}){' '}
              </h1>
            </>
          ) : (
            <div className="w-full flex flex-col rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>ID</TableHead> */}
                    <TableHead>Nickname</TableHead>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formsMap?.map((form) => {
                    return (
                      <TableRow key={form.formId}>
                        <TableCell>{form.nickname}</TableCell>
                        <TableCell>{form.name}</TableCell>
                        <TableCell>{form.instrumentGroupRef.group}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* onClick={() => openDialog(field)} */}
                            <Button variant="ghost" size="icon" onClick={() => editForm(form)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {/* onClick={() => openAlert(field)} */}
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        {selectedOptions && (
          <div className="flex flex-col items-start">
            {/* <h2>Blocos de Campos</h2> */}
            {data?.map((item: any, i: number) => {
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
                            className="data-[state=checked]:border-blue-600 data-[state=unchecked]:border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
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
                              className="data-[state=checked]:border-blue-600 data-[state=unchecked]:border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
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
