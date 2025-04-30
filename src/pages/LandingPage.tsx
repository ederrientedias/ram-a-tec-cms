import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import documentsRepository, {
  ICollectionMap,
  IDocumentProps,
  IFile,
} from '@/repositories/products/documents.repository';
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
import { Download, Eye, FileText, FileUp, Pencil, Plus, Search, Trash2, Check } from 'lucide-react';
import { LandingPageSchema, landingPageSchema } from '@/schemas/landing-page.schema';
import { checkDomainOfScale } from 'recharts/types/util/ChartUtils';
import { useFunds } from '@/hooks/firestore/funds/use-funds';
import { ILog } from '@/repositories/logs/logs.repository';
import firebaseService from '@/services/firebase.service';
import * as SelectPrimitive from '@radix-ui/react-select';
import productService from '@/services/product.service';
import { useLog } from '@/hooks/firestore/logs/use-log';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import fundsService from '@/services/funds.service';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Tipos
interface DocumentoLandingPage {
  id: string;
  nomeFundo: string;
  nomeAba: string;
  nomeArquivo: string;
  dataUpload: string;
  tipoArquivo: string;
  tamanhoArquivo: string;
  link: string;
  visivel: boolean;
}

// Função para gerar ID aleatório
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock data
const mockDocumentos: DocumentoLandingPage[] = [
  {
    id: generateId(),
    nomeFundo: 'Fundo Alocação Dinâmica',
    nomeAba: 'Informações Gerais',
    nomeArquivo: 'Lâmina do Fundo - Abril 2023',
    dataUpload: '2023-04-05',
    tipoArquivo: 'PDF',
    tamanhoArquivo: '1.2 MB',
    link: 'https://storage.googleapis.com/example-bucket/lamina_fundo_abril_2023.pdf',
    visivel: true,
  },
  {
    id: generateId(),
    nomeFundo: 'Fundo Renda Fixa Longo Prazo',
    nomeAba: 'Documentos',
    nomeArquivo: 'Regulamento Atualizado',
    dataUpload: '2023-03-20',
    tipoArquivo: 'PDF',
    tamanhoArquivo: '2.5 MB',
    link: 'https://storage.googleapis.com/example-bucket/regulamento_atualizado.pdf',
    visivel: true,
  },
  {
    id: generateId(),
    nomeFundo: 'Fundo Ações Dividendos',
    nomeAba: 'Relatórios',
    nomeArquivo: 'Relatório Mensal - Março 2023',
    dataUpload: '2023-04-10',
    tipoArquivo: 'PDF',
    tamanhoArquivo: '3.1 MB',
    link: 'https://storage.googleapis.com/example-bucket/relatorio_mensal_marco_2023.pdf',
    visivel: false,
  },
];

const months = [
  { name: 'Janeiro', month: '01' },
  { name: 'Fevereiro', month: '02' },
  { name: 'Março', month: '03' },
  { name: 'Abril', month: '04' },
  { name: 'Maio', month: '05' },
  { name: 'Junho', month: '06' },
  { name: 'Julho', month: '07' },
  { name: 'Agosto', month: '08' },
  { name: 'Setembro', month: '09' },
  { name: 'Outubro', month: '10' },
  { name: 'Novembro', month: '11' },
  { name: 'Dezembro', month: '12' },
];

const cuurentYear = new Date().getFullYear();
const defaultYears = [String(cuurentYear), String(cuurentYear + 1)];

const LandingPage = () => {
  /*Use State */
  const [documentos, setDocumentos] = useState<DocumentoLandingPage[]>(mockDocumentos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<DocumentoLandingPage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [collections, setCollections] = useState<ICollectionMap[] | []>([]);
  const [years, setYears] = useState<string[] | []>([]);
  const [lastUpdates, setLastUpdates] = useState<any | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: funds, isLoading, error } = useFunds();
  const {
    data: logs,
    isLoading: isLoadingLogs,
    error: logsError,
  } = useLog({ logName: 'landing_page_log' });
  const [idName, setIdName] = useState<string>('');
  const {
    handleSubmit,
    reset,
    formState: { errors, isValid },
    control,
    watch,
  } = useForm<LandingPageSchema>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      fundName: '',
      tabName: '',
      year: '',
      month: '',
      fileName: '',
      file: null,
    },
  });

  const selectedFund = watch('fundName');
  const selectedTab = watch('tabName');

  useEffect(() => {
    const files = async () => {
      if (selectedFund) {
        setLoading(true);
        const fund = funds.find((fund) => fund.name === selectedFund);
        setIdName(fund.idName);
        const response = await documentsRepository.getCollectionsMap(fund.idName);
        if (response) setCollections(response);
        else setCollections([]);
        setLoading(false);
      }
    };
    files();
  }, [selectedFund, funds]);

  useEffect(() => {
    const handleYears = async () => {
      if (selectedTab) {
        const fileRef = collections.find(
          (item: ICollectionMap) => item.collectionName === selectedTab
        );
        if (!fileRef) {
          setYears(defaultYears);
          return;
        }
        const lastYear = Number(fileRef.years[fileRef.years.length - 1]);
        const years = [...fileRef.years, (lastYear + 1).toString()];
        setYears(years);
      }
    };
    handleYears();
  }, [selectedTab, collections]);

  const onSubmit = async (data: LandingPageSchema) => {
    setUploadingFile(true);
    await handleComplianceFileUpload(data);
  };

  const createFileRef = (data: LandingPageSchema, url: string) => {
    const fileRef: IFile = {
      id: data.month,
      name: data.fileName,
      mes: data.month,
      downloadName: selectedFileName,
      file: url,
    };

    return fileRef;
  };

  const handleComplianceFileUpload = async (data: LandingPageSchema) => {
    const path = `test/${idName}/${data.tabName}/${data.year}/${selectedFileName}`;

    await apiService
      .uploadFile(fileUpload, path)
      .then(({ data: response }: { data: { status: string; url: string } }) => {
        setFile(data, response.url);
        setLogRef(data);
        // Promise.all([setFile(data, response.url)]);
      })
      .catch((error) => {
        console.error('Erro ao enviar o formulário:', error);
      })
      .finally(() => {
        setUploadingFile(false);
        // closeDialog();
        // reset();
      });
  };

  const setLogRef = async (data: LandingPageSchema) => {
    const logRef = {
      id: new Date().getTime(),
      fundName: data.fundName,
      tabName: collections.find((tab: any) => tab.collectionName === data.tabName)?.displayName,
      fileName: data.fileName,
      collectionName: data.tabName,
      year: data.year,
      month: data.month,
      createAt: Date.now(),
      fileType: fileUpload.type.split('/')[1].toUpperCase(),
    };

    console.log('setLogRef', logRef);
  };

  const setFile = async (data: LandingPageSchema, url: string) => {
    const fileRef: IFile = {
      id: data.month,
      name: data.fileName,
      mes: data.month,
      downloadName: selectedFileName,
      file: url,
    };

    console.log('setFile', fileRef);

    // await documentsRepository.setDocument({
    //   fundName: idName,
    //   collectionName: data.tabName,
    //   year: data.year,
    //   file: fileRef,
    // });
  };

  const filteredDocumentos = logs.filter(
    (file: ILog) =>
      file.fundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tabName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDialog = (documento?: DocumentoLandingPage) => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDocumento(null);
    setSelectedFileName('');
    setSelectedFileType('');
  };

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

  const handleDeleteDocumento = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      setDocumentos(documentos.filter((documento) => documento.id !== id));
      toast.success('Documento excluído com sucesso!');
    }
  };

  const toggleVisibility = (id: string) => {
    setDocumentos(
      documentos.map((documento) =>
        documento.id === id ? { ...documento, visivel: !documento.visivel } : documento
      )
    );
    toast.success('Visibilidade alterada com sucesso!');
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar os fundos</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos da Landing Page</h1>
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

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Fundo</TableHead>
                <TableHead>Aba</TableHead>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead>Tipo</TableHead>
                {/* <TableHead>Visível</TableHead> */}
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocumentos.length > 0 ? (
                filteredDocumentos.map((documento: ILog) => (
                  <TableRow key={documento.id}>
                    <TableCell className="font-medium">{documento.fundName}</TableCell>
                    <TableCell>{documento.tabName}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {documento.fileType === 'PDF' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : documento.fileType === 'DOCX' ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      {documento.fileName}
                    </TableCell>
                    <TableCell>
                      {new Date(documento.createAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{documento.fileType}</TableCell>
                    {/* <TableCell>
                      <Badge
                        variant={documento.visivel ? 'default' : 'outline'}
                        className={documento.visivel ? 'bg-green-500' : 'text-gray-500'}
                      >
                        {documento.visivel ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell> */}
                    {/* <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(log)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(documento.id)}
                          title={documento.visivel ? 'Tornar invisível' : 'Tornar visível'}
                        >
                          <Eye className={`h-4 w-4 ${documento.visivel ? '' : 'text-gray-400'}`} />
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
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
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
              <DialogDescription>Upload de documento para a landing page.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="fundName">Nome do Fundo</Label>
                <Controller
                  name="fundName"
                  control={control}
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
                {errors.fundName && (
                  <small className="text-red-400">{errors.fundName.message}</small>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tabName">Aba Correspondente</Label>
                <Controller
                  name="tabName"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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
                {errors.tabName && <small className="text-red-400">{errors.tabName.message}</small>}
              </div>
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
                {errors.tabName && <small className="text-red-400">{errors.tabName.message}</small>}
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
                {errors.month && <small className="text-red-400">{errors.month.message}</small>}
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
                {errors.fileName && (
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
