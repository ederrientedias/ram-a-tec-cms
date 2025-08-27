import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { CreateFieldsBlockSchema, createFieldsBlockDefaultValues, createfieldsBlockSchema, } from '@/schemas/instrument-registration/createFieldsBlock.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useFieldsBlock } from '@/hooks/firestore-intranet/use-fields-block';
import { IFieldsBlock } from '@/models/instrumentsRegistration.model';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Documents } from '@/enums/firestoreIntranet.enum';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';


export const CreateFieldBLock = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldBlockRef, setFieldBlockRef] = useState<IFieldsBlock | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: fieldsBlock, error, isLoading: fieldsBlockLoading } = useFieldsBlock();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateFieldsBlockSchema>({
    resolver: zodResolver(createfieldsBlockSchema),
    defaultValues: createFieldsBlockDefaultValues,
  });

  const groups = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((g, i) => {
    return {
      id: i + 1,
      code: g.toLowerCase(),
      name: `Grupo ${g}`,
    };
  });

  const filteredFieldsBlock = fieldsBlock?.filter((f) => {
    f.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openDialog = (fieldBlock?: IFieldsBlock) => {
    if (fieldBlock) {
      editFieldBlock(fieldBlock);
      return;
    }

    initializeNewField();
  };

  const openAlert = (fieldBlock: IFieldsBlock) => {
    setFieldBlockRef(fieldBlock);
    setAlertOpen(true);
  };

  const initializeNewField = () => {
    setDialogOpen(true);
    setFieldBlockRef(null);
  };

  const onSubmit = (data: CreateFieldsBlockSchema) => {
    setIsLoading(true);
    addFieldBlock(data);
  };

  const addFieldBlock = async (data: CreateFieldsBlockSchema) => {
    const fieldBlock = createFieldBlock(data);
    const response = await firestoreService.setFieldsBlock(fieldBlock).finally(() => finalize());

    if (!response) {
      toast.error('Não foi possível adicionar o bloco de campo');
      return;
    }

    toast.success('Bloco de campo adicionado com sucesso!');
  };

  const createFieldBlock = (data: CreateFieldsBlockSchema) => {
    const fieldBlock = {
      id: fieldBlockRef ? fieldBlockRef.id : crypto.randomUUID(),
      name: data.name,
      group: data.group,
    };

    return fieldBlock;
  };

  const editFieldBlock = async (fieldBlock: IFieldsBlock) => {
    setDialogOpen(true);
    setFieldBlockRef(fieldBlock);

    setValue('name', fieldBlock.name);
    setValue('group', fieldBlock.group);
  };

  const handleDeleteFieldBlock = async () => {
    if (!fieldBlockRef) return;
    setIsLoading(true);
    const response = await firestoreService.deleteFieldBlock(fieldBlockRef.id).finally(() => {
      finalize();
      closeAlert();
    });

    if (!response) {
      toast.error('Não foi possível excluir o Bloco de campo');
    }

    toast.success('Bloco de campo excluído com sucesso!');
  };

  const loadFieldsBlock = async () => {
    await queryClient.invalidateQueries({ queryKey: [Documents.FieldsBlock] });
  };

  const finalize = () => {
    setIsLoading(false);
    loadFieldsBlock();
    closeDialog();
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFieldBlockRef(null);
    reset();
  };

  const closeAlert = () => {
    setAlertOpen(false);
    // setFieldRef(null);
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
            placeholder="Buscar Bloco de Campos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Bloco de Campo
        </Button>
      </div>
      <div className="flex flex-col">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome do Campo</TableHead>
                <TableHead>Bloco</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fieldsBlockLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    <Skeleton className="h-[50px] w-full" />
                  </TableCell>
                </TableRow>
              ) : !fieldsBlock || fieldsBlock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhuma empresa está selecionada
                  </TableCell>
                </TableRow>
              ) : (
                fieldsBlock?.map((field: IFieldsBlock) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.id}</TableCell>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.group.toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* onClick={() => openDialog(field)} */}
                        <Button variant="ghost" size="icon" onClick={() => openDialog(field)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* onClick={() => openAlert(field)} */}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl" onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Criar Bloco de Campo</DialogTitle>
              <DialogDescription>
                Permite criar um novo bloco de campo dentro de um bloco de campos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 mt-12 mb-12">
              {/* Nome do Campo */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Campo</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Nome que identifica o campo." {...field} />
                  )}
                />
                {errors.name && touchedFields.name && (
                  <small className="text-red-400">{errors.name.message}</small>
                )}
              </div>

              {/* Bloco de Campos */}
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
                          placeholder={!groups.length ? 'Carregando...' : 'Selecione um fundo'}
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
              O Bloco de campo{' '}
              <span className="text-zinc-950 font-bold">{fieldBlockRef?.name}</span> será removida
              de forma definitiva. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={closeAlert}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleDeleteFieldBlock()}>
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
