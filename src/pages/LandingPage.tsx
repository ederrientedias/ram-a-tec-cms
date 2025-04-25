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
import { Plus, Pencil, Trash2, FileUp, Search, Download, FileText, Eye } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFunds } from '@/hooks/firestore/funds/use-funds';
// import { useDocument } from '@/hooks/firestore/use-document';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IInvestmentFund } from '@/models/firestore';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { storage } from '../config/firebase.config';
import Firestore from '../services/firestore';

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

const abasOptions = ['Informações Gerais', 'Documentos', 'Relatórios', 'Lâmina', 'Regulamento'];

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

const LandingPage = () => {
  /*Use State */
  const [documentos, setDocumentos] = useState<DocumentoLandingPage[]>(mockDocumentos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<DocumentoLandingPage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [fileMetadata, setFileMetadata] = useState<File>();
  const [url, setUrl] = useState<string>('');
  // const [funds, setFunds] = useState<IInvestmentFund[]>([]);
  const { data: funds, isLoading, error } = useFunds();

  // Estado do formulário
  const [formData, setFormData] = useState<any>({
    fundName: '',
    tabName: '',
    fileName: '',
    link: '',
    visivel: true,
  });

  // Nome do arquivo selecionado

  // Filtrar documentos pelo termo de busca
  const filteredDocumentos = documentos.filter(
    (documento) =>
      documento.nomeFundo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.nomeArquivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.nomeAba.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir dialog para adicionar/editar
  const openDialog = (documento?: DocumentoLandingPage) => {
    if (documento) {
      setEditingDocumento(documento);
      setFormData({
        nomeFundo: documento.nomeFundo,
        nomeAba: documento.nomeAba,
        nomeArquivo: documento.nomeArquivo,
        link: documento.link,
        visivel: documento.visivel,
      });
      setSelectedFileName(documento.nomeArquivo);
      setSelectedFileType(documento.tipoArquivo);
    } else {
      setEditingDocumento(null);
      setFormData({
        nomeFundo: '',
        nomeAba: '',
        nomeArquivo: '',
        link: '',
        visivel: true,
      });
      setSelectedFileName('');
      setSelectedFileType('');
    }
    setDialogOpen(true);
  };

  // Fechar dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDocumento(null);
    setSelectedFileName('');
    setSelectedFileType('');
  };

  // Atualizar selects
  const handleSelectChange = (name: string, value: string) => {
    console.log(value);

    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(formData);
    // const { data, isLoading, isError, error } = useDocument(value);
  };

  // Atualizar inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Manipular upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileMetadata(file);
    console.log('File:', formatFileSize(file.size));

    if (file) {
      setSelectedFileName(file.name);

      // Obter o tipo de arquivo da extensão
      const extension = file.name.split('.').pop()?.toUpperCase() || '';
      setSelectedFileType(extension);

      // Se não houver nome de exibição, usar o nome do arquivo
      if (!formData.nomeArquivo) {
        // Remover a extensão para o nome de exibição
        const displayName = file.name.replace(/\.[^/.]+$/, '');
        setFormData({
          ...formData,
          nomeArquivo: displayName,
        });
      }
    }
  };

  const formatFileSize = (tamanhoEmBytes: number) => {
    if (tamanhoEmBytes < 1024) {
      return tamanhoEmBytes + ' bytes';
    } else if (tamanhoEmBytes < 1024 * 1024) {
      return (tamanhoEmBytes / 1024).toFixed(2) + ' KB';
    } else if (tamanhoEmBytes < 1024 * 1024 * 1024) {
      return (tamanhoEmBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (tamanhoEmBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  };

  /* Upload de arquivos no Storage */
  const FirebaseUpload = async () => {
    if (!fileMetadata) return;

    const storageRef = ref(storage, `files/${fileMetadata.name}`);
    const uploadTask = uploadBytesResumable(storageRef, fileMetadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
      },

      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUrl(downloadURL);
        });
      }
    );
  };

  // Simular upload de arquivo
  const simulateFileUpload = async (): Promise<string> => {
    setUploadingFile(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUploadingFile(false);
    return `https://storage.googleapis.com/example-bucket/${selectedFileName
      .replace(/\s+/g, '_')
      .toLowerCase()}`;
  };

  // Salvar documento
  const handleSaveDocumento = async () => {
    // Validação básica
    if (!formData.nomeFundo || !formData.nomeAba || !formData.nomeArquivo) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    await FirebaseUpload().then(() => {
      const newDocumento: DocumentoLandingPage = {
        id: generateId(),
        nomeFundo: formData.nomeFundo || '',
        nomeAba: formData.nomeAba || '',
        nomeArquivo: formData.nomeArquivo || '',
        dataUpload: new Date().toISOString().split('T')[0],
        tipoArquivo: selectedFileType || 'PDF',
        tamanhoArquivo: formatFileSize(fileMetadata.size),
        link: url,
        visivel: formData.visivel !== undefined ? formData.visivel : true,
      };

      console.log(newDocumento, {
        selectedFileName,
      });
    });

    try {
      // Simular upload se for um novo documento ou se o arquivo foi alterado
      let fileLink = formData.link || '';
      if (
        !editingDocumento ||
        (editingDocumento && editingDocumento.nomeArquivo !== formData.nomeArquivo)
      ) {
        fileLink = await simulateFileUpload();
      }

      // Criar ou atualizar documento
      if (editingDocumento) {
        // Atualizar documento existente
        setDocumentos(
          documentos.map((documento) =>
            documento.id === editingDocumento.id
              ? {
                  ...documento,
                  nomeFundo: formData.nomeFundo || '',
                  nomeAba: formData.nomeAba || '',
                  nomeArquivo: formData.nomeArquivo || '',
                  dataUpload: new Date().toISOString().split('T')[0],
                  link: fileLink,
                  tipoArquivo: selectedFileType || documento.tipoArquivo,
                  visivel: formData.visivel !== undefined ? formData.visivel : true,
                }
              : documento
          )
        );
        toast.success('Documento atualizado com sucesso!');
      } else {
        // Criar novo documento
        const newDocumento: DocumentoLandingPage = {
          id: generateId(),
          nomeFundo: formData.nomeFundo || '',
          nomeAba: formData.nomeAba || '',
          nomeArquivo: formData.nomeArquivo || '',
          dataUpload: new Date().toISOString().split('T')[0],
          tipoArquivo: selectedFileType || 'PDF',
          tamanhoArquivo: `${(Math.random() * 5).toFixed(1)} MB`,
          link: fileLink,
          visivel: formData.visivel !== undefined ? formData.visivel : true,
        };
        setDocumentos([...documentos, newDocumento]);
        toast.success('Documento cadastrado com sucesso!');
      }

      closeDialog();
    } catch (error) {
      toast.error('Erro ao processar o arquivo');
      console.error(error);
    }
  };

  // Excluir documento
  const handleDeleteDocumento = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      setDocumentos(documentos.filter((documento) => documento.id !== id));
      toast.success('Documento excluído com sucesso!');
    }
  };

  // Alternar visibilidade do documento
  const toggleVisibility = (id: string) => {
    setDocumentos(
      documentos.map((documento) =>
        documento.id === id ? { ...documento, visivel: !documento.visivel } : documento
      )
    );
    toast.success('Visibilidade alterada com sucesso!');
  };

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
                <TableHead>Visível</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocumentos.length > 0 ? (
                filteredDocumentos.map((documento) => (
                  <TableRow key={documento.id}>
                    <TableCell className="font-medium">{documento.nomeFundo}</TableCell>
                    <TableCell>{documento.nomeAba}</TableCell>
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
                    <TableCell>
                      <Badge
                        variant={documento.visivel ? 'default' : 'outline'}
                        className={documento.visivel ? 'bg-green-500' : 'text-gray-500'}
                      >
                        {documento.visivel ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(documento)}>
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
                    </TableCell>
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
          <DialogHeader>
            <DialogTitle>
              {editingDocumento ? 'Editar Documento' : 'Cadastrar Novo Documento'}
            </DialogTitle>
            <DialogDescription>Upload de documento para a landing page.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomeFundo">Nome do Fundo</Label>
              <Select
                value={formData.fundName || ''}
                onValueChange={(value) => handleSelectChange('fundName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fundo" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(funds) && funds.length > 0 ? (
                    funds.map((fund, index) => (
                      <SelectItem key={index} value={fund.idName}>
                        {fund.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum fundo disponível
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeAba">Aba Correspondente</Label>
              <Select
                value={formData.tabName || ''}
                onValueChange={(value) => handleSelectChange('tabName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma aba" />
                </SelectTrigger>
                <SelectContent>
                  {abasOptions.map((aba) => (
                    <SelectItem key={aba} value={aba}>
                      {aba}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeArquivo">Nome do Arquivo</Label>
              <Input
                id="nomeArquivo"
                name="nomeArquivo"
                value={formData.nomeArquivo || ''}
                onChange={handleInputChange}
                placeholder="Nome que será exibido para o arquivo"
              />
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
                  <Input
                    id="landing-file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visivel"
                name="visivel"
                checked={formData.visivel !== undefined ? formData.visivel : true}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="visivel" className="cursor-pointer">
                Tornar visível na landing page
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveDocumento}
              disabled={
                uploadingFile || !formData.nomeFundo || !formData.nomeAba || !formData.nomeArquivo
              }
            >
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
