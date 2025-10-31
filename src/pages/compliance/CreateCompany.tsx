import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { createCompanyDefaultValues, createCompanySchema, CreateCompanySchema, } from '@/schemas/compliance.schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { toKebabCase, toSnakeCase } from '@/utils/format-string';
import { useTabs } from '@/hooks/firestore/compliance/use-tabs';
import complianceService from '@/services/compliance.service';
import { ITab as ICompany } from '@/models/compliance.model';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/enums/firestore.enum';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';


const CreateCompany = () => {
  const queryClient = useQueryClient();
  const [companyRef, setCompanyRef] = useState<ICompany | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditCompany, setIsEditCompany] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const { data: companies, isLoading: isLoadingTabs, error: errorTabs } = useTabs();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateCompanySchema>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: createCompanyDefaultValues,
  });

  const onSubmit = (data: CreateCompanySchema) => {
    setIsLoading(true);
    addCompany(data);
  };

  const createCompanyMetadata = (data: CreateCompanySchema) => {
    const companyId = companyRef?.id ?? companies?.length > 0 ? companies?.length : 0;
    const companyMetadata = {
      id: companyId,
      name: data.companyName,
      collection: companyRef?.collection ?? toSnakeCase(data.companyName),
      bucketName: companyRef?.bucketName ?? toKebabCase(data.companyName),
      isActive: false,
    };
    return companyMetadata;
  };

  const addCompany = async (data: CreateCompanySchema) => {
    const companyMetadata = createCompanyMetadata(data);
    await complianceService
      .addTab(companyMetadata)
      .then(async () => await loadCompanies())
      .finally(() => {
        setIsLoading(false);
        closeDialog();
      });
  };

  const openDialog = (company?: ICompany) => {
    if (company) {
      editCompany(company);
    } else {
      initializeNewCompany();
    }
  };

  const openAlert = (company: ICompany) => {
    setCompanyRef(company);
    setAlertOpen(true);
  };

  const initializeNewCompany = () => {
    setIsEditCompany(false);
    setDialogOpen(true);
    reset();
  };

  const editCompany = (company: ICompany) => {
    setDialogOpen(true);
    setIsEditCompany(true);
    setValue('companyName', company.name);
    setCompanyRef(company);
  };

  const handleDeleteCompany = async () => {
    setIsLoading(true);
    if (!companyRef) {
      setIsLoading(false);
      return;
    }

    await complianceService
      .deleteTab(companyRef)
      .then(async () => await loadCompanies())
      .finally(() => {
        setIsLoading(false);
        closeAlert();
      });
  };

  const loadCompanies = async () => {
    await queryClient.invalidateQueries({ queryKey: [Field.TABS] });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCompanyRef(null);
  };

  const closeAlert = () => {
    reset();
    setAlertOpen(false);
    setCompanyRef(null);
  };

  const dismiss = (e: CustomEvent): void => {
    if (e) {
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full flex items-end justify-end">
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>
      <div>
        {/* Table Component  */}
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome da Empresa</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTabs ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                companies?.map((company) => {
                  return (
                    <TableRow key={company.id}>
                      <TableCell>{company.id}</TableCell>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(company)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openAlert(company)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog para Criar e Editar Empresa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(event) => dismiss(event)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{isEditCompany ? 'Editar Empresa' : 'Criar Nova Empresa'}</DialogTitle>
              <DialogDescription>Permite criar ou editar uma empresa.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Nome que será exibido para o documento"
                      {...field}
                    />
                  )}
                />
                {errors.companyName && touchedFields.companyName && (
                  <small className="text-red-400">{errors.companyName.message}</small>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>

              <Button type="submit" disabled={!isValid}>
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

      {/* Alerta de Exclusão */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              A empresa <span className="text-zinc-950 font-bold">{companyRef?.name}</span> será
              removida de forma definitiva. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={closeAlert}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleDeleteCompany()}>
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
                  Deletando...
                </span>
              ) : (
                'Confirmar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default CreateCompany;
