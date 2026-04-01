import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Scan from "./pages/Scan";
import LoveScanner from "./pages/LoveScanner";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AuraHeader from "./components/AuraHeader";
import Challenges from "./pages/Challenges";
import ChallengeRunner from "./pages/ChallengeRunner";
import IdiotBoard from "./pages/IdiotBoard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuraHeader />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/love" element={<LoveScanner />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/play" element={<ChallengeRunner />} />
          <Route path="/idiots" element={<IdiotBoard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
