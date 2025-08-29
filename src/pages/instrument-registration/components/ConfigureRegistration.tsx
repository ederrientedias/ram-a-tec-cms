import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { IField, IFieldsBlock, IInstrument } from '@/models/instrumentsRegistration.model';
import { useInstrumentsGroup } from '@/hooks/firestore-intranet/use-instruments-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useCallback, useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Check } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const ConfigureRegistration = () => {
  const [instruments, setInstruments] = useState<IInstrument[]>([]);
  const [fieldsBlock, setFieldsBlock] = useState<IFieldsBlock[]>([]);
  const [data, setData] = useState<{ id: string; name: string; fields: IField[] }[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<IFieldsBlock[]>([]);
  const [seletectedInstrumentGroup, setSelectedInstrumentGroup] = useState<string | null>(null);
  const [seletectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [groupRef, setGroupRef] = useState<string | null>(null);
  const [instrumentRef, setInstrumentRef] = useState<IInstrument | null>(null);
  const [forms, setForms] = useState<{ id: string; name: string; fields: IField[] }[]>([]);

  const {
    data: instrumentsGroup,
    error: instrumentGroupErro,
    isLoading: InstrumentsGroupLoading,
  } = useInstrumentsGroup();

  const loadInstruments = useCallback(async () => {
    if (!seletectedInstrumentGroup) return;

    const instruments = await firestoreService.getInstrumentsById(seletectedInstrumentGroup);
    setInstruments(instruments);
  }, [seletectedInstrumentGroup]);

  const loadFieldsBlock = useCallback(async () => {
    if (!seletectedInstrument && !groupRef) return;

    const fieldsBlock = await firestoreService.getFieldsBlockByGroup(groupRef);
    setFieldsBlock(fieldsBlock);
  }, [seletectedInstrument, groupRef]);

  const handleFields = useCallback(
    (fields: IField[]) => {
      const data = selectedOptions.map((item) => {
        return {
          id: item.id,
          name: item.name,
          fields: fields.filter((field) => item.id === field.fieldBlockRef),
        };
      });

      setData(data);
    },
    [selectedOptions]
  );

  const loadFields = useCallback(async () => {
    if (!seletectedInstrument) return;
    const fields = await firestoreService.getFields();
    handleFields(fields);
  }, [seletectedInstrument, handleFields]);

  useEffect(() => {
    loadInstruments();
  }, [loadInstruments]);

  useEffect(() => {
    loadFieldsBlock();
  }, [loadFieldsBlock]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const handleInstrumentGroupChange = (value: string) => {
    setSelectedInstrumentGroup(value);
    handleGroupRef(value);
  };

  const handleGroupRef = (id: string) => {
    const data = instrumentsGroup.find((inst) => inst.id === id);
    setGroupRef(data.group);
  };

  const handleInstrumentChange = (value: string) => {
    setSelectedInstrument(value);
    handleInstrumentRef(value);
  };

  const handleInstrumentRef = (id: string) => {
    if (instruments.length === 0) return;
    const itemRef = instruments?.find((item) => item.id === id);
    setInstrumentRef(itemRef);
  };

  const handleOptionSelect = (selectedItem: any, checked: boolean | 'indeterminate') => {
    const isChecked = checked;
    setSelectedOptions((prev) => {
      const exists = prev.some((item) => item.id === selectedItem.id);
      const index = prev.findIndex((e) => e.id === selectedItem.id);

      if (isChecked && !exists) {
        // setDisplayOptions('Opções Customizadas');
        setForms([
          ...forms,
          {
            id: selectedItem.id,
            name: selectedItem.name,
            fields: [],
          },
        ]);

        return [...prev, selectedItem];
      }

      if (!isChecked && exists && index !== -1) {
        // setAllOptions(false);
        // setDisplayOptions('Opções Customizadas');
        const filtered = forms.filter((f) => f.id !== selectedItem.id);
        setForms(filtered);
        return prev.filter((item) => item.id !== selectedItem.id);
      }

      return prev;
    });
  };

  const handleSelectedField = (item: any, field: IField, checked: any) => {
    setForms((prev) => {
      const exists = prev.some((p) => p.id === item.id);

      if (!exists) return prev;

      if (!checked) {
        prev.map((p) => (p.id === item.id ? p.fields.filter((f) => f.id !== field.id) : p));
      }

      return prev.map((p) => (p.id === item.id ? { ...p, fields: [...p.fields, field] } : p));
    });
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-center gap-2">
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="fund">Grupo de Instrumentos</Label>
          <Select onValueChange={handleInstrumentGroupChange}>
            <SelectTrigger>
              {instrumentGroupErro ? (
                <SelectValue placeholder="Não foi possível carregar os dados." />
              ) : (
                <SelectValue
                  placeholder={
                    InstrumentsGroupLoading ? 'Carregando...' : 'Selecione um grupo de instrumento'
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {instrumentsGroup?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[300px] min-w-72 space-y-2">
          <Label htmlFor="fund">Instrumento</Label>
          <Select onValueChange={handleInstrumentChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={!instruments ? 'Carregando...' : 'Selecione um instrumento'}
              />
            </SelectTrigger>
            <SelectContent>
              {instruments?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="optionsRef">Bloco de Campos</Label>
          <Popover>
            <PopoverTrigger className="w-full border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Selecione o bloco de campo</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="min-w-[475px]">
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {/* <div className="flex items-center gap-3">
                  <Checkbox
                    id="all"
                    checked={allOptions}
                    onCheckedChange={(cheked) => handleSelectAllData(cheked)}
                  />
                  <Label htmlFor="all">Todos os Blocos</Label>
                </div> */}
                {fieldsBlock?.map((block) => {
                  return (
                    <div
                      key={block.id}
                      className="flex items-center gap-2 text-zinc-900 text-sm font-medium"
                    >
                      <Checkbox
                        checked={selectedOptions.some((item) => item.id === block.id)}
                        onCheckedChange={(checked) => handleOptionSelect(block, checked)}
                      />
                      {block.name}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-7">
        <div className="flex items-center gap-2">
          <h1 className="font-medium">Configuração de Cadastro</h1>
          {instrumentRef && (
            <>
              <span>|</span>
              <h1>
                {instrumentRef?.nickname} - {instrumentRef?.name}
              </h1>
            </>
          )}
        </div>
        {selectedOptions && (
          <div className="flex flex-col items-start">
            {/* <h2>Blocos de Campos</h2> */}
            {data.map((item, i) => {
              return (
                <Accordion key={item.id} type="single" collapsible className="w-full">
                  <AccordionItem value={item.id}>
                    <AccordionTrigger>{item.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center gap-2 flex-wrap my-4">
                        <Toggle variant="outline">Todos</Toggle>
                        {item.fields.map((field) => (
                          // <Toggle
                          //   key={field.id}
                          //   variant="outline"
                          //   onClick={() => handleSelectedField(item, field)}
                          //   className="has-[[data-state]:border-zinc-900]"
                          // >
                          //   {field.label}
                          // </Toggle>
                          <Label
                            key={field.id}
                            className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                          >
                            <Checkbox
                              id={field.id}
                              checked={forms[i].fields.some((s) => s.id === field.id)}
                              onCheckedChange={(checked) =>
                                handleSelectedField(item, field, checked)
                              }
                              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                            />
                            <div className="grid gap-1.5 font-normal">
                              <p className="text-sm leading-none font-medium">{field.label}</p>
                            </div>
                          </Label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-end">
          <Button onClick={() => console.log(forms)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
};
