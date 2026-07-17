'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, UserRound, Copy, Check, Shield, Swords, Skull, Heart,
  Users, Sprout, Crown, Trophy,
} from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { loadGovernorProfile, type GovernorProfile, type MgeHistoryEntry } from '@/lib/governor/profile';

const fmtM = (n: number) => `${(n / 1_000_000).toFixed(2)}M`;
const fmtBig = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return `${Math.round(n)}`;
};
const fmtInt = (n: number) => Math.round(n).toLocaleString();

const STATUS_STYLE: Record<MgeHistoryEntry['status'], { label: string; cls: string }> = {
  won: { label: 'WON', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  approved: { label: 'Approved', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
  pending: { label: 'Pending', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
  waitlisted: { label: 'Waitlisted', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
  declined: { label: 'Declined', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' },
  withdrawn: { label: 'Withdrawn', cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25' },
};

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
        {icon}{label}
      </div>
      <div className="text-lg font-semibold text-[var(--foreground)] tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function GovernorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<GovernorProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notfound'>('loading');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    loadGovernorProfile(id)
      .then((p) => { if (cancelled) return; setProfile(p); setState(p ? 'ready' : 'notfound'); })
      .catch(() => { if (!cancelled) setState('notfound'); });
    return () => { cancelled = true; };
  }, [id]);

  const copyLink = async () => {
    if (!profile) return;
    const url = `${window.location.origin}/governor/${profile.standing.characterId}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <AppSidebar>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/governor" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] mb-5">
          <ArrowLeft size={15} /> All governors
        </Link>

        {state === 'loading' && (
          <div className="py-20 text-center text-sm text-[var(--text-muted)]">Loading profile…</div>
        )}

        {state === 'notfound' && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-10 text-center">
            <UserRound size={34} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-base font-semibold text-[var(--foreground)] mb-1">Governor not found</p>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
              No one in the latest kingdom scan matches &ldquo;{decodeURIComponent(id)}&rdquo;. They may have left the kingdom,
              changed names since the last scan, or the name/ID is off.
            </p>
            <Link href="/governor" className="inline-block mt-5 text-sm text-[var(--gold)] hover:underline">Search all governors →</Link>
          </div>
        )}

        {state === 'ready' && profile && (() => {
          const s = profile.standing;
          const dkpPct = Math.min(100, (s.simpleDkp / Math.max(1, s.simpleTarget)) * 100);
          const deadsPct = Math.min(100, (s.totalDeaths / Math.max(1, s.minDeads)) * 100);
          const dkpGap = Math.max(0, s.simpleTarget - s.simpleDkp);
          return (
            <>
              {/* Header */}
              <div className="rounded-xl border border-[var(--gold)]/25 bg-[var(--background-card)] overflow-hidden mb-5">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--gold)] leading-tight break-words">{s.username}</h1>
                      <div className="text-xs text-[var(--text-muted)] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-mono">ID {s.characterId}</span>
                        {profile.alliance && <><span>·</span><span>{profile.alliance}</span></>}
                        <span>·</span><span>{fmtM(s.power)} power</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                        s.simpleStatus === 'PASS' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>{s.simpleStatus === 'PASS' ? 'PASSING' : 'BELOW TARGET'}</span>
                      <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--gold)]/40 transition-colors">
                        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}{copied ? 'Copied' : 'Copy link'}
                      </button>
                    </div>
                  </div>

                  {/* Rank ribbon */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-baseline gap-1.5">
                      <Trophy size={15} className="text-[var(--gold)] self-center" />
                      <span className="text-2xl font-bold text-[var(--foreground)] font-display">#{s.rank}</span>
                      <span className="text-sm text-[var(--text-muted)]">of {s.total}</span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">top <span className="text-[var(--gold)] font-semibold">{s.percentile}%</span> by DKP</div>
                    <div className="text-sm text-[var(--text-secondary)]">DKP <span className="font-mono text-[var(--foreground)]">{fmtBig(s.simpleDkp)}</span></div>
                  </div>
                </div>
              </div>

              {/* KvK standing */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={15} className="text-[var(--gold)]" />
                  <h2 className="font-display text-sm font-semibold tracking-wide text-[var(--foreground)]">KvK Requirement</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="uppercase tracking-wider text-[var(--text-muted)]">DKP vs target</span>
                      <span className="font-mono text-[var(--text-secondary)]">{fmtBig(s.simpleDkp)} / {fmtBig(s.simpleTarget)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                      <div className={`h-full ${s.simpleStatus === 'PASS' ? 'bg-gradient-to-r from-green-600 to-emerald-400' : 'bg-gradient-to-r from-[#8B0000] to-[#DC143C]'}`} style={{ width: `${dkpPct}%` }} />
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">{dkpPct.toFixed(0)}% of requirement</div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="uppercase tracking-wider text-[var(--text-muted)]">Deads vs minimum</span>
                      <span className="font-mono text-[var(--text-secondary)]">{fmtBig(s.totalDeaths)} / {fmtBig(s.minDeads)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                      <div className={`h-full ${s.deadsPass ? 'bg-gradient-to-r from-green-600 to-emerald-400' : 'bg-gradient-to-r from-[#8B0000] to-[#DC143C]'}`} style={{ width: `${deadsPct}%` }} />
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">{s.deadsPass ? 'Minimum met' : `${fmtBig(Math.max(0, s.minDeads - s.totalDeaths))} more deads needed`}</div>
                  </div>
                </div>
                {dkpGap > 0 && (
                  <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/50 px-3.5 py-2.5 text-xs text-[var(--text-secondary)]">
                    <span className="text-[var(--gold)] font-semibold uppercase tracking-wider mr-2">To pass:</span>
                    <span className="font-mono text-[var(--foreground)]">{fmtBig(dkpGap)}</span> more DKP —
                    about <span className="font-mono text-[var(--foreground)]">{fmtBig(Math.ceil(dkpGap / 10))}</span> T5 kills
                    or <span className="font-mono text-[var(--foreground)]">{fmtBig(Math.ceil(dkpGap / 24))}</span> T5 deads.
                  </div>
                )}
              </div>

              {/* Combat stats */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <Swords size={15} className="text-[var(--gold)]" />
                  <h2 className="font-display text-sm font-semibold tracking-wide text-[var(--foreground)]">Combat Record</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={<Swords size={12} />} label="Kill Points" value={fmtBig(s.totalKP)} />
                  <StatCard icon={<Swords size={12} />} label="T5 Kills" value={fmtBig(s.t5Kills)} sub={`T4 ${fmtBig(s.t4Kills)}`} />
                  <StatCard icon={<Skull size={12} />} label="Deads" value={fmtBig(s.totalDeaths)} sub={`T5 ${fmtBig(s.t5Deaths)} · T4 ${fmtBig(s.t4Deaths)}`} />
                  <StatCard icon={<Heart size={12} />} label="Honor" value={fmtBig(s.honorPoints)} />
                  <StatCard icon={<Shield size={12} />} label="Power" value={fmtM(s.power)} sub={s.highestPower > s.power ? `peak ${fmtM(s.highestPower)}` : undefined} />
                  <StatCard icon={<Sprout size={12} />} label="Gathered" value={fmtBig(s.rssGathered)} />
                  <StatCard icon={<Users size={12} />} label="Alliance Helps" value={fmtInt(s.allianceHelps)} />
                  <StatCard icon={<Crown size={12} />} label="DKP Score" value={fmtBig(s.simpleDkp)} />
                </div>
              </div>

              {/* MGE history */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={15} className="text-[var(--gold)]" />
                  <h2 className="font-display text-sm font-semibold tracking-wide text-[var(--foreground)]">MGE History</h2>
                </div>
                {profile.mge.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No MGE applications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {profile.mge.map((m) => {
                      const st = STATUS_STYLE[m.status];
                      return (
                        <div key={m.eventId} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/40 px-3 py-2.5">
                          <span className="text-xs font-mono text-[var(--text-muted)] w-24 shrink-0">{m.eventDate}</span>
                          <span className="text-sm text-[var(--text-muted)]">{m.eventTheme}</span>
                          <span className="text-sm font-medium text-[var(--foreground)]">{m.commander}</span>
                          <span className="ml-auto flex items-center gap-2">
                            {m.tier && <span className="text-xs text-[var(--gold)]">{m.tier}</span>}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${st.cls}`}>{st.label}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[var(--text-muted)] text-center mt-5">
                Standing from the latest kingdom scan. Baseline scans show 0 kills/deads until a real KvK-period scan is uploaded on the DKP page.
              </p>
            </>
          );
        })()}
      </div>
    </AppSidebar>
  );
}
