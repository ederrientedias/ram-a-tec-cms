import 'cleave.js/dist/addons/cleave-phone.br';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import Cleave from 'cleave.js/react';

const masks = [
  {
    id: 0,
    name: 'CPF',
    options: {
      delimiters: ['.', '.', '-'],
      blocks: [3, 3, 3, 2],
      numericOnly: true,
      rawValueTrimPrefix: true,
    },
  },
  {
    id: 1,
    name: 'CNPJ',
    options: {
      delimiters: ['.', '.', '/', '-'],
      blocks: [2, 3, 3, 4, 2],
      numericOnly: true,
      rawValueTrimPrefix: true,
    },
  },
  {
    id: 2,
    name: 'Telefone',
    options: {
      phone: true,
      phoneRegionCode: 'BR',
      rawValueTrimPrefix: true,
    },
  },
  {
    id: 3,
    name: 'CEP',
    options: {
      delimiters: ['-'],
      blocks: [5, 3],
      numericOnly: true,
      rawValueTrimPrefix: true,
    },
  },
  {
    id: 4,
    name: 'Cartão de Crédito',
    options: {
      creditCard: true,
      rawValueTrimPrefix: true,
    },
  },
  {
    id: 5,
    name: 'Valor Monetário (BRL)',
    options: {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      numeralDecimalMark: ',',
      delimiter: '.',
      prefix: 'R$ ',
      rawValueTrimPrefix: true,
    },
  },
  {
    id: 6,
    name: 'Máscara personalizada',
    type: 'custom',
  },
];

const maskConfigs = [
  {
    id: 0,
    key: 'tailPrefix',
    name: 'Prefixo depois do numeral',
  },
  {
    id: 1,
    key: 'signBeforePrefix',
    name: 'Prefixo antes do numeral',
  },
  {
    id: 2,
    key: 'numeralPositiveOnly',
    name: 'permite apenas valores numéricos positivos',
  },
  {
    id: 3,
    key: 'uppercase',
    name: 'Letra Maiúscula',
  },
  {
    id: 4,
    key: 'lowercase',
    name: 'Letra Minúscula',
  },
  {
    id: 5,
    key: 'numeral',
    name: 'Valores numéricos',
  },
  {
    id: 6,
    key: 'numericOnly',
    name: 'Somente número',
  },
];

export const CustomInputMask = ({ onSave, close }) => {
  const [selectedMask, setSelectedMask] = useState(null);
  const [rawValue, setRawValue] = useState<string>('');

  const [customOptions, setCustomOptions] = useState<Record<string, any>>({
    // Opções comuns
    prefix: '',
    tailPrefix: false,
    rawValueTrimPrefix: true,
    delimiterLazyShow: false,

    // Opções custom
    blocks: [] as number[],
    delimiter: '',
    delimiters: [] as string[],
    numericOnly: false,
    uppercase: false,
    lowercase: false,

    // Opções numeral
    numeral: false,
    numeralDecimalMark: '',
    numeralThousandsGroupStyle: 'thousand' as 'thousand' | 'lakh' | 'wan' | undefined,
    numeralDecimalScale: 0,
    stripLeadingZeroes: false,
    signBeforePrefix: true,
  });

  const optionsUsed = useMemo(() => {
    if (selectedMask?.type === 'custom') return customOptions;
    if (selectedMask?.name !== 'Customizar') return selectedMask?.options;
    return {};
  }, [selectedMask, customOptions]);

  const formatWithCleave = (raw: string, options: Record<string, any>) => {
    try {
      // cria input temporario, instancia Cleave e seta raw para obter value formatado
      const tmp = document.createElement('input');
      const inst: any = new (Cleave as any)(tmp, options); // usar any para TS
      // setRawValue existe nas versões recentes do cleave; se faltar, fallback
      if (typeof inst.setRawValue === 'function') {
        inst.setRawValue(raw || '');
      } else {
        tmp.value = raw || '';
      }
      const formatted = tmp.value;
      // destroy / cleanup
      if (typeof inst.destroy === 'function') inst.destroy();
      return formatted;
    } catch (err) {
      // se falhar, retorne raw (fallback)
      return raw ?? '';
    }
  };

  const formattedValue = useMemo(
    () => formatWithCleave(rawValue, optionsUsed),
    [rawValue, optionsUsed]
  );

  const handleSelectedMask = (value: string) => {
    const mask = masks.find((m) => m.name === value);
    setSelectedMask(mask);
  };

  const handleChange = (key: string, value: any) => {
    setCustomOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const data = {
      name: selectedMask?.type ? selectedMask?.name : `Máscara de ${selectedMask?.name}`,
      options: optionsUsed,
    };
    onSave(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="type">Escolha ou personalize a máscara</Label>
        <Select
          onValueChange={(value) => handleSelectedMask(value)}
          value={selectedMask?.name || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma máscara" />
          </SelectTrigger>
          <SelectContent>
            {masks.map((mask) => (
              <SelectItem key={mask.id} value={mask.name}>
                {mask.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full flex-1 min-h-[700px]">
        {selectedMask?.type === 'custom' && (
          <div className="w-full flex flex-col items-start gap-4">
            <h3>Cirar Máscara</h3>
            <div className="w-full grid grid-cols-2 gap-x-2 gap-y-4 items-center">
              {/* PREFIXO */}
              <div className="flex flex-col items-start gap-1">
                <Label className="text-xs" htmlFor="type">
                  Prefixo
                </Label>
                <Input
                  className="h-8 text-xs p-1 placeholder-shown:text-xs"
                  type="text"
                  placeholder="Ex: PREFIX"
                  onChange={(e) => handleChange('prefix', e.target.value)}
                />
              </div>

              {/* BLOCOS */}
              <div className="flex flex-col items-start gap-1">
                <Label className="text-xs" htmlFor="type">
                  Blocos
                </Label>
                <Input
                  className="h-8 text-xs p-1 placeholder-shown:text-xs"
                  type="text"
                  placeholder="Ex: 1; 2; 3"
                  onChange={(e) => {
                    const blocks = e.target.value.split(';').map((b) => Number(b));
                    handleChange('blocks', blocks);
                  }}
                />
              </div>

              {/* DELIMITADOR */}
              <div className="flex flex-col items-start gap-1">
                <Label className="text-xs" htmlFor="type">
                  Delimitador
                </Label>
                <Input
                  className="h-8 text-xs p-1 placeholder-shown:text-xs"
                  type="text"
                  placeholder="ex: . ou ,"
                  onChange={(e) => handleChange('delimiter', e.target.value)}
                />
              </div>

              {/* DELIMITADORES */}
              <div className="flex flex-col items-start gap-1">
                <Label className="text-xs" htmlFor="type">
                  Delimitadores
                </Label>
                <Input
                  className="h-8 text-xs p-1 placeholder-shown:text-xs"
                  type="text"
                  placeholder="Ex: .; ,; -;"
                  onChange={(e) => {
                    const delimiters = e.target.value.split(';');
                    handleChange('delimiters', delimiters);
                  }}
                />
              </div>

              {/* NUMERO DE CASAS DECIMAIS */}
              <div className="flex flex-col items-start gap-1">
                <Label className="text-xs" htmlFor="type">
                  Número de casas decimais
                </Label>
                <Input
                  className="h-8 text-xs p-1 placeholder-shown:text-xs"
                  type="number"
                  placeholder="Ex: 3"
                  onChange={(e) => handleChange('numeralDecimalScale', e.target.value)}
                />
              </div>

              {/* SEPARADOR DECIMAL */}
              <div className="flex flex-col items-start gap-1">
                <Label className="text-xs" htmlFor="type">
                  Separador decimal
                </Label>
                <Input
                  className="h-8 text-xs p-1 placeholder-shown:text-xs"
                  type="text"
                  placeholder="ex: . ou ,"
                  onChange={(e) => handleChange('numeralDecimalMark', e.target.value)}
                />
              </div>

              {/* AJUSTES DA MÁSCARA */}
              <div className="flex flex-col items-start gap-1">
                <Label className="text-xs" htmlFor="type">
                  Ajustes da máscara
                </Label>
                <Popover>
                  <PopoverTrigger className="w-full flex items-center justify-between border rounded-md h-8 p-1">
                    <span className="text-xs">Marque as opções de ajuste</span>
                    <ChevronDown className="w-4 h-4" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <div className="flex flex-col items-start gap-2">
                      {maskConfigs.map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                          <Checkbox
                            id={item.key}
                            checked={Boolean(customOptions[item.key])}
                            onCheckedChange={(checked) => handleChange(item.key, Boolean(checked))}
                          />
                          <Label htmlFor={item.key} className="text-xs">
                            {item.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
        {selectedMask && (
          <>
            <Separator className="w-full h-[1px] mb-4 mt-4" />

            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-xs" htmlFor="type">
                Campo com máscara aplicada
              </Label>
              <Cleave
                key={JSON.stringify(optionsUsed)}
                className="border rounded-md p-2 w-full col-span-2"
                placeholder="Digite aqui"
                value={formattedValue}
                options={optionsUsed}
                onChange={(e) => setRawValue(e.target.rawValue ?? '')}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={close}>
          Cancelar
        </Button>
        <Button onClick={() => handleSave()}>Confirmar</Button>
      </div>
    </div>
  );
};
