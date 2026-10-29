'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { SWRConfig } from 'swr';
import { AuthProvider } from '@/hooks/use-auth';
import { fetcher } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: '!rounded-2xl !border-2 !border-ink !bg-surface !text-fg !shadow-brutal !font-sans',
                description: '!text-muted',
              },
            }}
          />
        </AuthProvider>
      </SWRConfig>
    </ThemeProvider>
  );
}
