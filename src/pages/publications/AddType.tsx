import { defaulValuesType, typeSchema, TypeSchema } from '@/schemas/publication.schema';
import publicationService from '@/services/publications.service';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { IType } from '@/models/publication.model';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';


export const AddType = ({ closeSheet, typeData }) => {
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<IType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<TypeSchema>({
    resolver: zodResolver(typeSchema),
    defaultValues: defaulValuesType,
  });

  const handleEditData = useCallback(
    (data: IType) => {
      setValue('typename', data.type, { shouldValidate: true });
      setEditingType(data);
    },
    [setValue]
  );

  useEffect(() => {
    if (typeData) {
      console.log('typeData', typeData);
      handleEditData(typeData);
    }
  }, [typeData, handleEditData]);

  const onSubmit = async (data: TypeSchema) => {
    setIsLoading(true);
    await createType(data);
  };

  const createType = async (data: TypeSchema) => {
    const metadata = {
      id: editingType ? editingType.id : crypto.randomUUID(),
      type: data.typename,
    };

    await addType(metadata);
  };

  const addType = async (metadata: IType) => {
    try {
      await publicationService.setType(metadata).finally(() => refreshData());
      toast.success('Veículo salvo com sucesso.');
    } catch (error) {
      toast.error('Não foi possivel salvar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['types'] });
  };

  return (
    <form className="w-full h-full flex flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-y-5">
        {/* Nome do Arquivo */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="docName">Nome do Tipo</Label>
          <Controller
            name="typename"
            control={control}
            render={({ field }) => <Input type="text" placeholder="Nome do tipo" {...field} />}
          />
          {errors.typename && touchedFields.typename && (
            <small className="text-red-400">{errors.typename.message}</small>
          )}
        </div>
      </div>
      <div className="w-full flex items-center gap-2 justify-end">
        <Button type="button" variant="outline" onClick={closeSheet}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isValid}>
          {isLoading ? (
            <>
              <LoaderCircle className="w-4 h4 animate-spin" /> Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </div>
    </form>
  );
};
