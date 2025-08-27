import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CreateFieldBLock } from './components/CreateFieldBlock';
import { CreateField } from './components/CreateField';

export const InstrumentRegistration = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">Cadastro de Instrumentos</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs defaultValue="c-c" className="w-full">
          <TabsList>
            <TabsTrigger value="c-c">Criar Campo</TabsTrigger>
            <TabsTrigger value="c-b">Criar Bloco de Campos</TabsTrigger>
          </TabsList>
          <TabsContent value="c-c">
            <CreateField />
          </TabsContent>
          <TabsContent value="c-b">
            <CreateFieldBLock />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default InstrumentRegistration;
