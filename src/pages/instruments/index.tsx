import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Loading404Animation from '@/components/animations/loading404';

import { InstrumentGroupRegistration } from './tabs/instrumentGroupRegistration';
import { InstrumentRegistration } from './tabs/instrumentRegistration';
import { BlockRegistration } from './tabs/blockRegistration';
import { FormGenerator } from './tabs/formGenerator';

export function Instrument() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="c-g-i">
        <TabsList>
          <TabsTrigger value="c-g-i">Cadastro de Grupo de Instrumento</TabsTrigger>
          <TabsTrigger value="c-i">Cadastro de instrumentos</TabsTrigger>
          <TabsTrigger value="c-b">Cadastro de Blocos</TabsTrigger>
          <TabsTrigger value="g-f">Gerador de Formulário</TabsTrigger>
        </TabsList>
        <TabsContent value="c-g-i">
          <InstrumentGroupRegistration />
        </TabsContent>
        <TabsContent value="c-i">
          <InstrumentRegistration />
        </TabsContent>
        <TabsContent value="c-b">
          {/* <BlockRegistration /> */}
          <Loading404Animation />
        </TabsContent>
        <TabsContent value="g-f">
          <FormGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
