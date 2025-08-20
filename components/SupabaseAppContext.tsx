import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { User, Session } from '@supabase/supabase-js';

// API utility
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-a4a3f409${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `API call failed: ${response.status}`);
  }

  return data;
};

// Types
interface AppUser {
  id: string;
  email: string;
  name: string;
  birth_date?: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  user_id: string;
  default_divination: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
  notifications: boolean;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

interface UserTickets {
  id: string;
  user_id: string;
  tickets: number;
  daily_ad_count: number;
  daily_free_used: boolean;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

interface FortuneResult {
  id: string;
  user_id: string;
  fortune_type: 'personal' | 'compatibility';
  divination_method: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
  input_data: any;
  result_text: string;
  ai_tone: 'gentle' | 'direct';
  created_at: string;
}

interface AppState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: AppUser | null;
  session: Session | null;
  settings: UserSettings | null;
  tickets: UserTickets | null;
  fortunes: FortuneResult[];
}

// Actions
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH'; payload: { user: AppUser | null; session: Session | null } }
  | { type: 'SET_PROFILE_DATA'; payload: { profile: AppUser; settings: UserSettings; tickets: UserTickets } }
  | { type: 'UPDATE_SETTINGS'; payload: UserSettings }
  | { type: 'UPDATE_TICKETS'; payload: UserTickets }
  | { type: 'SET_FORTUNES'; payload: FortuneResult[] }
  | { type: 'ADD_FORTUNE'; payload: FortuneResult };

// Initial State
const initialState: AppState = {
  isLoading: true,
  isLoggedIn: false,
  user: null,
  session: null,
  settings: null,
  tickets: null,
  fortunes: [],
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isLoggedIn: !!action.payload.user,
      };

    case 'SET_PROFILE_DATA':
      return {
        ...state,
        user: action.payload.profile,
        settings: action.payload.settings,
        tickets: action.payload.tickets,
        isLoggedIn: true,
        isLoading: false,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };

    case 'UPDATE_TICKETS':
      return {
        ...state,
        tickets: action.payload,
      };

    case 'SET_FORTUNES':
      return {
        ...state,
        fortunes: action.payload,
      };

    case 'ADD_FORTUNE':
      return {
        ...state,
        fortunes: [action.payload, ...state.fortunes],
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  actions: {
    signUp: (email: string, password: string, name: string, birthDate?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<AppUser>) => Promise<void>;
    updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
    useTicket: () => Promise<boolean>;
    earnTickets: (amount: number, source: string) => Promise<void>;
    useDailyFree: () => Promise<void>;
    upgradeToPremium: () => Promise<void>;
    saveFortune: (fortuneData: any) => Promise<void>;
    loadFortuneHistory: () => Promise<void>;
    refreshProfile: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | null>(null);

// Hook
export function useSupabaseApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useSupabaseApp must be used within a SupabaseAppProvider');
  }
  return context;
}

// Provider
interface AppProviderProps {
  children: React.ReactNode;
}

export function SupabaseAppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth listener
  useEffect(() => {
    console.log('Initializing Supabase auth listener...');
    
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          // Load user profile
          await loadUserProfile(session);
        } else {
          console.log('No existing session found');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session);
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SET_AUTH', payload: { user: null, session: null } });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (session: Session) => {
    try {
      console.log('Loading user profile for:', session.user.id);
      
      const response = await apiCall('/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.success) {
        dispatch({
          type: 'SET_PROFILE_DATA',
          payload: {
            profile: response.profile,
            settings: response.settings,
            tickets: response.tickets,
          },
        });
        
        dispatch({ type: 'SET_AUTH', payload: { user: response.profile, session } });
        console.log('User profile loaded successfully');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Actions
  const actions = {
    signUp: async (email: string, password: string, name: string, birthDate?: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('Signing up user:', email);
        
        const response = await apiCall('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password, name, birthDate }),
        });

        if (response.success) {
          console.log('Signup successful');
          // The auth state change listener will handle loading the profile
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Signup error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
    },

    signIn: async (email: string, password: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('Signing in user:', email);
        
        const response = await apiCall('/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (response.success) {
          console.log('Signin successful');
          // Set the session in Supabase client
          await supabase.auth.setSession({
            access_token: response.session.access_token,
            refresh_token: response.session.refresh_token,
          });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Signin error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
    },

    signOut: async () => {
      try {
        console.log('Signing out user');
        
        if (state.session) {
          await apiCall('/auth/signout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${state.session.access_token}`,
            },
          });
        }

        await supabase.auth.signOut();
        console.log('Signout successful');
      } catch (error) {
        console.error('Signout error:', error);
        // Even if server signout fails, clear local state
        await supabase.auth.signOut();
      }
    },

    updateProfile: async (updates: Partial<AppUser>) => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/user/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
          body: JSON.stringify(updates),
        });

        if (response.success) {
          dispatch({
            type: 'SET_PROFILE_DATA',
            payload: {
              profile: response.profile,
              settings: state.settings!,
              tickets: state.tickets!,
            },
          });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },

    updateSettings: async (updates: Partial<UserSettings>) => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/user/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
          body: JSON.stringify(updates),
        });

        if (response.success) {
          dispatch({ type: 'UPDATE_SETTINGS', payload: response.settings });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Update settings error:', error);
        throw error;
      }
    },

    useTicket: async (): Promise<boolean> => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/tickets/use', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
        });

        if (response.success) {
          if (response.premium) {
            return true; // Premium user
          }
          
          // Update ticket count
          const updatedTickets = { ...state.tickets!, tickets: response.tickets };
          dispatch({ type: 'UPDATE_TICKETS', payload: updatedTickets });
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Use ticket error:', error);
        return false;
      }
    },

    earnTickets: async (amount: number, source: string) => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/tickets/earn', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
          body: JSON.stringify({ amount, source }),
        });

        if (response.success) {
          const updatedTickets = { 
            ...state.tickets!, 
            tickets: response.tickets,
            daily_ad_count: response.dailyAdCount || state.tickets!.daily_ad_count
          };
          dispatch({ type: 'UPDATE_TICKETS', payload: updatedTickets });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Earn tickets error:', error);
        throw error;
      }
    },

    useDailyFree: async () => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/tickets/daily-free', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
        });

        if (response.success) {
          const updatedTickets = { 
            ...state.tickets!, 
            daily_free_used: true
          };
          dispatch({ type: 'UPDATE_TICKETS', payload: updatedTickets });
        }
      } catch (error) {
        console.error('Use daily free error:', error);
        throw error;
      }
    },

    upgradeToPremium: async () => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/premium/upgrade', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
        });

        if (response.success) {
          dispatch({
            type: 'SET_PROFILE_DATA',
            payload: {
              profile: response.profile,
              settings: state.settings!,
              tickets: state.tickets!,
            },
          });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Premium upgrade error:', error);
        throw error;
      }
    },

    saveFortune: async (fortuneData: any) => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/fortune/save', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
          body: JSON.stringify(fortuneData),
        });

        if (response.success) {
          dispatch({ type: 'ADD_FORTUNE', payload: response.fortune });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Save fortune error:', error);
        throw error;
      }
    },

    loadFortuneHistory: async () => {
      try {
        if (!state.session) throw new Error('Not authenticated');
        
        const response = await apiCall('/fortune/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${state.session.access_token}`,
          },
        });

        if (response.success) {
          dispatch({ type: 'SET_FORTUNES', payload: response.fortunes });
        }
      } catch (error) {
        console.error('Load fortune history error:', error);
        throw error;
      }
    },

    refreshProfile: async () => {
      try {
        if (!state.session) return;
        await loadUserProfile(state.session);
      } catch (error) {
        console.error('Refresh profile error:', error);
      }
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}