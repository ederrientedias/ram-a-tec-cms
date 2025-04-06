
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
import { Plus, Pencil, Trash2, FileUp, Download, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Tipos
interface Portfolio {
  id: string;
  nomeFundo: string;
  nomeArquivo: string;
  dataUpload: string;
  tamanhoArquivo: string;
  status: "processado" | "erro" | "pendente";
  link: string;
}

// Mock data de fundos
const fundosOptions = [
  "Fundo Alocação Dinâmica", 
  "Fundo Renda Fixa Longo Prazo", 
  "Fundo Ações Dividendos", 
  "Fundo Multimercado Global",
  "Fundo FIIs Brasil"
];

// Função para gerar ID aleatório
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock data
const mockPortfolios: Portfolio[] = [
  {
    id: generateId(),
    nomeFundo: "Fundo Alocação Dinâmica",
    nomeArquivo: "portfolio_alocacao_q1_2023.csv",
    dataUpload: "2023-04-01",
    tamanhoArquivo: "2.3 MB",
    status: "processado",
    link: "https://storage.googleapis.com/example-bucket/portfolio_alocacao_q1_2023.csv",
  },
  {
    id: generateId(),
    nomeFundo: "Fundo Renda Fixa Longo Prazo",
    nomeArquivo: "portfolio_rf_q1_2023.csv",
    dataUpload: "2023-04-01",
    tamanhoArquivo: "1.8 MB",
    status: "processado",
    link: "https://storage.googleapis.com/example-bucket/portfolio_rf_q1_2023.csv",
  },
  {
    id: generateId(),
    nomeFundo: "Fundo Ações Dividendos",
    nomeArquivo: "portfolio_acoes_q1_2023.csv",
    dataUpload: "2023-04-01",
    tamanhoArquivo: "3.1 MB",
    status: "erro",
    link: "https://storage.googleapis.com/example-bucket/portfolio_acoes_q1_2023.csv",
  },
];

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<Portfolio>>({
    nomeFundo: "",
    nomeArquivo: "",
    link: "",
  });

  // Nome do arquivo selecionado
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  // Filtrar portfolios pelo termo de busca
  const filteredPortfolios = portfolios.filter(
    (portfolio) =>
      portfolio.nomeFundo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.nomeArquivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir dialog para adicionar/editar
  const openDialog = (portfolio?: Portfolio) => {
    if (portfolio) {
      setEditingPortfolio(portfolio);
      setFormData(portfolio);
      setSelectedFileName(portfolio.nomeArquivo);
    } else {
      setEditingPortfolio(null);
      setFormData({
        nomeFundo: "",
        nomeArquivo: "",
        link: "",
      });
      setSelectedFileName("");
    }
    setDialogOpen(true);
  };

  // Fechar dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPortfolio(null);
    setSelectedFileName("");
  };

  // Atualizar selects
  const handleSelectChange = (name: string, value: string) => {
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
      setFormData({
        ...formData,
        nomeArquivo: file.name,
      });
    }
  };

  // Simular upload de arquivo
  const simulateFileUpload = async (): Promise<string> => {
    setUploadingFile(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUploadingFile(false);
    return `https://storage.googleapis.com/example-bucket/${selectedFileName}`;
  };

  // Salvar portfolio
  const handleSavePortfolio = async () => {
    // Validação básica
    if (!formData.nomeFundo || !selectedFileName) {
      toast.error("Por favor, selecione um fundo e um arquivo");
      return;
    }

    try {
      // Simular upload se for um novo portfolio ou se o arquivo foi alterado
      let fileLink = formData.link || "";
      if (!editingPortfolio || (editingPortfolio && editingPortfolio.nomeArquivo !== selectedFileName)) {
        fileLink = await simulateFileUpload();
      }

      // Criar ou atualizar portfolio
      if (editingPortfolio) {
        // Atualizar portfolio existente
        setPortfolios(
          portfolios.map((portfolio) =>
            portfolio.id === editingPortfolio.id
              ? {
                  ...portfolio,
                  nomeFundo: formData.nomeFundo || "",
                  nomeArquivo: selectedFileName,
                  dataUpload: new Date().toISOString().split("T")[0],
                  link: fileLink,
                }
              : portfolio
          )
        );
        toast.success("Portfólio atualizado com sucesso!");
      } else {
        // Criar novo portfolio
        const newPortfolio: Portfolio = {
          id: generateId(),
          nomeFundo: formData.nomeFundo || "",
          nomeArquivo: selectedFileName,
          dataUpload: new Date().toISOString().split("T")[0],
          tamanhoArquivo: `${(Math.random() * 5).toFixed(1)} MB`,
          status: Math.random() > 0.2 ? "processado" : "pendente",
          link: fileLink,
        };
        setPortfolios([...portfolios, newPortfolio]);
        toast.success("Portfólio cadastrado com sucesso!");
      }

      closeDialog();
    } catch (error) {
      toast.error("Erro ao processar o arquivo");
      console.error(error);
    }
  };

  // Excluir portfolio
  const handleDeletePortfolio = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este portfólio?")) {
      setPortfolios(portfolios.filter((portfolio) => portfolio.id !== id));
      toast.success("Portfólio excluído com sucesso!");
    }
  };

  // Renderizar status do portfolio
  const renderStatusBadge = (status: Portfolio["status"]) => {
    switch (status) {
      case "processado":
        return <Badge className="bg-green-500">Processado</Badge>;
      case "erro":
        return <Badge variant="destructive">Erro</Badge>;
      case "pendente":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Portfólios</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Portfólio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total de Portfólios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolios.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atualizado em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm">{portfolios.filter(p => p.status === "processado").length} Processados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm">{portfolios.filter(p => p.status === "erro").length} Erros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm">{portfolios.filter(p => p.status === "pendente").length} Pendentes</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Fundos com Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(portfolios.map(p => p.nomeFundo)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De um total de {fundosOptions.length} fundos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar portfólios..."
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
                <TableHead>Arquivo</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPortfolios.length > 0 ? (
                filteredPortfolios.map((portfolio) => (
                  <TableRow key={portfolio.id}>
                    <TableCell className="font-medium">{portfolio.nomeFundo}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {portfolio.nomeArquivo}
                    </TableCell>
                    <TableCell>{new Date(portfolio.dataUpload).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{portfolio.tamanhoArquivo}</TableCell>
                    <TableCell>{renderStatusBadge(portfolio.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(portfolio)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast.success("Download iniciado");
                            window.open(portfolio.link, "_blank");
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeletePortfolio(portfolio.id)}
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
                    Nenhum portfólio encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog para adicionar/editar portfolio */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPortfolio ? "Editar Portfólio" : "Cadastrar Novo Portfólio"}
            </DialogTitle>
            <DialogDescription>
              Upload de arquivo CSV contendo informações do portfólio do fundo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomeFundo">Nome do Fundo</Label>
              <Select
                value={formData.nomeFundo || ""}
                onValueChange={(value) => handleSelectChange("nomeFundo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fundo" />
                </SelectTrigger>
                <SelectContent>
                  {fundosOptions.map((fundo) => (
                    <SelectItem key={fundo} value={fundo}>
                      {fundo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Arquivo CSV</Label>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileUp className="h-8 w-8 text-gray-400" />
                  <div className="text-sm text-center text-gray-600">
                    <p>Arraste e solte o arquivo aqui ou</p>
                    <label htmlFor="csv-upload" className="text-primary cursor-pointer hover:underline">
                      selecione do seu computador
                    </label>
                  </div>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
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
                  <p className="text-xs text-gray-500 mt-2">Formato: CSV. Tamanho máximo: 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePortfolio} 
              disabled={uploadingFile || !formData.nomeFundo || !selectedFileName}
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

export default Portfolios;
