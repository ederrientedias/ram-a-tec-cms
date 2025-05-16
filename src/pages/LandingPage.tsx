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
import { defaultValues, LandingPageSchema, landingPageSchema } from '@/schemas/landing-page.schema';
import { FileText, FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import LoadingPageAnimation from '@/components/animations/loadingPage';
import Loading404Animation from '@/components/animations/loading404';
import { formatText, formatToBucketName } from '@/lib/format-text';
import { ICollectionMap, IFile } from '@/models/documents.model';
import { useFunds } from '@/hooks/firestore/funds/use-funds';
import { FirestoreDocument } from '@/enums/firestore.enum';
import documentService from '@/services/document.service';
import { useLog } from '@/hooks/firestore/logs/use-log';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ILandingPageLog } from '@/models/log.model';
import logsService from '@/services/logs.service';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { useMonths } from '@/hooks/use-months';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IFund } from '@/models/funds.model';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const cuurentYear = new Date().getFullYear();
const defaultYears = [String(cuurentYear), String(cuurentYear + 1)];

const LandingPage = () => {
  const queryClient = useQueryClient();
  const months = useMonths();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDocument, setEditDocument] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [collections, setCollections] = useState<ICollectionMap[] | []>([]);
  const [collectionMap, setCollectionMap] = useState<ICollectionMap | null>(null);
  const [logRef, setLogRef] = useState<ILandingPageLog | null>(null);
  const [years, setYears] = useState<string[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fundRef, setFundRef] = useState<IFund | null>(null);
  const [globalId, setGlobalId] = useState<string>('');
  const { data: funds, isLoading, error } = useFunds();
  const {
    data: logs,
    isLoading: isLoadingLogs,
    error: logErro,
  } = useLog<ILandingPageLog>({ logName: FirestoreDocument.LANDING_PAGE_LOG });
  const {
    handleSubmit,
    reset,
    formState: { errors, isValid, touchedFields },
    control,
    register,
    setValue,
    clearErrors,
    watch,
  } = useForm<LandingPageSchema>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: defaultValues,
  });

  const selectedFund = watch('fundName');
  const selectedTab = watch('tabName');
  const createNewTab = watch('createNewTab');
  const newTabName = watch('newTabName');
  const year = watch('year');

  useEffect(() => {
    const files = async () => {
      if (selectedFund) {
        setLoading(true);
        const fund = funds.find((fund) => fund.name === selectedFund);
        setFundRef(fund);
        const response = await documentService.getCollectionsMap(fund.collectionName);
        if (response) setCollections(response);
        else setCollections([]);
        setLoading(false);
      }
    };
    files();
  }, [selectedFund, funds]);

  useEffect(() => {
    const handleCreateNewTab = () => {
      if (createNewTab) {
        const years = [String(cuurentYear - 1), ...defaultYears];
        setYears(years);
      } else {
        setValue('newTabName', '');
      }
    };
    handleCreateNewTab();
  }, [createNewTab, setValue]);

  useEffect(() => {
    const handleYears = async () => {
      if (selectedTab) {
        const collectionMap = collections.find(
          (item: ICollectionMap) => item.collectionName === selectedTab
        );
        setCollectionMap(collectionMap);
        if (!collectionMap) {
          setYears(defaultYears);
          return;
        }
        const lastYear = Number(collectionMap.years[collectionMap.years.length - 1]);
        const years = [...collectionMap.years, (lastYear + 1).toString()];
        setYears(years);
      }

      if (!selectedTab.length && createNewTab && newTabName) {
        setValue('tabName', newTabName);
      }
    };
    handleYears();
  }, [selectedTab, createNewTab, newTabName, collections, setValue]);

  const generateId = (): void => {
    setGlobalId(crypto.randomUUID());
  };

  const onSubmit = async (data: LandingPageSchema): Promise<void> => {
    if (createNewTab && newTabName) {
      const collectionMapRef = handleNewTab();
      data.tabName = data.newTabName;
      await handleFileUpload(data, collectionMapRef);
    } else {
      await handleFileUpload(data, collectionMap);
    }
  };

  const handleFileUpload = async (
    data: LandingPageSchema,
    collectionMap: ICollectionMap
  ): Promise<void> => {
    const path = `produtos/${fundRef.idName}/${formatToBucketName(data.tabName)}/${
      data.year
    }/${selectedFileName}`;

    try {
      setUploadingFile(true);
      const { data: response } = await apiService.uploadFile(fileUpload, path);

      if (!response.status) {
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      await handleSaveFirestore(data, collectionMap, response.url);
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
      console.error('Erro ao enviar o formulário:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveFirestore = async (
    data: LandingPageSchema,
    collectionMap: ICollectionMap,
    url: string
  ): Promise<void> => {
    await Promise.all([
      handleAddFile(data, url),
      handleAddLog(data),
      updateCollectionsMap(collectionMap),
    ])
      .then(async () => {
        await refreshData();
        toast.success('Arquivo enviado com sucesso!');
        closeDialog();
        reset();
      })
      .catch((error) => {
        toast.error('Erro ao salvar os dados no Firestore');
        console.error('Erro ao salvar os dados no Firestore:', error);
      });
  };

  const handleAddLog = async (data: LandingPageSchema): Promise<void> => {
    const log = {
      id: globalId,
      fundName: data.fundName,
      tabName: newTabName
        ? newTabName
        : collections.find((tab: any) => tab.collectionName === data.tabName)?.displayName,
      fileName: data.fileName,
      fileYear: data.year,
      fileMonth: data.month,
      fileType: fileUpload.type.split('/')[1].toUpperCase(),
      collectionName: newTabName ? formatText(data.tabName) : data.tabName,
      fundRef: fundRef.collectionName,
      docId: editDocument ? logRef.docId : globalId,
      createdAt: Date.now(),
    };

    await logsService.addLog(FirestoreDocument.LANDING_PAGE_LOG, log);
  };

  const handleAddFile = async (data: LandingPageSchema, url: string): Promise<void> => {
    const fileRef: IFile = {
      id: crypto.randomUUID(),
      docId: editDocument ? logRef.docId : globalId,
      name: data.fileName,
      month: data.month,
      downloadName: selectedFileName,
      file: url,
    };

    await documentService.updateFile({
      fundName: fundRef.collectionName,
      collectionName: formatText(data.tabName),
      year: data.year,
      file: fileRef,
    });
  };

  const updateCollectionsMap = async (collectionMap: ICollectionMap): Promise<void> => {
    let collectionsMap: ICollectionMap[] = [];

    const collectionMapIndex = collections.findIndex(
      (item: ICollectionMap) => item.collectionName === collectionMap.collectionName
    );

    if (collectionMapIndex !== -1) {
      collectionsMap = collections.map((item: ICollectionMap) => {
        if (item.collectionName === collectionMap.collectionName) {
          if (!item.years.includes(year)) {
            return { ...item, years: [...item.years, year] };
          }
        }
        return item;
      });
    } else {
      collectionsMap = [...collections, collectionMap];
    }

    await documentService.updateCollectionsMap(fundRef.collectionName, collectionsMap);
  };

  const filteredDocumentos = (logs || []).filter(
    (item: ILandingPageLog) =>
      item.fundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tabName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDialog = (status: 'new' | 'edit', logRef?: ILandingPageLog): void => {
    if (logRef && status === 'edit') {
      setEditDocument(true);
      setLogRef(logRef);
      handleEditDocument(logRef);
      setDialogOpen(true);
      return;
    }

    resetForm();
    setEditDocument(false);
    generateId();
    setDialogOpen(true);
  };

  const closeDialog = (): void => {
    setDialogOpen(false);
    setEditDocument(false);
    resetForm();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ): void => {
    const file = e.target.files?.[0];
    onChange(e);

    if (file) {
      setSelectedFileName(file.name);
      setFileUpload(file);
    }
  };

  const handleEditDocument = async (log: ILandingPageLog): Promise<void> => {
    setValue('fundName', log.fundName);
    setValue('tabName', log.collectionName);
    setValue('fileName', log.fileName);
    setValue('year', log.fileYear);
    setValue('month', log.fileMonth);
    setFileUpload(null);
    setSelectedFileName(null);
  };

  const handleDeleteDocument = async (log: ILandingPageLog): Promise<void> => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      Promise.all([deleteLog(log.docId), deleteFile(log)])
        .then(async () => {
          await refreshData();
          toast.success('Documento excluído com sucesso!');
        })
        .catch((error) => {
          console.log(error);
          toast.error('Não foi possível excluir o documento');
        })
        .finally(
          async () =>
            await queryClient.invalidateQueries({ queryKey: [FirestoreDocument.LANDING_PAGE_LOG] })
        );
    }
  };

  const deleteLog = async (docId: string): Promise<boolean> => {
    return await logsService.deleteLog(FirestoreDocument.LANDING_PAGE_LOG, docId);
  };

  const deleteFile = async (log: ILandingPageLog): Promise<boolean> => {
    return await documentService.deleteFile(log);
  };

  const handleNewTab = (): ICollectionMap => {
    const collectionMap: ICollectionMap = {
      id: collections.length,
      bucketName: formatToBucketName(newTabName),
      collectionName: formatText(newTabName),
      displayName: newTabName,
      isActive: false,
      isDisabled: false,
      isSelected: false,
      years: [year],
      order: collections.length,
    };
    setCollectionMap(collectionMap);

    return collectionMap;
  };

  const resetForm = (): void => {
    reset();
    clearErrors();
    setSelectedFileName('');
    setFileUpload(null);
  };

  const refreshData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: [FirestoreDocument.LANDING_PAGE_LOG] });
  };

  if (isLoading || isLoadingLogs) return <LoadingPageAnimation />;
  if (error || logErro) return <Loading404Animation />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos da Landing Page</h1>
        <Button onClick={() => openDialog('new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar documentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Fundo</TableHead>
                <TableHead>Aba</TableHead>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingLogs ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Carregando logs...
                  </TableCell>
                </TableRow>
              ) : logErro ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-red-500">
                    Erro ao carregar logs: {logErro.message}
                  </TableCell>
                </TableRow>
              ) : !logs || logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhum documento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocumentos.map((log: ILandingPageLog) => (
                  <TableRow key={log.id}>
                    {/* Nome do Fundo */}
                    <TableCell className="font-medium">{log.fundName}</TableCell>
                    {/* Nome da Aba */}
                    <TableCell>{log.tabName}</TableCell>
                    {/* Nome do Arquivo */}
                    <TableCell className="flex items-center gap-2 h-20">
                      {log.fileType === 'PDF' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : log.fileType === 'DOCX' ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      {log.fileName}
                    </TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="max-w-20 truncate" title={log.fileType}>
                      {log.fileType}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog('edit', log)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteDocument(log)}
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

      {/* Dialog para adicionar/editar documento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editDocument ? 'Editar Documento' : 'Cadastrar Novo Documento'}
              </DialogTitle>
              <DialogDescription>Upload de documento para a landing page.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="fundName">Nome do Fundo</Label>
                <Controller
                  name="fundName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fundo" />
                      </SelectTrigger>
                      <SelectContent>
                        {funds?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fundName && touchedFields.fundName && (
                  <small className="text-red-400">{errors.fundName.message}</small>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tabName" className="flex items-center justify-between">
                  Aba Correspondente
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Criar Nova Aba
                    <input type="checkbox" {...register('createNewTab')} />
                  </label>
                </Label>
                <Controller
                  name="tabName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={createNewTab}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loading
                              ? 'Carregando...'
                              : collections?.length > 0
                              ? 'Selecione uma aba'
                              : 'Nenhuma aba disponível'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {collections?.map((tab: ICollectionMap) => (
                          <SelectItem key={tab.id} value={tab.collectionName}>
                            {tab.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tabName && touchedFields.tabName && (
                  <small className="text-red-400">{errors.tabName.message}</small>
                )}
              </div>
              {createNewTab && (
                <div className="space-y-2">
                  <Label htmlFor="newTabName">Nome da Aba</Label>
                  <Controller
                    name="newTabName"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" placeholder="Nome da nova aba" {...field} />
                    )}
                  />
                  {errors.fileName && touchedFields.fileName && (
                    <small className="text-red-400">{errors.fileName.message}</small>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="year">Ano Correspondente</Label>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loading
                              ? 'Carregando...'
                              : years?.length > 0
                              ? 'Selecione um Ano'
                              : 'Nenhuma ano disponível'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {years?.map((year: string) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.year && touchedFields.year && (
                  <small className="text-red-400">{errors.year.message}</small>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Mês Correspondente</Label>
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loading
                              ? 'Carregando...'
                              : months?.length > 0
                              ? 'Selecione um Ano'
                              : 'Nenhuma ano disponível'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {months?.map((month: { name: string; month: string }) => (
                          <SelectItem key={month.month} value={month.month}>
                            {month.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.month && touchedFields.month && (
                  <small className="text-red-400">{errors.month.message}</small>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileName">Nome do Arquivo</Label>
                <Controller
                  name="fileName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que será exibido para o arquivo"
                      {...field}
                    />
                  )}
                />
                {errors.fileName && touchedFields.fileName && (
                  <small className="text-red-400">{errors.fileName.message}</small>
                )}
              </div>

              <div className="space-y-2">
                <Label>Arquivo</Label>
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileUp className="h-8 w-8 text-gray-400" />
                    <div className="text-sm text-center text-gray-600">
                      <p>Arraste e solte o arquivo aqui ou</p>
                      <label
                        htmlFor="landing-file-upload"
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
                          id="landing-file-upload"
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
              {/* disabled={isValid} */}
              <Button type="submit" disabled={!isValid}>
                {uploadingFile ? (
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
  );
};

export default LandingPage;
