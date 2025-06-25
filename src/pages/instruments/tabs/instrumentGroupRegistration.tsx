import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  defaultValues,
  instrumentGroup,
  InstrumentGroupSchema,
} from '@/schemas/instruments/instrument-group.schema';
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
import { useInstrumentGroup } from '@/hooks/firestore/instrument/use-instrument-group';
import instrumentService from '@/services/instruments/instrument-group.service';
import LoadingPageAnimation from '@/components/animations/loadingPage';
import { IGroup, IInstrumentGroup } from '@/models/instruments.model';
import Loading404Animation from '@/components/animations/loading404';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGroup } from '@/hooks/firestore/instrument/use-group';
import { FilePen, Plus, Search, Trash2 } from 'lucide-react';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toCamelCase } from '@/utils/to-camel-case';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

export const InstrumentGroupRegistration = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editInstrumentGroup, setEditInstrumentGroup] = useState<boolean>(false);
  const { data: groups, isLoading: isLoadingGroups, error: groupError } = useGroup();
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
    formState: { errors, isValid, touchedFields },
  } = useForm<InstrumentGroupSchema>({
    resolver: zodResolver(instrumentGroup),
    defaultValues: defaultValues,
  });

  const filteredInstrumentGroups = (instrumentGroups || []).filter(
    (item: IInstrumentGroup) =>
      item.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nickName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: InstrumentGroupSchema): void => {
    setIsLoading(true);
    createInstrumentGroup.mutate(data);
  };

  const openDialog = (status: 'new' | 'edit', instrumentGroup?: IInstrumentGroup | null) => {
    if (instrumentGroup && status === 'edit') {
      setEditInstrumentGroup(true);
      handleEditInstrumentGroup(instrumentGroup);
      setDialogOpen(true);
      return;
    }
    resetForm();
    setEditInstrumentGroup(false);
    setDialogOpen(true);
  };

  const handleEditInstrumentGroup = (instrumentGroup: IInstrumentGroup): void => {
    setValue('name', instrumentGroup.name);
    setValue('nickname', instrumentGroup.nickName);
    setValue('group', instrumentGroup.group);
    setValue('description', instrumentGroup.description);
  };

  const deleteInstrumentGroup = (idName: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      handleDeleteInstrumentGroup.mutate(idName);
    }
  };

  const createInstrumentGroup = useMutation({
    mutationFn: async (data: InstrumentGroupSchema) => {
      const group = {
        uuid: crypto.randomUUID(),
        idName: toCamelCase(data.nickname),
        name: data.name,
        nickName: data.nickname,
        group: data.group,
        description: data.description,
      };

      return instrumentService.createInstrumentGroup(group);
    },
    onSuccess: (_, data) => {
      setIsLoading(false);
      toast.success('Grupo de instrumento criado com sucesso!');
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [FirestoreDocument.INSTRUMENTS_GROUP] });
    },
    onError: () => {
      setIsLoading(false);
      toast.error('Erro ao criar o grupo de instrumento. Verifique os dados e tente novamente.');
    },
  });

  const handleDeleteInstrumentGroup = useMutation({
    mutationFn: async (idName: string) => {
      return instrumentService.deleteInstrumentGroup(idName);
    },
    onSuccess: () => {
      toast.success('Grupo de instrumento excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: [FirestoreDocument.INSTRUMENTS_GROUP] });
    },
    onError: () => {
      toast.error('Erro ao excluir o grupo de instrumento. Tente novamente.');
    },
  });

  const closeDialog = (): void => {
    setDialogOpen(false);
    setEditInstrumentGroup(false);
    resetForm();
  };

  const dismiss = (e: CustomEvent): void => {
    console.log(e);
  };

  const resetForm = (): void => {
    reset();
    clearErrors();
  };

  if (isLoadingInstrumentGroups || isLoadingGroups) return <LoadingPageAnimation />;
  if (groupError || instrumentGroupError) return <Loading404Animation />;

  return (
    <div className="w-full  flex flex-col gap-2  p-4">
      <div className="w-full flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Cadastro de Grupo de Instrumento</h1>
        <Button onClick={() => openDialog('new')}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Grupo de Instrumento
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
        {/* Tabela de Publicações */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>NickName</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstrumentGroups.map((group: IInstrumentGroup) => {
                return (
                  <TableRow key={group.uuid}>
                    <TableCell className="font-medium">
                      <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center">
                        {group.group}
                      </div>
                    </TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.nickName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500"
                          onClick={() => openDialog('edit', group)}
                        >
                          <FilePen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => deleteInstrumentGroup(group.idName)}
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
        {/* Dialog para adicionar/editar publicação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl" onInteractOutside={(event) => dismiss(event)}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                {editInstrumentGroup ? (
                  <DialogTitle>Editar Grupo de Instrumento</DialogTitle>
                ) : (
                  <DialogTitle>Cadastrar Grupo de Instrumento</DialogTitle>
                )}
                {/* <DialogTitle>Cadastrar Grupo de Instrumento</DialogTitle> */}
                <DialogDescription>
                  Preencha as informações sobre o grupo de instrumento.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    {...register('name')}
                    placeholder="Ex: Titulos Públicos Federais"
                  />
                  {errors.name && touchedFields.name && (
                    <small className="text-red-400">{errors.name.message}</small>
                  )}
                </div>
                {/* Nickname */}
                <div className="space-y-2">
                  <Label htmlFor="nickname">Abreviação</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    {...register('nickname')}
                    placeholder="Ex: Tít. Públicos"
                  />
                  {errors.nickname && touchedFields.nickname && (
                    <small className="text-red-400">{errors.nickname.message}</small>
                  )}
                </div>
                {/* Grupo */}
                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Controller
                    name="group"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          {isLoadingGroups ? (
                            <SelectValue placeholder="Carregando Grupos..." />
                          ) : (
                            <SelectValue placeholder="Selecione o Grupo" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {groups?.map((g: IGroup) => (
                            <SelectItem key={g.code} value={g.code}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.group && touchedFields.group && (
                    <small className="text-red-400">{errors.group.message}</small>
                  )}
                </div>
                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    minLength={1}
                    maxLength={300}
                    rows={5}
                    {...register('description')}
                    placeholder="Breve descrição sobre o grupo de instrumento."
                  />
                  {errors.description && touchedFields.description && (
                    <small className="text-red-400">{errors.description.message}</small>
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
