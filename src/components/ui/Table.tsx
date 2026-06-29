import { cn } from '@/lib/utils';

interface TableProps { children: React.ReactNode; className?: string; }

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        {children}
      </tr>
    </thead>
  );
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap', className)}
      style={{ color: '#4b6070' }}>
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody style={{ borderColor: 'rgba(255,255,255,0.04)' }} className="divide-y">
      {children}
    </tbody>
  );
}

export function TableRow({
  children, className, onClick,
}: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={cn('transition-colors duration-100', onClick && 'cursor-pointer', className)}
      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      onMouseEnter={onClick ? (e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; }) : undefined}
      onMouseLeave={onClick ? (e => { (e.currentTarget as HTMLElement).style.background = ''; }) : undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-[13px]', className)} style={{ color: '#94a3b8' }}>
      {children}
    </td>
  );
}
