
"use client"; 
import React from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProvider from '@/context/AppContext'; 
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import AuthInitializer from '@/components/AuthInitializer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthInitializer>
              <AppProvider> 
                <div className="flex flex-col min-h-screen">
                  {children}
                </div>
                <Toaster />
              </AppProvider>
            </AuthInitializer>
          </QueryClientProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
