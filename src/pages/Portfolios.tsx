import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PortfolioSchema, defaultValues, portfolioSchema } from '@/schemas/portfolio.schema';
import { Plus, Pencil, Trash2, FileUp, Download, Search, FileText } from 'lucide-react';
import LoadingPageAnimation from '@/components/animations/loadingPage';
import Loading404Animation from '@/components/animations/loading404';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useFunds } from '@/hooks/firestore/funds/use-funds';
import portfolioService from '@/services/portfolio.service';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { formatFileSize } from '@/utils/format-file-size';
import { useLog } from '@/hooks/firestore/logs/use-log';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { IPortfolioLog } from '@/models/log.model';
import { ITable } from '@/models/portfolio.model';
import logService from '@/services/logs.service';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IFund } from '@/models/funds.model';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';


// Tipos
interface Portfolio {
  id: string;
  nomeFundo: string;
  nomeArquivo: string;
  dataUpload: string;
  tamanhoArquivo: string;
  status: 'processado' | 'erro' | 'pendente';
  link: string;
}

const Portfolios = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileRef, setFileRef] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [editPortfolio, setEditPortfolio] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fundRef, setFundRef] = useState<IFund | null>(null);
  const { data: funds, isLoading: isLoadingFund, error: fundsError } = useFunds();
  const {
    data: logs,
    isLoading: isLoadingLog,
    error: LogError,
  } = useLog<IPortfolioLog>({ logName: FirestoreDocument.PORTFOLIO_LOG });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, touchedFields },
    control,
  } = useForm<PortfolioSchema>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: defaultValues,
  });

  const selectedFundName = useWatch({
    control,
    name: 'fundName',
    defaultValue: defaultValues.fundName,
  });

  useEffect(() => {
    if (selectedFundName) {
      const fundRef = funds?.find((fund) => fund.collectionName === selectedFundName);
      setFundRef(fundRef);
    }
  }, [selectedFundName, funds]);

  const filteredLogs = (logs || []).filter(
    (p: IPortfolioLog) =>
      p.fundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: PortfolioSchema): Promise<void> => {
    setUploadingFile(true);
    await handleFileUpload(data);
  };

  const handleFileUpload = async (data: PortfolioSchema): Promise<void> => {
    try {
      const { data: response } = await apiService.uploadCSV(fileRef);

      if (response.status !== 'success') {
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      await handleSavePortfolio(data, response.table);
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo.');
      console.error(error);
    }
  };

  const handleSavePortfolio = async (data: PortfolioSchema, table: ITable): Promise<void> => {
    await Promise.all([handleAddLog(data), handleSaveAssetTable(data, table)])
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: [FirestoreDocument.PORTFOLIO_LOG] });
        toast.success('Portfólio salvo com sucesso!');
        closeDialog();
        reset();
      })
      .catch((error) => {
        toast.error('Erro ao enviar o formulário');
        console.error('Erro ao enviar o formulário:', error);
      })
      .finally(() => {
        setUploadingFile(false);
      });
  };

  const handleAddLog = async (data: PortfolioSchema): Promise<boolean> => {
    const newLog: IPortfolioLog = {
      id: crypto.randomUUID(),
      fundName: fundRef.name,
      fileName: selectedFileName,
      fileSize: formatFileSize(fileRef.size),
      collectionName: data.fundName,
      createdAt: Date.now(),
    };

    return await logService.addLog(FirestoreDocument.PORTFOLIO_LOG, newLog);
  };

  const handleSaveAssetTable = async (data: PortfolioSchema, table: ITable): Promise<boolean> => {
    return await portfolioService.updateAssetTable(data.fundName, table);
  };

  const openDialog = (logRef?: IPortfolioLog) => {
    console.log(logRef);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditPortfolio(false);
    setSelectedFileName('');
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(e);
      setSelectedFileName(file?.name || '');
      if (file) {
        setFileRef(file);
      }
    }
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      reset();
      setEditPortfolio(false);
    }
  };

  const handleDeletePortfolio = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este portfólio?')) {
      toast.success('Portfólio excluído com sucesso!');
    }
  };

  if (isLoadingFund || isLoadingLog) return <LoadingPageAnimation />;
  if (LogError || fundsError) return <Loading404Animation />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium font-serif text-rz-black">
          Gerenciamento de Portfólios
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total de Portfólios Atualizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atualizado em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-rz-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-rz-black" />
            <Input
              type="search"
              placeholder="Buscar portfólios..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Portfólio
          </Button>
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Fundo</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead>Tamanho</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log: IPortfolioLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.fundName}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {log.fileName}
                    </TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{log.fileSize}</TableCell>
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
        <DialogContent onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editPortfolio ? 'Editar Portfólio' : 'Cadastrar Novo Portfólio'}
              </DialogTitle>
              <DialogDescription>
                Upload de arquivo CSV contendo informações do portfólio do fundo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="nomeFundo">Nome do Fundo</Label>
                <Controller
                  name="fundName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fundo" />
                      </SelectTrigger>
                      <SelectContent>
                        {funds.map((fundo) => (
                          <SelectItem key={fundo.idName} value={fundo.collectionName}>
                            {fundo.name}
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
                <Label>Arquivo CSV</Label>
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileUp className="h-8 w-8 text-gray-400" />
                    <div className="text-sm text-center text-gray-600">
                      <p>Arraste e solte o arquivo aqui ou</p>
                      <label
                        htmlFor="csv-upload"
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
                          id="csv-upload"
                          type="file"
                          accept=".csv"
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
                    <p className="text-xs text-gray-500 mt-2">Formato: CSV. Tamanho máximo: 10MB</p>
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

export default Portfolios;
