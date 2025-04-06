
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, FileUp, Search, Download, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

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

// Mock data
const empresasOptions = [
  "Empresa A Investimentos LTDA",
  "Empresa B Capital S.A.",
  "Empresa C Gestora de Recursos LTDA",
  "Empresa D Asset Management",
  "Empresa E Investimentos S.A.",
];

// Função para gerar ID aleatório
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock data
const mockDocumentos: DocumentoCompliance[] = [
  {
    id: generateId(),
    nomeEmpresa: "Empresa A Investimentos LTDA",
    nomeArquivo: "Política de Investimentos 2023",
    dataUpload: "2023-03-15",
    tipoArquivo: "PDF",
    tamanhoArquivo: "1.2 MB",
    link: "https://storage.googleapis.com/example-bucket/politica_investimentos_2023.pdf",
  },
  {
    id: generateId(),
    nomeEmpresa: "Empresa B Capital S.A.",
    nomeArquivo: "Relatório de Compliance Q1 2023",
    dataUpload: "2023-04-05",
    tipoArquivo: "PDF",
    tamanhoArquivo: "2.5 MB",
    link: "https://storage.googleapis.com/example-bucket/relatorio_compliance_q1_2023.pdf",
  },
  {
    id: generateId(),
    nomeEmpresa: "Empresa C Gestora de Recursos LTDA",
    nomeArquivo: "Manual de Normas e Procedimentos",
    dataUpload: "2023-02-20",
    tipoArquivo: "DOCX",
    tamanhoArquivo: "3.1 MB",
    link: "https://storage.googleapis.com/example-bucket/manual_normas_procedimentos.docx",
  },
];

const Compliance = () => {
  const [documentos, setDocumentos] = useState<DocumentoCompliance[]>(mockDocumentos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<DocumentoCompliance | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<DocumentoCompliance>>({
    nomeEmpresa: "",
    nomeArquivo: "",
    link: "",
  });

  // Nome do arquivo selecionado
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFileType, setSelectedFileType] = useState<string>("");

  // Filtrar documentos pelo termo de busca
  const filteredDocumentos = documentos.filter(
    (documento) =>
      documento.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.nomeArquivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir dialog para adicionar/editar
  const openDialog = (documento?: DocumentoCompliance) => {
    if (documento) {
      setEditingDocumento(documento);
      setFormData({
        nomeEmpresa: documento.nomeEmpresa,
        nomeArquivo: documento.nomeArquivo,
        link: documento.link,
      });
      setSelectedFileName(documento.nomeArquivo);
      setSelectedFileType(documento.tipoArquivo);
    } else {
      setEditingDocumento(null);
      setFormData({
        nomeEmpresa: "",
        nomeArquivo: "",
        link: "",
      });
      setSelectedFileName("");
      setSelectedFileType("");
    }
    setDialogOpen(true);
  };

  // Fechar dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDocumento(null);
    setSelectedFileName("");
    setSelectedFileType("");
  };

  // Atualizar selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Atualizar inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manipular upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      
      // Obter o tipo de arquivo da extensão
      const extension = file.name.split('.').pop()?.toUpperCase() || '';
      setSelectedFileType(extension);
      
      // Se não houver nome de exibição, usar o nome do arquivo
      if (!formData.nomeArquivo) {
        // Remover a extensão para o nome de exibição
        const displayName = file.name.replace(/\.[^/.]+$/, "");
        setFormData({
          ...formData,
          nomeArquivo: displayName,
        });
      }
    }
  };

  // Simular upload de arquivo
  const simulateFileUpload = async (): Promise<string> => {
    setUploadingFile(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUploadingFile(false);
    return `https://storage.googleapis.com/example-bucket/${selectedFileName.replace(/\s+/g, '_').toLowerCase()}`;
  };

  // Salvar documento
  const handleSaveDocumento = async () => {
    // Validação básica
    if (!formData.nomeEmpresa || !formData.nomeArquivo) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      // Simular upload se for um novo documento ou se o arquivo foi alterado
      let fileLink = formData.link || "";
      if (!editingDocumento || (editingDocumento && editingDocumento.nomeArquivo !== formData.nomeArquivo)) {
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
                  nomeEmpresa: formData.nomeEmpresa || "",
                  nomeArquivo: formData.nomeArquivo || "",
                  dataUpload: new Date().toISOString().split("T")[0],
                  link: fileLink,
                  tipoArquivo: selectedFileType || documento.tipoArquivo,
                }
              : documento
          )
        );
        toast.success("Documento atualizado com sucesso!");
      } else {
        // Criar novo documento
        const newDocumento: DocumentoCompliance = {
          id: generateId(),
          nomeEmpresa: formData.nomeEmpresa || "",
          nomeArquivo: formData.nomeArquivo || "",
          dataUpload: new Date().toISOString().split("T")[0],
          tipoArquivo: selectedFileType || "PDF",
          tamanhoArquivo: `${(Math.random() * 5).toFixed(1)} MB`,
          link: fileLink,
        };
        setDocumentos([...documentos, newDocumento]);
        toast.success("Documento cadastrado com sucesso!");
      }

      closeDialog();
    } catch (error) {
      toast.error("Erro ao processar o arquivo");
      console.error(error);
    }
  };

  // Excluir documento
  const handleDeleteDocumento = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      setDocumentos(documentos.filter((documento) => documento.id !== id));
      toast.success("Documento excluído com sucesso!");
    }
  };

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
                      {documento.tipoArquivo === "PDF" ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : documento.tipoArquivo === "DOCX" ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      {documento.nomeArquivo}
                    </TableCell>
                    <TableCell>{new Date(documento.dataUpload).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{documento.tipoArquivo}</TableCell>
                    <TableCell>{documento.tamanhoArquivo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(documento)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast.success("Download iniciado");
                            window.open(documento.link, "_blank");
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
          <DialogHeader>
            <DialogTitle>
              {editingDocumento ? "Editar Documento" : "Cadastrar Novo Documento"}
            </DialogTitle>
            <DialogDescription>
              Upload de documento de compliance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Select
                value={formData.nomeEmpresa || ""}
                onValueChange={(value) => handleSelectChange("nomeEmpresa", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresasOptions.map((empresa) => (
                    <SelectItem key={empresa} value={empresa}>
                      {empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeArquivo">Nome do Documento</Label>
              <Input
                id="nomeArquivo"
                name="nomeArquivo"
                value={formData.nomeArquivo || ""}
                onChange={handleInputChange}
                placeholder="Nome que será exibido para o documento"
              />
            </div>

            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileUp className="h-8 w-8 text-gray-400" />
                  <div className="text-sm text-center text-gray-600">
                    <p>Arraste e solte o arquivo aqui ou</p>
                    <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">
                      selecione do seu computador
                    </label>
                  </div>
                  <Input
                    id="file-upload"
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

            {editingDocumento && (
              <div className="space-y-2">
                <Label htmlFor="link">Link Atual</Label>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <ExternalLink className="h-4 w-4" />
                  <a href={editingDocumento.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {editingDocumento.link}
                  </a>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveDocumento} 
              disabled={uploadingFile || !formData.nomeEmpresa || !formData.nomeArquivo}
            >
              {uploadingFile ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compliance;
