import {
  CreateFileMetadataSchema,
  createfileMetadataSchema,
  fileMetadataDefaultValues,
  updatefileMetadataSchema,
  UpdateFileMetadataSchema,
} from '@/schemas/compliance.schema';
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
import { FileText, FileUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTabs } from '@/hooks/firestore/compliance/use-tabs';
import complianceService from '@/services/compliance.service';
import { IFile, ITab } from '@/models/compliance.model';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AddFile = () => {
  const [files, setFiles] = useState<IFile[] | null>(null);
  const [fileMetadata, setFileMetadata] = useState<IFile | null>(null);
  const [companyRef, setCompanyRef] = useState<ITab | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [fileRef, setFileRef] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFileMetadata, setEditingFileMetadata] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const { data: companies, isLoading: isLoadingTabs, error: errorTabs } = useTabs();
  const memorizedCompanies = useMemo(() => companies ?? [], [companies]);

  const {
    handleSubmit: handleFileSubmit,
    reset: resetFileMetadata,
    control: controlFileMetadata,
    setValue: setFileValue,
    formState: { errors: fileErrors, isValid: isFileValid, touchedFields: fileTouchedFields },
  } = useForm<UpdateFileMetadataSchema | CreateFileMetadataSchema>({
    resolver: zodResolver(
      editingFileMetadata ? updatefileMetadataSchema : createfileMetadataSchema
    ),
    defaultValues: fileMetadataDefaultValues,
  });

  const loadFiles = useCallback(async () => {
    if (!selectedCompany) return;

    setIsLoadingFile(true);
    try {
      const files = await complianceService.getFiles(selectedCompany);
      setFiles(files.sort((a: any, b: any) => a.id - b.id));
    } finally {
      setIsLoadingFile(false);
    }
  }, [selectedCompany]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (selectedCompany) {
      const companyRef = memorizedCompanies?.find(
        (company: ITab) => company.collection === selectedCompany
      );
      setCompanyRef(companyRef);
    }
  }, [selectedCompany, memorizedCompanies]);

  const handleValueChange = (value: string) => {
    setSelectedCompany(value);
  };

  const openDialog = (file?: IFile) => {
    if (file) {
      editFileMetadata(file);
    } else {
      initializeNewFile();
    }
  };

  const fileSubmit = async (data: any) => {
    setIsUploading(true);
    await addFile(data);
  };

  const initializeNewFile = () => {
    setDialogOpen(true);
    setFileMetadata(null);
    setEditingFileMetadata(false);
    setFileRef(null);
    setSelectedFileName('');
    resetFileMetadata();
  };

  const createFileMetadata = async (data: UpdateFileMetadataSchema | CreateFileMetadataSchema) => {
    let fileUrl: string | null = null;
    if (!data.fileMedatada) {
      fileUrl = fileMetadata?.url;
    } else {
      const { url } = await handleFileUpload();
      fileUrl = url;
    }

    const fileId = fileMetadata?.id ?? (files.length > 0 ? files.length + 1 : 0);

    const fileMetadataRef = {
      id: fileId,
      downloadName: selectedFileName,
      fileName: data.filename,
      url: fileUrl,
    };

    return fileMetadataRef;
  };

  const addFile = async (data: UpdateFileMetadataSchema | CreateFileMetadataSchema) => {
    const fileMetadataRef = await createFileMetadata(data);

    await complianceService.addFile(companyRef.collection, fileMetadataRef).finally(() => {
      setIsUploading(false);
      setFileMetadata(null);
      loadFiles();
      closeDialog();
    });
  };

  const editFileMetadata = (file: IFile) => {
    setDialogOpen(true);
    setEditingFileMetadata(true);
    setFileMetadata(file);

    setFileValue('filename', file.fileName);
    setSelectedFileName(file.downloadName);

    setFileRef(null);
  };

  const deleteFileMetadata = async (file: IFile) => {
    if (confirm('Tem certeza que deseja excluir este Arquivo?')) {
      await complianceService
        .deleteFile(companyRef.collection, file.id)
        .then(async () => {
          await loadFiles();
          toast.success('Documento excluído com sucesso!');
        })
        .catch((error) => {
          toast.error('Erro ao excluir o documento');
          console.error('Erro ao excluir o documento:', error);
        });
    }
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
    const path = `compliance/${companyRef.bucketName}/${selectedFileName}`;

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

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      resetFileMetadata();
      setEditingFileMetadata(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 mt-12">
      <div className="w-full flex items-end justify-between">
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="company">Nome da Empresa</Label>
          <Select onValueChange={handleValueChange} value={selectedCompany}>
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
        </div>
        <Button onClick={() => openDialog()} disabled={!selectedCompany}>
          <Plus className="h-4 w-4" />
          Novo Arquivo
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {/* Table Component  */}
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
              {isLoadingFile ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    <Skeleton className="h-[50px] w-full" />
                  </TableCell>
                </TableRow>
              ) : !files || files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhuma empresa está selecionada
                  </TableCell>
                </TableRow>
              ) : (
                files?.map((file: IFile) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.id}</TableCell>
                    <TableCell>{file.fileName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(file)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => deleteFileMetadata(file)}
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
        <DialogContent onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleFileSubmit(fileSubmit)}>
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
                  control={controlFileMetadata}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que será exibido para o documento"
                      {...field}
                    />
                  )}
                />
                {fileErrors.filename && fileTouchedFields.filename && (
                  <small className="text-red-400">{fileErrors.filename.message}</small>
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
                      name="fileMedatada"
                      control={controlFileMetadata}
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
              <Button type="submit" disabled={!isFileValid}>
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
    </div>
  );
};
export default AddFile;
