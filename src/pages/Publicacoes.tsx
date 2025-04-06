
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, ExternalLink, Calendar, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Tipos
interface Publicacao {
  id: string;
  tema: string;
  produto: string;
  tipo: string;
  categoria: string;
  dataPublicacao: string;
  veiculo: string;
  logoVeiculo: string;
  descricao: string;
  link: string;
}

// Função para gerar ID aleatório
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock data
const mockPublicacoes: Publicacao[] = [
  {
    id: generateId(),
    tema: "Mercado Financeiro",
    produto: "Fundo Multimercado",
    tipo: "Entrevista",
    categoria: "Investimentos",
    dataPublicacao: "2023-04-05",
    veiculo: "Valor Econômico",
    logoVeiculo: "https://valor.globo.com/favicon.ico",
    descricao: "Entrevista com o gestor do fundo sobre as perspectivas econômicas para 2023 e estratégias de alocação em um cenário de volatilidade.",
    link: "https://valor.globo.com/exemplo-link",
  },
  {
    id: generateId(),
    tema: "Renda Fixa",
    produto: "Fundo Renda Fixa",
    tipo: "Artigo",
    categoria: "Educação Financeira",
    dataPublicacao: "2023-03-20",
    veiculo: "InfoMoney",
    logoVeiculo: "https://www.infomoney.com.br/favicon.ico",
    descricao: "Artigo explicando as vantagens e desvantagens dos investimentos em renda fixa em um cenário de juros altos.",
    link: "https://www.infomoney.com.br/exemplo-link",
  },
  {
    id: generateId(),
    tema: "ESG",
    produto: "Fundo Ações Sustentáveis",
    tipo: "Notícia",
    categoria: "Sustentabilidade",
    dataPublicacao: "2023-04-10",
    veiculo: "Exame",
    logoVeiculo: "https://exame.com/favicon.ico",
    descricao: "Lançamento do novo fundo de ações com foco em empresas com boas práticas ESG.",
    link: "https://exame.com/exemplo-link",
  },
];

const Publicacoes = () => {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>(mockPublicacoes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPublicacao, setEditingPublicacao] = useState<Publicacao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<Publicacao>>({
    tema: "",
    produto: "",
    tipo: "",
    categoria: "",
    dataPublicacao: "",
    veiculo: "",
    logoVeiculo: "",
    descricao: "",
    link: "",
  });

  // Filtrar publicações pelo termo de busca
  const filteredPublicacoes = publicacoes.filter(
    (publicacao) =>
      publicacao.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publicacao.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publicacao.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publicacao.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir dialog para adicionar/editar
  const openDialog = (publicacao?: Publicacao) => {
    if (publicacao) {
      setEditingPublicacao(publicacao);
      setFormData(publicacao);
    } else {
      setEditingPublicacao(null);
      setFormData({
        tema: "",
        produto: "",
        tipo: "",
        categoria: "",
        dataPublicacao: new Date().toISOString().split("T")[0],
        veiculo: "",
        logoVeiculo: "",
        descricao: "",
        link: "",
      });
    }
    setDialogOpen(true);
  };

  // Fechar dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPublicacao(null);
  };

  // Atualizar inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Salvar publicação
  const handleSavePublicacao = () => {
    // Validação básica
    if (!formData.tema || !formData.produto || !formData.dataPublicacao || !formData.veiculo) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Criar ou atualizar publicação
    if (editingPublicacao) {
      // Atualizar publicação existente
      setPublicacoes(
        publicacoes.map((publicacao) =>
          publicacao.id === editingPublicacao.id
            ? { ...publicacao, ...formData } as Publicacao
            : publicacao
        )
      );
      toast.success("Publicação atualizada com sucesso!");
    } else {
      // Criar nova publicação
      const newPublicacao: Publicacao = {
        id: generateId(),
        ...(formData as Omit<Publicacao, "id">),
      };
      setPublicacoes([...publicacoes, newPublicacao]);
      toast.success("Publicação cadastrada com sucesso!");
    }

    closeDialog();
  };

  // Excluir publicação
  const handleDeletePublicacao = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta publicação?")) {
      setPublicacoes(publicacoes.filter((publicacao) => publicacao.id !== id));
      toast.success("Publicação excluída com sucesso!");
    }
  };

  // Agrupar por categoria
  const getPublicacoesByCategoria = () => {
    const categories: Record<string, number> = {};
    
    publicacoes.forEach((publicacao) => {
      if (categories[publicacao.categoria]) {
        categories[publicacao.categoria]++;
      } else {
        categories[publicacao.categoria] = 1;
      }
    });
    
    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  };

  // Agrupar por tipo
  const getPublicacoesByTipo = () => {
    const types: Record<string, number> = {};
    
    publicacoes.forEach((publicacao) => {
      if (types[publicacao.tipo]) {
        types[publicacao.tipo]++;
      } else {
        types[publicacao.tipo] = 1;
      }
    });
    
    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Publicações e Materiais</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Publicação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total de Publicações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicacoes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atualizado em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {getPublicacoesByCategoria().map(([categoria, count]) => (
                <div key={categoria} className="flex items-center justify-between text-sm">
                  <span>{categoria}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {getPublicacoesByTipo().map(([tipo, count]) => (
                <div key={tipo} className="flex items-center justify-between text-sm">
                  <span>{tipo}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar publicações..."
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
                <TableHead>Tema</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPublicacoes.length > 0 ? (
                filteredPublicacoes.map((publicacao) => (
                  <TableRow key={publicacao.id}>
                    <TableCell className="font-medium">{publicacao.tema}</TableCell>
                    <TableCell>{publicacao.produto}</TableCell>
                    <TableCell>{publicacao.tipo}</TableCell>
                    <TableCell>{publicacao.categoria}</TableCell>
                    <TableCell>{new Date(publicacao.dataPublicacao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Newspaper className="h-4 w-4 text-gray-500" />
                      {publicacao.veiculo}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(publicacao)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            window.open(publicacao.link, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeletePublicacao(publicacao.id)}
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
                    Nenhuma publicação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog para adicionar/editar publicação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPublicacao ? "Editar Publicação" : "Cadastrar Nova Publicação"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações sobre a publicação ou material.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema</Label>
                <Input
                  id="tema"
                  name="tema"
                  value={formData.tema || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: Mercado Financeiro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="produto">Produto</Label>
                <Input
                  id="produto"
                  name="produto"
                  value={formData.produto || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: Fundo Multimercado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  name="tipo"
                  value={formData.tipo || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: Entrevista, Artigo, Notícia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  name="categoria"
                  value={formData.categoria || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: Investimentos, Educação Financeira"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPublicacao">Data da Publicação</Label>
                <Input
                  id="dataPublicacao"
                  name="dataPublicacao"
                  type="date"
                  value={formData.dataPublicacao || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="veiculo">Veículo</Label>
                <Input
                  id="veiculo"
                  name="veiculo"
                  value={formData.veiculo || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: Valor Econômico, InfoMoney"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoVeiculo">Link para Logotipo do Veículo</Label>
                <Input
                  id="logoVeiculo"
                  name="logoVeiculo"
                  type="url"
                  value={formData.logoVeiculo || ""}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link para a Matéria</Label>
                <Input
                  id="link"
                  name="link"
                  type="url"
                  value={formData.link || ""}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/materia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao || ""}
                  onChange={handleInputChange}
                  placeholder="Breve descrição sobre a publicação"
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePublicacao} 
              disabled={!formData.tema || !formData.produto || !formData.dataPublicacao || !formData.veiculo}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Publicacoes;
