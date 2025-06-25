import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  instrument,
  InstrumentSchema,
  defaultValues,
} from '@/schemas/instruments/instrument.schema';
import { useInstrumentGroup } from '@/hooks/firestore/instrument/use-instrument-group';
import { useInstrument } from '@/hooks/firestore/instrument/use-instrument';
import { IInstrument, IInstrumentGroup } from '@/models/instruments.model';
import instrumentService from '@/services/instruments/instrument.service';
import LoadingPageAnimation from '@/components/animations/loadingPage';
import Loading404Animation from '@/components/animations/loading404';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FilePen, Plus, Search, Trash2 } from 'lucide-react';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toCamelCase } from '@/utils/to-camel-case';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const InstrumentRegistration = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [instrumentGroupRef, setInstrumentGroupRef] = useState<IInstrumentGroup | null>(null);
  const [editInstrumentGroup, setEditInstrumentGroup] = useState<boolean>(false);
  const {
    data: instruments,
    isLoading: isLoadingInstruments,
    error: instrumentsError,
  } = useInstrument();
  const {
    data: instrumentGroups,
    isLoading: isLoadingInstrumentGroups,
    error: instrumentGroupError,
  } = useInstrumentGroup();

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    clearErrors,
    watch,
    formState: { errors, isValid, touchedFields },
  } = useForm<InstrumentSchema>({
    resolver: zodResolver(instrument),
    defaultValues: defaultValues,
  });

  const selectedInstrumentGroup = watch('instrumentGroup');

  useEffect(() => {
    if (selectedInstrumentGroup) {
      const instrumentGroup = instrumentGroups?.find((e) => e.idName === selectedInstrumentGroup);
      setInstrumentGroupRef(instrumentGroup || null);
    }
  }, [selectedInstrumentGroup, instrumentGroups]);

  const filteredInstrumentGroups = (instruments || []).filter(
    (item: IInstrument) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nickName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: InstrumentSchema): void => {
    setIsLoading(true);
    createInstrument.mutate(data);
  };

  const openDialog = (status: 'new' | 'edit', instrument?: IInstrument | null) => {
    if (instrument && status === 'edit') {
      setEditInstrumentGroup(true);
      handleEditInstrumentGroup(instrument);
      setDialogOpen(true);
      return;
    }
    resetForm();
    setEditInstrumentGroup(false);
    setDialogOpen(true);
  };

  const handleEditInstrumentGroup = (instrument: IInstrument): void => {
    setValue('name', instrument.name);
    setValue('nickname', instrument.nickName);
    setValue('instrumentGroup', instrument.instrumentGroup.idName);
    setValue('reference', instrument.reference);
  };

  const deleteInstrumentGroup = (idName: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      handleDeleteInstrumentGroup.mutate(idName);
    }
  };

  const createInstrument = useMutation({
    mutationFn: async (data: InstrumentSchema) => {
      const docRef = await instrumentService.getDocRef();
      const instrument: IInstrument = {
        uuid: crypto.randomUUID(),
        name: data.name,
        nickName: data.nickname,
        idName: toCamelCase(data.nickname),
        reference: data.reference,
        instrumentGroup: {
          instGroupId: instrumentGroupRef.uuid,
          idName: instrumentGroupRef.idName,
          group: instrumentGroupRef.group,
          docRef,
        },
      };
      console.log('Instrument:', instrument);
      return instrumentService.createInstrument(instrument);
    },
    onSuccess: (_, data) => {
      setIsLoading(false);
      toast.success('Grupo de instrumento criado com sucesso!');
      setDialogOpen(false);
      refreshData();
    },
    onError: () => {
      setIsLoading(false);
      toast.error('Erro ao criar o grupo de instrumento. Verifique os dados e tente novamente.');
    },
  });

  const handleDeleteInstrumentGroup = useMutation({
    mutationFn: async (idName: string) => {
      return instrumentService.deleteInstrument(idName);
    },
    onSuccess: () => {
      toast.success('Instrumento excluído com sucesso!');
      refreshData();
    },
    onError: () => {
      toast.error('Erro ao excluir o instrumento. Tente novamente.');
    },
  });

  const closeDialog = (): void => {
    setDialogOpen(false);
    setEditInstrumentGroup(false);
    resetForm();
  };

  const resetForm = (): void => {
    reset();
    clearErrors();
  };

  const refreshData = (): void => {
    queryClient.invalidateQueries({ queryKey: [FirestoreDocument.INSTRUMENTS] });
  };

  if (isLoadingInstrumentGroups || isLoadingInstruments) return <LoadingPageAnimation />;
  if (instrumentsError || instrumentGroupError) return <Loading404Animation />;

  return (
    <div className="w-full  flex flex-col gap-2  p-4">
      <div className="w-full flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Cadastro de Instrumento</h1>
        <Button onClick={() => openDialog('new')}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Instrumento
        </Button>
      </div>
      <div className="flex-1 bg-white rounded-lg p-4 border flex flex-col gap-4">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar Grupo de Instrumento..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Tabela de Instrumentos */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NickName</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Grupo</TableHead>
                {/* <TableHead>Grupo de Instrumentos</TableHead> */}
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstrumentGroups.map((instrument: IInstrument) => {
                return (
                  <TableRow key={instrument.uuid}>
                    <TableCell className="font-medium">{instrument.nickName}</TableCell>
                    <TableCell>{instrument.name}</TableCell>
                    <TableCell>{instrument.instrumentGroup.group}</TableCell>
                    {/* <TableCell>{instrument.instrumentGroup.name}</TableCell> */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500"
                          onClick={() => openDialog('edit', instrument)}
                        >
                          <FilePen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => deleteInstrumentGroup(instrument.idName)}
                        >
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
        {/* Dialog para adicionar/editar instrumentos */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                {editInstrumentGroup ? (
                  <DialogTitle>Editar Instrumento</DialogTitle>
                ) : (
                  <DialogTitle>Cadastrar Instrumento</DialogTitle>
                )}
                <DialogDescription>Preencha as informações sobre o instrumento.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Nome Completo do Instrumento */}
                <div className="space-y-2">
                  <Label htmlFor="name">Instrumento</Label>
                  <Input
                    id="name"
                    name="name"
                    {...register('name')}
                    placeholder="Ex: Letra Financeira do Tesouro"
                  />
                  {errors.name && touchedFields.name && (
                    <small className="text-red-400">{errors.name.message}</small>
                  )}
                </div>
                {/* Nickname do Instrumento */}
                <div className="space-y-2">
                  <Label htmlFor="nickname">Instrumento (Abreviação)</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    {...register('nickname')}
                    placeholder="Ex: LTF"
                  />
                  {errors.nickname && touchedFields.nickname && (
                    <small className="text-red-400">{errors.nickname.message}</small>
                  )}
                </div>
                {/* Grupo de Instrumento */}
                <div className="space-y-2">
                  <Label htmlFor="instrumentGroup">Grupo de Instrumento</Label>
                  <Controller
                    name="instrumentGroup"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          {isLoadingInstrumentGroups ? (
                            <SelectValue placeholder="Carregando Grupos..." />
                          ) : (
                            <SelectValue placeholder="Selecione o Grupo de Instrumento" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {instrumentGroups?.map((item: IInstrumentGroup) => (
                            <SelectItem key={item.uuid} value={item.idName}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.instrumentGroup && touchedFields.instrumentGroup && (
                    <small className="text-red-400">{errors.instrumentGroup.message}</small>
                  )}
                </div>
                {/* Referência Legislação Vigente */}
                <div className="space-y-2">
                  <Label htmlFor="reference">Referência Legislação Vigente</Label>
                  <Input
                    id="reference"
                    name="reference"
                    {...register('reference')}
                    placeholder="Link do documento ou legislação vigente"
                  />
                  {errors.reference && touchedFields.reference && (
                    <small className="text-red-400">{errors.reference.message}</small>
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
      </div>
    </div>
  );
};
