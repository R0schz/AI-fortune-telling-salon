export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  birth_date?: string;
  zodiac_sign?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  name?: string;
  avatar_url?: string;
  birth_date?: string;
  zodiac_sign?: string;
}

export interface UserStats {
  totalFortunes: number;
  totalChats: number;
  memberSince: string;
  lastActive: string;
}
