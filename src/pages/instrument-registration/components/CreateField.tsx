import { Check, ChevronDown, ChevronsUpDown, MousePointerClick, Pencil, Plus, Search, ServerCrash, Settings2Icon, Trash2, X, } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { createFieldDefaultValues, CreateFieldSchema, createfieldSchema, } from '@/schemas/instrument-registration/createField.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { IField, IOption, ISelectOption } from '@/models/instruments-registration.model';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useFieldsBlock } from '@/hooks/firestore-intranet/use-fields-block';
import firestoreAssetManagement from '@/services/firestoreAssetManagement';
import { normalizeText, sanitizeString } from '@/utils/format-string';
import { useFields } from '@/hooks/firestore-intranet/use-fields';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { SubCollection } from '@/enums/firestoreIntranet.enum';
import { useCallback, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckedState } from '@radix-ui/react-checkbox';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatTimestamp } from '@/utils/format-date';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CustomInputMask } from './CustomInputMask';


const types = [
  {
    id: 0,
    name: 'Text',
    type: 'text',
  },
  {
    id: 1,
    name: 'Number',
    type: 'number',
  },
  {
    id: 2,
    name: 'Date',
    type: 'date',
  },
  {
    id: 3,
    name: 'Lista',
    type: 'select',
  },
  {
    id: 4,
    name: 'Lista Customizável',
    type: 'custom-list',
  },
  {
    id: 5,
    name: 'Checkbox',
    type: 'checkbox',
  },
];

const collectionsMap = [
  {
    id: 0,
    name: 'Agencia Rating',
    collection: 'agencia_rating',
  },
  {
    id: 1,
    name: 'Capital Social',
    collection: 'capital_social',
  },
  {
    id: 2,
    name: 'Classe de Investimento',
    collection: 'classe_invest',
  },
  {
    id: 3,
    name: 'Classificação do Fundo',
    collection: 'classific_fundo',
  },
  {
    id: 4,
    name: 'classificação de liquidez da ANBIMA',
    collection: 'classific_liqdz_anbima',
  },
  {
    id: 5,
    name: 'Condomínio',
    collection: 'condominio',
  },
  {
    id: 6,
    name: 'Indexador',
    collection: 'indexador',
  },
  {
    id: 7,
    name: 'Instrumento',
    collection: 'instrumento',
  },
  {
    id: 8,
    name: 'Investimento',
    collection: 'invest',
  },
  {
    id: 9,
    name: 'Modo de Investimento',
    collection: 'mod_invest',
  },
  {
    id: 10,
    name: 'Moeda',
    collection: 'moeda',
  },
  {
    id: 11,
    name: 'Oferta',
    collection: 'oferta',
  },
  {
    id: 12,
    name: 'Persona',
    collection: 'persona',
  },
  {
    id: 13,
    name: 'Persona Fundo',
    collection: 'persona_fundo',
  },
  {
    id: 14,
    name: 'Persona PJ',
    collection: 'persona_pj',
  },
  {
    id: 15,
    name: 'Rating',
    collection: 'rating',
  },
  {
    id: 16,
    name: 'Rating Mercado',
    collection: 'rating_mercado',
  },
  {
    id: 17,
    name: 'Setor Atividade',
    collection: 'setor_atividade',
  },
  {
    id: 18,
    name: 'Setor Macro',
    collection: 'setor_macro',
  },
  {
    id: 19,
    name: 'Setor Negócio',
    collection: 'setor_negocio',
  },
  {
    id: 20,
    name: 'Tipificação cedente sacado.',
    collection: 'tipific_cedente_sacado',
  },
  {
    id: 21,
    name: 'Tipo Carteira',
    collection: 'tipo_carteira',
  },
];

export const CreateField = () => {
  const queryClient = useQueryClient();
  const [options, setOptions] = useState<any>([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [allOptions, setAllOptions] = useState<CheckedState | null>(null);
  const [displayOptions, setDisplayOptions] = useState<string | null>(null);
  const [fieldRef, setFieldRef] = useState<IField | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<IField[] | []>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customList, setCustomList] = useState([]);
  const [customName, setCustomName] = useState('');
  const [customInputMaskName, setCustomInputMaskName] = useState(null);
  const [isCustomInputMaskOpen, setIsCustomInputMaskOpen] = useState(false);
  const [inputMaskOptions, setInputMaskOption] = useState(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptions, setIsOptions] = useState<boolean>(false);
  const [isEditField, setIsEditField] = useState<boolean>(false);
  const [isCollectionData, setIsCollectionData] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [blockName, setBlockName] = useState('');

  const { data: fieldsBlock, error, isLoading: fieldsBlockIsloading } = useFieldsBlock();
  const { data: fields, error: fieldsError, isLoading: fieldsLoading } = useFields();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateFieldSchema>({
    resolver: zodResolver(createfieldSchema),
    defaultValues: createFieldDefaultValues,
    shouldUnregister: false,
  });

  const selectedType = useWatch({
    control,
    name: 'type',
    defaultValue: createFieldDefaultValues.type,
  });

  const selectedCollectionData = useWatch({
    control,
    name: 'collectionData',
    defaultValue: createFieldDefaultValues.collectionData,
  });

  const loadOptions = useCallback(async () => {
    if (!selectedCollectionData) return;
    setIsOptions(true);
    const options = await firestoreAssetManagement.getCollectionData(selectedCollectionData);
    setOptions(options);
  }, [selectedCollectionData]);

  const loadFields = useCallback(async () => {
    if (!selectedBlockId) return;
    const filteredFields = fields.filter((f) => f.fieldBlockRef === selectedBlockId);
    setSelectedFields(filteredFields);
  }, [selectedBlockId, fields]);

  useEffect(() => {
    if (!selectedType) return;

    const selectedTypes = {
      select: () => {
        setCustomList([]);
        setCustomName('');
      },
      'custom-list': () => {
        setOptions([]);
        setIsOptions(false);
        setValue('collectionData', '');
      },
    };

    selectedTypes[selectedType]?.();
  }, [selectedType, setValue]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const filteredFields = selectedFields?.filter((f: IField) =>
    normalizeText(f.label).includes(normalizeText(searchTerm))
  );

  const openDialog = (field?: IField) => {
    if (field) {
      editField(field);
      return;
    }
    setIsEditField(false);
    initializeNewField();
  };

  const openAlert = (field: IField) => {
    setFieldRef(field);
    setAlertOpen(true);
  };

  const initializeNewField = () => {
    setDialogOpen(true);
    setAllOptions(null);
    setDisplayOptions(null);
    setIsCollectionData(false);
    setFieldRef(null);
  };

  const onSubmit = async (data: CreateFieldSchema) => {
    setIsLoading(true);
    await createField(data);
  };

  const createField = async (data: CreateFieldSchema) => {
    const options: ISelectOption = {
      id: fieldRef ? fieldRef.optionsRef : crypto.randomUUID(),
      options: selectedType === 'custom-list' ? customList : selectedOptions,
    };

    const field: IField = {
      id: fieldRef ? fieldRef.id : crypto.randomUUID(),
      idName: sanitizeString(data.fieldName),
      fieldName: data.fieldName,
      label: data.label,
      type: data.type,
      placeholder: data.placeholder ?? null,
      collectionData: data.collectionData ?? null,
      fieldBlockRef: selectedBlockId,
      optionsRef: selectedCollectionData || selectedType === 'custom-list' ? options.id : null,
      isRequired: data.isRequired ?? false,
      inputMaskOptions: inputMaskOptions ?? null,
      createdAt: fieldRef ? fieldRef.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await addField({ options, field });
  };

  const addField = async ({ options, field }): Promise<void> => {
    const isListType = ['custom-list', 'select'].includes(selectedType);

    try {
      const exists = selectedFields.some((item: IField) => item.fieldName === field.fieldName);

      if (exists && !isEditField) {
        toast.error('Já existe um campo com esse nome.');
        return;
      }

      const isFieldCreated = await firestoreService.setFieldOrBlock(SubCollection.Fields, field);

      if (!isFieldCreated) {
        toast.error('Não foi possível criar o campo.');
        return;
      }

      toast.success(
        `${
          !isEditField ? 'O campo foi criado com sucesso.' : 'O campo foi atualizado com sucesso.'
        }`
      );

      if (isListType) {
        await addOption(options);
      }
    } catch (error) {
      toast.error('Erro ao adicionar o campo');
      console.error('Erro ao adicionar o campo:', error);
    } finally {
      setIsLoading(false);
      closeDialog();
      updateFields();
      handleBlockChange(blockName);
    }
  };

  const addOption = async (options: ISelectOption) => {
    const isSelectOptionCreated = await firestoreService.setSelectOption(
      SubCollection.Options,
      options
    );

    if (!isSelectOptionCreated) {
      toast.error('Não foi possível criar as opções.');
      return;
    }

    toast.success('As Opções foram criadas com sucesso!');
  };

  const getOptions = async (optionRef: string) => {
    const option = await firestoreService.getSelectOptionById<IOption>(
      SubCollection.Options,
      optionRef
    );
    return option as IOption;
  };

  const editField = async (field: IField) => {
    setDialogOpen(true);
    setIsEditField(true);
    setFieldRef(field);

    setValue('fieldName', field.fieldName);
    setValue('label', field.label);
    setValue('type', field.type);
    setValue('collectionData', field.collectionData);
    setValue('placeholder', field.placeholder);
    setValue('isRequired', field.isRequired);

    if (field.type === 'select') {
      setIsOptions(true);
      const option = await getOptions(field.optionsRef);
      setOptions(option?.options);
    }
  };

  const handleDeleteField = async () => {
    setIsLoading(true);
    const response = await firestoreService
      .deleteFieldOrBlock(SubCollection.Fields, fieldRef.id)
      .finally(() => {
        setIsLoading(false);
        closeAlert();
        updateFields();
      });

    if (!response) {
      toast.error('Não foi possível excluir o Campo');
      return;
    }

    await handleDeleteSelectOption();
    toast.success('Campo excluído com sucesso!');
  };

  const handleDeleteSelectOption = async () => {
    if (fieldRef.type !== 'select' && !fieldRef.optionsRef) return;

    const response = await firestoreService.deleteSelectOption(
      SubCollection.Options,
      fieldRef.optionsRef
    );
    if (!response) {
      toast.error('Não foi possível excluir as Opções');
      return;
    }

    toast.success('Opções excluída com sucesso!');
  };

  const handleSelectAllData = (checked: any) => {
    setAllOptions(checked);
    if (!checked) {
      setDisplayOptions(null);
      setSelectedOptions([]);
      return;
    }
    setDisplayOptions('Todas as Opções');
    setSelectedOptions(options);
  };

  const handleOptionSelect = (option: any, checked: boolean | 'indeterminate') => {
    const isChecked = checked;
    setSelectedOptions((prev) => {
      const exists = prev.some((item) => item['ID'] === option['ID']);
      const index = prev.findIndex((e) => e['ID'] === option['ID']);

      if (isChecked && !exists) {
        setDisplayOptions('Opções Customizadas');
        return [...prev, option];
      }

      if (!isChecked && exists && index !== -1) {
        setAllOptions(false);
        setDisplayOptions('Opções Customizadas');
        return prev.filter((item) => item['ID'] !== option['ID']);
      }

      return prev;
    });
  };

  const addItemCustomList = () => {
    if (!customName.trim()) return;
    setCustomList((prev) => [...prev, { id: crypto.randomUUID(), name: customName }]);
    setCustomName('');
  };

  const removeItemCustomList = (id: number) => {
    setCustomList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCustomInputMask = (data: { name: string; options: any }) => {
    setInputMaskOption(data.options);
    setCustomInputMaskName(data.name);
    closeCustomInputMask();
  };

  const removeInputMask = () => {
    setInputMaskOption(null);
    setCustomInputMaskName(null);
    setIsCustomInputMaskOpen(false);
  };

  const openCustomInputMask = () => {
    setIsCustomInputMaskOpen(true);
  };

  const closeCustomInputMask = () => {
    setIsCustomInputMaskOpen(false);
  };

  const handleBlockChange = (value: string) => {
    setBlockName(value);
    const blockId = fieldsBlock?.find((block) => block.name === value)?.id;
    setSelectedBlockId(blockId);
    setOpen(false);
  };

  const updateFields = async () => {
    await queryClient.invalidateQueries({ queryKey: [SubCollection.Fields] });
  };

  const closeDialog = () => {
    resetForm();
    setDialogOpen(false);
  };

  const closeAlert = () => {
    setAlertOpen(false);
    setFieldRef(null);
  };

  const dismiss = (e: CustomEvent): void => {
    // console.log(e);
    // if (e) {
    //   return resetForm();
    // }

    if (isCustomInputMaskOpen) {
      event.preventDefault();
      return;
    }
  };

  const resetForm = () => {
    reset();
    setIsCollectionData(false);
    setIsOptions(false);
    setDisplayOptions(null);
    setAllOptions(false);
    setSelectedOptions([]);
    setCustomList([]);
    setInputMaskOption(null);
    setIsEditField(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div
        className={cn(
          'flex items-end',
          blockName && selectedBlockId ? 'justify-between' : 'justify-end'
        )}
      >
        {blockName && selectedBlockId && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar Campo..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedBlockId}
            />
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="w-[300px] min-w-72 space-y-2">
            <Label htmlFor="fund">Bloco de campo</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {blockName
                    ? fieldsBlock?.find((block) => block.name === blockName)?.name
                    : fieldsBlockIsloading
                    ? 'carregando...'
                    : 'Selecione o bloco de campo'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Nenhum bloco de campo</CommandEmpty>
                    <CommandGroup>
                      {fieldsBlock?.map((block) => (
                        <CommandItem
                          key={block.id}
                          value={block.name}
                          onSelect={(currentValue) => handleBlockChange(currentValue)}
                        >
                          {block.name}
                          <Check
                            className={cn(
                              'ml-auto',
                              blockName === block.name ? 'opacity-100' : 'opacity-0'
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
          <Button onClick={() => openDialog()} disabled={!selectedBlockId}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Campo
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="rounded-md border overflow-hidden">
          {fieldsError ? (
            <div className="w-full flex items-center justify-center gap-2 p-5">
              <ServerCrash className="h-4 w-4" size={32} />
              <span className="font-medium">Ops! Tivemos um problema ao buscar os dados.</span>
            </div>
          ) : !blockName && !selectedBlockId ? (
            <div className="w-full flex items-center justify-center gap-2 p-5">
              <MousePointerClick className="h-4 w-4" size={32} />
              <span className="font-medium">
                Antes de criar um novo campo, selecione o bloco em que ele será adicionado.
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Campo</TableHead>
                  <TableHead>Tipo do Campo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ultima Atualização</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      <Skeleton className="h-[50px] w-full" />
                    </TableCell>
                  </TableRow>
                ) : !filteredFields || filteredFields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Ainda não há dados cadastrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFields?.map((field: IField) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.label}</TableCell>
                      <TableCell>{`${
                        field.type.charAt(0).toUpperCase() + field.type.slice(1)
                      }`}</TableCell>
                      <TableCell>{formatTimestamp(field.createdAt)}</TableCell>
                      <TableCell>{formatTimestamp(field.updatedAt)}</TableCell>
                      {/* Ações */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(field)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openAlert(field)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Dialog para adicionar Arquivo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          forceMount
          className="max-w-5xl"
          onInteractOutside={(event) => dismiss(event)}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{!isEditField ? 'Criar Campo' : 'Editar Campo'}</DialogTitle>
              <DialogDescription>
                {!isEditField
                  ? 'Permite criar um novo campo dentro de um bloco de campos.'
                  : 'Permite alterar as informações de um campo existente dentro de um bloco de campos.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-12 mb-12">
              {/* Nome do Campo */}
              <div className="space-y-2">
                <Label htmlFor="fieldName">Nome do Campo</Label>
                <Controller
                  name="fieldName"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Nome que identifica o campo." {...field} />
                  )}
                />
                {errors.fieldName && touchedFields.fieldName && (
                  <small className="text-red-400">{errors.fieldName.message}</small>
                )}
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Controller
                  name="label"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que será exibido acima do campo"
                      {...field}
                    />
                  )}
                />
                {errors.label && touchedFields.label && (
                  <small className="text-red-400">{errors.label.message}</small>
                )}
              </div>

              {/* Tipo do Campo */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo do Campo</Label>
                <Controller
                  name="type"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fundo" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.id} value={type.type}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && touchedFields.type && (
                  <small className="text-red-400">{errors.type.message}</small>
                )}
              </div>

              {/* Tipo Lista */}
              {selectedType === 'select' && (
                <div className="space-y-2">
                  {/* <Label htmlFor="collectionData">Dados da opção do tipo select</Label> */}
                  <Label htmlFor="collectionData">Coleção de Dados</Label>
                  <Controller
                    name="collectionData"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma coleção de dados" />
                        </SelectTrigger>
                        <SelectContent>
                          {collectionsMap.map((data) => (
                            <SelectItem key={data.id} value={data.collection}>
                              {data.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {/* {errors.type && touchedFields.type && (
                    <small className="text-red-400">{errors.type.message}</small>
                  )} */}
                </div>
              )}

              {/* Tipo Lista Customizável */}
              {selectedType === 'custom-list' && (
                <div className="space-y-2">
                  <Label htmlFor="optionsRef">Lista Customizável</Label>
                  <Popover>
                    <PopoverTrigger className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-md  cursor-pointer">
                      <span className="text-sm">Criar lista</span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="min-w-[475px]">
                      <div className="flex flex-col gap-3">
                        <div className="space-y-2">
                          <h4 className="leading-none font-medium">Lista Customizável</h4>
                          <p className="text-muted-foreground text-sm">
                            Adicione itens à sua lista customizável.
                          </p>
                        </div>

                        {/* input + botão de adicionar */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Digite um nome"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="h-9 outline-none"
                          />
                          <Button
                            className="h-9 bg-blue-100 hover:bg-blue-200"
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={addItemCustomList}
                          >
                            <Plus className="text-blue-500" />
                          </Button>
                        </div>

                        {/* lista renderizada */}
                        <ScrollArea className="h-36 w-full rounded-md border">
                          <div className="flex flex-col gap-2 my-4">
                            {customList.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-2 group"
                              >
                                <div className="w-full px-3 py-1 border-b ">
                                  <span className="text-sm">{item.name}</span>
                                </div>
                                <Button
                                  className="h-7 bg-transparent group-hover:bg-gray-50"
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeItemCustomList(item.id)}
                                >
                                  <Trash2 className="text-red-500 group-hover:text-slate-950" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {isOptions && (
                <div className="space-y-2">
                  <Label htmlFor="optionsRef">Dados da opção do tipo select</Label>
                  <Popover>
                    <PopoverTrigger className="w-full border rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {!displayOptions
                            ? options
                              ? 'Selecione as opções'
                              : 'Carregando...'
                            : displayOptions}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="min-w-[475px]">
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="all"
                            checked={allOptions}
                            onCheckedChange={(cheked) => handleSelectAllData(cheked)}
                          />
                          <Label htmlFor="all">Todos os Dados</Label>
                        </div>
                        {options?.map((option) => {
                          return (
                            <div
                              key={option['ID']}
                              className="flex items-center gap-2 text-zinc-900 text-sm font-medium"
                            >
                              <Checkbox
                                checked={selectedOptions.some(
                                  (item) => item['ID'] === option['ID']
                                )}
                                onCheckedChange={(checked) => handleOptionSelect(option, checked)}
                              />
                              {option['NOME'] ??
                                option['CLASSE'] ??
                                option['NICKNAME'] ??
                                option['COD']}
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* {errors.type && touchedFields.type && (
                    <small className="text-red-400">{errors.type.message}</small>
                  )} */}
                </div>
              )}

              {/* Placeholder */}
              {selectedType !== 'checkbox' && (
                <div className="space-y-2">
                  <Label htmlFor="placeholder">Placeholder</Label>
                  <Controller
                    name="placeholder"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        placeholder="Texto que auxilia o preenchimento do campo"
                        {...field}
                      />
                    )}
                  />
                  {errors.placeholder && touchedFields.placeholder && (
                    <small className="text-red-400">{errors.placeholder.message}</small>
                  )}
                </div>
              )}

              {/* Máscara Customizável */}
              {(selectedType === 'text' || selectedType === 'number') && (
                <div className="space-y-2 relative">
                  <Label htmlFor="inputMask">Máscara Customizável</Label>
                  <div
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-md cursor-pointer"
                    onClick={openCustomInputMask}
                  >
                    <span className="text-sm">
                      {!inputMaskOptions ? 'Escolha ou personalize a máscara' : customInputMaskName}
                    </span>
                    {inputMaskOptions && customInputMaskName ? (
                      <div
                        className="w-8 h-8 flex items-center justify-center z-10 absolute right-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeInputMask();
                        }}
                      >
                        <X className="w-4 h-4 opacity-50" />
                      </div>
                    ) : (
                      <Settings2Icon className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                </div>
              )}

              {/* É Obrigatório */}
              <div className="flex flex-col items-start justify-end space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="isRequire">Este campo é obrigatório?</Label>
                  <Controller
                    name="isRequired"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="isRequire"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {errors.isRequired && touchedFields.isRequired ? (
                  <small className="text-red-400">{errors.isRequired.message}</small>
                ) : (
                  <small className="text-xs text-muted-foreground">
                    Se ativado, o campo será de preenchimento obrigatório.
                  </small>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isValid}>
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerta de Exclusão */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Campo?</AlertDialogTitle>
            <AlertDialogDescription>
              O Campo <span className="text-zinc-950 font-bold">{fieldRef?.label}</span> será
              removida de forma definitiva. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={closeAlert}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleDeleteField()}>
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
                  Deletando...
                </span>
              ) : (
                'Confirmar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Máscara de Input */}
      <Sheet open={isCustomInputMaskOpen} onOpenChange={setIsCustomInputMaskOpen}>
        <SheetContent className="w-[500px] sm:max-w-[540px]">
          <SheetHeader className="mb-3">
            <SheetTitle>Máscara Customizável</SheetTitle>
            <SheetDescription>
              Crie uma máscara personalizada ou selecione uma pronta.
            </SheetDescription>
          </SheetHeader>
          <CustomInputMask onSave={handleCustomInputMask} close={closeCustomInputMask} />
        </SheetContent>
      </Sheet>
    </div>
  );
};
