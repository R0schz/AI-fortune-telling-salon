'use client';

import React from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Sparkles, 
  MessageCircle, 
  User, 
  LogOut,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  const { user, isLoggedIn, supabase } = useSupabase();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('サインアウトエラー:', error);
    }
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold text-foreground">AI占いサロン</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
              ホーム
            </Link>
            <Link href="/fortune" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Sparkles className="w-4 h-4" />
              占い
            </Link>
            <Link href="/chat" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-4 h-4" />
              チャット
            </Link>
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'ユーザー'} />
                      <AvatarFallback>
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.user_metadata?.full_name && (
                        <p className="font-medium">{user.user_metadata.full_name}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      プロフィール
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      設定
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    サインアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost">ログイン</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>新規登録</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
