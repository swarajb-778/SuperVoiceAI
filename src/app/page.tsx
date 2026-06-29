import Link from 'next/link'
import Script from 'next/script'
import {
  Mic,
  Calendar,
  BarChart3,
  Code2,
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
  Bot,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  PhoneCall,
  MessageSquare,
  Users,
  Globe,
  Lock,
  Activity,
  Headphones,
  Play,
  ChevronDown,
  Wrench,
  PlugZap,
  BrainCircuit,
  BadgeCheck,
  PhoneIncoming,
  Timer,
  Repeat2,
  SlidersHorizontal,
  LineChart,
  Twitter,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'

/* ─── Data ───────────────────────────────────────────────────────── */

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Live Demo', href: '#demo' },
  { label: 'Integrations', href: '#integration' },
  { label: 'Pricing', href: '#pricing' },
]

const heroStats = [
  { value: '24/7', label: 'Availability', icon: Clock },
  { value: '<1s', label: 'Voice Latency', icon: Zap },
  { value: '3×', label: 'More Bookings', icon: TrendingUp },
  { value: '98%', label: 'Satisfaction Rate', icon: BadgeCheck },
]

const bentoFeatures = [
  {
    size: 'large',
    icon: BrainCircuit,
    accent: '#22c55e',
    tag: 'AI Core',
    title: 'GPT-4o Realtime Voice',
    desc: "Sub-second latency, natural turn-taking, interruption handling. Customers forget they're talking to an AI.",
    extra: null,
  },
  {
    size: 'small',
    icon: Calendar,
    accent: '#8b5cf6',
    tag: 'Scheduling',
    title: 'Smart Appointment Booking',
    desc: 'Books against your real availability. No double-bookings.',
    extra: null,
  },
  {
    size: 'small',
    icon: PhoneIncoming,
    accent: '#f59e0b',
    tag: 'Always On',
    title: '24/7 Call Handling',
    desc: 'After hours, holidays, weekends — every call answered.',
    extra: null,
  },
  {
    size: 'small',
    icon: LineChart,
    accent: '#22c55e',
    tag: 'Analytics',
    title: 'Live Conversation Analytics',
    desc: 'Track calls, sentiment, conversion and booking trends.',
    extra: null,
  },
  {
    size: 'small',
    icon: SlidersHorizontal,
    accent: '#f97316',
    tag: 'Customizable',
    title: 'Fully Configurable Agent',
    desc: 'Voice, personality, FAQs, services — all yours.',
    extra: null,
  },
  {
    size: 'small',
    icon: PlugZap,
    accent: '#ec4899',
    tag: 'One-Line Setup',
    title: 'Instant Website Embed',
    desc: 'One script tag. Works on any site, any platform.',
    extra: null,
  },
  {
    size: 'small',
    icon: Shield,
    accent: '#22c55e',
    tag: 'Security',
    title: 'Enterprise-Grade RLS',
    desc: 'Row-level security. Isolated data. No key exposure.',
    extra: null,
  },
]

const steps = [
  {
    num: '01',
    icon: Users,
    title: 'Set Up Your Business',
    desc: 'Add your services, FAQs, pricing, and business hours. Takes under 10 minutes.',
    highlight: 'Business profile ready in minutes',
  },
  {
    num: '02',
    icon: Bot,
    title: 'Configure Your AI Agent',
    desc: 'Choose a voice, personality, and greeting. The AI learns your specific shop details.',
    highlight: 'Trained on your exact services',
  },
  {
    num: '03',
    icon: Globe,
    title: 'Embed on Your Website',
    desc: 'Paste one script tag. Customers can instantly call your AI receptionist.',
    highlight: 'Live in under 30 seconds',
  },
  {
    num: '04',
    icon: BarChart3,
    title: 'Watch Bookings Grow',
    desc: 'Every call is logged, transcribed, and turned into booked appointments.',
    highlight: 'Zero missed opportunities',
  },
]

const testimonials = [
  {
    quote:
      'Our missed call rate dropped to zero overnight. CarBot handles every inquiry, books appointments, and even upsells service packages. Best investment we made this year.',
    author: 'Mike Thompson',
    role: 'Owner',
    business: 'Premier Auto Repair, Austin TX',
    rating: 5,
    metric: '0 missed calls',
  },
  {
    quote:
      "I was skeptical about AI handling customer calls, but the voice quality is incredible. Customers genuinely can't tell they're talking to a bot. Bookings up 40%.",
    author: 'Sarah Lin',
    role: 'General Manager',
    business: 'Quick Lube Plus, Chicago IL',
    rating: 5,
    metric: '+40% bookings',
  },
  {
    quote:
      'ROI in the first week. The AI booked $2,400 in appointments that would have gone to voicemail. It pays for itself ten times over every month.',
    author: 'James Rivera',
    role: 'Co-Owner',
    business: 'Riverside Motors, Miami FL',
    rating: 5,
    metric: '$2,400 week 1',
  },
  {
    quote:
      'Setup was surprisingly fast. We had it live on our website in 20 minutes. The dashboard analytics help us understand what customers are calling about.',
    author: 'David Chen',
    role: 'Operations Director',
    business: 'Pacific Auto Group, Seattle WA',
    rating: 5,
    metric: 'Live in 20 min',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever · self-hosted',
    desc: 'Perfect for a single shop testing AI voice.',
    features: [
      '1 Business profile',
      '1 AI Voice Agent',
      'Unlimited conversations',
      'Appointment booking',
      'Analytics dashboard',
      'Embeddable widget',
      'Conversation transcripts',
    ],
    cta: 'Get Started Free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: 'per month',
    desc: 'For growing shops that need more power.',
    features: [
      'Multiple businesses',
      'Unlimited AI agents',
      'Priority support',
      'Custom domains',
      'Advanced analytics',
      'API access',
      'White-label widget',
    ],
    cta: 'Join Waitlist',
    href: '/signup',
    highlight: true,
    badge: 'Coming Soon',
  },
]

const footerLinks = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Status'],
  Company: ['About', 'Careers', 'Privacy', 'Terms'],
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function LandingPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const demoBizId = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || '';

  return (
    <div className="min-h-screen bg-[#050a0e] text-white font-sans antialiased overflow-x-hidden">
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,10,14,0.95) 0%, rgba(5,10,14,0.6) 100%)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                boxShadow: '0 0 20px rgba(34,197,94,0.4)',
              }}
            >
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">
              CarBot <span className="text-green-400">AI</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-4 py-2 text-[13px] font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 text-[13px] font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg text-white transition-all duration-150"
              style={{
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                boxShadow: '0 1px 2px rgba(22,163,74,0.4)',
              }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background layers */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.15) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 20% 80%, rgba(16,185,129,0.08) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 40% 40% at 80% 60%, rgba(139,92,246,0.06) 0%, transparent 50%)',
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              {/* Pill */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-8"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  color: '#4ade80',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Powered by OpenAI GPT-4o Realtime
                <Sparkles className="w-3 h-3" />
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
                Your Shop
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg,#4ade80,#bbf7d0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Never Misses
                </span>
                <br />a Call Again
              </h1>

              <p className="text-[17px] text-gray-400 leading-relaxed mb-8 max-w-lg">
                Deploy an AI voice receptionist that answers calls, books appointments, and captures
                leads — 24/7, while you focus on the repairs.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-semibold rounded-xl text-white transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                    boxShadow: '0 0 0 1px rgba(34,197,94,0.3), 0 4px 24px rgba(34,197,94,0.25)',
                  }}
                >
                  Start Free — No Card Needed
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-semibold rounded-xl transition-all duration-150 hover:bg-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                  }}
                >
                  <Play className="w-4 h-4 text-green-400" />
                  Watch Demo
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex -space-x-2">
                  {['MT', 'SL', 'JR', 'DC'].map((init, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#050a0e] flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `hsl(${140 + i * 20},60%,35%)` }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">Trusted by 200+ auto repair shops</p>
                </div>
              </div>
            </div>

            {/* Right — Dashboard preview mockup */}
            <div className="relative hidden lg:block">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                }}
              >
                {/* Mock titlebar */}
                <div
                  className="flex items-center gap-1.5 px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <div className="flex-1 flex justify-center">
                    <div
                      className="px-4 py-1 rounded-md text-[11px] text-gray-500"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      app.carbot.ai/dashboard
                    </div>
                  </div>
                </div>
                {/* Mock dashboard content */}
                <div className="p-5 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Calls Today', value: '24', change: '+8', color: '#22c55e' },
                      { label: 'Bookings', value: '17', change: '+5', color: '#8b5cf6' },
                      { label: 'Conversion', value: '71%', change: '+3%', color: '#22c55e' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <div className="text-[10px] text-gray-500 mb-1">{s.label}</div>
                        <div className="text-[20px] font-bold text-white">{s.value}</div>
                        <div className="text-[10px] font-medium" style={{ color: s.color }}>
                          {s.change} today
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Chart placeholder */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-end gap-1.5 h-16">
                      {[30, 55, 40, 70, 60, 85, 75, 90, 65, 80, 95, 72, 88, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm transition-all"
                          style={{
                            height: `${h}%`,
                            background: i === 13 ? '#22c55e' : 'rgba(34,197,94,0.3)',
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2">14-day conversation trend</div>
                  </div>
                  {/* Live call indicator */}
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <PhoneIncoming className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold text-green-300">
                        Live call in progress
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Oil change + tire rotation inquiry
                      </div>
                    </div>
                    <div className="flex gap-1 items-end h-4">
                      {[3, 5, 4, 6, 3, 5].map((h, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-green-500 rounded-full"
                          style={{
                            height: `${h * 3}px`,
                            animation: `wave 1.2s ease-in-out ${i * 0.15}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow behind card */}
              <div
                className="absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-20"
                style={{ background: 'radial-gradient(ellipse at 50% 50%, #22c55e, transparent)' }}
              />
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {heroStats.map(({ value, label, icon: Icon }, i) => (
              <div
                key={label}
                className="flex items-center gap-4 px-8 py-6"
                style={{ background: 'rgba(5,10,14,0.6)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                  }}
                >
                  <Icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[11px] text-gray-500">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-gray-500 animate-bounce" />
        </div>
      </section>

      {/* ── FEATURES BENTO ──────────────────────────────────────── */}
      <section id="features" className="py-28 px-6" style={{ background: '#07100f' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#4ade80',
              }}
            >
              <Zap className="w-3 h-3" /> Core Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything your shop
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg,#4ade80,#bbf7d0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                needs to grow
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Production-ready from day one. Not a demo. Not a mockup. Real AI, real data, real
              results.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Large hero feature */}
            <div
              className="md:col-span-2 lg:col-span-2 rounded-2xl p-8 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg,rgba(34,197,94,0.1),rgba(16,185,129,0.05))',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30"
                style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold mb-5"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                >
                  <BrainCircuit className="w-3 h-3" /> AI Core
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                  GPT-4o Realtime Voice Engine
                </h3>
                <p className="text-gray-400 text-[14px] leading-relaxed mb-6">
                  Sub-second latency, natural turn-taking, smart interruption handling. Customers
                  have genuine conversations — not menu trees.
                </p>
                {/* Waveform viz */}
                <div className="flex items-end gap-1 h-10">
                  {[4, 7, 5, 9, 6, 8, 5, 10, 7, 6, 9, 5, 8, 6, 10, 7, 5, 8, 6, 9].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h * 10}%`,
                        background: `rgba(34,197,94,${0.3 + (i % 3) * 0.2})`,
                        animation: `wave 1.2s ease-in-out ${i * 0.07}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-[11px] text-green-400/60 mt-2">
                  Live voice waveform simulation
                </div>
              </div>
            </div>

            {/* Regular features */}
            {[
              {
                icon: Calendar,
                accent: '#8b5cf6',
                tag: 'Scheduling',
                title: 'Smart Appointment Booking',
                desc: 'Checks real availability and books directly — no double bookings, ever.',
              },
              {
                icon: Timer,
                accent: '#f59e0b',
                tag: 'Always On',
                title: '24/7 — Nights & Weekends',
                desc: 'Every call answered even when your shop is closed.',
              },
              {
                icon: LineChart,
                accent: '#22c55e',
                tag: 'Analytics',
                title: 'Conversation Intelligence',
                desc: 'Sentiment, topics, conversion rates — all tracked automatically.',
              },
              {
                icon: SlidersHorizontal,
                accent: '#f97316',
                tag: 'Config',
                title: 'Fully Configurable',
                desc: 'Voice, personality, FAQs, services. Train on your exact business.',
              },
              {
                icon: PlugZap,
                accent: '#ec4899',
                tag: 'Embed',
                title: 'One Script Tag Setup',
                desc: 'Works on WordPress, Wix, Webflow, Squarespace — any platform.',
              },
              {
                icon: Shield,
                accent: '#22c55e',
                tag: 'Security',
                title: 'Enterprise Security',
                desc: 'Row-level security, isolated data, zero permanent key exposure.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 relative overflow-hidden group cursor-default hover:scale-[1.02] transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ background: f.accent }}
                />
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold mb-4"
                  style={{ background: `${f.accent}15`, color: f.accent }}
                >
                  <f.icon className="w-2.5 h-2.5" /> {f.tag}
                </div>
                <h3 className="text-[14px] font-bold text-white mb-2 leading-snug">{f.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: '#050a0e' }}
      >
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#4ade80',
              }}
            >
              <Repeat2 className="w-3 h-3" /> Quick Setup
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              From zero to AI receptionist
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg,#4ade80,#86efac)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                in under 30 minutes
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              No engineering degree required. If you can copy-paste, you can deploy this.
            </p>
          </div>

          {/* Steps — alternating layout */}
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
              >
                {/* Visual */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <div
                      className="rounded-2xl p-8 relative overflow-hidden"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div
                        className="absolute top-4 right-4 text-[64px] font-black tabular-nums leading-none select-none"
                        style={{ color: 'rgba(255,255,255,0.03)' }}
                      >
                        {step.num}
                      </div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                        style={{
                          background: 'rgba(34,197,94,0.1)',
                          border: '1px solid rgba(34,197,94,0.2)',
                        }}
                      >
                        <step.icon className="w-6 h-6 text-green-400" />
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {step.highlight}
                      </div>
                    </div>
                    {/* Connector */}
                    {i < steps.length - 1 && (
                      <div
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-8"
                        style={{
                          background: 'linear-gradient(to bottom,rgba(34,197,94,0.4),transparent)',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 max-w-md">
                  <div className="text-[11px] font-bold text-green-400/60 uppercase tracking-widest mb-3">
                    Step {step.num}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-[15px] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: '#07100f' }}>
        <div
          className="absolute right-0 top-0 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
                style={{
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: '#fbbf24',
                }}
              >
                <Star className="w-3 h-3 fill-amber-400" /> Reviews
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Shops that
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  never look back
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-3xl font-bold text-white">
                  4.9<span className="text-amber-400">/5</span>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">200+ verified reviews</div>
              </div>
            </div>
          </div>

          {/* 2-column testimonial grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={t.author}
                className={`rounded-2xl p-7 relative overflow-hidden ${i === 0 ? 'md:row-span-1' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Quote mark */}
                <div
                  className="absolute top-4 right-6 text-[80px] font-black leading-none select-none"
                  style={{ color: 'rgba(255,255,255,0.03)' }}
                >
                  "
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-[15px] text-gray-300 leading-relaxed mb-6">"{t.quote}"</p>
                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
                    >
                      {t.author
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white">{t.author}</div>
                      <div className="text-[11px] text-gray-500">
                        {t.role} · {t.business}
                      </div>
                    </div>
                  </div>
                  {/* Metric badge */}
                  <div
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      color: '#4ade80',
                    }}
                  >
                    {t.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATION / CODE ──────────────────────────────────── */}
      <section
        id="integration"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: '#050a0e' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-6"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  color: '#4ade80',
                }}
              >
                <Code2 className="w-3 h-3" /> Integration
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Add it to your site
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg,#4ade80,#16a34a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  in 30 seconds
                </span>
              </h2>
              <p className="text-gray-400 text-[16px] leading-relaxed mb-8">
                Copy two lines. Paste before the closing body tag. Works on WordPress, Squarespace,
                Wix, Webflow, custom HTML — everything.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: Globe, text: 'Works on any website platform' },
                  { icon: Zap, text: 'No server setup or configuration needed' },
                  { icon: Lock, text: 'Business ID is public-safe — no keys exposed' },
                  { icon: Wrench, text: 'Fully customizable widget appearance' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(34,197,94,0.1)' }}
                    >
                      <Icon className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <span className="text-[14px] text-gray-400">{text}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-3 text-[13px] font-semibold rounded-xl text-white transition-all duration-150"
                style={{
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  boxShadow: '0 0 0 1px rgba(34,197,94,0.3)',
                }}
              >
                Get Your Embed Code
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — code block */}
            <div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#0d1117',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              >
                {/* Window chrome */}
                <div
                  className="flex items-center gap-2 px-5 py-3.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span
                    className="ml-3 text-[11px] font-mono"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    index.html
                  </span>
                </div>
                {/* Code */}
                <div className="p-6 font-mono text-[13px] leading-loose overflow-x-auto">
                  <div style={{ color: '#6b7280' }}>{'<!-- Paste before </body> -->'}</div>
                  <div className="mt-3">
                    <span style={{ color: '#f97316' }}>{'<script '}</span>
                    <span style={{ color: '#4ade80' }}>src</span>
                    <span style={{ color: '#e2e8f0' }}>=</span>
                    <span style={{ color: '#4ade80' }}>
                      "https://yourapp.com/api/widget-script"
                    </span>
                    <span style={{ color: '#f97316' }}>{' />'}</span>
                  </div>
                  <div className="mt-2">
                    <span style={{ color: '#f97316' }}>{'<script>'}</span>
                  </div>
                  <div className="ml-6">
                    <span style={{ color: '#e2e8f0' }}>CarBot.</span>
                    <span style={{ color: '#4ade80' }}>init</span>
                    <span style={{ color: '#e2e8f0' }}>{'({'}</span>
                  </div>
                  <div className="ml-12">
                    <span style={{ color: '#fbbf24' }}>businessId</span>
                    <span style={{ color: '#e2e8f0' }}>: </span>
                    <span style={{ color: '#4ade80' }}>"your-business-id"</span>
                    <span style={{ color: '#e2e8f0' }}>,</span>
                  </div>
                  <div className="ml-12">
                    <span style={{ color: '#fbbf24' }}>position</span>
                    <span style={{ color: '#e2e8f0' }}>: </span>
                    <span style={{ color: '#4ade80' }}>"bottom-right"</span>
                    <span style={{ color: '#e2e8f0' }}>,</span>
                  </div>
                  <div className="ml-6">
                    <span style={{ color: '#e2e8f0' }}>{'})'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#f97316' }}>{'</script>'}</span>
                  </div>
                </div>
                {/* Footer bar */}
                <div
                  className="flex items-center gap-2 px-5 py-3"
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px]" style={{ color: '#4ade80' }}>
                    Widget active — listening for calls
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO SECTION ───────────────────────────────────── */}
      <section
        id="demo"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: '#07100f' }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.07) 0%, transparent 65%)',
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-7"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#4ade80',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Demo — No Login Required
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-[1.1]">
                Talk to our AI
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg,#4ade80,#bbf7d0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  receptionist now
                </span>
              </h2>

              <p className="text-gray-400 text-[16px] leading-relaxed mb-10 max-w-md">
                Click the green phone button in the bottom-right corner. Ask it anything — services,
                pricing, hours, or how to book an appointment. This is exactly what your customers
                will experience.
              </p>

              {/* Feature checklist */}
              <div className="space-y-4">
                {[
                  {
                    icon: Headphones,
                    title: 'Natural voice conversation',
                    desc: 'Speaks and listens like a real receptionist',
                  },
                  {
                    icon: Zap,
                    title: 'Sub-second response time',
                    desc: 'No awkward pauses — instant GPT-4o Realtime',
                  },
                  {
                    icon: Calendar,
                    title: 'Can book appointments',
                    desc: 'Try asking "I need an oil change tomorrow"',
                  },
                  {
                    icon: MessageSquare,
                    title: 'Full conversation transcript',
                    desc: 'Every word captured in real time',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.2)',
                      }}
                    >
                      <Icon className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white">{title}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual call-to-action card */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-sm rounded-2xl p-8 text-center overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.04))',
                  border: '1px solid rgba(34,197,94,0.2)',
                  boxShadow: '0 0 60px rgba(34,197,94,0.08)',
                }}
              >
                {/* Top glow */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 blur-3xl opacity-30 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse, #22c55e, transparent)' }}
                />

                {/* Animated orb */}
                <div className="relative flex items-center justify-center mb-6">
                  {/* Outer pulse ring */}
                  <div
                    className="absolute w-32 h-32 rounded-full"
                    style={{
                      background: 'rgba(34,197,94,0.08)',
                      animation: 'demo-pulse-outer 2.2s ease-out infinite',
                    }}
                  />
                  {/* Middle ring */}
                  <div
                    className="absolute w-24 h-24 rounded-full"
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      animation: 'demo-pulse-outer 2.2s ease-out 0.4s infinite',
                    }}
                  />
                  {/* Button */}
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                      boxShadow: '0 8px 32px rgba(34,197,94,0.5), 0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    <PhoneCall className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="text-[18px] font-bold text-white mb-2">Try It Right Now</div>
                <p className="text-[13px] text-gray-400 mb-6 leading-relaxed">
                  Our AI demo agent is live and ready to chat. Click the{' '}
                  <span style={{ color: '#4ade80' }}>green phone button</span> in the corner.
                </p>

                {/* Suggested questions */}
                <div className="space-y-2 text-left">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-3"
                    style={{ color: '#3d5060' }}
                  >
                    Try asking…
                  </div>
                  {[
                    '"What services do you offer?"',
                    '"How much is an oil change?"',
                    '"Can I book for tomorrow at 10am?"',
                    '"What are your business hours?"',
                  ].map((q) => (
                    <div
                      key={q}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px]"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: '#94a3b8',
                      }}
                    >
                      <MessageSquare className="w-3 h-3 flex-shrink-0" style={{ color: '#22c55e' }} />
                      {q}
                    </div>
                  ))}
                </div>

                {/* Arrow hint */}
                <div className="mt-6 flex items-center justify-center gap-2 text-[12px]" style={{ color: '#4ade80' }}>
                  <span>Click the phone button below</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes demo-pulse-outer {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: '#07100f' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#4ade80',
              }}
            >
              <BadgeCheck className="w-3 h-3" /> Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-gray-400 text-lg">
              You bring the OpenAI key. We provide everything else.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-8"
                style={
                  plan.highlight
                    ? {
                        background:
                          'linear-gradient(135deg,rgba(34,197,94,0.1),rgba(16,185,129,0.05))',
                        border: '1px solid rgba(34,197,94,0.3)',
                        boxShadow: '0 0 0 1px rgba(34,197,94,0.1), 0 20px 40px rgba(34,197,94,0.1)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }
                }
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="px-4 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider text-white"
                      style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.badge && (
                  <span
                    className="absolute top-5 right-5 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider"
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      border: '1px solid rgba(251,191,36,0.2)',
                      color: '#fbbf24',
                    }}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  {plan.name}
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black text-white tabular-nums">{plan.price}</span>
                  {plan.price !== 'Free' && (
                    <span className="text-gray-500 text-[14px] mb-2">/ mo</span>
                  )}
                </div>
                <div className="text-[12px] text-gray-500 mb-2">{plan.period}</div>
                <p
                  className="text-[13px] text-gray-400 mb-7 pb-7"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {plan.desc}
                </p>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(34,197,94,0.15)' }}
                      >
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-[13px] text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="block w-full text-center py-3 rounded-xl text-[13px] font-bold transition-all duration-150"
                  style={
                    plan.highlight
                      ? {
                          background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                          color: '#fff',
                          boxShadow: '0 2px 12px rgba(34,197,94,0.3)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#e2e8f0',
                        }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ note */}
          <p className="text-center text-[12px] text-gray-600 mt-10">
            Questions?{' '}
            <a
              href="mailto:support@carbot.ai"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              support@carbot.ai
            </a>
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: '#050a0e' }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <Headphones className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Stop losing calls.
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg,#4ade80,#bbf7d0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Start booking more.
            </span>
          </h2>
          <p className="text-gray-400 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Join 200+ auto repair shops that never miss a customer call. Setup takes less than 30
            minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-bold rounded-xl text-white transition-all duration-150 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                boxShadow: '0 0 0 1px rgba(34,197,94,0.3), 0 8px 32px rgba(34,197,94,0.3)',
              }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold rounded-xl transition-all duration-150 hover:bg-white/10"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af',
              }}
            >
              Sign In
            </Link>
          </div>
          <p className="text-[12px] text-gray-600 mt-5">
            No credit card required · Free plan available · Deploy in 30 min
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ background: '#030609', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Top row */}
          <div className="grid md:grid-cols-5 gap-10 mb-16">
            {/* Brand col */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
                >
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] font-bold">
                  CarBot <span className="text-green-400">AI</span>
                </span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6 max-w-xs">
                AI voice receptionist platform built for auto repair businesses. Never miss a call,
                never miss a booking.
              </p>
              <div className="flex gap-3">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-white"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#6b7280',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-4">
                  {group}
                </div>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[12px] text-gray-600">© 2026 CarBot AI. All rights reserved.</p>
            <div className="flex items-center gap-2 text-[12px] text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </div>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[12px] text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── LIVE DEMO WIDGET — home page only ───────────────────── */}
      {demoBizId && (
        <Script id="carbot-demo-init" strategy="afterInteractive">
          {`
            (function() {
              if (window.location.pathname !== '/') return;
              var s = document.createElement('script');
              s.src = '${appUrl}/widget.js';
              s.onload = function() {
                CarBot.init({ businessId: '${demoBizId}', position: 'bottom-right' });
              };
              document.body.appendChild(s);
            })();
          `}
        </Script>
      )}
    </div>
  )
}
