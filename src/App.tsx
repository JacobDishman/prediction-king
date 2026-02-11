import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Index from "./pages/Index";
import ChatsPage from "./pages/ChatsPage";
import FriendsPage from "./pages/FriendsPage";
import MenuPage from "./pages/MenuPage";
import ChatDetailPage from "./pages/ChatDetailPage";
import CreatePredictionPage from "./pages/CreatePredictionPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ActivityPage from "./pages/ActivityPage";
import RulesPage from "./pages/RulesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/chat/:id" element={<ChatDetailPage />} />
            <Route path="/chat/:id/create-prediction" element={<CreatePredictionPage />} />
            <Route path="/chat/:id/leaderboard" element={<LeaderboardPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/rules" element={<RulesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
