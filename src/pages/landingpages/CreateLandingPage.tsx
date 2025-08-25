import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { createLandingPageSchema, CreateLandingPageData, defaultValues, } from '@/schemas/landing-page.schema';
import { useLandingPageFunds } from '@/hooks/firestore/funds/use-landingpage';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IFund } from '@/models/funds.model';
import { useState } from 'react';


const CreateLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const { data: landingPages, error, isLoading } = useLandingPageFunds();
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateLandingPageData>({
    resolver: zodResolver(createLandingPageSchema),
    defaultValues,
  });

  const filteredLandingPage = landingPages?.filter((page) =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDialog = (fund?: any) => {
    console.log(fund);
    setDialogOpen(true);
    // if (collectionMap) {
    //   editCollectionMap(collectionMap);
    // } else {
    //   initializeNewCollectionMap();
    // }
  };

  const onSubmit = (data: CreateLandingPageData) => {
    console.log(data);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      //   reset();
      //   setEditingFileMetadata(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-end gap-2 justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/*  disabled={!selectedFund} */}
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
              filteredLandingPage?.map((data) => {
                return (
                  <TableRow>
                    <TableCell>{data.id}</TableCell>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* onClick={() => openDialog(collection)} */}
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* onClick={() => openAlert(collection)} */}
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}

            {/* {!collectionMap || collectionMap.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  Nenhum arquivo encontrado
                </TableCell>
              </TableRow>
            ) : isFileLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  <Skeleton className="h-[50px] w-full" />
                </TableCell>
              </TableRow>
            ) : (
              collectionMap.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>{collection.id}</TableCell>
                  <TableCell>{collection.displayName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(collection)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => openAlert(collection)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )} */}
          </TableBody>
        </Table>
      </div>
      {/* Dialog para adicionar Arquivo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(event) => dismiss(event)} className="max-w-[50rem]">
          {/* onSubmit={handleSubmit(onSubmit)} */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {/* {editingCollectionMapMetadata ? 'Editar Arquivo' : 'Adicionar Novo Arquivo'} */}
              </DialogTitle>
              <DialogDescription>Upload de documento de compliance.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 mb-3 mt-5">
              {/* ID do fundo */}
              <div className="w-auto">
                <Label htmlFor="id">
                  ID do Fundo <sup className="text-red-500">*</sup>
                </Label>

                <Controller
                  name="id"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Id registrado no banco" {...field} />
                  )}
                />
                {errors.id && touchedFields.id && (
                  <small className="text-red-400">{errors.id.message}</small>
                )}
              </div>

              {/* ID name */}
              <div className="w-auto">
                <Label htmlFor="idName">
                  ID Name <sup className="text-red-500">*</sup>
                </Label>

                <Controller
                  name="idName"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Nome que identifica o fundo" {...field} />
                  )}
                />
                {errors.idName && touchedFields.idName && (
                  <small className="text-red-400">{errors.idName.message}</small>
                )}
              </div>

              {/* Nome do Fundo */}
              <div className="w-full">
                <Label htmlFor="name">
                  Nome do Fundo <sup className="text-red-500">*</sup>
                </Label>

                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Nome que sera exibido no site" {...field} />
                  )}
                />
                {errors.name && touchedFields.name && (
                  <small className="text-red-400">{errors.name.message}</small>
                )}
              </div>

              {/* Ticker */}
              <div className="w-auto">
                <Label htmlFor="name">Ticker</Label>

                <Controller
                  name="ticker"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Código de Negociação" {...field} />
                  )}
                />
                {errors.ticker && touchedFields.ticker && (
                  <small className="text-red-400">{errors.ticker.message}</small>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {/* Tipo de produto */}
              <div className="w-auto">
                <Label htmlFor="productType">Tipo do Produto</Label>

                <Controller
                  name="productType"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="ex: Fundos de Investimento,Fundos de Previdência "
                      {...field}
                    />
                  )}
                />
                {errors.productType && touchedFields.productType && (
                  <small className="text-red-400">{errors.productType.message}</small>
                )}
              </div>

              {/* Tipo */}
              <div className="w-auto">
                <Label htmlFor="type">Tipo</Label>

                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="ex: Aberto, Fechado, Listado na B3 ou Outro."
                      {...field}
                    />
                  )}
                />
                {errors.type && touchedFields.type && (
                  <small className="text-red-400">{errors.type.message}</small>
                )}
              </div>

              {/* Categoria */}
              <div className="w-auto">
                <Label htmlFor="category">Tipo</Label>

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="ex: Agronegócio, Crédito Estruturado"
                      {...field}
                    />
                  )}
                />
                {errors.category && touchedFields.category && (
                  <small className="text-red-400">{errors.category.message}</small>
                )}
              </div>

              {/* Url de Redirecionamento */}
              <div className="w-auto">
                <Label htmlFor="redirectUrl">Url de Redirecionamento</Label>

                <Controller
                  name="redirectUrl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="ex: riza-terrax, riza-lotus ou lotus"
                      {...field}
                    />
                  )}
                />
                {errors.redirectUrl && touchedFields.redirectUrl && (
                  <small className="text-red-400">{errors.redirectUrl.message}</small>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              {/* disabled={!isValid} */}
              <Button type="submit">
                {isLoading ? (
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
export default CreateLandingPage;
