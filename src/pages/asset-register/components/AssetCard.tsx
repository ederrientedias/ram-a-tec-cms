import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Calendar, CalendarClock, Ellipsis, FileCheck2, FileMinus2, FilePen, FilePenLine, FileText, FileX2, } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useEffect, useState } from 'react';
import { formatTimestamp } from '@/utils/format-date';
import { Separator } from '@radix-ui/react-select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { AssetDatail } from './AssetDetail';


export const AssetCard = ({ assetData, handleEditAsset }) => {
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [assetInfo, setAssetInfo] = useState<any>(null);
  const [openStatus, setOpenStatus] = useState(false);

  const handleAssetDatail = (asset: any) => {
    setOpenDialog(true);
    setSelectedInstrument(asset);
  };

  const handleAssetInfo = useCallback(() => {
    if (!assetData?.forms?.Identificadores?.data) {
      setAssetInfo(null);
      return;
    }

    const { forms, createdAt, updatedAt, status } = assetData;
    const { data } = forms.Identificadores;

    const asset = {
      nickname: data.nicknamedoativofinanceiro ?? 'N/A',
      name: data.nomedoativofinanceiro ?? 'N/A',
      createdAt: formatTimestamp(createdAt),
      updatedAt: formatTimestamp(updatedAt),
      status: status ?? 'N/A',
    };

    setAssetInfo(asset);
  }, [assetData]);

  useEffect(() => handleAssetInfo(), [handleAssetInfo]);

  const editingAsset = () => handleEditAsset(assetData);

  return (
    <Card
      key={assetData.id}
      className="w-full cursor-pointer hover:shadow-lg transition-shadow rounded-md"
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {assetInfo?.nickname ?? 'Sem nome'}
            </CardTitle>
            <div className="text-xs text-gray-600">{assetInfo?.name ?? 'N/A'}</div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-md px-3 py-2 gap-2" variant="ghost" size="sm">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={editingAsset}>
                  Continuar cadastro
                  <DropdownMenuShortcut>
                    <FilePenLine className="w-4 h-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAssetDatail(assetData)}>
                  Detalhes do Ativo
                  <DropdownMenuShortcut>
                    <FileText className="w-4 h-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-4 justify-center">
          <div className="flex flex-col items-start justify-between gap-2">
            <div className="flex items-end gap-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <strong className="text-xs">Criado em:</strong>
              <span className="text-xs text-gray-600">{assetInfo?.createdAt ?? 'N/A'}</span>
            </div>
            <div className="flex items-end gap-1">
              <CalendarClock className="w-4 h-4 text-orange-600" />
              <strong className="text-xs">Ultima Atualização:</strong>
              <span className="text-xs text-gray-600">{assetInfo?.updatedAt ?? 'N/A'}</span>
            </div>
          </div>
          <div className="w-full flex flex-col items-end justify-end">
            {/* Status */}
            <div className="w-full flex item-end justify-end">
              <Popover open={openStatus} onOpenChange={setOpenStatus}>
                <PopoverTrigger>
                  <Badge
                    className={`rounded-md px-3 py-2 text-xs flex items-center gap-2 ${
                      assetInfo?.status === 'Em andamento'
                        ? 'bg-blue-100 text-blue-500 hover:bg-blue-100'
                        : !assetInfo?.status
                        ? 'bg-red-100 text-red-500 hover:bg-red-100'
                        : 'bg-green-100 text-green-500 hover:bg-green-100'
                    }`}
                    variant="default"
                    onClick={() => setOpenStatus((prev) => !prev)}
                  >
                    {!assetInfo?.status ? (
                      <FileX2 className="w-4 h-4" />
                    ) : assetInfo?.status === 'Em andamento' ? (
                      <FilePen className="w-4 h-4" />
                    ) : (
                      <FileCheck2 className="w-4 h-4" />
                    )}
                    {assetInfo?.status}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] flex flex-col gap-4">
                  <h3 className="font-semibold text-sm">Progresso do Cadastro</h3>
                  <Separator className="w-full h-[1px] bg-gray-100" />
                  <ul className="flex flex-col gap-2">
                    {assetData.steps.map((step, index) => {
                      return (
                        <ol className="flex items-center gap-2" key={index}>
                          {step.id === assetData.currentStepId &&
                          assetData.status === 'Em andamento' ? (
                            <div className="bg-blue-100 p-2 rounded-full">
                              <FilePenLine className="w-4 h-4 text-blue-600" />
                            </div>
                          ) : index <
                            assetData.steps.findIndex((s) => s.id === assetData.currentStepId) ? (
                            <div className="bg-green-100 p-2 rounded-full">
                              <FileCheck2 className="w-4 h-4 text-green-600" />
                            </div>
                          ) : assetData.status === 'Concluído' && step.id === 'complete' ? (
                            <div className="bg-green-100 p-2 rounded-full">
                              <FileCheck2 className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="bg-gray-100 p-2 rounded-full">
                              <FileMinus2 className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <span className="text-sm">{step.title}</span>
                        </ol>
                      );
                    })}
                  </ul>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
      {/* Detalhes do Ativo     */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-full max-w-6xl min-w-max">
          <DialogHeader>
            <DialogTitle>Detalhes do Ativo - {assetInfo?.nickname ?? 'Sem Nome'}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <AssetDatail key={assetData.id} data={selectedInstrument} />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
