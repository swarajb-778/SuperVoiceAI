import Link from 'next/link';
import { Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center mb-6">
        <Phone className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-surface-200 mb-3">404</h1>
      <h2 className="text-lg font-semibold text-surface-900 mb-2">Page not found</h2>
      <p className="text-sm text-surface-500 mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
