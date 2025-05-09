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
import { complianceSchema, ComplianceSchema, defaultValues } from '@/schemas/compliance.schema';
import { FileText, FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import LoadingPageAnimation from '@/components/animations/loadingPage';
import Loading404Animation from '@/components/animations/loading404';
import { useTabs } from '@/hooks/firestore/compliance/use-tabs';
import { Controller, useForm, useWatch } from 'react-hook-form';
import complianceService from '@/services/compliance.service';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { formatFileSize } from '@/utils/format-file-size';
import { useLog } from '@/hooks/firestore/logs/use-log';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { IComplianceLog } from '@/models/log.model';
import logsService from '@/services/logs.service';
import { ITab } from '@/models/compliance.model';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { globalId } from '@/utils/global-id';
import { toast } from 'sonner';

const Compliance = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileRef, setFileRef] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [companyRef, setCompanyRef] = useState<ITab | null>(null);
  const [logRef, setLogRef] = useState<IComplianceLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDocument, setEditingDocument] = useState<boolean>(false);
  const { data: companies, isLoading: isLoadingTabs, error: errorTabs } = useTabs();
  const {
    data: logs,
    isLoading: isLoadingLogs,
    error: logErro,
  } = useLog<IComplianceLog>({ logName: FirestoreDocument.COMPLIANCE_LOG });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, touchedFields },
    control,
  } = useForm<ComplianceSchema>({
    resolver: zodResolver(complianceSchema),
    defaultValues: defaultValues,
  });

  const selectedCompany = useWatch({
    control,
    name: 'company',
    defaultValue: defaultValues.company,
  });

  const memoizedCompanies = useMemo(() => companies ?? [], [companies]);

  useEffect(() => {
    if (selectedCompany) {
      const companyRef = memoizedCompanies?.find(
        (company: ITab) => company.collection === selectedCompany
      );
      setCompanyRef(companyRef);
    }
  }, [selectedCompany, memoizedCompanies]);

  const onSubmit = async (data: ComplianceSchema): Promise<void> => {
    setUploadingFile(true);
    await handleFileUpload(data);
  };

  const handleFileUpload = async (data: ComplianceSchema): Promise<void> => {
    const path = `test/${companyRef.bucketName}/${selectedFileName}`;

    try {
      const { data: response } = await apiService.uploadFile(fileRef, path);

      if (!response.status) {
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      await handleSaveFirestore(data, response.url);
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
      console.error('Erro ao enviar o formulário:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveFirestore = async (data: ComplianceSchema, url: string): Promise<void> => {
    await Promise.all([handleAddLog(data), handleAddFile(data, url)])
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: [FirestoreDocument.COMPLIANCE_LOG] });
        toast.success('Arquivo enviado com sucesso');
        closeDialog();
        reset();
      })
      .catch((error) => {
        toast.error('Erro ao enviar o formulário');
        console.error('Erro ao enviar o formulário:', error);
      });
  };

  const handleAddLog = async (data: ComplianceSchema): Promise<void> => {
    const log = {
      id: Date.now(),
      company: companyRef.name,
      collectionRef: data.company,
      bucketName: companyRef.bucketName,
      docName: data.docName,
      docType: fileRef.type.split('/')[1].toLocaleUpperCase(),
      docSize: formatFileSize(fileRef.size),
      docId: editingDocument ? logRef.docId : globalId,
      createAt: Date.now(),
    };
    await logsService.addLog(FirestoreDocument.COMPLIANCE_LOG, log);
  };

  const handleAddFile = async (data: ComplianceSchema, url: string): Promise<void> => {
    const fileRef = {
      id: 0,
      docId: editingDocument ? logRef.docId : globalId,
      downloadName: selectedFileName,
      fileName: data.docName,
      url: url,
    };
    await complianceService.addFile(data.company, fileRef);
  };

  const openDialog = (log?: IComplianceLog): void => {
    if (log) {
      setEditingDocument(true);
      setLogRef(log);
      handleEditDocument(log);
    }

    setDialogOpen(true);
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

  const handleEditDocument = async (log: IComplianceLog) => {
    setValue('company', log.collectionRef);
    setValue('docName', log.docName);
  };

  // Criar um loading para deletar um documento.
  const handleDeleteDocument = async (log: IComplianceLog): Promise<void> => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      Promise.all([deleteLog(log.docId), deleteFile(log)])
        .then(async () => {
          await queryClient.invalidateQueries({ queryKey: [FirestoreDocument.COMPLIANCE_LOG] });
          toast.success('Documento excluído com sucesso!');
        })
        .catch((error) => {
          toast.error('Erro ao excluir o documento');
          console.error('Erro ao excluir o documento:', error);
        });
    }
  };

  const deleteLog = async (docId: string): Promise<boolean> => {
    return await logsService.deleteLog(FirestoreDocument.COMPLIANCE_LOG, docId);
  };

  const deleteFile = async (log: IComplianceLog): Promise<boolean> => {
    return await complianceService.deleteFile(log.collectionRef, log.docId);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDocument(false);
    setSelectedFileName('');
    reset();
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      reset();
      setEditingDocument(false);
    }
  };

  const filteredLogs = (logs || []).filter(
    (log: IComplianceLog) =>
      log.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.docName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingTabs || isLoadingLogs) return <LoadingPageAnimation />;
  if (errorTabs || logErro) return <Loading404Animation />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos de Compliance</h1>
        <Button onClick={() => openDialog()}>
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

        {/* Table Component  */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Nome do Documento</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!logs || logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhum documento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: IComplianceLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.company}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {log.docType === 'PDF' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : log.docType === 'DOCX' ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      {log.docName}
                    </TableCell>
                    <TableCell>{new Date(log.createAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{log.docType}</TableCell>
                    <TableCell>{log.docSize}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(log)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast.success('Download iniciado');
                            window.open(documento.link, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button> */}
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
        <DialogContent onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? 'Editar Documento' : 'Cadastrar Novo Documento'}
              </DialogTitle>
              <DialogDescription>Upload de documento de compliance.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="company">Nome da Empresa</Label>
                <Controller
                  name="company"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((item) => (
                          <SelectItem key={item.id} value={item.collection}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.company && touchedFields.company && (
                  <small className="text-red-400">{errors.company.message}</small>
                )}
              </div>

              {/* Nome do Documento */}
              <div className="space-y-2">
                <Label htmlFor="docName">Nome do Documento</Label>
                <Controller
                  name="docName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que será exibido para o documento"
                      {...field}
                    />
                  )}
                />
                {errors.docName && touchedFields.docName && (
                  <small className="text-red-400">{errors.docName.message}</small>
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
                        htmlFor="file-upload"
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
                          id="file-upload"
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

export default Compliance;
