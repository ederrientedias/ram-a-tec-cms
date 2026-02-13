import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { createCollectionMapSchema, CreateCollectionMapSchema, createCollectionMapDefaultValues, } from '@/schemas/landing-page.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { useLandingPageFunds } from '@/hooks/firestore/funds/use-landingpage';
import { toKebabCase, toSnakeCase } from '@/utils/format-string';
import landingPageService from '@/services/landingpage.service';
import { ICollectionMap } from '@/models/landingpage.model';
import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


const CreateTab = () => {
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [collectionMap, setCollectionMap] = useState<ICollectionMap[]>([]);
  const [collectionMapRef, setCollectionMapRef] = useState<ICollectionMap | null>(null);
  const [editingCollectionMapMetadata, setEditingCollectionMapMetadata] = useState<boolean>(false);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: landingPages,
    error: landingPagesError,
    isLoading: isLoadingLandingPages,
  } = useLandingPageFunds();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateCollectionMapSchema>({
    resolver: zodResolver(createCollectionMapSchema),
    defaultValues: createCollectionMapDefaultValues,
  });

  const loadCollectionMap = useCallback(async () => {
    if (!selectedFund) return;
    const collectionMap = await landingPageService.getCollectionMap(selectedFund);
    setCollectionMap(collectionMap);
  }, [selectedFund]);

  useEffect(() => {
    loadCollectionMap();
  }, [loadCollectionMap]);

  const handleFundChange = (value: string) => {
    setSelectedFund(value);
    // handleFundRef(value);
    // setSelectedTab(undefined);
    // setSelectedYear(null);
    // setFileMetadata(null);
  };

  const openDialog = (collectionMap?: ICollectionMap) => {
    if (collectionMap) {
      editCollectionMap(collectionMap);
    } else {
      initializeNewCollectionMap();
    }
  };

  const editCollectionMap = (collectionMap: ICollectionMap) => {
    setDialogOpen(true);
    setEditingCollectionMapMetadata(true);
    setValue('collectionName', collectionMap.displayName);
    setCollectionMapRef(collectionMap);
  };

  const initializeNewCollectionMap = () => {
    setEditingCollectionMapMetadata(false);
    setCollectionMapRef(null);
    setDialogOpen(true);
    reset();
  };

  const openAlert = (collectionMap: ICollectionMap) => {
    setCollectionMapRef(collectionMap);
    setAlertOpen(true);
  };

  const onSubmit = async (data: CreateCollectionMapSchema) => {
    setIsLoading(true);
    await addCollectionMap(data);
  };

  const createCollectionMapMetadata = (data: CreateCollectionMapSchema) => {
    const currentYear = new Date().getFullYear();
    const collectionId =
      collectionMapRef?.id ?? collectionMap?.length > 0 ? collectionMap.at(-1).id + 1 : 0;
    const collectionMapMetadata: ICollectionMap = {
      id: collectionId,
      displayName: data.collectionName,
      collectionName: collectionMapRef?.collectionName ?? toSnakeCase(data.collectionName),
      bucketName: collectionMapRef?.bucketName ?? toKebabCase(data.collectionName),
      isActive: false,
      isSelected: false,
      isDisabled: false,
      order: 0,
      years: [String(currentYear)],
    };

    return collectionMapMetadata;
  };

  const addCollectionMap = async (data: CreateCollectionMapSchema) => {
    const collectionMapMetadata = createCollectionMapMetadata(data);
    await landingPageService
      .setCollectionMap(selectedFund, collectionMapMetadata)
      .then(async () => await loadCollectionMap())
      .finally(() => {
        setIsLoading(false);
        closeDialog();
      });
  };

  const handleDeleteCollectionMap = async () => {
    setIsFileLoading(true);
    if (!collectionMapRef) return;
    await landingPageService
      .deleteCollectionMap(selectedFund, collectionMapRef)
      .then(() => loadCollectionMap())
      .finally(() => {
        setIsFileLoading(false);
        closeAlert();
      });
  };

  const closeAlert = () => {
    setAlertOpen(false);
    // setFileMetadataRef(null);
    // reset();
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      //   reset();
      //   setEditingFileMetadata(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-end gap-2 justify-between">
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="fund">Fundo</Label>
          <Select onValueChange={handleFundChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={isLoadingLandingPages ? 'Carregando...' : 'Selecione um fundo'}
              />
            </SelectTrigger>
            <SelectContent>
              {landingPages?.map((item) => (
                <SelectItem key={item.collectionName} value={item.collectionName}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={() => openDialog()} disabled={!selectedFund}>
          <Plus className="h-4 w-4" />
          Nova Aba
        </Button>
      </div>
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome da Aba</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!collectionMap || collectionMap.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  Nenhum arquivo encontrado
                </TableCell>
              </TableRow>
            ) : isFileLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  <Skeleton className="h-[50px] w-full" />
                </TableCell>
              </TableRow>
            ) : (
              collectionMap.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>{collection.id}</TableCell>
                  <TableCell>{collection.displayName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(collection)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => openAlert(collection)}
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

      {/* Dialog para adicionar Arquivo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editingCollectionMapMetadata ? 'Editar Arquivo' : 'Adicionar Novo Arquivo'}
              </DialogTitle>
              <DialogDescription>Upload de documento de compliance.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Nome do Arquivo */}
              <div className="space-y-2">
                <Label htmlFor="docName">Nome da Aba</Label>
                <Controller
                  name="collectionName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que será exibido para o documento"
                      {...field}
                    />
                  )}
                />
                {errors.collectionName && touchedFields.collectionName && (
                  <small className="text-red-400">{errors.collectionName.message}</small>
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
            <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
            <AlertDialogDescription>
              A aba <span className="text-zinc-950 font-bold">{collectionMapRef?.displayName}</span>{' '}
              será removida de forma definitiva. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={closeAlert}>
              Cancel
            </Button>
            {/* onClick={() => handleDeleteFile()} */}
            <Button type="submit" onClick={() => handleDeleteCollectionMap()}>
              {isFileLoading ? (
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
export default CreateTab;
