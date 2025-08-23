import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { AppHeader } from '@/components/shared/AppHeader';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI占いサロン',
  description: '最新のAI技術と伝統的な占術を組み合わせた、新しい占い体験をお届けします。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SupabaseProvider>
          <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
