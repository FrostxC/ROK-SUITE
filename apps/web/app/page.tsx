'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { createClient, fetchAllRows } from '@/lib/supabase/client';
import {
  Swords,
  GitBranch,
  ExternalLink,
  Calendar,
  Shield,
  Map,
  BarChart3,
  Calculator,
  Sigma,
  Users,
  ScrollText,
  Trophy,
  ClipboardList,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// ---------------------------------------------------------------------------
// Count-up numeral — animates from 0 when scrolled into view
// ---------------------------------------------------------------------------
function useInView<T extends HTMLElement>(threshold = 0.3) {
  // Callback-ref version: re-attaches the observer whenever the element
  // actually mounts (conditionally-rendered sections mount late).
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [node, threshold]);
  return { ref: setNode, inView };
}

function CountUp({ value, inView }: { value: number; inView: boolean }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView || value <= 0) return;
    const dur = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <>{formatBig(display)}</>;
}

function formatBig(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// Scroll-triggered reveal wrapper — releases children when they enter view
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// Deterministic pseudo-random embers (stable across renders)
const EMBERS = Array.from({ length: 16 }, (_, i) => {
  const seed = (i * 2654435761) % 1000 / 1000;
  const seed2 = (i * 1597334677) % 1000 / 1000;
  return {
    left: `${4 + seed * 92}%`,
    delay: `${(seed2 * 14).toFixed(1)}s`,
    duration: `${(9 + seed * 10).toFixed(1)}s`,
    drift: `${Math.round((seed2 - 0.5) * 130)}px`,
    opacity: 0.35 + seed2 * 0.5,
    size: 2 + Math.round(seed * 2),
  };
});

export default function Home() {
  const t = useTranslations('home');
  const heroRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const stats = useInView<HTMLDivElement>(0.35);
  const [kingdom, setKingdom] = useState<{ power: number; kills: number; warriors: number } | null>(null);
  const [topWarriors, setTopWarriors] = useState<{ name: string; power: number }[]>([]);

  // Top warriors banner — from the bundled kingdom dataset
  useEffect(() => {
    let cancelled = false;
    fetch('/data/players_data.json')
      .then((r) => r.json())
      .then((players: { username: string; power: number }[]) => {
        if (cancelled || !Array.isArray(players)) return;
        const top = [...players]
          .sort((a, b) => (b.power || 0) - (a.power || 0))
          .slice(0, 12)
          .map((p) => ({ name: p.username, power: p.power }));
        setTopWarriors(top);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Parallax — hero background only, rAF-throttled. The page scrolls inside the
  // AppSidebar <main> container (not the window), so listen there.
  useEffect(() => {
    const scroller = heroRef.current?.closest('main') ?? null;
    const target: HTMLElement | Window = scroller || window;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (fogRef.current) {
          const y = Math.min(scroller ? scroller.scrollTop : window.scrollY, 900);
          fogRef.current.style.transform = `translateY(${y * 0.28}px)`;
        }
      });
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => { target.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // Kingdom stat band — bundled kingdom dataset paints immediately; the live
  // roster overwrites it if/when the database responds with data.
  useEffect(() => {
    let cancelled = false;
    fetch('/data/players_data.json')
      .then((r) => r.json())
      .then((players: { power: number; totalKP?: number }[]) => {
        if (cancelled || !Array.isArray(players) || !players.length) return;
        setKingdom((k) => k ?? {
          power: players.reduce((s, p) => s + (p.power || 0), 0),
          kills: players.reduce((s, p) => s + (p.totalKP || 0), 0),
          warriors: players.length,
        });
      })
      .catch(() => {});
    (async () => {
      try {
        const supabase = createClient();
        const rows = await fetchAllRows<{ power: number | null; kills: number | null }>((range) =>
          supabase.from('alliance_roster').select('power,kills').eq('is_active', true).range(range.from, range.to)
        );
        if (cancelled || !rows.length) return;
        setKingdom({
          power: rows.reduce((s, r) => s + (r.power || 0), 0),
          kills: rows.reduce((s, r) => s + (r.kills || 0), 0),
          warriors: rows.length,
        });
      } catch {
        /* bundled numbers already shown */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Crimson scroll-progress bar (the page scrolls inside the AppSidebar <main>)
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = progressRef.current?.closest('main');
    if (!scroller) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const bar = progressRef.current?.firstElementChild as HTMLElement | null;
        if (!bar) return;
        const max = scroller.scrollHeight - scroller.clientHeight;
        bar.style.width = max > 0 ? `${(scroller.scrollTop / max) * 100}%` : '0%';
      });
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => { scroller.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // 3D tilt for tool cards (pointer devices only)
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-3px)`;
  };
  const resetTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  };

  const tools = [
    { href: '/calendar', titleKey: 'tools.calendar.title', descriptionKey: 'tools.calendar.description', icon: Calendar },
    { href: '/alliance-calculator', titleKey: 'tools.allianceCalculator.title', descriptionKey: 'tools.allianceCalculator.description', icon: Calculator },
    { href: '/calculators', titleKey: 'tools.calculators.title', descriptionKey: 'tools.calculators.description', icon: Sigma },
    { href: '/commanders', titleKey: 'tools.commanders.title', descriptionKey: 'tools.commanders.description', icon: Users },
    { href: '/equipment', titleKey: 'tools.equipment.title', descriptionKey: 'tools.equipment.description', icon: Shield },
    { href: '/rok-mail', titleKey: 'tools.rokMail.title', descriptionKey: 'tools.rokMail.description', icon: ScrollText },
    { href: '/dkp', titleKey: 'tools.dkp.title', descriptionKey: 'tools.dkp.description', icon: Trophy },
    { href: '/migration', titleKey: 'tools.migration.title', descriptionKey: 'tools.migration.description', icon: ClipboardList },
    { href: '/aoo-strategy', titleKey: 'tools.aoo.title', descriptionKey: 'tools.aoo.description', icon: Swords },
    { href: '/mge', titleKey: 'tools.mge.title', descriptionKey: 'tools.mge.description', icon: Shield },
    { href: '/kingdom/kingdom-stats', titleKey: 'tools.kingdomStats.title', descriptionKey: 'tools.kingdomStats.description', icon: BarChart3 },
    { href: '/kvk-map', titleKey: 'tools.kvkMap.title', descriptionKey: 'tools.kvkMap.description', icon: Map },
    { href: '/apply', titleKey: 'tools.applyLeader.title', descriptionKey: 'tools.applyLeader.description', icon: UserPlus },
  ] as const;

  return (
    <AppSidebar>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Scroll progress */}
        <div ref={progressRef} className="scroll-progress"><div /></div>
        {/* ============================== HERO ============================== */}
        <section
          ref={heroRef}
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{ minHeight: 'calc(100vh - 56px)' }}
        >
          {/* Atmosphere — layered fog + mountain silhouettes (pure CSS) */}
          <div ref={fogRef} className="absolute inset-0 will-change-transform" aria-hidden>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 55% at 50% -12%, rgba(139,0,0,0.22), transparent 60%),' +
                  'radial-gradient(ellipse 70% 45% at 18% 108%, rgba(201,169,97,0.07), transparent 55%),' +
                  'radial-gradient(ellipse 80% 50% at 85% 112%, rgba(139,0,0,0.14), transparent 58%)',
              }}
            />
            <div
              className="fog-layer absolute inset-x-[-10%] bottom-0 h-[46%]"
              style={{
                background:
                  'radial-gradient(ellipse 55% 88% at 28% 100%, rgba(20,20,22,0.9), transparent 70%),' +
                  'radial-gradient(ellipse 60% 95% at 72% 100%, rgba(14,14,16,0.95), transparent 72%)',
              }}
            />
            {/* Jagged peaks */}
            <svg className="absolute bottom-0 inset-x-0 w-full h-[30%] opacity-70" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden>
              <path d="M0,220 L0,150 L90,92 L170,150 L260,60 L350,140 L430,100 L520,170 L620,40 L730,150 L820,90 L910,160 L1010,70 L1100,140 L1200,110 L1200,220 Z" fill="#0D0D0F" />
              <path d="M0,220 L0,190 L120,140 L230,190 L330,120 L460,195 L580,110 L700,190 L830,130 L950,195 L1080,150 L1200,185 L1200,220 Z" fill="#111113" />
            </svg>
            {/* Embers */}
            {EMBERS.map((e, i) => (
              <span
                key={i}
                className="ember"
                style={{
                  left: e.left,
                  width: e.size,
                  height: e.size,
                  animationDelay: e.delay,
                  animationDuration: e.duration,
                  ['--ember-x' as string]: e.drift,
                  ['--ember-o' as string]: e.opacity,
                }}
              />
            ))}
          </div>

          {/* Hero content */}
          <div className="relative z-10 text-center px-4 pt-10">
            <p className="section-label anim-rise mb-6" style={{ animationDelay: '0.1s' }}>
              {t('tagline')}
            </p>
            <h1
              className="hero-title relative text-[2.6rem] sm:text-[4.6rem] lg:text-[7rem]"
              aria-label="EMBERFALL"
            >
              {'EMBERFALL'.split('').map((ch, i) => (
                <span
                  key={i}
                  className="hero-letter-wrap"
                  aria-hidden
                  style={{ animationDelay: `${0.28 + i * 0.05}s` }}
                >
                  <span className="hero-letter" style={{ animationDelay: `${0.25 + i * 0.09}s` }}>
                    {ch}
                  </span>
                </span>
              ))}
              <span className="hero-arrow" aria-hidden>
                <span className="hero-arrow-inner">
                  <svg viewBox="0 0 220 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="arrowTrail" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#DC143C" stopOpacity="0" />
                        <stop offset="0.65" stopColor="#E8C77B" stopOpacity="0.55" />
                        <stop offset="1" stopColor="#F5E6C4" stopOpacity="0.95" />
                      </linearGradient>
                      <radialGradient id="headGlow" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0" stopColor="#F5E6C4" stopOpacity="0.65" />
                        <stop offset="0.5" stopColor="#DC143C" stopOpacity="0.28" />
                        <stop offset="1" stopColor="#DC143C" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="trailGlow" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0" stopColor="#E8C77B" stopOpacity="0.28" />
                        <stop offset="1" stopColor="#E8C77B" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <g transform="translate(0,5)">
                      {/* baked glow (replaces CSS drop-shadow filters) */}
                      <ellipse cx="205" cy="9" rx="26" ry="12" fill="url(#headGlow)" />
                      <ellipse cx="150" cy="9" rx="70" ry="8" fill="url(#trailGlow)" />
                      {/* ember trail */}
                      <rect x="0" y="8.25" width="168" height="1.5" fill="url(#arrowTrail)" />
                      {/* shaft */}
                      <rect x="150" y="8" width="52" height="2" rx="1" fill="#E8C77B" />
                      {/* fletching */}
                      <path d="M150 9 L141 3.5 L146.5 9 L141 14.5 Z" fill="#C9A961" />
                      <path d="M158 9 L149 3.5 L154.5 9 L149 14.5 Z" fill="#C9A961" opacity="0.75" />
                      {/* arrowhead */}
                      <path d="M202 9 L219 9 M202 4.5 L219 9 L202 13.5 Z" fill="#F5E6C4" />
                    </g>
                  </svg>
                </span>
              </span>
            </h1>
            <p
              className="anim-rise mt-5 text-sm sm:text-base tracking-[0.24em] uppercase text-[var(--gold)]/80 font-medium"
              style={{ animationDelay: '0.45s' }}
            >
              {t('subtitle')}
            </p>

            <div className="anim-rise mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.6s' }}>
              <Link
                href="/mge"
                className="shine-sweep group relative px-8 py-3.5 rounded-[8px] font-semibold text-sm tracking-[0.14em] uppercase text-white bg-gradient-to-b from-[#DC143C] to-[#8B0000] border border-[#DC143C]/40 shadow-[0_6px_28px_rgba(139,0,0,0.45)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(220,20,60,0.55)] hover:-translate-y-0.5"
              >
                Apply for MGE
              </Link>
              <a
                href="#war-room"
                className="px-8 py-3.5 rounded-[8px] font-semibold text-sm tracking-[0.14em] uppercase text-[var(--gold)] border border-[var(--gold)]/30 bg-transparent transition-all duration-300 hover:border-[var(--gold)]/70 hover:bg-[var(--gold)]/5 hover:-translate-y-0.5"
              >
                Enter the War Room
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <a href="#war-room" className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors" aria-label="Scroll down">
            <span className="text-[9px] uppercase tracking-[0.3em]">Descend</span>
            <ChevronDown className="scroll-indicator w-4 h-4" />
          </a>
        </section>

        {/* ============================ STAT BAND ============================ */}
        {kingdom && (
          <section className="relative border-y border-[var(--border)] bg-[var(--background-secondary)]/60">
            <div ref={stats.ref} className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { label: 'Kingdom Power', value: kingdom.power },
                { label: 'Enemies Slain', value: kingdom.kills },
                { label: 'Sworn Warriors', value: kingdom.warriors },
              ].filter((s) => s.value > 0).map((s) => (
                <div key={s.label}>
                  <div className="font-display text-4xl sm:text-5xl font-bold text-[var(--gold)] tabular-nums">
                    <CountUp value={s.value} inView={stats.inView} />
                  </div>
                  <div className="section-label mt-2.5">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================ WAR CRY ============================ */}
        <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,0,0,0.08), transparent 70%)' }}
          />
          <Reveal className="relative max-w-3xl mx-auto text-center">
            <blockquote className="warcry text-2xl sm:text-4xl text-[var(--foreground)]">
              &ldquo;Victorious warriors <span className="warcry-accent">win first</span> and then go
              to war — defeated warriors go to war first and then seek to win.&rdquo;
            </blockquote>
            <div className="divider-ornament mt-8 max-w-xs mx-auto">
              <span className="divider-gem" />
            </div>
            <p className="section-label mt-4">Sun Tzu · The Art of War</p>
          </Reveal>
        </section>

        {/* ======================= TOP WARRIORS BANNER ======================= */}
        {topWarriors.length > 0 && (
          <section className="marquee-band border-y border-[var(--border)] bg-[var(--background-secondary)]/50 py-3.5">
            <div className="marquee-track">
              {[0, 1].map((dup) => (
                <span key={dup} className="inline-flex items-center" aria-hidden={dup === 1}>
                  {topWarriors.map((w, i) => (
                    <span key={`${dup}-${i}`} className="inline-flex items-center">
                      <span className="font-display text-sm font-bold tracking-[0.14em] uppercase text-[var(--gold)]">
                        {w.name}
                      </span>
                      <span className="ml-2 text-xs font-mono text-[var(--text-muted)]">
                        {formatBig(w.power)}
                      </span>
                      <span className="mx-5 w-1.5 h-1.5 rotate-45 bg-gradient-to-br from-[#C9A961] to-[#8B0000] inline-block" />
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ============================ WAR ROOM ============================ */}
        <div id="war-room" className="max-w-5xl mx-auto px-6 py-20">
          <div className="divider-ornament mb-4">
            <span className="divider-gem" />
          </div>
          <h2 className="text-center font-display text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-[0.08em] uppercase mb-2">
            {t('sections.interactiveTools')}
          </h2>
          <p className="text-center text-sm text-[var(--text-secondary)] mb-12">{t('title')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <Reveal key={tool.href} delay={0.06 * (i % 3)} className="h-full">
                <Link href={tool.href} className="block h-full">
                  <div className="glass-card tilt-card group p-5 h-full cursor-pointer" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-[6px] border border-[var(--gold)]/20 bg-[var(--background-secondary)] text-[var(--gold)] transition-all duration-300 group-hover:border-[var(--crimson)]/50 group-hover:text-[var(--crimson)] group-hover:shadow-[0_0_14px_rgba(220,20,60,0.25)] flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-[var(--foreground)] mb-1 group-hover:text-[var(--gold)] transition-colors duration-300">
                          {t(tool.titleKey)}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {t(tool.descriptionKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
                </Reveal>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="mt-20">
            <div className="divider-ornament mb-8">
              <span className="divider-gem" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs tracking-[0.12em] uppercase text-[var(--text-muted)]">
                {t('footer.copyright')}
              </p>
              <div className="flex items-center gap-6 text-xs uppercase tracking-[0.12em]">
                <a
                  href="https://github.com/avweigel/rok-suite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors flex items-center gap-1.5"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  GitHub
                </a>
                <a
                  href="https://avweigel.github.io/rok-suite/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Docs
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </AppSidebar>
  );
}
