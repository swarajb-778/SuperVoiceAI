import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatTimeAgo(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPrice(priceMin: number | null, priceMax: number | null, priceType: string): string {
  if (priceType === 'call_for_price') return 'Call for Price';
  if (priceType === 'fixed' && priceMin !== null) return `$${priceMin.toFixed(2)}`;
  if (priceType === 'starting_at' && priceMin !== null) return `Starting at $${priceMin.toFixed(2)}`;
  if (priceType === 'range' && priceMin !== null && priceMax !== null) {
    return `$${priceMin.toFixed(2)} - $${priceMax.toFixed(2)}`;
  }
  return 'Price not set';
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function calculateConversionRate(booked: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((booked / total) * 100 * 10) / 10;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    no_show: 'bg-gray-100 text-gray-600 border-gray-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    abandoned: 'bg-red-100 text-red-700 border-red-200',
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    qualified: 'bg-purple-100 text-purple-700 border-purple-200',
    converted: 'bg-green-100 text-green-700 border-green-200',
    lost: 'bg-gray-100 text-gray-600 border-gray-200',
    positive: 'bg-green-100 text-green-700 border-green-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
    negative: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}

export function buildEmbedCode(
  businessId: string,
  appUrl: string,
  options?: { position?: string; primaryColor?: string }
): string {
  const pos = options?.position || 'bottom-right';
  return `<!-- CarBot AI Voice Widget -->
<script src="${appUrl}/widget.js"></script>
<script>
  CarBot.init({
    businessId: "${businessId}",
    position: "${pos}",
  });
</script>`;
}
