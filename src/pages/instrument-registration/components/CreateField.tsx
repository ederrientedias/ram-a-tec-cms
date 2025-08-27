import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { CreateFieldSchema, createfieldSchema, createFieldDefaultValues, } from '@/schemas/instrument-registration/createField.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IField, ISelectOption } from '@/models/instrumentsRegistration.model';
import { useFieldsBlock } from '@/hooks/firestore-intranet/use-fields-block';
import firestoreAssetManagement from '@/services/firestoreAssetManagement';
import { ChevronDown, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useFields } from '@/hooks/firestore-intranet/use-fields';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Documents } from '@/enums/firestoreIntranet.enum';
import { useCallback, useState, useEffect } from 'react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';


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
    name: 'Select',
    type: 'select',
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
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [allOptions, setAllOptions] = useState<CheckedState | null>(null);
  const [displayOptions, setDisplayOptions] = useState<string | null>(null);
  const [fieldRef, setFieldRef] = useState<IField | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptions, setIsOptions] = useState<boolean>(false);
  const [isCollectionData, setIsCollectionData] = useState<boolean>(false);
  const { data: fieldsBlock, error, isLoading: fieldsBlockIsloading } = useFieldsBlock();
  const { data: fields, error: fielsError, isLoading: fieldsLoading } = useFields();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateFieldSchema>({
    resolver: zodResolver(createfieldSchema),
    defaultValues: createFieldDefaultValues,
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

  useEffect(() => {
    if (!selectedType) return;
    if (selectedType === 'select') {
      setIsCollectionData(true);
    }
  }, [selectedType]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const filteredFields = fields?.filter((f) => {
    f.label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openDialog = (field?: IField) => {
    if (field) {
      editField(field);
      return;
    }

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
    await addField(data);
  };

  const addField = async (data: CreateFieldSchema): Promise<void> => {
    try {
      const { options, field } = createField(data);
      const response = await firestoreService.setField(field);
      if (response) toast.success('Campo adicionado com sucesso!');

      if (selectedCollectionData && options.options.length > 0) {
        await addOption(options);
      }
    } catch (error) {
      toast.error('Erro ao adicionar o campo');
      console.error('Erro ao adicionar o campo:', error);
    } finally {
      setIsLoading(false);
      closeDialog();
      loadFields();
    }
  };

  const createField = (data: CreateFieldSchema) => {
    const fieldBlockId = fieldsBlock.find((e) => e.name === data.fieldBlockRef).id;

    const options: ISelectOption = {
      id: fieldRef ? fieldRef.optionsRef : crypto.randomUUID(),
      options: selectedOptions,
    };

    const field: IField = {
      id: fieldRef ? fieldRef.id : crypto.randomUUID(),
      fieldName: data.fieldName,
      label: data.label,
      type: data.type,
      placeholder: data.placeholder ?? null,
      collectionData: data.collectionData.length > 0 ? data.collectionData : null,
      fieldBlockRef: fieldBlockId,
      optionsRef: selectedCollectionData ? options.id : null,
      isRequire: data.isRequire ?? false,
    };

    return { options, field };
  };

  const addOption = async (options: ISelectOption) => {
    const response = await firestoreService.setSelectOption(options);
    if (!response) toast.error('Erro ao adicionar as opções');
    toast.success('Opções adicionada com sucesso!');
  };

  const getOptions = async (optionRef: string) => {
    const option = await firestoreService.getSelectOptionByID(optionRef);
    return option;
  };

  const editField = async (field: IField) => {
    setDialogOpen(true);
    setFieldRef(field);

    const fieldBlockName = fieldsBlock.find((e) => e.id === field.fieldBlockRef).name;
    setValue('fieldName', field.fieldName);
    setValue('label', field.label);
    setValue('type', field.type);
    setValue('collectionData', field.collectionData);
    setValue('fieldBlockRef', fieldBlockName);
    setValue('isRequire', field.isRequire);

    if (field.type === 'select') {
      setIsOptions(true);
      const option = await getOptions(field.optionsRef);
      setOptions(option.options);
    }
  };

  const handleDeleteField = async () => {
    setIsLoading(true);
    const response = await firestoreService.deleteField(fieldRef).finally(() => {
      setIsLoading(false);
      closeAlert();
      loadFields();
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

    const response = await firestoreService.deleteSelectOptions(fieldRef.optionsRef);
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

  const loadFields = async () => {
    await queryClient.invalidateQueries({ queryKey: [Documents.Fields] });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const closeAlert = () => {
    setAlertOpen(false);
    setFieldRef(null);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) resetForm();
  };

  const resetForm = () => {
    reset();
    setIsCollectionData(false);
    setIsOptions(false);
    setDisplayOptions(null);
    setAllOptions(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar Campo..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Campo
        </Button>
      </div>
      <div className="flex flex-col">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome do Campo</TableHead>
                {/* <TableHead>Boloco de Campo</TableHead> */}
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
              ) : !fields || fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhuma empresa está selecionada
                  </TableCell>
                </TableRow>
              ) : (
                fields?.map((field: IField) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.id}</TableCell>
                    <TableCell>{field.label}</TableCell>
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
        </div>
      </div>

      {/* Dialog para adicionar Arquivo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl" onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Criar Campo</DialogTitle>
              <DialogDescription>
                Permite criar um novo campo dentro de um bloco de campos.
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

              {isCollectionData && (
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
                                options['COD']}
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

              {/* Bloco de Campos */}
              <div className="space-y-2">
                <Label htmlFor="fieldBlockRef">Bloco de Campos</Label>
                <Controller
                  name="fieldBlockRef"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            fieldsBlockIsloading ? 'Carregando...' : 'Selecione um fundo'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldsBlock.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fieldBlockRef && touchedFields.fieldBlockRef && (
                  <small className="text-red-400">{errors.fieldBlockRef.message}</small>
                )}
              </div>

              {/* É Obrigatório */}
              <div className="flex flex-col items-start justify-end space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="isRequire">Este campo é obrigatório?</Label>
                  <Controller
                    name="isRequire"
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

                {errors.isRequire && touchedFields.isRequire ? (
                  <small className="text-red-400">{errors.isRequire.message}</small>
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
    </div>
  );
};
