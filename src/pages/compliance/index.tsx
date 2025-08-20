import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CreateCompany from './CreateCompany';
import AddFile from './AddFile';

const Compliance = () => {
  // if (isLoadingTabs || isLoadingLogs) return <LoadingPageAnimation />;
  // if (errorTabs || logErro) return <Loading404Animation />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos de Compliance</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs defaultValue="addFile" className="w-full">
          <TabsList>
            <TabsTrigger value="addFile">Adicionar arquivo</TabsTrigger>
            <TabsTrigger value="createCompany">Criar empresa</TabsTrigger>
          </TabsList>
          <TabsContent value="addFile">
            <AddFile />
          </TabsContent>
          <TabsContent value="createCompany">
            <CreateCompany />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Compliance;
