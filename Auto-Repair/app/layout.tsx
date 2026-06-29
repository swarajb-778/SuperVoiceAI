import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProFix Auto Repair — Trusted Auto Service',
  description: 'Expert auto repair and maintenance. Book your appointment today or speak with our AI receptionist 24/7.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
