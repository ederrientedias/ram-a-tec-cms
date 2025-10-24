import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { FundFormValues, landingPageSchema, defaultLandingPageValues, } from '@/schemas/landing-page.schema';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLandingPageFunds } from '@/hooks/firestore/funds/use-landingpage';
import { toKebabCase, toSnakeCase } from '@/utils/format-string';
import routesRepository from '@/repositories/routes.repository';
import { Info, Key, Pencil, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import routeService from '@/services/routes.service';
import { Skeleton } from '@/components/ui/skeleton';
import fundService from '@/services/funds.service';
import { Button } from '@/components/ui/button';
import { IRoute } from '@/models/routes.model';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IFund } from '@/models/funds.model';
import Cleave from 'cleave.js/react';
import { useState } from 'react';
import { toast } from 'sonner';


const CreateLandingPage = () => {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isloading, setIsloading] = useState<boolean>(false);
  const [fundData, setFundData] = useState<IFund | null>(null);
  const [routeRef, setRouteRef] = useState<IRoute | null>(null);
  const { data: landingPages, error, isLoading } = useLandingPageFunds();
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FundFormValues>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: defaultLandingPageValues,
  });

  const nameWatch = watch('name');

  const openDialog = (data?: IFund) => {
    setDialogOpen(true);
    if (data) {
      handleEditingLandingPage(data);
      return;
    }
    setFundData(null);
    reset();
  };

  const handleEditingLandingPage = async (data: IFund) => {
    await handleRouteRef(data);
    setValue('id', Number(data.id));
    setValue('name', data.name);
    setValue('ticker', data.ticker);
    setValue('corporateName', data.feeders[0].corporateName);
    setValue('cnpj', data.feeders[0].cnpj);
    setValue('url', data.redirectUrl);
    setFundData(data);
  };

  const handleRouteRef = async (data: IFund) => {
    const routes = await routeService.getRoutes();
    setRouteRef(routes.find((r: IRoute) => r.collectionName === data.collectionName));
  };

  const IDGenerator = () => {
    setValue('id', new Date().getTime());
  };

  const onSubmit = async (data: FundFormValues) => {
    setIsloading(true);

    if (fundData) {
      await updateLandingPageData(data);
    } else {
      await newLandingPage(data);
    }
  };

  const updateLandingPageData = async (data: FundFormValues) => {
    try {
      const snakeCaseName = toSnakeCase(data.name);
      const kebabCaseName = toKebabCase(data.name);
      const shouldMigrate = snakeCaseName !== fundData.collectionName;

      const updatedLandingpageData = {
        ...fundData,
        id: data.id,
        name: data.name,
        idName: kebabCaseName,
        ticker: data.ticker,
        eventName: snakeCaseName,
        collectionName: snakeCaseName,
        redirectUrl: data.url,
        feeders: [
          {
            ...fundData.feeders[0],
            corporateName: data.corporateName,
            cnpj: data.cnpj,
          },
        ],
      };

      const route: IRoute = {
        id: routeRef.id,
        path: data.url,
        title: data.name,
        collectionName: updatedLandingpageData.collectionName,
        createdAt: routeRef.createdAt,
        updatedAt: Date.now(),
      };

      const promises = [fundService.setFunds(updatedLandingpageData), routeService.setRoute(route)];

      if (shouldMigrate) {
        promises.push(
          fundService.migrateCollection({
            oldCollection: fundData.collectionName,
            newColletion: snakeCaseName,
          })
        );
      }

      await Promise.all(promises);
      toast.success('Informações do fundo atualizadas com sucesso.');
    } catch (error) {
      toast.error('Erro ao atualizar as informações do fundo.');
    } finally {
      setIsloading(false);
      loadLandingPageData();
      closeDialog();
    }
  };

  const newLandingPage = async (data: FundFormValues) => {
    try {
      const landingPageData = {
        uuid: crypto.randomUUID(),
        id: data.id,
        name: data.name,
        ticker: data.ticker ?? '',
        initDate: '',
        redirectUrl: data.url,
        collectionName: toSnakeCase(data.name),
        portfolioUpdatedAt: Date.now(),
        description: '',
        monthProfitability: 0,
        '12m': 0,
        yearProfitability: 0,
        eventName: toSnakeCase(data.name),
        type: '',
        rank: 0,
        updatedAt: Date.now(),
        platforms: [],
        idName: toKebabCase(data.name),
        init: 0,
        '24m': 0,
        feeders: [
          {
            cnpj: data.cnpj ?? '',
            corporateName: data.corporateName ?? '',
            eventName: '',
            feeder: '',
            feederName: '',
            id: 0,
          },
        ],
        hasFeeder: false,
        isClosed: false,
        displayProfitability: false,
        highlighted: false,
        displayInFundList: false,
        share: 0,
        benchmark: '',
        category: '',
        productType: '',
      };

      const route = {
        id: crypto.randomUUID(),
        path: data.url,
        title: data.name,
        collectionName: landingPageData.collectionName,
        createdAt: Date.now(),
      };

      const docRef = {
        fundName: landingPageData.collectionName,
        documentName: 'documents',
        data: [],
      };

      await Promise.all([
        fundService.setFunds(landingPageData),
        routeService.setRoute(route),
        fundService.setDocument(docRef),
      ]);

      await loadLandingPageData();
      toast.success('Novo fundo registrado e rota configurada com sucesso.');
    } catch (error) {
      toast.error('Erro ao registrar o fundo. Verifique os dados e tente novamente.');
    } finally {
      setIsloading(false);
      closeDialog();
    }
  };

  const loadLandingPageData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['landingPageFunds'] });
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-end gap-2 justify-end">
        <Button type="button" onClick={() => openDialog()}>
          <Plus className="h-4 w-4" />
          Nova Landing Page
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome do Fundo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  <Skeleton className="h-[50px] w-full" />
                </TableCell>
              </TableRow>
            ) : (
              landingPages?.map((data) => {
                return (
                  <TableRow key={data.name}>
                    <TableCell>{data.id}</TableCell>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openDialog(data)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar landing page</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl flex flex-col gap-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {nameWatch || fundData?.name || 'Cadastro de Landing Page'}
                </DialogTitle>
                <DialogDescription>Preencha as informações sobre o fundo.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-x-2 gap-y-4 my-7">
                <div className="col-span-1 col-start-1 flex items-end gap-2">
                  <div className="flex-1 flex flex-col justify-start gap-2">
                    <Label htmlFor="id">ID do Fundo</Label>
                    <Controller
                      name="id"
                      control={control}
                      render={({ field }) => (
                        <Input type="text" placeholder="Nome que será exibido" {...field} />
                      )}
                    />
                    {errors.id && <small className="text-red-400">{errors.id.message}</small>}
                  </div>
                  <div>
                    <Button type="button" onClick={IDGenerator} variant="outline">
                      <Key />
                      Gerar ID Aleatório
                    </Button>
                  </div>
                </div>
                <div className="col-span-1 flex-1 flex flex-col justify-start gap-2">
                  <Label htmlFor="url" className="flex items-center gap-2">
                    URL de Redirecionamento
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3" />
                      </TooltipTrigger>
                      <TooltipContent className="p-2">
                        <p className="font-sans font-normal mb-2">
                          <strong className="font-medium">URL de Redirecionamento:</strong> É o slug
                          (a parte final da URL) que define a página de destino.
                        </p>
                        <p className="font-sans font-normal">
                          <strong className="font-medium">Exemplo:</strong>
                          <span className="p-1 font-medium bg-slate-100">sua-url-aqui</span> em
                          https://rizaasset.com/sua-url-aqui.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Controller
                    name="url"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" placeholder="Nome da URL da landing page" {...field} />
                    )}
                  />
                  {errors.url && <small className="text-red-400">{errors.url.message}</small>}
                </div>
                <div className="col-span-1 flex flex-col gap-2">
                  <Label htmlFor="name">Nome do Fundo</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" placeholder="Nome que será exibido" {...field} />
                    )}
                  />
                  {errors.name && <small className="text-red-400">{errors.name.message}</small>}
                </div>

                <div className="col-span-1 flex flex-col gap-2">
                  <Label htmlFor="corporateName">Razão Social</Label>
                  <Controller
                    name="corporateName"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" placeholder="Digite o id Name" {...field} />
                    )}
                  />
                </div>

                <div className="col-span-1 flex flex-col gap-2">
                  <Label htmlFor="eventName">CNPJ</Label>
                  <Controller
                    name="cnpj"
                    control={control}
                    render={({ field }) => (
                      <Cleave
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        id="cnpj"
                        placeholder="Digite o CNPJ"
                        {...field}
                        options={{
                          numericOnly: true,
                          delimiters: ['.', '.', '/', '-'],
                          blocks: [2, 3, 3, 4, 2],
                          uppercase: true,
                        }}
                      />
                    )}
                  />
                </div>

                <div className="col-span-1 flex flex-col gap-2">
                  <Label htmlFor="ticker">Ticker</Label>
                  <Controller
                    name="ticker"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" placeholder="Digite o Ticker" {...field} />
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!isValid}>
                  {isloading ? (
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
    </div>
  );
};
export default CreateLandingPage;
