'use client';

import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/dashboard':               { title: 'Overview',      sub: 'Business performance at a glance' },
  '/dashboard/agents':        { title: 'AI Agents',     sub: 'Configure voice agent personalities' },
  '/dashboard/appointments':  { title: 'Appointments',  sub: 'Track bookings and schedule' },
  '/dashboard/conversations': { title: 'Conversations', sub: 'Call history and transcripts' },
  '/dashboard/services':      { title: 'Services',      sub: 'Manage your service catalog' },
  '/dashboard/faqs':          { title: 'FAQs',          sub: 'Train your AI with answers' },
  '/dashboard/widget':        { title: 'Widget',        sub: 'Embed settings and code' },
  '/dashboard/analytics':     { title: 'Analytics',     sub: 'Performance insights' },
  '/dashboard/settings':      { title: 'Settings',      sub: 'Business profile and configuration' },
};

function getDynamicPage(pathname: string) {
  if (/^\/dashboard\/agents\/[^/]+$/.test(pathname))
    return { title: 'Agent Studio', sub: 'Configure and test live voice' };
  return null;
}

interface NavbarProps { onMenuClick: () => void; }

export function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();

  const getPage = () => {
    const dynamic = getDynamicPage(pathname);
    if (dynamic) return dynamic;
    const key = '/' + pathname.split('/').filter(Boolean).slice(0, 2).join('/');
    return pageTitles[key] || pageTitles[pathname] || { title: 'Dashboard', sub: '' };
  };

  const page = getPage();

  return (
    <header className="h-14 flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-10"
      style={{ background: 'rgba(8,14,16,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: '#4b6070' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#4b6070'; }}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col leading-none">
          <h1 className="text-[14px] font-bold text-slate-100 tracking-tight">{page.title}</h1>
          {page.sub && <p className="text-[11px] mt-0.5" style={{ color: '#3d5060' }}>{page.sub}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-lg transition-all duration-150 group"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#3d5060' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#3d5060'; }}>
          <Search className="w-3.5 h-3.5" />
          <span className="text-[12px]">Search...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ml-1"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#3d5060' }}>⌘K</kbd>
        </button>

        {/* Bell */}
        <button className="relative p-1.5 rounded-lg transition-colors"
          style={{ color: '#4b6070' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#4b6070'; }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg transition-all duration-150"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
            CA
          </div>
          <ChevronDown className="w-3 h-3" style={{ color: '#3d5060' }} />
        </button>
      </div>
    </header>
  );
}
