'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Bot, Calendar, MessageSquare, Wrench,
  HelpCircle, Code2, BarChart3, Settings, Mic, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useBusinessStore } from '@/store/business';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard',               label: 'Overview',       icon: LayoutDashboard, exact: true },
      { href: '/dashboard/analytics',     label: 'Analytics',      icon: BarChart3 },
      { href: '/dashboard/conversations', label: 'Conversations',  icon: MessageSquare },
      { href: '/dashboard/appointments',  label: 'Appointments',   icon: Calendar },
    ],
  },
  {
    label: 'Configure',
    items: [
      { href: '/dashboard/agents',   label: 'AI Agents', icon: Bot },
      { href: '/dashboard/services', label: 'Services',  icon: Wrench },
      { href: '/dashboard/faqs',     label: 'FAQs',      icon: HelpCircle },
      { href: '/dashboard/widget',   label: 'Widget',    icon: Code2 },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { business } = useBusinessStore();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full z-30 flex flex-col transition-transform duration-300 select-none w-[220px]',
        'lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
        style={{ background: '#080e10', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 h-14 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 0 12px rgba(34,197,94,0.35)' }}>
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border-2"
              style={{ borderColor: '#080e10' }} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-tight text-white">CarBot <span className="text-green-400">AI</span></span>
            <span className="text-[10px] text-green-500/70 font-medium mt-0.5">Voice Platform</span>
          </div>
        </div>

        {/* Business badge */}
        {business && (
          <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                {business.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-slate-200 truncate leading-tight">{business.name}</div>
                <div className="text-[10px] truncate" style={{ color: '#3d5060' }}>{business.city || 'Configure location'}</div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2a3f4d' }}>
                  {group.label}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}
                      className={cn('relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-100 group',
                        active ? 'text-green-300 font-semibold' : 'font-medium hover:text-slate-300'
                      )}
                      style={{ color: active ? undefined : '#4b6070' }}>
                      {active && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 rounded-lg"
                          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <item.icon className={cn('w-[15px] h-[15px] flex-shrink-0 relative z-10 transition-colors',
                        active ? 'text-green-400' : 'text-[#2a3f4d] group-hover:text-slate-400'
                      )} />
                      <span className="text-[13px] relative z-10 flex-1">{item.label}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 relative z-10" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-2 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-100 group"
            style={{ color: '#4b6070' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#4b6070'; }}>
            <LogOut className="w-[15px] h-[15px] flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
