
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import Index from "./pages/Index";
import Project from "./pages/Project";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Navbar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={
                    isAuthenticated ? 
                      <Navigate to={isAdmin ? "/" : "/employee"} replace /> : 
                      <Login />
                  } />
                  <Route path="/register" element={
                    isAuthenticated ? 
                      <Navigate to={isAdmin ? "/" : "/employee"} replace /> : 
                      <Register />
                  } />
                  
                  {/* Protected admin routes */}
                  <Route path="/" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/project/:id" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Project />
                    </ProtectedRoute>
                  } />
                  <Route path="/tasks" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Tasks />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected employee routes */}
                  <Route path="/employee" element={
                    <ProtectedRoute>
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback route */}
                  <Route path="*" element={
                    isAuthenticated ? 
                      <NotFound /> : 
                      <Navigate to="/login" replace />
                  } />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
