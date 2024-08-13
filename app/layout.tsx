import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Chatbot',
  description: '--',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider publishableKey='pk_test_bW9kZXN0LXBob2VuaXgtNzUuY2xlcmsuYWNjb3VudHMuZGV2JA'>
      <html lang="en" className={inter.className}>
        <body className="bg-white flex flex-col gap-4">{children}</body>
      </html>
    </ClerkProvider>
  );
}
