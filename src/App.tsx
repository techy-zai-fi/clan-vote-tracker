import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ClansOverview from "./pages/ClansOverview";
import ClanMain from "./pages/ClanMain";
import VoteHub from "./pages/VoteHub";
import AdminPortal from "./pages/AdminPortal";
import Auth from "./pages/Auth";
import Results from "./pages/Results";
import VotingSupervisor from "./pages/VotingSupervisor";
import VotingStation from "./pages/VotingStation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/clans" element={<ClansOverview />} />
          <Route path="/clans/:clanId" element={<ClanMain />} />
          <Route path="/vote" element={<VoteHub />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/results" element={<Results />} />
          <Route path="/voting-supervisor" element={<VotingSupervisor />} />
          <Route path="/voting-station/:stationId" element={<VotingStation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
