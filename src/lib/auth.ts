
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './data';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface AuthUser {
  id: string;
  email?: string;
}

interface Profile {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface AuthState {
  currentUser: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; message: string; userId?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAdmin: false,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            return { success: false, message: error.message };
          }
          
          // Fetch user profile
          if (data.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileData) {
              const user: User = {
                id: profileData.id,
                name: profileData.name,
                avatar: profileData.avatar,
                role: profileData.role
              };
              
              set({
                currentUser: user,
                isAuthenticated: true,
                isAdmin: profileData.role === 'Project Manager'
              });
              
              return { success: true, message: 'Login successful' };
            }
          }
          
          return { success: false, message: 'User profile not found' };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, message: 'An unexpected error occurred' };
        }
      },
      
      register: async (name: string, email: string, password: string, role: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                role
              }
            }
          });
          
          if (error) {
            return { success: false, message: error.message };
          }
          
          if (data.user) {
            const user: User = {
              id: data.user.id,
              name,
              avatar: `https://i.pravatar.cc/150?u=${name.replace(/\s+/g, '')}`,
              role
            };
            
            set({
              currentUser: user,
              isAuthenticated: true,
              isAdmin: role === 'Project Manager'
            });
            
            return { success: true, message: 'Registration successful', userId: data.user.id };
          }
          
          return { success: false, message: 'User registration failed' };
        } catch (error) {
          console.error('Registration error:', error);
          return { success: false, message: 'An unexpected error occurred' };
        }
      },
      
      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({
            currentUser: null,
            isAuthenticated: false,
            isAdmin: false
          });
        } catch (error) {
          console.error('Logout error:', error);
          toast({
            title: "Error",
            description: "Failed to log out",
            variant: "destructive",
          });
        }
      },
      
      refreshSession: async () => {
        try {
          set({ isLoading: true });
          
          const { data } = await supabase.auth.getSession();
          
          if (data.session?.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
            
            if (profileData) {
              const user: User = {
                id: profileData.id,
                name: profileData.name,
                avatar: profileData.avatar,
                role: profileData.role
              };
              
              set({
                currentUser: user,
                isAuthenticated: true,
                isAdmin: profileData.role === 'Project Manager'
              });
            } else {
              set({
                currentUser: null,
                isAuthenticated: false,
                isAdmin: false
              });
            }
          } else {
            set({
              currentUser: null,
              isAuthenticated: false,
              isAdmin: false
            });
          }
        } catch (error) {
          console.error('Session refresh error:', error);
          set({
            currentUser: null,
            isAuthenticated: false,
            isAdmin: false
          });
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'buildtrack-auth',
    }
  )
);

// Initialize auth state on app load
if (typeof window !== 'undefined') {
  useAuth.getState().refreshSession();
  
  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      await useAuth.getState().refreshSession();
    } else if (event === 'SIGNED_OUT') {
      useAuth.getState().logout();
    }
  });
}
