import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PDFSummarizer from "./pages/PDFSummarizer";
import QuizGenerator from "./pages/QuizGenerator";
import CodingAssistant from "./pages/CodingAssistant";
import AITutor from "./pages/AITutor";
import StudyPlanner from "./pages/StudyPlanner";
import Flashcards from "./pages/Flashcards";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import SavedContent from "./pages/SavedContent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/pdf-summarizer" element={<ProtectedRoute><PDFSummarizer /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
            <Route path="/coding" element={<ProtectedRoute><CodingAssistant /></ProtectedRoute>} />
            <Route path="/tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedContent /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
