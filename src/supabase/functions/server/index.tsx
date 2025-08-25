import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors } from "https://deno.land/x/hono@v3.7.4/middleware.ts";
import { Hono } from "https://deno.land/x/hono@v3.7.4/mod.ts";
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
}));

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Types
interface User {
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
    defaultDivination: string;
    notifications: boolean;
    darkMode: boolean;
  };
}

interface FortuneResult {
  id: string;
  user_id: string;
  fortune_type: 'personal' | 'compatibility';
  divination_method: string;
  input_data: any;
  result: string;
  ai_tone: 'gentle' | 'direct';
  created_at: string;
}

interface ChatHistory {
  id: string;
  user_id: string;
  chat_mode: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

// Initialize database tables
app.post('/make-server-a4a3f409/init-db', async (c) => {
  try {
    // Users table
    const { error: userError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'users',
      columns: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        birth_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        tickets INTEGER DEFAULT 3,
        is_premium BOOLEAN DEFAULT FALSE,
        daily_ad_count INTEGER DEFAULT 0,
        daily_free_used BOOLEAN DEFAULT FALSE,
        last_login DATE DEFAULT CURRENT_DATE,
        settings JSONB DEFAULT '{"defaultDivination":"tarot","notifications":true,"darkMode":false}'::jsonb
      `
    });

    // Fortune results table
    const { error: fortuneError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'fortune_results',
      columns: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        fortune_type TEXT NOT NULL,
        divination_method TEXT NOT NULL,
        input_data JSONB NOT NULL,
        result TEXT NOT NULL,
        ai_tone TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      `
    });

    // Chat history table
    const { error: chatError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'chat_history',
      columns: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        chat_mode TEXT NOT NULL,
        messages JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      `
    });

    if (userError || fortuneError || chatError) {
      console.error('Database initialization errors:', { userError, fortuneError, chatError });
      return c.json({ error: 'Failed to initialize database' }, 500);
    }

    return c.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return c.json({ error: 'Database initialization failed' }, 500);
  }
});

// User registration
app.post('/make-server-a4a3f409/auth/register', async (c) => {
  try {
    const { email, password, name, birthDate } = await c.req.json();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, birth_date: birthDate },
      email_confirm: true // Auto-confirm since we don't have email server configured
    });

    if (authError) {
      console.error('Auth registration error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create user profile in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name,
        birth_date: birthDate || null,
      }])
      .select()
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      return c.json({ error: 'Failed to create user profile' }, 500);
    }

    return c.json({ 
      user: userData,
      session: authData.session 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// User login
app.post('/make-server-a4a3f409/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth login error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('User profile fetch error:', userError);
      return c.json({ error: 'Failed to fetch user profile' }, 500);
    }

    // Update last login and daily reset if needed
    const today = new Date().toISOString().split('T')[0];
    const updates: any = { last_login: today };

    if (userData.last_login !== today) {
      // Reset daily counters
      updates.daily_ad_count = 0;
      updates.daily_free_used = false;
      
      // Login bonus
      if (!userData.is_premium) {
        updates.tickets = userData.tickets + 1;
      }
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', authData.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('User update error:', updateError);
      return c.json({ error: 'Failed to update user' }, 500);
    }

    return c.json({ 
      user: updatedUser,
      session: authData.session 
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get user profile
app.get('/make-server-a4a3f409/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('User profile fetch error:', userError);
      return c.json({ error: 'Failed to fetch user profile' }, 500);
    }

    return c.json({ user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Profile fetch failed' }, 500);
  }
});

// Update user profile
app.put('/make-server-a4a3f409/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const updates = await c.req.json();

    const { data: userData, error: userError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (userError) {
      console.error('User profile update error:', userError);
      return c.json({ error: 'Failed to update user profile' }, 500);
    }

    return c.json({ user: userData });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Profile update failed' }, 500);
  }
});

// Use ticket
app.post('/make-server-a4a3f409/user/use-ticket', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('tickets, is_premium')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return c.json({ error: 'Failed to fetch user data' }, 500);
    }

    if (userData.is_premium) {
      return c.json({ success: true, tickets: userData.tickets });
    }

    if (userData.tickets <= 0) {
      return c.json({ error: 'Insufficient tickets' }, 400);
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ tickets: userData.tickets - 1 })
      .eq('id', user.id)
      .select('tickets')
      .single();

    if (updateError) {
      return c.json({ error: 'Failed to use ticket' }, 500);
    }

    return c.json({ success: true, tickets: updatedUser.tickets });
  } catch (error) {
    console.error('Use ticket error:', error);
    return c.json({ error: 'Failed to use ticket' }, 500);
  }
});

// Watch ad and earn ticket
app.post('/make-server-a4a3f409/user/watch-ad', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('tickets, daily_ad_count, last_login')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return c.json({ error: 'Failed to fetch user data' }, 500);
    }

    const today = new Date().toISOString().split('T')[0];
    let { daily_ad_count } = userData;

    // Reset daily counter if it's a new day
    if (userData.last_login !== today) {
      daily_ad_count = 0;
    }

    if (daily_ad_count >= 3) {
      return c.json({ error: 'Daily ad limit reached' }, 400);
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        tickets: userData.tickets + 1,
        daily_ad_count: daily_ad_count + 1,
        last_login: today
      })
      .eq('id', user.id)
      .select('tickets, daily_ad_count')
      .single();

    if (updateError) {
      return c.json({ error: 'Failed to earn ticket' }, 500);
    }

    return c.json({ 
      success: true, 
      tickets: updatedUser.tickets,
      dailyAdCount: updatedUser.daily_ad_count
    });
  } catch (error) {
    console.error('Watch ad error:', error);
    return c.json({ error: 'Failed to watch ad' }, 500);
  }
});

// Save fortune result
app.post('/make-server-a4a3f409/fortune/save', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const fortuneData = await c.req.json();

    const { data: result, error: saveError } = await supabase
      .from('fortune_results')
      .insert([{
        user_id: user.id,
        ...fortuneData
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Fortune save error:', saveError);
      return c.json({ error: 'Failed to save fortune result' }, 500);
    }

    return c.json({ result });
  } catch (error) {
    console.error('Fortune save error:', error);
    return c.json({ error: 'Failed to save fortune result' }, 500);
  }
});

// Get fortune history
app.get('/make-server-a4a3f409/fortune/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data: results, error: fetchError } = await supabase
      .from('fortune_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Fortune history fetch error:', fetchError);
      return c.json({ error: 'Failed to fetch fortune history' }, 500);
    }

    return c.json({ results });
  } catch (error) {
    console.error('Fortune history error:', error);
    return c.json({ error: 'Failed to fetch fortune history' }, 500);
  }
});

// Save chat session
app.post('/make-server-a4a3f409/chat/save', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { chatMode, messages } = await c.req.json();

    const { data: result, error: saveError } = await supabase
      .from('chat_history')
      .insert([{
        user_id: user.id,
        chat_mode: chatMode,
        messages: messages
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Chat save error:', saveError);
      return c.json({ error: 'Failed to save chat session' }, 500);
    }

    return c.json({ result });
  } catch (error) {
    console.error('Chat save error:', error);
    return c.json({ error: 'Failed to save chat session' }, 500);
  }
});

// Get chat history
app.get('/make-server-a4a3f409/chat/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data: results, error: fetchError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Chat history fetch error:', fetchError);
      return c.json({ error: 'Failed to fetch chat history' }, 500);
    }

    return c.json({ results });
  } catch (error) {
    console.error('Chat history error:', error);
    return c.json({ error: 'Failed to fetch chat history' }, 500);
  }
});

// Upgrade to premium
app.post('/make-server-a4a3f409/user/upgrade-premium', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ is_premium: true })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Premium upgrade error:', updateError);
      return c.json({ error: 'Failed to upgrade to premium' }, 500);
    }

    return c.json({ user: updatedUser });
  } catch (error) {
    console.error('Premium upgrade error:', error);
    return c.json({ error: 'Failed to upgrade to premium' }, 500);
  }
});

// Health check
app.get('/make-server-a4a3f409/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log('Starting AI Fortune App server...');
serve(app.fetch);