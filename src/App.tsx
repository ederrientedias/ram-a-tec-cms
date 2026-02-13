import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/route/ProtectedRoute';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

import { InformationalTransparency } from './pages/InformationalTransparency';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/landingpages/index';
import Compliance from './pages/compliance/index';
import Publicacoes from './pages/Publications';
import Portfolios from './pages/Portfolios';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Fundos from './pages/Funds';
import Login from './pages/Login';


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fundos" element={<Fundos />} />
              <Route path="/portfolios" element={<Portfolios />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/landing-page" element={<LandingPage />} />
              <Route path="/publicacoes" element={<Publicacoes />} />
              <Route path="/sumario" element={<InformationalTransparency />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
