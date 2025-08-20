import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase, apiClient } from '../utils/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Types
interface AppUser {
  id: string;
  email: string;
  name: string;
  birth_date?: string;
  created_at: string;
  tickets: number;
  is_premium: boolean;
  daily_ad_count: number;
  daily_free_used: boolean;
  last_login: string;
  settings: {
    defaultDivination: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
    notifications: boolean;
    darkMode: boolean;
  };
}

interface AppState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: AppUser | null;
  session: Session | null;
  error: string | null;
}

// Actions
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: AppUser; session: Session } }
  | { type: 'UPDATE_USER'; payload: Partial<AppUser> }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial State
const initialState: AppState = {
  isLoading: true,
  isLoggedIn: false,
  user: null,
  session: null,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_USER':
      return {
        ...state,
        isLoading: false,
        isLoggedIn: true,
        user: action.payload.user,
        session: action.payload.session,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isLoggedIn: false,
        user: null,
        session: null,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  actions: {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, birthDate?: string) => Promise<void>;
    loginWithOAuth: (provider: 'google' | 'twitter') => Promise<void>;
    logout: () => Promise<void>;
    useTicket: () => Promise<boolean>;
    watchAd: () => Promise<void>;
    upgradeToPremium: () => Promise<void>;
    useDailyFree: () => Promise<void>;
    updateSettings: (settings: Partial<AppUser['settings']>) => Promise<void>;
    saveFortuneResult: (fortuneData: any) => Promise<void>;
    getFortuneHistory: () => Promise<any[]>;
    saveChatSession: (chatMode: string, messages: any[]) => Promise<void>;
    getChatHistory: () => Promise<any[]>;
    refreshUser: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | null>(null);

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Provider
interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app and check for existing session
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Initialize database tables
        try {
          await apiClient.initDatabase();
        } catch (error) {
          console.warn('Database initialization warning:', error);
        }

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          return;
        }

        if (session && mounted) {
          apiClient.setAccessToken(session.access_token);
          
          try {
            const { user } = await apiClient.getUserProfile();
            dispatch({ 
              type: 'SET_USER', 
              payload: { user, session } 
            });
          } catch (error) {
            console.error('Profile fetch error:', error);
            // Clear invalid session
            await supabase.auth.signOut();
            dispatch({ type: 'LOGOUT' });
          }
        } else if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('App initialization error:', error);
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
        }
      } finally {
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeApp();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          apiClient.setAccessToken(null);
          dispatch({ type: 'LOGOUT' });
        } else if (event === 'SIGNED_IN' && session) {
          apiClient.setAccessToken(session.access_token);
          try {
            const { user } = await apiClient.getUserProfile();
            dispatch({ 
              type: 'SET_USER', 
              payload: { user, session } 
            });
          } catch (error) {
            console.error('Profile fetch after sign in error:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch user profile' });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Actions
  const actions = {
    login: async (email: string, password: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const { user, session } = await apiClient.login(email, password);
        
        // Supabase will handle the session automatically through onAuthStateChange
        // But we can also set it directly for immediate response
        apiClient.setAccessToken(session.access_token);
        dispatch({ 
          type: 'SET_USER', 
          payload: { user, session } 
        });
      } catch (error: any) {
        console.error('Login error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
        throw error;
      }
    },

    register: async (email: string, password: string, name: string, birthDate?: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const { user, session } = await apiClient.register(email, password, name, birthDate);
        
        apiClient.setAccessToken(session.access_token);
        dispatch({ 
          type: 'SET_USER', 
          payload: { user, session } 
        });
      } catch (error: any) {
        console.error('Registration error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Registration failed' });
        throw error;
      }
    },

    loginWithOAuth: async (provider: 'google' | 'twitter') => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          throw error;
        }

        // The actual sign-in will be handled by the auth state change listener
      } catch (error: any) {
        console.error('OAuth login error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'OAuth login failed' });
        throw error;
      }
    },

    logout: async () => {
      try {
        await supabase.auth.signOut();
        apiClient.setAccessToken(null);
        dispatch({ type: 'LOGOUT' });
      } catch (error: any) {
        console.error('Logout error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Logout failed' });
      }
    },

    useTicket: async (): Promise<boolean> => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        if (state.user?.is_premium) {
          return true; // Premium users don't need tickets
        }

        const { tickets } = await apiClient.useTicket();
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { tickets } 
        });
        return true;
      } catch (error: any) {
        console.error('Use ticket error:', error);
        if (error.message === 'Insufficient tickets') {
          return false;
        }
        throw error;
      }
    },

    watchAd: async () => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        const { tickets, dailyAdCount } = await apiClient.watchAd();
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { 
            tickets, 
            daily_ad_count: dailyAdCount 
          } 
        });
      } catch (error: any) {
        console.error('Watch ad error:', error);
        throw error;
      }
    },

    upgradeToPremium: async () => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        const { user } = await apiClient.upgradeToPremium();
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { is_premium: user.is_premium } 
        });
      } catch (error: any) {
        console.error('Premium upgrade error:', error);
        throw error;
      }
    },

    useDailyFree: async () => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        await apiClient.updateUserProfile({ daily_free_used: true });
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { daily_free_used: true } 
        });
      } catch (error: any) {
        console.error('Use daily free error:', error);
        throw error;
      }
    },

    updateSettings: async (settings: Partial<AppUser['settings']>) => {
      try {
        if (!state.session || !state.user) {
          throw new Error('Not authenticated');
        }

        const updatedSettings = { ...state.user.settings, ...settings };
        await apiClient.updateUserProfile({ settings: updatedSettings });
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { settings: updatedSettings } 
        });
      } catch (error: any) {
        console.error('Update settings error:', error);
        throw error;
      }
    },

    saveFortuneResult: async (fortuneData: any) => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        await apiClient.saveFortuneResult(fortuneData);
      } catch (error: any) {
        console.error('Save fortune result error:', error);
        throw error;
      }
    },

    getFortuneHistory: async () => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        const { results } = await apiClient.getFortuneHistory();
        return results;
      } catch (error: any) {
        console.error('Get fortune history error:', error);
        throw error;
      }
    },

    saveChatSession: async (chatMode: string, messages: any[]) => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        await apiClient.saveChatSession(chatMode, messages);
      } catch (error: any) {
        console.error('Save chat session error:', error);
        throw error;
      }
    },

    getChatHistory: async () => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        const { results } = await apiClient.getChatHistory();
        return results;
      } catch (error: any) {
        console.error('Get chat history error:', error);
        throw error;
      }
    },

    refreshUser: async () => {
      try {
        if (!state.session) {
          throw new Error('Not authenticated');
        }

        const { user } = await apiClient.getUserProfile();
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: user 
        });
      } catch (error: any) {
        console.error('Refresh user error:', error);
        throw error;
      }
    },
  };

  // Show loading screen until app is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-800">AI占いアプリを起動中...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}