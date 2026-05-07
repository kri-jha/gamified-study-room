import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import StudyTimer from "./pages/StudyTimer";
import TodoPage from "./pages/TodoPage";
import StudyRooms from "./pages/StudyRooms";
import StudyRoomSession from "./pages/StudyRoomSession";
import SignInPage from "./pages/SignInPage";
import NotFound from "./pages/NotFound";
import RemindersPage from "./pages/RemindersPage";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/timer" element={<StudyTimer />} />
        <Route path="/quests" element={<TodoPage />} />
        <Route path="/rooms" element={<StudyRooms />} />
        <Route path="/rooms/:id" element={<StudyRoomSession />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <div className="pb-20 md:pb-0">
            <AnimatedRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
