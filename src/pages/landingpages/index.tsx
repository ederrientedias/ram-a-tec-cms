import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CreateLandingPage from './CreateLandingPage';
import CreateTab from './CreateTab';
import AddFile from './AddFile';


const LandingPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos da Landing Page</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs defaultValue="createLandingPage" className="w-full">
          <TabsList>
            <TabsTrigger value="createLandingPage">Criar landing page</TabsTrigger>
            <TabsTrigger value="addFile">Adicionar arquivo</TabsTrigger>
            <TabsTrigger value="createTab">Criar aba</TabsTrigger>
          </TabsList>
          <TabsContent value="addFile">
            <AddFile />
          </TabsContent>
          <TabsContent value="createTab">
            <CreateTab />
          </TabsContent>
          <TabsContent value="createLandingPage">
            <CreateLandingPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default LandingPage;
