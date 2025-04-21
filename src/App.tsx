import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fundos from './pages/Funds';
import Portfolios from './pages/Portfolios';
import Compliance from './pages/Compliance';
import LandingPage from './pages/LandingPage';
import Publicacoes from './pages/Publications';
import NotFound from './pages/NotFound';
import DashboardLayout from './components/layout/DashboardLayout';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fundos" element={<Fundos />} />
            <Route path="/portfolios" element={<Portfolios />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/landing-page" element={<LandingPage />} />
            <Route path="/publicacoes" element={<Publicacoes />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
