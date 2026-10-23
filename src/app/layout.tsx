import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/providers/ClientProviders';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LMLS Cognitive AI - Multi-Domain Workspace',
  description:
    'Advanced multi-domain AI workspace for Academic, Health, and Daily Productivity tasks with adaptive panic levels and live deadline scheduling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070b12] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
