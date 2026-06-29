'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID || '';
const WIDGET_URL = process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:3000';

const services = [
  { icon: '🔧', name: 'Oil Change', desc: 'Full synthetic, semi-synthetic, or conventional. Filter included.', price: 'From $49' },
  { icon: '🛞', name: 'Tire Rotation & Balance', desc: 'Extend tire life and improve fuel economy with regular rotation.', price: 'From $29' },
  { icon: '🛑', name: 'Brake Service', desc: 'Pads, rotors, calipers — full brake inspection and repair.', price: 'From $99' },
  { icon: '❄️', name: 'AC & Heating', desc: 'Recharge, leak detection, and full climate system service.', price: 'From $89' },
  { icon: '⚡', name: 'Battery Replacement', desc: 'Free battery test. We carry all major brands with warranty.', price: 'From $79' },
  { icon: '🔍', name: 'Engine Diagnostics', desc: 'Check engine light? We scan and diagnose all fault codes.', price: 'From $59' },
  { icon: '💧', name: 'Transmission Service', desc: 'Fluid flush, filter change, and full inspection.', price: 'From $129' },
  { icon: '🚗', name: 'Full Vehicle Inspection', desc: '50-point inspection — perfect before a road trip or purchase.', price: 'From $39' },
];

const testimonials = [
  { name: 'James H.', vehicle: '2019 Toyota Camry', stars: 5, text: 'Best auto shop in town. They fixed my brakes quickly and the price was fair. The AI phone assistant was surprisingly helpful — booked my appointment at midnight!' },
  { name: 'Sarah M.', vehicle: '2021 Ford F-150', stars: 5, text: 'Called in for an oil change and the AI receptionist had me booked in under 2 minutes. Showed up and was in and out in 30 minutes. Excellent service.' },
  { name: 'David L.', vehicle: '2017 Honda Civic', stars: 5, text: 'Brought my car in for a mysterious noise. They diagnosed it fast and the repair was done same day. Honest, professional, and affordable.' },
];

const hours = [
  { day: 'Monday – Friday', time: '7:00 AM – 7:00 PM' },
  { day: 'Saturday', time: '8:00 AM – 5:00 PM' },
  { day: 'Sunday', time: 'Closed' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initWidget = () => {
    if (typeof window !== 'undefined' && (window as any).CarBot && BUSINESS_ID) {
      (window as any).CarBot.init({
        businessId: BUSINESS_ID,
        position: 'bottom-right',
      });
      setWidgetReady(true);
    }
  };

  return (
    <>
      {/* Voice Widget Script */}
      {BUSINESS_ID && (
        <Script
          src={`${WIDGET_URL}/api/widget-script`}
          strategy="afterInteractive"
          onLoad={initWidget}
        />
      )}

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className={`font-bold text-lg tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              ProFix Auto
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {['Services', 'About', 'Testimonials', 'Hours', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                  scrolled ? 'text-gray-600' : 'text-white/80'
                }`}
              >
                {item}
              </a>
            ))}
            <a
              href="#contact"
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Now
            </a>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {['Services', 'About', 'Testimonials', 'Hours', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-sm font-medium text-gray-700 py-1"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <a
              href="#contact"
              className="block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center"
              onClick={() => setMenuOpen(false)}
            >
              Book Now
            </a>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 50%, #1d4ed8 0%, transparent 50%), radial-gradient(circle at 75% 30%, #0284c7 0%, transparent 45%)',
            }}
          />
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-32">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-blue-300 text-sm font-medium">AI Receptionist Available 24/7</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Your Car Deserves<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Expert Care
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              ProFix Auto Repair delivers fast, honest, and affordable service for all makes and models.
              Book an appointment in seconds — even after hours with our AI voice receptionist.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 text-base"
              >
                Book Appointment
              </a>
              <a
                href="tel:+15550001234"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-base flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                </svg>
                (555) 000-1234
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-14 flex-wrap">
              {[
                { icon: '⭐', label: '4.9 Rating', sub: '500+ Reviews' },
                { icon: '🔧', label: '15+ Years', sub: 'Experience' },
                { icon: '🛡️', label: 'Warranty', sub: 'On All Work' },
                { icon: '⚡', label: 'Same Day', sub: 'Service' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-xl">{b.icon}</span>
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm leading-tight">{b.label}</div>
                    <div className="text-gray-400 text-xs">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* AI Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AI Voice Receptionist — Active Now</p>
                <p className="text-blue-100 text-xs">Click the phone button in the corner to speak with our AI agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Available 24/7 · No hold time · Instant booking
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">What We Do</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Complete Auto Repair Services</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">
                From routine maintenance to complex repairs — our certified technicians handle it all.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((s) => (
                <div
                  key={s.name}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{s.desc}</p>
                  <span className="text-blue-600 font-semibold text-sm">{s.price}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-gray-500 text-sm">
                Don&apos;t see your service? Our AI receptionist can help.{' '}
                <span className="text-blue-600 font-medium cursor-pointer">Click the phone icon</span> to ask.
              </p>
            </div>
          </div>
        </section>

        {/* About / Why Choose Us */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: image placeholder */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <div className="text-7xl mb-4">🔧</div>
                    <p className="font-bold text-xl">ProFix Auto Repair</p>
                    <p className="text-blue-200 text-sm mt-1">Since 2009</p>
                  </div>
                </div>
                {/* Stat card */}
                <div className="absolute -bottom-5 -right-5 bg-blue-600 text-white rounded-2xl px-5 py-4 shadow-xl">
                  <div className="text-3xl font-extrabold">15+</div>
                  <div className="text-blue-100 text-sm">Years of Service</div>
                </div>
              </div>

              {/* Right: content */}
              <div>
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">About Us</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                  Honest Repairs.<br />Fair Prices. Fast Turnaround.
                </h2>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  ProFix Auto Repair has been serving our community since 2009. Our ASE-certified technicians
                  treat every vehicle like their own — with quality parts, transparent pricing, and no surprise charges.
                </p>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  We&apos;ve also partnered with cutting-edge AI technology to make booking easier than ever.
                  Our AI voice receptionist is available 24/7 to answer questions, check availability, and
                  schedule appointments — even at 2 AM.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '✅', label: 'ASE Certified Techs' },
                    { icon: '💰', label: 'Price Match Guarantee' },
                    { icon: '🚗', label: 'All Makes & Models' },
                    { icon: '📱', label: '24/7 AI Booking' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-gray-700 text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Reviews</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What Our Customers Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex gap-1 mb-3">
                    {[...Array(t.stars)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.vehicle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hours + Contact */}
        <section id="hours" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Hours */}
              <div className="bg-gray-950 rounded-2xl p-8 text-white">
                <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">Hours</p>
                <h3 className="text-2xl font-extrabold mb-6">Business Hours</h3>
                <div className="space-y-3">
                  {hours.map((h) => (
                    <div key={h.day} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                      <span className="text-gray-300 text-sm">{h.day}</span>
                      <span className={`text-sm font-semibold ${h.time === 'Closed' ? 'text-red-400' : 'text-white'}`}>
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-300 text-sm font-medium mb-1">After Hours?</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Our AI voice receptionist takes calls and books appointments 24/7 — even on holidays.
                    Click the phone icon in the corner to try it now.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div id="contact">
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Contact</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Get In Touch</h3>
                <div className="space-y-4 mb-8">
                  {[
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                        </svg>
                      ),
                      label: 'Phone',
                      value: '(555) 000-1234',
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ),
                      label: 'Email',
                      value: 'service@profixauto.com',
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ),
                      label: 'Address',
                      value: '1247 Mechanic Ave, Austin, TX 78701',
                    },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        {c.icon}
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-medium">{c.label}</div>
                        <div className="text-gray-800 font-medium text-sm mt-0.5">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <p className="font-bold text-gray-900 mb-1">Book via AI Voice Agent</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Speak with our AI receptionist to check availability and book your appointment instantly.
                  </p>
                  <button
                    onClick={() => {
                      const fab = document.querySelector('.carbot-fab') as HTMLElement;
                      if (fab) fab.click();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Speak with AI Receptionist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to Get Your Car Fixed?
            </h2>
            <p className="text-blue-100 mb-8 text-base">
              Book in seconds with our AI receptionist or call us directly. No waiting, no hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const fab = document.querySelector('.carbot-fab') as HTMLElement;
                  if (fab) fab.click();
                }}
                className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Talk to AI Receptionist
              </button>
              <a
                href="tel:+15550001234"
                className="border-2 border-white/50 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                Call (555) 000-1234
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="text-white font-semibold">ProFix Auto Repair</span>
            </div>
            <p className="text-sm text-center">© {new Date().getFullYear()} ProFix Auto. 1247 Mechanic Ave, Austin TX · (555) 000-1234</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 font-medium">AI Agent Online</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
