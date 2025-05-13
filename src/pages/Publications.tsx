import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  publicationSchema,
  PublicationsSchema,
  defaultValues,
  convertToInputDateFormat,
} from '@/schemas/publication.schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Newspaper, Pencil, Plus, Search, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingPageAnimation from '@/components/animations/loadingPage';
import Loading404Animation from '@/components/animations/loading404';
import { usePublications } from '@/hooks/firestore/use-publication';
import publicationService from '@/services/publications.service';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IPublication } from '@/models/publication.model';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

const Publications = (): JSX.Element => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = usePublications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPublication, setEditPublication] = useState<boolean>(false);
  const [publicationRef, setPublicationRef] = useState<IPublication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isloading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors, isValid, touchedFields },
  } = useForm<PublicationsSchema>({
    resolver: zodResolver(publicationSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: PublicationsSchema): Promise<void> => {
    setLoading(true);
    await handleSavePublication(data);
  };

  const handleSavePublication = async (data: PublicationsSchema): Promise<void> => {
    const newPublication: IPublication = {
      id: editPublication ? publicationRef.id : crypto.randomUUID(),
      theme: data.theme,
      product: data.product,
      type: data.type,
      category: data.category,
      publicationDate: data.publicationDate,
      mediaOutlet: data.mediaOutlet,
      mediaLogo: data.mediaLogo,
      description: data.description,
      link: data.link,
      isPublic: data.isPublic,
      createAt: Date.now(),
    };

    try {
      const response = await publicationService.setPublications(newPublication);
      if (response) {
        toast.success('Publicação criada com sucesso!');
        await refreshData();
        reset();
        closeDialog();
      } else {
        toast.error('Erro ao enviar a publicação. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao enviar a publicação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPublications = data?.filter(
    (publication) =>
      publication.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.mediaOutlet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDialog = (status: 'new' | 'edit', publication?: IPublication): void => {
    if (publication && status === 'edit') {
      setEditPublication(true);
      setPublicationRef(publication);
      handleEditPublication(publication);
      setDialogOpen(true);
      return;
    }
    setEditPublication(false);
    setDialogOpen(true);
  };

  const handleEditPublication = (publication: IPublication): void => {
    setValue('theme', publication.theme);
    setValue('product', publication.product);
    setValue('type', publication.type);
    setValue('category', publication.category);
    setValue('publicationDate', convertToInputDateFormat(publication.publicationDate));
    setValue('mediaOutlet', publication.mediaOutlet);
    setValue('mediaLogo', publication.mediaLogo);
    setValue('link', publication.link);
    setValue('description', publication.description);
    setValue('isPublic', publication.isPublic);
  };

  const handleDeletePublication = (id: string): void => {
    if (confirm('Tem certeza que deseja excluir esta publicação?')) {
      publicationService
        .deletePublication(id)
        .then(async () => {
          await refreshData();
          toast.success('Publicação excluída com sucesso!');
        })
        .catch((error) => {
          toast.error('Erro ao excluir a publicação. Tente novamente.');
          console.error('Erro ao excluir a publicação:', error);
        });
    }
  };

  const getPublicacoesByCategoria = (): [string, number][] => {
    const categories: Record<string, number> = {};

    data?.forEach((publication) => {
      if (categories[publication.category]) {
        categories[publication.category]++;
      } else {
        categories[publication.category] = 1;
      }
    });

    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  };

  const getPublicacoesByTipo = (): [string, number][] => {
    const types: Record<string, number> = {};

    data?.forEach((publication) => {
      if (types[publication.type]) {
        types[publication.type]++;
      } else {
        types[publication.type] = 1;
      }
    });

    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  };

  const closeDialog = (): void => {
    reset();
    setDialogOpen(false);
    setEditPublication(false);
  };

  const refreshData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: [FirestoreDocument.PUBLICATIONS] });
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      reset();
      setEditPublication(false);
    }
  };

  if (isLoading) return <LoadingPageAnimation />;
  if (error) return <Loading404Animation />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Publicações e Materiais</h1>
        <Button onClick={() => openDialog('new')}>
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
            <div className="text-2xl font-bold">{data?.length}</div>
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

        {/* Tabela de Publicações */}
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
                <TableHead>Visivel</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPublications?.length > 0 ? (
                filteredPublications?.map((publication: IPublication) => (
                  <TableRow key={publication.id}>
                    <TableCell className="font-medium">{publication.theme}</TableCell>
                    <TableCell>{publication.product}</TableCell>
                    <TableCell>{publication.type}</TableCell>
                    <TableCell>{publication.category}</TableCell>
                    <TableCell>{publication.publicationDate}</TableCell>
                    <TableCell>
                      {/* <img
                        className="h-6 w-6 "
                        src={publication.mediaLogo}
                        alt={publication.mediaOutlet}
                      /> */}
                      {/* <Newspaper className="h-4 w-4 text-gray-500" /> */}
                      {publication.mediaOutlet}
                    </TableCell>
                    <TableCell>
                      {publication.isPublic ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog('edit', publication)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            window.open(publication.link, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeletePublication(publication.id)}
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
        <DialogContent className="max-w-4xl" onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editPublication ? 'Editar Publicação' : 'Cadastrar Nova Publicação'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações sobre a publicação ou material.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                {/* Tema */}
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Input
                    id="theme"
                    name="theme"
                    {...register('theme')}
                    placeholder="Ex: Mercado Financeiro"
                  />
                  {errors.theme && touchedFields.theme && (
                    <small className="text-red-400">{errors.theme.message}</small>
                  )}
                </div>

                {/* Produto */}
                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Input
                    id="product"
                    name="product"
                    {...register('product')}
                    placeholder="Ex: Fundo Multimercado"
                  />
                  {errors.product && touchedFields.product && (
                    <small className="text-red-400">{errors.product.message}</small>
                  )}
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Input
                    id="type"
                    name="type"
                    {...register('type')}
                    placeholder="Ex: Entrevista, Artigo, Notícia"
                  />
                  {errors.type && touchedFields.type && (
                    <small className="text-red-400">{errors.type.message}</small>
                  )}
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    name="category"
                    {...register('category')}
                    placeholder="Ex: Investimentos, Educação Financeira"
                  />
                  {errors.category && touchedFields.category && (
                    <small className="text-red-400">{errors.category.message}</small>
                  )}
                </div>

                {/* Data da Publicação */}
                <div className="space-y-2">
                  <Label htmlFor="publicationDate">Data da Publicação</Label>
                  <Input
                    id="publicationDate"
                    name="publicationDate"
                    type="date"
                    {...register('publicationDate')}
                  />
                  {errors.publicationDate && touchedFields.publicationDate && (
                    <small className="text-red-400">{errors.publicationDate.message}</small>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Veiculo */}
                <div className="space-y-2">
                  <Label htmlFor="mediaOutlet">Veículo</Label>
                  <Input
                    id="mediaOutlet"
                    name="mediaOutlet"
                    {...register('mediaOutlet')}
                    placeholder="Ex: Valor Econômico, InfoMoney"
                  />
                  {errors.mediaOutlet && touchedFields.mediaOutlet && (
                    <small className="text-red-400">{errors.mediaOutlet.message}</small>
                  )}
                </div>

                {/* Link para Logotipo do Veículo */}
                <div className="space-y-2">
                  <Label htmlFor="mediaLogo">Link para Logotipo do Veículo</Label>
                  <Input
                    id="mediaLogo"
                    name="mediaLogo"
                    type="url"
                    {...register('mediaLogo')}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {errors.mediaLogo && touchedFields.mediaLogo && (
                    <small className="text-red-400">{errors.mediaLogo.message}</small>
                  )}
                </div>

                {/* Link para a Matéria */}
                <div className="space-y-2">
                  <Label htmlFor="link">Link para a Matéria</Label>
                  <Input
                    id="link"
                    name="link"
                    type="url"
                    {...register('link')}
                    placeholder="https://exemplo.com/materia"
                  />
                  {errors.link && touchedFields.link && (
                    <small className="text-red-400">{errors.link.message}</small>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    minLength={100}
                    maxLength={300}
                    rows={5}
                    {...register('description')}
                    placeholder="Breve descrição sobre a publicação"
                  />
                  {errors.description && touchedFields.description && (
                    <small className="text-red-400">{errors.description.message}</small>
                  )}
                </div>

                {/* Tornar publicação pública */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isPublic">Tornar publicação pública</Label>
                    <Controller
                      name="isPublic"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="isPublic"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  {errors.isPublic && touchedFields.isPublic ? (
                    <small className="text-red-400">{errors.isPublic.message}</small>
                  ) : (
                    <small className="text-xs text-muted-foreground">
                      Se ativado, qualquer pessoa poderá ver esta publicação.
                    </small>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
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
  );
};

export default Publications;
