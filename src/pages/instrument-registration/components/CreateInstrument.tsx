import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { createInstrumentSchema, CreateInstrumentSchema, defaultValues, } from '@/schemas/instrument-registration/createInstrument.schema';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useInstruments } from '@/hooks/firestore-intranet/use-instruments';
import { Pencil, Plus, Search, ServerCrash, Trash2 } from 'lucide-react';
import { IInstrument } from '@/models/instruments-registration.model';
import { useGroups } from '@/hooks/firestore-intranet/use-groups';
import { SubCollection } from '@/enums/firestoreIntranet.enum';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';


export const CreateInstrument = () => {
  const queryClient = useQueryClient();
  const [instrumentRef, setInstrumentRef] = useState<IInstrument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: instruments, error, isLoading: instrumentsLoading } = useInstruments();
  const { data: instrumentsGroup, isLoading: instrumentsGroupLoading } = useGroups();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateInstrumentSchema>({
    resolver: zodResolver(createInstrumentSchema),
    defaultValues,
  });

  const filteredInstruments = instruments?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDialog = (instrument?: IInstrument) => {
    if (instrument) {
      handleEditInstrument(instrument);
      return;
    }

    initializeNewInstrumentoGroup();
  };

  const initializeNewInstrumentoGroup = () => {
    setDialogOpen(true);
    setInstrumentRef(null);
  };

  const openAlert = (instrument: IInstrument) => {
    setInstrumentRef(instrument);
    setAlertOpen(true);
  };

  const onSubmit = async (data: CreateInstrumentSchema) => {
    setIsLoading(true);
    await createInstrument(data);
  };

  const createInstrument = async (data: CreateInstrumentSchema) => {
    const id = !instrumentRef ? crypto.randomUUID() : instrumentRef.id;
    const instrument = {
      id,
      name: data.name,
      nickname: data.nickname,
      instrumentGroupRef: data.instrumentGroupRef,
      legislation: data.legislation,
    };

    await addInstrument(instrument);
  };

  const addInstrument = async (instrument: IInstrument) => {
    try {
      const isInstrumentCreated = await firestoreService.setInstrumentOrGroup(
        SubCollection.Instruments,
        instrument
      );

      if (!isInstrumentCreated) {
        toast.error('Não foi possível criar o Instrumento.');
        return;
      }

      toast.success('O instrumento foi criado com sucesso.');
    } catch (error) {
      toast.error('Erro ao criar o instrumento.');
      console.log('Erro ao tentar criar o instrumento', error);
    } finally {
      setIsLoading(false);
      loadInstruments();
      closeDialog();
    }
  };

  const handleEditInstrument = (instrument: IInstrument) => {
    setDialogOpen(true);
    setInstrumentRef(instrument);
    setValue('name', instrument.name);
    setValue('nickname', instrument.nickname);
    setValue('instrumentGroupRef', instrument.instrumentGroupRef);
    setValue('legislation', instrument.legislation);
  };

  const handleDeleteInstrument = async () => {
    if (!instrumentRef) {
      toast.error('Não possível obter a referência do Instrumento');
      return;
    }
    try {
      const isDeleted = await firestoreService.deleteInstrumentOrGroup(
        SubCollection.Instruments,
        instrumentRef.id
      );
      if (!isDeleted) {
        toast.error('Não foi possível excluir o instrumento.');
        return;
      }
      toast.success('O instrumento foi excluído com sucesso.');
    } catch (error) {
      toast.error('Erro ao tentar excluir o instrumento');
      console.log('Erro ao tentar excluir o instrumento', error);
    } finally {
      setIsLoading(false);
      loadInstruments();
      closeAlert();
    }
  };

  const loadInstruments = async () => {
    await queryClient.invalidateQueries({ queryKey: [SubCollection.Instruments] });
  };

  const closeDialog = () => {
    setInstrumentRef(null);
    setDialogOpen(false);
    reset();
  };

  const closeAlert = () => {
    setAlertOpen(false);
    setInstrumentRef(null);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      closeDialog();
    }
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
          Novo Instrumento
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
                  <TableHead>Nickname</TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instrumentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      <Skeleton className="h-[50px] w-full" />
                    </TableCell>
                  </TableRow>
                ) : !instruments || instruments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Ainda não há dados cadastrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstruments?.map((item: IInstrument) => (
                    <TableRow key={item.id}>
                      {/* <TableCell className="font-medium">{item.id}</TableCell> */}
                      <TableCell>{item.nickname}</TableCell>
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
              <DialogTitle>Criar Instrumento</DialogTitle>
              <DialogDescription>Permite criar um novo instrumento.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 mt-12 mb-12">
              {/* Nome do Grupo de Instrumento */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Instrumento</Label>
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
                <Label htmlFor="instrumentGroupRef">Grupo de Instrumentos</Label>
                <Controller
                  name="instrumentGroupRef"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            instrumentsGroupLoading ? 'Carregando...' : 'Selecione um grupo'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {instrumentsGroup.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.instrumentGroupRef && touchedFields.instrumentGroupRef && (
                  <small className="text-red-400">{errors.instrumentGroupRef.message}</small>
                )}
              </div>

              {/* Legislação */}
              <div className="space-y-2">
                <Label htmlFor="legislation">Referência da Legislação Vigente</Label>
                <Controller
                  name="legislation"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Link de referência da legislação vigente"
                      {...field}
                    />
                  )}
                />
                {errors.legislation && touchedFields.legislation && (
                  <small className="text-red-400">{errors.legislation.message}</small>
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
              O Instrumento {''}
              <span className="text-zinc-950 font-bold">{instrumentRef?.name}</span> será removida
              de forma definitiva. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={closeAlert}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleDeleteInstrument()}>
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
