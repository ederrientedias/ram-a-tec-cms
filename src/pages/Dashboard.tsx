
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleUser, FileText, TrendingUp, Calendar, BarChart3, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Sample data for charts
const monthlyData = [
  { month: "Jan", rentabilidade: 4.2 },
  { month: "Fev", rentabilidade: 3.5 },
  { month: "Mar", rentabilidade: 5.1 },
  { month: "Abr", rentabilidade: 4.8 },
  { month: "Mai", rentabilidade: 3.9 },
  { month: "Jun", rentabilidade: 4.5 },
  { month: "Jul", rentabilidade: 5.3 },
  { month: "Ago", rentabilidade: 4.7 },
  { month: "Set", rentabilidade: 3.8 },
  { month: "Out", rentabilidade: 4.9 },
  { month: "Nov", rentabilidade: 5.2 },
  { month: "Dez", rentabilidade: 4.6 },
];

const fundsData = [
  { nome: "Fundo A", rentabilidade: 4.2, benchmark: 3.8 },
  { nome: "Fundo B", rentabilidade: 5.5, benchmark: 3.8 },
  { nome: "Fundo C", rentabilidade: 3.2, benchmark: 3.8 },
  { nome: "Fundo D", rentabilidade: 6.1, benchmark: 3.8 },
  { nome: "Fundo E", rentabilidade: 4.7, benchmark: 3.8 },
  { nome: "Fundo F", rentabilidade: 3.9, benchmark: 3.8 },
];

const activityData = [
  { data: "2023-04-05", usuario: "Marcos Silva", acao: "Cadastrou novo fundo" },
  { data: "2023-04-04", usuario: "Ana Oliveira", acao: "Atualizou portfólio" },
  { data: "2023-04-03", usuario: "Carlos Santos", acao: "Upload de documento" },
  { data: "2023-04-02", usuario: "Juliana Costa", acao: "Editou fundo" },
  { data: "2023-04-01", usuario: "Roberto Almeida", acao: "Nova publicação" },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Fundos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              +2 desde o último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              +12 desde o último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7%</div>
            <p className="text-xs text-muted-foreground">
              +0.2% desde o último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publicações</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <p className="text-xs text-muted-foreground">
              +4 desde o último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="fundos">
            <TrendingUp className="h-4 w-4 mr-2" />
            Fundos
          </TabsTrigger>
          <TabsTrigger value="atividade">
            <Activity className="h-4 w-4 mr-2" />
            Atividade Recente
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rentabilidade Mensal</CardTitle>
              <CardDescription>
                Acompanhe a rentabilidade média mensal dos fundos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Rentabilidade']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rentabilidade"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fundos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Fundo</CardTitle>
              <CardDescription>
                Comparação entre a rentabilidade de cada fundo e seu benchmark
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fundsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`]} />
                    <Legend />
                    <Bar dataKey="rentabilidade" name="Rentabilidade" fill="#3b82f6" />
                    <Bar dataKey="benchmark" name="Benchmark" fill="#93c5fd" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="atividade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas ações realizadas no portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activityData.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-4 mt-1">
                      <CircleUser className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        <span className="font-semibold">{item.usuario}</span> {item.acao}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

function Database(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}
