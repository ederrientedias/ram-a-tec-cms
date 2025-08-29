import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { createInstrumentGroupSchema, CreateInstrumentGroupSchema, defaultValues, } from '@/schemas/instrument-registration/createInstrumentsGroup.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { useInstrumentsGroup } from '@/hooks/firestore-intranet/use-instruments-group';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IInstrumentsGroup } from '@/models/instrumentsRegistration.model';
import { Pencil, Plus, Search, ServerCrash, Trash2 } from 'lucide-react';
import { Documents } from '@/enums/firestoreIntranet.enum';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { groups } from '@/utils/groups';
import { useState } from 'react';
import { toast } from 'sonner';


export const CreateInstrumentGroup = () => {
  const queryClient = useQueryClient();
  const [instrumentGroupRef, setInstrumentGroupRef] = useState<IInstrumentsGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    data: instrumentsGroup,
    error,
    isLoading: instrumentsGroupLoading,
  } = useInstrumentsGroup();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateInstrumentGroupSchema>({
    resolver: zodResolver(createInstrumentGroupSchema),
    defaultValues,
  });

  const filteredInstrumentsGroup = instrumentsGroup?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDialog = (instrument?: IInstrumentsGroup) => {
    setDialogOpen(true);
    if (instrument) {
      handleEditInstrumentGroup(instrument);
      return;
    }

    initializeNewInstrumentoGroup();
  };

  const initializeNewInstrumentoGroup = () => {
    setDialogOpen(true);
    setInstrumentGroupRef(null);
  };

  const openAlert = (instrument: IInstrumentsGroup) => {
    setInstrumentGroupRef(instrument);
    setAlertOpen(true);
  };

  const onSubmit = async (data: CreateInstrumentGroupSchema) => {
    setIsLoading(true);
    await createInstrumentGroup(data);
  };

  const createInstrumentGroup = async (data: CreateInstrumentGroupSchema) => {
    const id = !instrumentGroupRef ? crypto.randomUUID() : instrumentGroupRef.id;
    const instrumentGroup = {
      id,
      name: data.name,
      nickname: data.nickname,
      group: data.group,
      description: data.description,
    };

    console.log(instrumentGroup);
    await addInstrumentGroup(instrumentGroup);
  };

  const addInstrumentGroup = async (instrumentGroup: IInstrumentsGroup) => {
    const isGroupCreated = await firestoreService
      .setInstrumentGroup(instrumentGroup)
      .finally(() => {
        setIsLoading(false);
        resetForm();
        loadInstrumentGroup();
      });

    if (!isGroupCreated) {
      toast.error('Não foi possível criar o grupo de instrumentos.');
      return;
    }

    toast.success('O grupo de instrumentos foi criado com sucesso.');
  };

  const handleEditInstrumentGroup = (instrument: IInstrumentsGroup) => {
    setDialogOpen(true);
    setInstrumentGroupRef(instrument);
    setValue('name', instrument.name);
    setValue('nickname', instrument.nickname);
    setValue('group', instrument.group);
    setValue('description', instrument.description);
  };

  const handleDeleteInstrumentGroup = async () => {
    setIsLoading(true);
    if (!instrumentGroupRef) {
      return;
    }

    const isGroupDeleted = await firestoreService
      .deleteIntrumentGroup(instrumentGroupRef.id)
      .finally(() => {
        loadInstrumentGroup();
        setIsLoading(false);
        closeAlert();
      });

    if (!isGroupDeleted) {
      toast.error('Não foi possível excluir o grupo de instrumentos.');
      return;
    }

    toast.success('O grupo de instrumentos foi excluído com sucesso.');
  };

  const loadInstrumentGroup = async () => {
    await queryClient.invalidateQueries({ queryKey: [Documents.InstrumentsGroup] });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setInstrumentGroupRef(null);
    resetForm();
  };

  const closeAlert = () => {
    setAlertOpen(false);
    setInstrumentGroupRef(null);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      closeDialog();
    }
  };

  const resetForm = () => {
    reset({
      name: '',
      nickname: '',
      group: '',
      description: '',
    });
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo de Instrumento
        </Button>
      </div>
      <div className="flex flex-col">
        <div className="rounded-md border overflow-hidden">
          {error ? (
            <div className="w-full flex items-center justify-center gap-2 p-5">
              <ServerCrash className="h-4 w-4" size={32} />
              <span className="font-medium">Ops! Tivemos um problema ao buscar os dados.</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead>ID</TableHead> */}
                  <TableHead>Grupo</TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instrumentsGroupLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      <Skeleton className="h-[50px] w-full" />
                    </TableCell>
                  </TableRow>
                ) : !instrumentsGroup || instrumentsGroup.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Ainda não há dados cadastrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstrumentsGroup?.map((item: IInstrumentsGroup) => (
                    <TableRow key={item.id}>
                      {/* <TableCell className="font-medium">{item.id}</TableCell> */}
                      <TableCell>{item.group}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openAlert(item)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl" onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Criar Grupo de Instrumento</DialogTitle>
              <DialogDescription>Permite criar um novo grupo de instrumentos.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 mt-12 mb-12">
              {/* Nome do Grupo de Instrumento */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Grupo de Instrumento</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que identifica o grupo de instrumentos."
                      {...field}
                    />
                  )}
                />
                {errors.name && touchedFields.name && (
                  <small className="text-red-400">{errors.name.message}</small>
                )}
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Abreviação</Label>
                <Controller
                  name="nickname"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Abreviação do nome completo" {...field} />
                  )}
                />
                {errors.nickname && touchedFields.nickname && (
                  <small className="text-red-400">{errors.nickname.message}</small>
                )}
              </div>

              {/* Grupo */}
              <div className="space-y-2">
                <Label htmlFor="group">Bloco de Campos</Label>
                <Controller
                  name="group"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={!groups.length ? 'Carregando...' : 'Selecione um grupo'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.code}>
                            {group.name}
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
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Uma breve descrição sobre o grupo de instrumentos."
                      {...field}
                    />
                  )}
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

      {/* Alerta de Exclusão */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Campo?</AlertDialogTitle>
            <AlertDialogDescription>
              O Grupo de Instrumentos {''}
              <span className="text-zinc-950 font-bold">{instrumentGroupRef?.name}</span> será
              removida de forma definitiva. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={closeAlert}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleDeleteInstrumentGroup()}>
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
