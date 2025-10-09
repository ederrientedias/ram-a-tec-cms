import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LoadingFindDataAnimation from '@/components/animations/loadingFinddata';
import { IFieldRef, IFormsMap } from '@/models/instruments-registration.model';
import { Check, ChevronsUpDown, FolderOpen, Search } from 'lucide-react';
import { useFormsMap } from '@/hooks/firestore-intranet/use-forms-map';
import { useFormStepper } from '@/hooks/stepper/use-form-stepper';
import { useFields } from '@/hooks/firestore-intranet/use-fields';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAssets } from '@/hooks/firestore-intranet/use-assets';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { AssetCard } from './components/AssetCard';
import { Stepper } from './components/stepper';


export const AssetRegister = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: formsMap, isLoading: formsMapLoading } = useFormsMap();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formMapRef, setFormMapRef] = useState<IFormsMap | null>(null);
  const [forms, setForms] = useState([]);
  const { data: fieldsData } = useFields();
  const { data: assets, isLoading: assetsLoading } = useAssets();
  const { customSteps, isLoading: formLoading, formData } = useFormStepper(selectedForm);
  const [editingData, setEditingData] = useState(null);
  const [instrumentName, setInstrumentName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const loadFields = useCallback(
    (fields: IFieldRef[]) => {
      return fields
        .map((field) => {
          const currentField = fieldsData.find((item) => item.id === field.id);
          return currentField ? { ...currentField } : null;
        })
        .filter(Boolean);
    },
    [fieldsData]
  );

  const loadForm = useCallback(async () => {
    if (!selectedForm) return;
    const data = formData?.map((f) => ({ ...f, fields: loadFields(f.fields) }));
    setForms(data);
  }, [selectedForm, formData, loadFields]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const handleFormMapChange = (id: string) => {
    const formMap = formsMap.find((f) => f.formId === id);
    setFormMapRef(formMap);
    setInstrumentName(formMap.name);
    setSelectedForm(id);
    setOpen(false);
  };

  const handleCompleteForm = (isComplete: boolean) => {
    if (isComplete) {
      setSelectedForm(null);
      setForms([]);
      setEditingData(null);
      requestAnimationFrame(() => requestAnimationFrame(() => setSelectedForm(formMapRef.formId)));
    }
  };

  const filteredInstruments = useMemo(() => {
    return assets?.filter((asset) => {
      const searchLower = searchTerm.toLowerCase();
      const data = asset?.forms?.Identificadores.data;
      return (
        data.nicknamedoativofinanceiro?.toLowerCase().includes(searchLower) ||
        data.nomedoativofinanceiro?.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, assets]);

  const showAssetsList = () => {
    setFormMapRef(null);
    setSelectedForm(null);
    setForms([]);
    setEditingData(null);
    setInstrumentName(null);
    loadAssets();
  };

  const editAsset = (instrument: any) => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        handleFormMapChange(instrument.formId);
        setEditingData(instrument);
      })
    );
  };

  const loadAssets = async () => {
    await queryClient.invalidateQueries({ queryKey: ['registered-asset'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cadastro de Ativo</h1>
        <div className="flex items-end gap-2">
          <div className="w-full min-w-72 space-y-2">
            <Label htmlFor="fund">Formulário de instrumento</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  <span className="text-ellipsis truncate max-w-[300px]">
                    {instrumentName
                      ? formsMap?.find((item) => item.name === instrumentName)?.name
                      : !formsMap
                      ? 'carregando...'
                      : 'Selecione o formulário do instrumento'}
                  </span>
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                    <CommandGroup>
                      {formsMap?.map((item) => (
                        <CommandItem
                          key={item.formId}
                          value={item.name}
                          onSelect={() => handleFormMapChange(item.formId)}
                          className="flex item-center gap-2"
                        >
                          <Check
                            className={cn(
                              'ml-auto w-4 h-4',
                              instrumentName === item.name ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {item.nickname} - {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Button variant="default" disabled={!selectedForm} onClick={showAssetsList}>
              Visualizar Ativos
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        {!formLoading && formMapRef && forms ? (
          <Stepper
            customSteps={customSteps}
            forms={forms}
            editingData={editingData}
            formMapRef={formMapRef}
            isComplete={handleCompleteForm}
          />
        ) : formLoading ? (
          <LoadingFindDataAnimation />
        ) : (
          <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Ativos</h1>

              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, emissor ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Badge variant="outline" className="px-3 py-1 rounded-md">
                  {assets?.length ?? 0} Ativos Cadastrados
                </Badge>
              </div>
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-full grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {assetsLoading ? (
                  <div className="col-span-2">
                    <LoadingFindDataAnimation />
                  </div>
                ) : (
                  filteredInstruments?.map((asset, index) => (
                    <AssetCard key={index} assetData={asset} handleEditAsset={editAsset} />
                  ))
                )}
              </div>
            </div>
            {filteredInstruments?.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum ativo encontrado</h3>
                <p className="text-gray-400">Tente ajustar os filtros de busca</p>
              </div>
            )}
            {assets?.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum ativo cadastrado</h3>
                <p className="text-gray-400">
                  Selecione o formulário de instrumento acima para começar
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
