import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ExamList from "./pages/ExamList";
import TakeExam from "./pages/TakeExam";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExams from "./pages/admin/AdminExams";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminResults from "./pages/admin/AdminResults";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />}/>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
            <Route path="/exams" element={<ProtectedRoute><ExamList /></ProtectedRoute>}/>
            <Route path="/exams/:id" element={<ProtectedRoute><TakeExam /></ProtectedRoute>}/>
            <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>}/>
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>}/>
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>}/>
            <Route path="/admin/exams" element={<ProtectedRoute requireAdmin><AdminExams /></ProtectedRoute>}/>
            <Route path="/admin/certificates" element={<ProtectedRoute requireAdmin><AdminCertificates /></ProtectedRoute>}/>
            <Route path="/admin/results" element={<ProtectedRoute requireAdmin><AdminResults /></ProtectedRoute>}/>
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>);
export default App;
