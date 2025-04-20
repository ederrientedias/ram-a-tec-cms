import {
  Plus,
  Pencil,
  Trash2,
  FileUp,
  Search,
  Download,
  ExternalLink,
  FileText,
  CircleCheckBig,
} from 'lucide-react';
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
import { complianceSchema, ComplianceSchema } from '@/schemas/compliance.schema';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storageSite } from '@/config/firebase/firebase-site.config';
import { FirestoreDocument, Field } from '@/enums/firestore';
import FirebaseService from '@/services/firebase.service';
import { ChangeEvent, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Tipos
interface DocumentoCompliance {
  id: string;
  nomeEmpresa: string;
  nomeArquivo: string;
  dataUpload: string;
  tipoArquivo: string;
  tamanhoArquivo: string;
  link: string;
}

interface UploadRef {
  id: number;
  company: string;
  docName: string;
  fileName: string;
  createAt: number;
  docType: string;
  docSize: number;
}

// Função para gerar ID aleatório
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateUid = () => Math.floor(1000 + Math.random() * 9000);
// Mock data
const mockDocumentos: DocumentoCompliance[] = [
  {
    id: generateId(),
    nomeEmpresa: 'Empresa A Investimentos LTDA',
    nomeArquivo: 'Política de Investimentos 2023',
    dataUpload: '2023-03-15',
    tipoArquivo: 'PDF',
    tamanhoArquivo: '1.2 MB',
    link: 'https://storage.googleapis.com/example-bucket/politica_investimentos_2023.pdf',
  },
  {
    id: generateId(),
    nomeEmpresa: 'Empresa B Capital S.A.',
    nomeArquivo: 'Relatório de Compliance Q1 2023',
    dataUpload: '2023-04-05',
    tipoArquivo: 'PDF',
    tamanhoArquivo: '2.5 MB',
    link: 'https://storage.googleapis.com/example-bucket/relatorio_compliance_q1_2023.pdf',
  },
  {
    id: generateId(),
    nomeEmpresa: 'Empresa C Gestora de Recursos LTDA',
    nomeArquivo: 'Manual de Normas e Procedimentos',
    dataUpload: '2023-02-20',
    tipoArquivo: 'DOCX',
    tamanhoArquivo: '3.1 MB',
    link: 'https://storage.googleapis.com/example-bucket/manual_normas_procedimentos.docx',
  },
];

const Compliance = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Refactor
  const {
    handleSubmit,
    reset,
    formState: { errors, isValid },
    control,
  } = useForm<ComplianceSchema>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      company: '',
      docName: '',
      file: null,
    },
  });

  const onSubmit = async (data: ComplianceSchema) => {
    setUploadingFile(true);
    await handleComplianceFileUpload(data);

    // const updaloadRef: UploadRef = {
    //   id: generateUid(),
    //   company: data.company,
    //   docName: data.docName,
    //   fileName: selectedFileName,
    //   createAt: Date.now(),
    //   docType: fileUpload.name.split(".").pop()?.toUpperCase(),
    //   docSize: fileUpload.size,
    // };

    // console.log("Formulário enviado:", updaloadRef);
  };

  const handleComplianceFileUpload = async (data: ComplianceSchema) => {
    const path = `test/${data.company}/${selectedFileName}`;
    await apiService
      .uploadFile(fileUpload, path)
      .then(async ({ data: response }: { data: { status: string; url: string } }) => {
        updateUploadRef(data);
        updateComplianceFile({
          company: data.company,
          docName: data.docName,
          url: response.url,
        });
      })
      .catch((error) => {
        console.error('Erro ao enviar o formulário:', error);
      })
      .finally(() => {
        setUploadingFile(false);
        closeDialog();
        reset();
      });
  };

  const updateComplianceFile = async (data: { url: string; company: string; docName: string }) => {
    const item = {
      id: 0,
      downloadName: selectedFileName,
      fileName: data.docName,
      url: data.url,
    };

    const response = await FirebaseService.updateDocumentCollection(
      FirestoreDocument.COMPLIANCE,
      data.company,
      Field.FILES,
      item
    );

    if (response) {
      toast(
        <div className="flex items-center gap-3">
          <CircleCheckBig className="h-5 w-5 text-green-600" />
          <span className="text-base font-medium text-green-600">
            Documento cadastrado com sucesso!
          </span>
        </div>
      );
    }
  };

  const updateUploadRef = async (data: ComplianceSchema) => {
    const updaloadRef: UploadRef = {
      id: generateUid(),
      company: data.company,
      docName: data.docName,
      fileName: selectedFileName,
      createAt: Date.now(),
      docType: fileUpload.name.split('.').pop()?.toUpperCase(),
      docSize: fileUpload.size,
    };

    await FirebaseService.updateUploadsRef(
      FirestoreDocument.COMPLIANCE,
      Field.LAST_UPLOADS,
      updaloadRef
    );
  };

  const fetchCompanies = async () => {
    try {
      const response = await FirebaseService.getDocument(FirestoreDocument.COMPLIANCE);
      if (response.tabs) setCompanies(response.tabs);
      if (response.last_uploads) setUploads(response.last_uploads);
    } catch (error) {
      console.error('Erro ao buscar documentos do Firebase:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Abrir dialog para adicionar/editar
  const openDialog = (documento?: DocumentoCompliance) => {
    // if (documento) {
    //   setEditingDocumento(documento);
    //   setFormData({
    //     nomeEmpresa: documento.nomeEmpresa,
    //     nomeArquivo: documento.nomeArquivo,
    //     link: documento.link,
    //   });
    //   setSelectedFileName(documento.nomeArquivo);
    //   setSelectedFileType(documento.tipoArquivo);
    // } else {
    //   setEditingDocumento(null);
    //   setFormData({
    //     nomeEmpresa: "",
    //     nomeArquivo: "",
    //     link: "",
    //   });
    //   setSelectedFileName("");
    //   setSelectedFileType("");
    // }

    setDialogOpen(true);
  };

  // Manipular upload de arquivo
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ) => {
    const file = e.target.files?.[0];
    onChange(e);

    if (file) {
      setSelectedFileName(file.name);
      setFileUpload(file);
    }
  };

  // Excluir documento
  const handleDeleteDocumento = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      setDocumentos(documentos.filter((documento) => documento.id !== id));
      toast.success('Documento excluído com sucesso!');
    }
  };

  // Fechar dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDocumento(null);
    setSelectedFileName('');
    // setSelectedFileType("");
  };

  // Remover
  const [documentos, setDocumentos] = useState<DocumentoCompliance[]>(mockDocumentos);
  const [editingDocumento, setEditingDocumento] = useState<DocumentoCompliance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Nome do arquivo selecionado
  // Filtrar documentos pelo termo de busca
  const filteredDocumentos = documentos.filter(
    (documento) =>
      documento.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.nomeArquivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredDocumentos.length > 0 ? (
                filteredDocumentos.map((documento) => (
                  <TableRow key={documento.id}>
                    <TableCell className="font-medium">{documento.nomeEmpresa}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {documento.tipoArquivo === 'PDF' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : documento.tipoArquivo === 'DOCX' ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      {documento.nomeArquivo}
                    </TableCell>
                    <TableCell>
                      {new Date(documento.dataUpload).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{documento.tipoArquivo}</TableCell>
                    <TableCell>{documento.tamanhoArquivo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(documento)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast.success('Download iniciado');
                            window.open(documento.link, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteDocumento(documento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhum documento encontrado
                  </TableCell>
                </TableRow>
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
                {editingDocumento ? 'Editar Documento' : 'Cadastrar Novo Documento'}
              </DialogTitle>
              <DialogDescription>Upload de documento de compliance.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="complany">Nome da Empresa</Label>
                <Controller
                  name="company"
                  control={control}
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
                {errors.docName && <small className="text-red-400">{errors.docName.message}</small>}
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
