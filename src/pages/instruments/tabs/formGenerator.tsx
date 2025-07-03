import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useInstrumentGroup } from '@/hooks/firestore/instrument/use-instrument-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFieldsBlocks } from '@/hooks/firestore/instrument/use-fields-blocks';
import { ChevronDown, FilePen, Plus, Search, Trash2 } from 'lucide-react';
import { useFields } from '@/hooks/firestore/instrument/use-fields';
import { useForms } from '@/hooks/firestore/instrument/use-forms';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

import { instrumentGroup } from '../../../schemas/instruments/instrument-group.schema';

export const FormGenerator = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isCreateForm, setIsCreateForm] = useState<boolean>(false);

  const { data: forms, isLoading: formLoading, error: formError } = useForms();
  const {
    data: instrumentGroup,
    isLoading: istrumentGroupLoading,
    error: instrumentGroupError,
  } = useInstrumentGroup();
  const {
    data: fieldsBlocks,
    isLoading: fieldsBlocksLoading,
    error: fieldsBlocksError,
  } = useFieldsBlocks();
  const { data: fields, isLoading: fieldsLoading, error: fieldsError } = useFields();

  const openCreateForm = () => {
    setIsCreateForm(true);
  };

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = (): void => {
    setDialogOpen(false);
  };

  return (
    <div className="w-full  flex flex-col gap-2  p-4">
      <div className="w-full flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Gerador de Formulário</h1>
        {/* onClick={() => openDialog('new')} */}
        <Button onClick={() => openCreateForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Formulário
        </Button>
      </div>
      {isCreateForm ? (
        <div className="h-[80vh] py-4 flex flex-col bg-white border rounded-lg">
          <ResizablePanelGroup direction="horizontal">
            {/* Campos */}
            <ResizablePanel defaultSize={30}>
              <div className="h-full flex flex-col justify-between gap-2 px-2">
                <h1>Campos</h1>

                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  {/* value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} */}
                  <Input type="search" placeholder="Buscar Campo" className="pl-8" />
                </div>
                <ScrollArea className="h-[620px] w-full rounded-md border p-4">
                  <div className="flex flex-col gap-2">
                    {fields.map((field) => {
                      return (
                        <div
                          className="bg-slate-50 p-2 rounded-md border border-transparent hover:border-zinc-900 cursor-pointer"
                          key={field.id}
                        >
                          <span className="text-xs">{field.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-end">
                  <Button className="w-fit" variant="outline" onClick={() => openDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Campo
                  </Button>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            {/* Formulários */}
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col gap-2 px-2">
                <div className="h-full flex-1">
                  <h1>Criar Formulário</h1>
                  <div className="flex items-center justify-start gap-2">
                    <Input type="search" placeholder="Nome do Bloco" />
                    <Popover>
                      <PopoverTrigger className="w-full border rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Selecione um Bloco</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>Place content for the popover here.</PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="w-full flex items-center justify-end gap-4 border-t pt-2 border-zinc-200">
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="default">Salvar</Button>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-lg p-4 border flex flex-col gap-4">
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              {/* value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} */}
              <Input type="search" placeholder="Buscar Grupo de Instrumento..." className="pl-8" />
            </div>
          </div>
          {/* Tabela de Instrumentos */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Bloco</TableHead>
                  <TableHead>Formulário</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldsBlocks &&
                  fieldsBlocks.map((item) => {
                    return (
                      <TableRow key={item.uuid}>
                        <TableCell className="font-medium">
                          {item.instrumentsGroups.map((instrument) => {
                            return (
                              <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center">
                                {instrument.group}
                              </div>
                            );
                          })}
                        </TableCell>
                        <TableCell>{item.blockName}</TableCell>
                        <TableCell>{item.idName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-500"
                              onClick={() => openDialog()}
                            >
                              <FilePen className="h-4 w-4" />
                            </Button>
                            {/* onClick={() => deleteInstrumentGroup(instrument.idName)} */}
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
          {/* Dialog para adicionar/editar instrumentos */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-7xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Instrumento</DialogTitle>
                <DialogDescription>Preencha as informações sobre o instrumento.</DialogDescription>
              </DialogHeader>
              {/* grid grid-cols-1 md:grid-cols-2 gap-6 */}
              <div className="h-[80vh] py-4 flex items-center gap-4">
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Campo
                      </Button>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel>Two</ResizablePanel>
                </ResizablePanelGroup>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};
