
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, users as mockUsers } from './data';

interface AuthState {
  currentUser: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; message: string; userId?: string }>;
  logout: () => void;
}

// Store user credentials for demo purposes (in a real app, this would be in a database)
const userCredentials: Record<string, { password: string; userId: string }> = {
  'john@buildtrack.com': { password: 'password123', userId: 'u1' },
  'sarah@buildtrack.com': { password: 'password123', userId: 'u2' },
  'michael@buildtrack.com': { password: 'password123', userId: 'u3' },
  'emily@buildtrack.com': { password: 'password123', userId: 'u4' },
};

// Create auth store with persistence
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAdmin: false,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Check if user exists
        const userCred = userCredentials[email];
        
        if (!userCred) {
          return { success: false, message: 'User not found' };
        }
        
        // Check password
        if (userCred.password !== password) {
          return { success: false, message: 'Invalid password' };
        }
        
        // Find user in mock data
        const user = mockUsers.find(u => u.id === userCred.userId);
        
        if (!user) {
          return { success: false, message: 'User data not found' };
        }
        
        // Set auth state
        set({
          currentUser: user,
          isAuthenticated: true,
          isAdmin: user.role === 'Project Manager' // For demo, project managers are admins
        });
        
        return { success: true, message: 'Login successful' };
      },
      
      register: async (name: string, email: string, password: string, role: string) => {
        // Check if email already exists
        if (userCredentials[email]) {
          return { success: false, message: 'Email already registered' };
        }
        
        // Generate a new user ID
        const userId = `u${Math.floor(Math.random() * 10000)}`;
        
        // Create new user credentials
        userCredentials[email] = {
          password,
          userId
        };
        
        // Create new user
        const newUser: User = {
          id: userId,
          name,
          avatar: `https://i.pravatar.cc/150?u=${name.replace(/\s+/g, '')}`,
          role
        };
        
        // Add to mock users (in a real app, this would be saved to a database)
        mockUsers.push(newUser);
        
        // Set auth state
        set({
          currentUser: newUser,
          isAuthenticated: true,
          isAdmin: role === 'Project Manager' // For demo, project managers are admins
        });
        
        return { success: true, message: 'Registration successful', userId };
      },
      
      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          isAdmin: false
        });
      }
    }),
    {
      name: 'buildtrack-auth',
    }
  )
);
