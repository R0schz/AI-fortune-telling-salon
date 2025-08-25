import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          birth_date: string | null;
          avatar_url: string | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          birth_date?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          birth_date?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          default_divination: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
          notifications: boolean;
          dark_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_divination?: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
          notifications?: boolean;
          dark_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_divination?: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
          notifications?: boolean;
          dark_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      fortune_results: {
        Row: {
          id: string;
          user_id: string;
          fortune_type: 'personal' | 'compatibility';
          divination_method: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
          input_data: any;
          result_text: string;
          ai_tone: 'gentle' | 'direct';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          fortune_type: 'personal' | 'compatibility';
          divination_method: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
          input_data: any;
          result_text: string;
          ai_tone: 'gentle' | 'direct';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          fortune_type?: 'personal' | 'compatibility';
          divination_method?: 'tarot' | 'numerology' | 'astrology' | 'crystalball';
          input_data?: any;
          result_text?: string;
          ai_tone?: 'gentle' | 'direct';
          created_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          mode: 'free' | 'tarot' | 'numerology' | 'astrology';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          mode: 'free' | 'tarot' | 'numerology' | 'astrology';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          mode?: 'free' | 'tarot' | 'numerology' | 'astrology';
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          type: 'user' | 'ai';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: 'user' | 'ai';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          type?: 'user' | 'ai';
          content?: string;
          created_at?: string;
        };
      };
      user_tickets: {
        Row: {
          id: string;
          user_id: string;
          tickets: number;
          daily_ad_count: number;
          daily_free_used: boolean;
          last_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tickets?: number;
          daily_ad_count?: number;
          daily_free_used?: boolean;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tickets?: number;
          daily_ad_count?: number;
          daily_free_used?: boolean;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient<Database>(supabaseUrl, publicAnonKey);