import { mediaOutletSchema, MediaOutletSchema, defaulValuesMediaOutlet, } from '@/schemas/publication.schema';
import publicationService from '@/services/publications.service';
import { FileText, FileUp, LoaderCircle } from 'lucide-react';
import { IMediaOutlet } from '@/models/publication.model';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import apiService from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';


export const AddMediaOutlet = ({ closeSheet, mediaOutletData }) => {
  const queryClient = useQueryClient();
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileRef, setFileRef] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingData, setEditingData] = useState<IMediaOutlet>(null);
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<MediaOutletSchema>({
    resolver: zodResolver(mediaOutletSchema),
    defaultValues: defaulValuesMediaOutlet,
  });

  const handleEditData = useCallback(
    (data: IMediaOutlet) => {
      setValue('name', data.name);
      setEditingData(data);
    },
    [setValue]
  );

  useEffect(() => {
    if (mediaOutletData) {
      handleEditData(mediaOutletData);
    }
  }, [mediaOutletData, handleEditData]);

  const onSubmit = async (data: MediaOutletSchema) => {
    setIsLoading(true);
    await createMediaOutletMetadata(data);
  };

  const createMediaOutletMetadata = async (data: MediaOutletSchema) => {
    let logoUrl: string | null;

    if (!fileRef) {
      logoUrl = editingData.logoUrl;
    } else {
      const { url } = await fileUpload();
      logoUrl = url as string;
    }

    const idRef = editingData ? editingData.id : crypto.randomUUID();
    const mediaOutletMetadata = {
      id: idRef,
      name: data.name,
      logoUrl,
    };

    await addMediaOutletMetadata(mediaOutletMetadata);
  };

  const fileUpload = async (): Promise<{ url: string }> => {
    const path = `img/logos/${selectedFileName}`;

    try {
      const { data: response } = await apiService.uploadFile(fileRef, path);

      if (!response.status) {
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      return { url: response.url };
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
      console.error('Erro ao enviar o formulário:', error);
    }
  };

  const addMediaOutletMetadata = async (metadata: IMediaOutlet) => {
    try {
      await publicationService.setMediaOutlet(metadata).finally(() => refreshData());
      toast.success('Veículo salvo com sucesso.');
    } catch (error) {
      toast.error('Não foi possivel salvar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ): void => {
    const file = e.target.files?.[0];
    onChange(e);
    setSelectedFileName(file?.name || '');
    if (file) {
      setFileRef(file);
    }
  };

  const refreshData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['media_outlet'] });
  };

  return (
    <form className="w-full h-full flex flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-y-5">
        {/* Nome do Arquivo */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="docName">Nome do Veículo</Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="Nome que será exibido" {...field} />
            )}
          />
          {errors.name && touchedFields.name && (
            <small className="text-red-400">{errors.name.message}</small>
          )}
        </div>

        {/* Arquivo */}
        <div className="flex flex-col gap-2">
          <Label>Logo do Veículo</Label>
          <div className="border border-dashed border-rz-beige rounded-md p-4 bg-rz-white">
            <div className="flex flex-col items-center justify-center gap-2">
              <FileUp className="h-8 w-8 text-rz-beige" />
              <div className="text-sm text-center text-gray-600">
                <p>Arraste e solte o arquivo aqui ou</p>
                <label
                  htmlFor="file-upload-metadata"
                  className="text-rz-black cursor-pointer hover:underline"
                >
                  selecione do seu computador
                </label>
              </div>
              <Controller
                name="file"
                control={control}
                render={({ field: { onChange, ref } }) => (
                  <Input
                    id="file-upload-metadata"
                    type="file"
                    accept=".png, .jpg, .jpeg, .svg"
                    className="hidden"
                    ref={ref}
                    onChange={(e) => handleFileChange(e, onChange)}
                  />
                )}
              />

              {selectedFileName && (
                <div className="mt-2 text-sm text-rz-black bg-rz-white px-3 py-1 rounded-md border border-rz-beige w-full">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-rz-black" />
                    {selectedFileName}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Formatos aceitos: PNG, JPG, SVG</p>
            </div>
          </div>
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
