import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CarBot AI - AI Voice Receptionist for Auto Repair',
    template: '%s | CarBot AI',
  },
  description: 'AI-powered voice receptionist platform for auto repair businesses. Book appointments, answer questions, and capture leads 24/7.',
  keywords: ['AI receptionist', 'auto repair', 'voice AI', 'appointment booking'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
