'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mic, Eye, EyeOff, CheckCircle2, ArrowRight, Mail, Zap, Star, Users, TrendingUp, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createBusiness } from '@/services/business';
import { signupSchema, type SignupFormData } from '@/validations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const benefits = [
  { icon: CheckCircle2, text: 'No credit card required' },
  { icon: CheckCircle2, text: 'Set up in under 3 minutes' },
  { icon: CheckCircle2, text: 'Cancel anytime' },
];

const testimonial = {
  quote: 'CarBot handles all our after-hours calls. We went from missing 40% of leads to capturing nearly all of them.',
  author: 'Mike R.',
  role: 'Owner, Premier Auto Repair',
  rating: 5,
};

const stats = [
  { icon: Users, value: '500+', label: 'Auto Shops' },
  { icon: TrendingUp, value: '40%', label: 'More Leads' },
  { icon: Star, value: '4.9★', label: 'Rating' },
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError('');
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) { setServerError(authError.message); return; }
    if (authData.user) {
      try { await createBusiness(authData.user.id, { name: data.business_name, timezone: 'America/New_York' }); } catch { /* ok */ }
      if (authData.session) { router.push('/dashboard'); router.refresh(); }
      else setStep('success');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#080e10' }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse,#22c55e,transparent 70%)' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-10 max-w-[420px] w-full text-center relative"
          style={{ background: '#0d1518', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a)' }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-[20px] font-bold mb-2 tracking-tight" style={{ color: '#f1f5f9' }}>Check your email</h2>
          <p className="text-[13px] mb-2 leading-relaxed" style={{ color: '#4b6070' }}>
            We sent a confirmation link to your email address.
          </p>
          <p className="text-[13px] mb-7 leading-relaxed" style={{ color: '#4b6070' }}>
            Click the link to activate your account and access your dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full" size="lg">Back to Sign In</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080e10' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0a1a10 0%,#080e10 60%,#061209 100%)' }}>
        {/* Decorative glow orbs */}
        <div className="absolute top-[-80px] right-[-40px] w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)' }} />
        <div className="absolute bottom-[15%] left-[-60px] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(34,197,94,0.1) 0%,transparent 70%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 0 24px rgba(34,197,94,0.45)' }}>
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[20px] font-bold tracking-tight" style={{ color: '#f1f5f9' }}>
                CarBot <span style={{ color: '#4ade80' }}>AI</span>
              </span>
              <p className="text-[11px] leading-none mt-0.5" style={{ color: '#3d5060' }}>AI Voice Receptionist Platform</p>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#4ade80' }}>Join 500+ auto shops today</span>
            </div>

            <h2 className="text-[36px] font-bold leading-[1.15] tracking-tight mb-4" style={{ color: '#f1f5f9' }}>
              Start capturing<br />
              <span style={{ background: 'linear-gradient(90deg,#4ade80,#bbf7d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                every lead
              </span><br />
              automatically.
            </h2>
            <p className="text-[14px] leading-relaxed mb-10" style={{ color: '#4b6070', maxWidth: '340px' }}>
              Your AI receptionist is live in minutes. No tech skills needed — just paste one line of code into your website.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: '#4ade80' }} />
                  <p className="text-[16px] font-bold" style={{ color: '#f1f5f9' }}>{value}</p>
                  <p className="text-[10px]" style={{ color: '#4b6070' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" style={{ color: '#4ade80' }} />
                ))}
              </div>
              <p className="text-[12px] leading-relaxed mb-3 italic" style={{ color: '#94a3b8' }}>
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="text-[11px] font-semibold" style={{ color: '#e2e8f0' }}>{testimonial.author}</p>
              <p className="text-[10px]" style={{ color: '#4b6070' }}>{testimonial.role}</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 flex items-center gap-2 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4ade80' }} />
          <p className="text-[11px]" style={{ color: '#3d5060' }}>
            Your data is encrypted and never shared. Enterprise-grade security by default.
          </p>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-[20px] font-bold tracking-tight" style={{ color: '#f1f5f9' }}>
            CarBot <span style={{ color: '#4ade80' }}>AI</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-7">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: '#22c55e', color: '#080e10' }}>1</div>
              <span className="text-[11px] font-medium" style={{ color: '#4ade80' }}>Create account</span>
            </div>
            <div className="flex-1 h-[1px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#4b6070' }}>2</div>
              <span className="text-[11px]" style={{ color: '#4b6070' }}>Configure agent</span>
            </div>
            <div className="flex-1 h-[1px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#4b6070' }}>3</div>
              <span className="text-[11px]" style={{ color: '#4b6070' }}>Go live</span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-7 relative" style={{ background: '#0d1518', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a)' }} />

            <h1 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: '#f1f5f9' }}>Create your account</h1>
            <p className="text-[13px] mb-6" style={{ color: '#4b6070' }}>Free to start — bring your own OpenAI key</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Business Name" type="text" placeholder="Premier Auto Repair" error={errors.business_name?.message} {...register('business_name')} />
              <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] transition-colors" style={{ color: '#4b6070' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#4b6070'; }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {serverError && (
                <div className="px-3 py-2.5 rounded-lg text-[12px] font-medium" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="w-full" size="lg" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Create Account
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                  <p className="text-[11px]" style={{ color: '#4b6070' }}>{text}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-[12px] mt-4" style={{ color: '#4b6070' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold transition-colors" style={{ color: '#4ade80' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#22c55e'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#4ade80'; }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Bottom note */}
          <p className="text-center text-[11px] mt-5" style={{ color: '#2d4050' }}>
            By creating an account you agree to our{' '}
            <span style={{ color: '#3d5060' }}>Terms of Service</span>
            {' '}&amp;{' '}
            <span style={{ color: '#3d5060' }}>Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
