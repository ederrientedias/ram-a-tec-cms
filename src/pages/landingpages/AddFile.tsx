import { createfileMetadataSchema, CreateFileMetadataSchema, fileMetadataDefaultValues, updatefileMetadataSchema, UpdateFileMetadataSchema, } from '@/schemas/landing-page.schema';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { ICollectionMap, IDocumentProps, IFileMetadata } from '@/models/landingpage.model';
import { useLandingPageFunds } from '@/hooks/firestore/funds/use-landingpage';
import { FileText, FileUp, Pencil, Plus, Trash2 } from 'lucide-react';
import landingPageService from '@/services/landingpage.service';
import landinpageService from '@/services/landingpage.service';
import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IFund } from '@/models/funds.model';
import { toast } from 'sonner';


const AddFile = () => {
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<any | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [collectionMap, setCollectionMap] = useState<ICollectionMap[]>([]);
  const [fileMetadata, setFileMetadata] = useState<IFileMetadata[] | []>([]);
  const [years, setYears] = useState<string[]>([]);
  const [fileRef, setFileRef] = useState<File | null>(null);
  const [collectionMapRef, setCollectionMapRef] = useState<ICollectionMap | null>(null);
  const [fileMetadataRef, setFileMetadataRef] = useState<IFileMetadata | null>(null);
  const [fundRef, setFundRef] = useState<IFund | null>(null);
  const [documentPropsRef, setDocumentPropsRef] = useState<IDocumentProps | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [editingFileMetadata, setEditingFileMetadata] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);

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
  } = useForm<UpdateFileMetadataSchema | CreateFileMetadataSchema>({
    resolver: zodResolver(
      editingFileMetadata ? updatefileMetadataSchema : createfileMetadataSchema
    ),
    defaultValues: fileMetadataDefaultValues,
  });

  const loadCollectionMap = useCallback(async () => {
    if (!selectedFund) return;
    const collectionMap = await landingPageService.getCollectionMap(selectedFund);
    setCollectionMap(collectionMap);
  }, [selectedFund]);

  const loadYears = useCallback(async () => {
    if (!selectedTab) return;

    const currentYear = new Date().getFullYear().toString();

    const years = collectionMap
      .filter((c) => c.collectionName === selectedTab)
      .flatMap((c) => c.years)
      .map(String)
      .sort((a, b) => Number(a) - Number(b));

    if (!years.includes(currentYear)) {
      years.push(currentYear);
    }

    setYears(years);
  }, [collectionMap, selectedTab]);

  const handleFilesMetadatas = useCallback(async () => {
    const props: IDocumentProps = {
      fundName: selectedFund,
      collectionName: selectedTab,
      year: selectedYear,
    };

    const files = await landingPageService.getFiles(props).finally(() => setIsFileLoading(false));
    setFileMetadata(files);
    setDocumentPropsRef(props);
  }, [selectedFund, selectedTab, selectedYear]);

  const loadFilesMetadatas = useCallback(async () => {
    if (!selectedYear) return;

    await handleFilesMetadatas();
  }, [selectedYear, handleFilesMetadatas]);

  useEffect(() => {
    loadCollectionMap();
  }, [loadCollectionMap]);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    loadFilesMetadatas();
  }, [loadFilesMetadatas]);

  const handleFundChange = (value: string) => {
    setSelectedFund(value);
    handleFundRef(value);
    setSelectedTab(undefined);
    setSelectedYear(null);
    setFileMetadata(null);
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    handleCollectionRef(value);
  };

  const handleYearChange = (value: string) => {
    setIsFileLoading(true);
    setSelectedYear(value);
  };

  const handleFundRef = (collectionName: string) => {
    const fundRef = landingPages.find((f) => f.collectionName === collectionName) || null;
    setFundRef(fundRef);
  };

  const handleCollectionRef = (collectionName: string) => {
    const collectionRef = collectionMap.find((c) => c.collectionName === collectionName) || null;
    setCollectionMapRef(collectionRef);
  };

  const openDialog = (file?: IFileMetadata) => {
    if (file) {
      editFileMetadata(file);
    } else {
      initializeNewFile();
    }
  };

  const initializeNewFile = () => {
    setDialogOpen(true);
    setFileMetadataRef(null);
    setEditingFileMetadata(false);
    setFileRef(null);
    setSelectedFileName('');
    reset();
  };

  const editFileMetadata = (file: IFileMetadata) => {
    setDialogOpen(true);
    setEditingFileMetadata(true);
    setFileMetadataRef(file);

    setValue('filename', file.name);
    setSelectedFileName(file.downloadName);
    setFileRef(null);
  };

  const onSubmit = async (data: any) => {
    setIsUploading(true);
    await createFileMetadata(data);
  };

  const createFileMetadata = async (data: UpdateFileMetadataSchema | CreateFileMetadataSchema) => {
    // let fileUrl: string | null = null;
    // if (!fileRef) {
    //   fileUrl = fileMetadataRef.file;
    // } else {
    //   const { url } = await handleFileUpload();
    //   fileUrl = url;
    // }

    const fileId =
      fileMetadataRef?.id ?? (fileMetadata.length > 0 ? Number(fileMetadata.at(-1).id) + 1 : 0);

    const metadata: IFileMetadata = {
      id: fileId,
      name: data.filename,
      month: String(new Date().getMonth() + 1),
      downloadName: selectedFileName,
      file: 'fileUrl',
    };

    await addFile(metadata);
  };

  const addFile = async (fileMetadata: IFileMetadata) => {
    await handleCollectionMa();

    await landingPageService.setFile(documentPropsRef, fileMetadata).finally(() => {
      setIsUploading(false);
      setFileMetadata(null);
      loadFilesMetadatas();
      closeDialog();
    });
  };

  const handleCollectionMa = async () => {
    const collectionMap = await landinpageService.getCollectionMap(selectedFund);
    const selectedCollectionMap: ICollectionMap = collectionMap.find(
      (c: any) => c.collectionName === selectedTab
    );

    selectedCollectionMap.years = selectedCollectionMap.years.includes(selectedYear)
      ? selectedCollectionMap.years
      : [...selectedCollectionMap.years, String(selectedYear)];

    await landingPageService.setCollectionMap(selectedFund, selectedCollectionMap);
  };

  const handleDeleteFile = async () => {
    setIsFileLoading(true);
    if (!fileMetadataRef) return;
    await landingPageService
      .deleteFile(documentPropsRef, fileMetadataRef)
      .then(() => loadFilesMetadatas())
      .finally(() => {
        setIsFileLoading(false);
        closeAlert();
      });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ): void => {
    const file = e.target.files?.[0];
    onChange(e);
    setSelectedFileName(file?.name || '');
    if (file) {
      setFileRef(file);
    }
  };

  const handleFileUpload = async (): Promise<{ url: any }> => {
    const path = `produtos/${fundRef.idName}/${collectionMapRef.bucketName}/${selectedYear}/${selectedFileName}`;

    try {
      const { data: response } = await apiService.uploadFile(fileRef, path);

      if (!response.status) {
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      return { url: response.url };
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
      console.error('Erro ao enviar o formulário:', error);
    }
  };

  const openAlert = (file: IFileMetadata) => {
    setFileMetadataRef(file);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
    setFileMetadataRef(null);
    reset();
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      reset();
      setEditingFileMetadata(false);
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
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="tab">Aba</Label>
          <Select onValueChange={handleTabChange} disabled={!selectedFund}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma aba" />
            </SelectTrigger>
            <SelectContent>
              {collectionMap?.map((collection) => (
                <SelectItem key={collection.id} value={collection.collectionName}>
                  {collection.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Select onValueChange={handleYearChange} disabled={!selectedTab}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um ano" />
            </SelectTrigger>
            <SelectContent>
              {years?.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={() => openDialog()} disabled={!selectedYear}>
          <Plus className="h-4 w-4" />
          Novo Arquivo
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome do Documento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!fileMetadata || fileMetadata.length === 0 ? (
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
              fileMetadata.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.id}</TableCell>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(file)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* onClick={() => deleteFileMetadata(file)} */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => openAlert(file)}
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
                {editingFileMetadata ? 'Editar Arquivo' : 'Adicionar Novo Arquivo'}
              </DialogTitle>
              <DialogDescription>Upload de documento de compliance.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Nome do Arquivo */}
              <div className="space-y-2">
                <Label htmlFor="docName">Nome do Arquivo</Label>
                <Controller
                  name="filename"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que será exibido para o documento"
                      {...field}
                    />
                  )}
                />
                {errors.filename && touchedFields.filename && (
                  <small className="text-red-400">{errors.filename.message}</small>
                )}
              </div>

              {/* Arquivo */}
              <div className="space-y-2">
                <Label>Arquivo</Label>
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileUp className="h-8 w-8 text-gray-400" />
                    <div className="text-sm text-center text-gray-600">
                      <p>Arraste e solte o arquivo aqui ou</p>
                      <label
                        htmlFor="file-upload-metadata"
                        className="text-primary cursor-pointer hover:underline"
                      >
                        selecione do seu computador
                      </label>
                    </div>
                    <Controller
                      name="file"
                      control={control}
                      render={({ field: { onChange, ref } }) => (
                        <Input
                          id="file-upload-metadata"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          className="hidden"
                          ref={ref}
                          onChange={(e) => handleFileChange(e, onChange)}
                        />
                      )}
                    />

                    {selectedFileName && (
                      <div className="mt-2 text-sm text-gray-800 bg-white px-3 py-1 rounded-md border w-full">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          {selectedFileName}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX. Tamanho máximo: 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isValid}>
                {isUploading ? (
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
              O arquivo <span className="text-zinc-950 font-bold">{fileMetadataRef?.name}</span>{' '}
              será removida de forma definitiva. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={closeAlert}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleDeleteFile()}>
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
export default AddFile;
