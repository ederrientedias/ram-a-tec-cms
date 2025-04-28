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
import { useProductTypes } from '@/hooks/firestore/funds/use-product-types';
import { useCategories } from '@/hooks/firestore/funds/use-categories';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { useTypes } from '@/hooks/firestore/funds/use-types';
import { useFunds } from '@/hooks/firestore/funds/use-funds';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IFund } from '@/models/funds.model';
import { useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
// Tipos
interface Fundo {
  id: string;
  idFundo: string;
  nome: string;
  produto: string;
  tipo: string;
  categoria: string;
  dataInicio: string;
  valorCota: number;
  rentabilidadeMensal: number;
  rentabilidadeAnual: number;
  rentabilidade12M: number;
  rentabilidade24M: number;
  rentabilidadeInicio: number;
  benchmark: string;
  link: string;
}

// Mock data
const produtosOptions = ['Renda Fixa', 'Renda Variável', 'Multimercado', 'FIIs', 'Offshore'];
const tiposOptions = ['Aberto', 'Fechado', 'Exclusivo'];
const categoriasOptions = ['Conservador', 'Moderado', 'Arrojado', 'Super Arrojado'];

// Função para gerar ID aleatório
const generateId = () => Math.random().toString(36).substr(2, 9);

const mockFundos: Fundo[] = [
  {
    id: generateId(),
    idFundo: 'FND-001',
    nome: 'Fundo Alocação Dinâmica',
    produto: 'Multimercado',
    tipo: 'Aberto',
    categoria: 'Moderado',
    dataInicio: '2021-02-15',
    valorCota: 12.75,
    rentabilidadeMensal: 0.9,
    rentabilidadeAnual: 9.8,
    rentabilidade12M: 11.2,
    rentabilidade24M: 19.5,
    rentabilidadeInicio: 27.5,
    benchmark: 'CDI',
    link: 'https://exemplo.com/fundo-alocacao',
  },
  {
    id: generateId(),
    idFundo: 'FND-002',
    nome: 'Fundo Renda Fixa Longo Prazo',
    produto: 'Renda Fixa',
    tipo: 'Aberto',
    categoria: 'Conservador',
    dataInicio: '2020-05-10',
    valorCota: 10.43,
    rentabilidadeMensal: 0.5,
    rentabilidadeAnual: 5.8,
    rentabilidade12M: 6.1,
    rentabilidade24M: 13.2,
    rentabilidadeInicio: 18.9,
    benchmark: 'CDI',
    link: 'https://exemplo.com/fundo-rf',
  },
  {
    id: generateId(),
    idFundo: 'FND-003',
    nome: 'Fundo Ações Dividendos',
    produto: 'Renda Variável',
    tipo: 'Aberto',
    categoria: 'Arrojado',
    dataInicio: '2019-12-01',
    valorCota: 25.68,
    rentabilidadeMensal: 1.7,
    rentabilidadeAnual: 12.3,
    rentabilidade12M: 15.6,
    rentabilidade24M: 22.8,
    rentabilidadeInicio: 37.4,
    benchmark: 'Ibovespa',
    link: 'https://exemplo.com/fundo-acoes',
  },
];

const Funds = () => {
  const { data, isLoading, error } = useFunds();
  const {
    data: productTypes,
    isLoading: isLoadingProductTypes,
    error: productTypesErro,
  } = useProductTypes();
  const { data: types, isLoading: isLoadingTypes, error: typesErro } = useTypes();
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesErro,
  } = useCategories();

  const [fundos, setFundos] = useState<Fundo[]>(mockFundos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFundo, setEditingFundo] = useState<Fundo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  console.log('Fundos:', data);
  console.log('Tipos:', types);
  console.log('Categorias:', categories);
  console.log('Produtos:', productTypes);

  // Estado do formulário
  const [formData, setFormData] = useState<Partial<Fundo>>({
    idFundo: '',
    nome: '',
    produto: '',
    tipo: '',
    categoria: '',
    dataInicio: '',
    valorCota: 0,
    rentabilidadeMensal: 0,
    rentabilidadeAnual: 0,
    rentabilidade12M: 0,
    rentabilidade24M: 0,
    rentabilidadeInicio: 0,
    benchmark: '',
    link: '',
  });

  // Filtrar fundos pelo termo de busca
  const filteredFundos = data?.filter(
    (fund) =>
      fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir dialog para adicionar/editar
  const openDialog = (fundo?: Fundo) => {
    if (fundo) {
      setEditingFundo(fundo);
      setFormData(fundo);
    } else {
      setEditingFundo(null);
      setFormData({
        idFundo: `FND-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`,
        nome: '',
        produto: '',
        tipo: '',
        categoria: '',
        dataInicio: new Date().toISOString().split('T')[0],
        valorCota: 0,
        rentabilidadeMensal: 0,
        rentabilidadeAnual: 0,
        rentabilidade12M: 0,
        rentabilidade24M: 0,
        rentabilidadeInicio: 0,
        benchmark: '',
        link: '',
      });
    }
    setDialogOpen(true);
  };

  // Fechar dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingFundo(null);
  };

  // Atualizar formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  // Atualizar selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Salvar fundo
  const handleSaveFundo = () => {
    // Validação básica
    if (!formData.nome || !formData.produto || !formData.tipo || !formData.categoria) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Criar ou atualizar fundo
    if (editingFundo) {
      // Atualizar fundo existente
      setFundos(
        fundos.map((fundo) =>
          fundo.id === editingFundo.id ? ({ ...formData, id: fundo.id } as Fundo) : fundo
        )
      );
      toast.success('Fundo atualizado com sucesso!');
    } else {
      // Criar novo fundo
      const newFundo: Fundo = {
        id: generateId(),
        ...(formData as Omit<Fundo, 'id'>),
      };
      setFundos([...fundos, newFundo]);
      toast.success('Fundo cadastrado com sucesso!');
    }

    closeDialog();
  };

  // Excluir fundo
  const handleDeleteFundo = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fundo?')) {
      setFundos(fundos.filter((fundo) => fundo.id !== id));
      toast.success('Fundo excluído com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Fundos</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fundo
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar fundos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 text-gray-700">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Fundo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Valor da Cota</TableHead>
                <TableHead>Rent. Mensal</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFundos?.length > 0 ? (
                filteredFundos?.map((fund: IFund) => (
                  <TableRow key={fund.id}>
                    <TableCell className="font-medium">{fund.id}</TableCell>
                    <TableCell>{fund.name}</TableCell>
                    <TableCell>{fund.productType}</TableCell>
                    <TableCell>{fund.type}</TableCell>
                    <TableCell>{fund.category}</TableCell>
                    <TableCell>{new Date(fund.initDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>R$ {fund.share}</TableCell>
                    <TableCell>{fund['12m']}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* onClick={() => openDialog(fundo)} */}
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* onClick={() => handleDeleteFundo(fundo.id)} */}
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    Nenhum fundo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog para adicionar/editar fundo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingFundo ? 'Editar Fundo' : 'Cadastrar Novo Fundo'}</DialogTitle>
            <DialogDescription>Preencha as informações do fundo abaixo.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idFundo">ID do Fundo</Label>
                <Input
                  id="idFundo"
                  name="idFundo"
                  value={formData.idFundo || ''}
                  onChange={handleInputChange}
                  disabled={editingFundo !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Fundo</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome || ''}
                  onChange={handleInputChange}
                />
              </div>

              {/* Product Types */}
              <div className="space-y-2">
                <Label htmlFor="produto">Produto</Label>
                {isLoadingProductTypes ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <Select
                    value={formData.produto || ''}
                    onValueChange={(value) => handleSelectChange('produto', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes?.map((productType) => (
                        <SelectItem key={productType?.id} value={productType?.name}>
                          {productType?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Types */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo do Fundo</Label>
                <Select
                  value={formData.tipo || ''}
                  onValueChange={(value) => handleSelectChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria do Fundo</Label>
                <Select
                  value={formData.categoria || ''}
                  onValueChange={(value) => handleSelectChange('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início do Fundo</Label>
                <Input
                  id="dataInicio"
                  name="dataInicio"
                  type="date"
                  value={formData.dataInicio || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorCota">Valor da Cota (R$)</Label>
                <Input
                  id="valorCota"
                  name="valorCota"
                  type="number"
                  step="0.01"
                  value={formData.valorCota || 0}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rentabilidadeMensal">Rentabilidade Mensal (%)</Label>
                <Input
                  id="rentabilidadeMensal"
                  name="rentabilidadeMensal"
                  type="number"
                  step="0.01"
                  value={formData.rentabilidadeMensal || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentabilidadeAnual">Rentabilidade Anual (%)</Label>
                <Input
                  id="rentabilidadeAnual"
                  name="rentabilidadeAnual"
                  type="number"
                  step="0.01"
                  value={formData.rentabilidadeAnual || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentabilidade12M">Rentabilidade 12 Meses (%)</Label>
                <Input
                  id="rentabilidade12M"
                  name="rentabilidade12M"
                  type="number"
                  step="0.01"
                  value={formData.rentabilidade12M || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentabilidade24M">Rentabilidade 24 Meses (%)</Label>
                <Input
                  id="rentabilidade24M"
                  name="rentabilidade24M"
                  type="number"
                  step="0.01"
                  value={formData.rentabilidade24M || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentabilidadeInicio">Rentabilidade desde o Início (%)</Label>
                <Input
                  id="rentabilidadeInicio"
                  name="rentabilidadeInicio"
                  type="number"
                  step="0.01"
                  value={formData.rentabilidadeInicio || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benchmark">Benchmark</Label>
                <Input
                  id="benchmark"
                  name="benchmark"
                  value={formData.benchmark || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link do Fundo</Label>
                <Input
                  id="link"
                  name="link"
                  type="url"
                  value={formData.link || ''}
                  onChange={handleInputChange}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFundo}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Funds;
