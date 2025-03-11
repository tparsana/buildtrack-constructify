
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Project = lazy(() => import("./pages/Project"));
const Tasks = lazy(() => import("./pages/Tasks"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const Team = lazy(() => import("./pages/Team"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const { isAuthenticated, isAdmin, isLoading, refreshSession } = useAuth();
  const [initializing, setInitializing] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      await refreshSession();
      setInitializing(false);
    };
    checkSession();
  }, [refreshSession]);
  
  if (initializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading application...</span>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              {isAuthenticated && <Navbar />}
              <main className={`flex-1 overflow-auto ${!isAuthenticated ? 'bg-gray-50' : ''}`}>
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading page...</span>
                  </div>
                }>
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
                    <Route path="/team" element={
                      <ProtectedRoute requireAdmin={true}>
                        <Team />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute requireAdmin={true}>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    
                    {/* Protected employee routes */}
                    <Route path="/employee" element={
                      <ProtectedRoute>
                        <EmployeeDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    
                    {/* Fallback route */}
                    <Route path="*" element={
                      isAuthenticated ? 
                        <NotFound /> : 
                        <Navigate to="/login" replace />
                    } />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
