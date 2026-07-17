'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { UserRound, Copy, Check, X, Search, ExternalLink } from 'lucide-react';

// Personal KvK report card. Player searches their name once (pinned in
// localStorage) and sees THEIR rank, targets and exact gap to pass —
// self-serve answers to "am I OK for KvK?".

export interface ProfilePlayer {
  characterId: number;
  username: string;
  power: number;
  t4Kills: number;
  t5Kills: number;
  totalKP: number;
  simpleDkp: number;
  simpleTarget: number;
  simpleRatio: number;
  simpleStatus: 'PASS' | 'BELOW';
  simpleMinDeads: number;
  simpleTotalDeaths: number;
  simpleDeadsPass: boolean;
}

interface Props {
  players: ProfilePlayer[];
  formula: { t4Kill: number; t5Kill: number; t4Death: number; t5Death: number };
  multiplier: number;
  minDeadsPct: number;
}

const fmtM = (n: number) => `${(n / 1_000_000).toFixed(2)}M`;
const fmtK = (n: number) => `${(n / 1_000).toFixed(0)}K`;
const fmtBig = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return `${Math.round(n)}`;
};

const STORAGE_KEY = 'dkp-warrior-profile-id';

export default function WarriorProfile({ players, formula, multiplier, minDeadsPct }: Props) {
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPinnedId(parseInt(raw, 10) || null);
    } catch {}
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const ranked = useMemo(
    () => [...players].sort((a, b) => b.simpleDkp - a.simpleDkp || b.power - a.power),
    [players]
  );
  const rankById = useMemo(() => {
    const m = new Map<number, number>();
    ranked.forEach((p, i) => m.set(p.characterId, i + 1));
    return m;
  }, [ranked]);

  const me = pinnedId != null ? players.find((p) => p.characterId === pinnedId) ?? null : null;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return players
      .filter((p) => p.username.toLowerCase().includes(q) || String(p.characterId).includes(q))
      .slice(0, 8);
  }, [players, query]);

  const pin = (id: number) => {
    setPinnedId(id);
    setOpen(false);
    setQuery('');
    try { localStorage.setItem(STORAGE_KEY, String(id)); } catch {}
  };
  const unpin = () => {
    setPinnedId(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Gap math — what it takes to pass, in the player's own numbers
  const gaps = useMemo(() => {
    if (!me) return null;
    const dkpGap = Math.max(0, me.simpleTarget - me.simpleDkp);
    const deadsGap = Math.max(0, me.simpleMinDeads - me.simpleTotalDeaths);
    return {
      dkpGap,
      deadsGap,
      t5KillsNeeded: formula.t5Kill > 0 ? Math.ceil(dkpGap / formula.t5Kill) : 0,
      t4KillsNeeded: formula.t4Kill > 0 ? Math.ceil(dkpGap / formula.t4Kill) : 0,
      t5DeadsNeeded: formula.t5Death > 0 ? Math.ceil(dkpGap / formula.t5Death) : 0,
    };
  }, [me, formula]);

  const copyCard = async () => {
    if (!me || !gaps) return;
    const rank = rankById.get(me.characterId) ?? 0;
    const pct = Math.max(1, Math.round((rank / Math.max(1, ranked.length)) * 100));
    const lines = [
      `⚔️ ${me.username} — Kingdom 3709 KvK Card`,
      `Rank #${rank} of ${ranked.length} (top ${pct}%)`,
      `Power ${fmtM(me.power)} · KP ${fmtBig(me.totalKP)}`,
      `DKP ${fmtBig(me.simpleDkp)} / ${fmtBig(me.simpleTarget)} (${((me.simpleDkp / Math.max(1, me.simpleTarget)) * 100).toFixed(0)}%) — ${me.simpleStatus}`,
      `Deads ${fmtK(me.simpleTotalDeaths)} / ${fmtK(me.simpleMinDeads)} min — ${me.simpleDeadsPass ? 'MET' : 'BELOW'}`,
      gaps.dkpGap > 0
        ? `To pass: ~${fmtBig(gaps.t5KillsNeeded)} T5 kills OR ~${fmtBig(gaps.t4KillsNeeded)} T4 kills OR ~${fmtBig(gaps.t5DeadsNeeded)} T5 deads`
        : `Requirement met — hold the line.`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const dkpPct = me ? Math.min(100, (me.simpleDkp / Math.max(1, me.simpleTarget)) * 100) : 0;
  const deadsPct = me ? Math.min(100, (me.simpleTotalDeaths / Math.max(1, me.simpleMinDeads)) * 100) : 0;
  const rank = me ? rankById.get(me.characterId) ?? 0 : 0;
  const percentile = me ? Math.max(1, Math.round((rank / Math.max(1, ranked.length)) * 100)) : 0;

  return (
    <section className="mb-6 rounded-xl border border-[var(--gold)]/25 bg-[var(--background-card)] shadow-[var(--card-shadow)] overflow-hidden">
      <div className="px-4 sm:px-5 py-3 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
        <UserRound size={16} className="text-[var(--gold)] flex-shrink-0" />
        <h2 className="text-sm font-semibold text-[var(--foreground)] flex-1">My Warrior Profile</h2>
        {me && (
          <button onClick={unpin} className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1">
            <X size={12} /> change
          </button>
        )}
      </div>

      {!me ? (
        <div className="p-4 sm:p-5" ref={boxRef}>
          <p className="text-xs text-[var(--text-muted)] mb-2">
            Find yourself once — your card is saved on this device.
          </p>
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Your governor name or ID…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]/50"
            />
            {open && suggestions.length > 0 && (
              <div className="absolute z-30 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background-card)] shadow-xl overflow-hidden">
                {suggestions.map((p) => (
                  <button
                    key={p.characterId}
                    onClick={() => pin(p.characterId)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--background-hover)] flex items-center justify-between gap-3"
                  >
                    <span className="text-[var(--foreground)] truncate">{p.username}</span>
                    <span className="text-xs text-[var(--text-muted)] font-mono flex-shrink-0">{fmtM(p.power)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="font-display text-xl font-bold text-[var(--gold)]">{me.username}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                Rank <span className="text-[var(--foreground)] font-semibold">#{rank}</span> of {ranked.length}
                <span className="mx-1.5">·</span>top {percentile}%
                <span className="mx-1.5">·</span>{fmtM(me.power)} power
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                  me.simpleStatus === 'PASS'
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {me.simpleStatus === 'PASS' ? 'PASSING' : 'BELOW TARGET'}
              </span>
              <Link
                href={`/governor/${me.characterId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--gold)]/40 transition-colors"
              >
                <ExternalLink size={12} /> Full profile
              </Link>
              <button
                onClick={copyCard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--gold)]/40 transition-colors"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy my card'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* DKP progress */}
            <div>
              <div className="flex items-baseline justify-between text-xs mb-1.5">
                <span className="uppercase tracking-wider text-[var(--text-muted)]">DKP vs target (power × {multiplier})</span>
                <span className="font-mono text-[var(--text-secondary)]">
                  {fmtBig(me.simpleDkp)} / {fmtBig(me.simpleTarget)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                <div
                  className={`h-full ${me.simpleStatus === 'PASS' ? 'bg-gradient-to-r from-green-600 to-emerald-400' : 'bg-gradient-to-r from-[#8B0000] to-[#DC143C]'}`}
                  style={{ width: `${dkpPct}%` }}
                />
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{dkpPct.toFixed(0)}% of requirement</div>
            </div>

            {/* Deads progress */}
            <div>
              <div className="flex items-baseline justify-between text-xs mb-1.5">
                <span className="uppercase tracking-wider text-[var(--text-muted)]">Deads vs minimum ({minDeadsPct}% of power)</span>
                <span className="font-mono text-[var(--text-secondary)]">
                  {fmtK(me.simpleTotalDeaths)} / {fmtK(me.simpleMinDeads)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                <div
                  className={`h-full ${me.simpleDeadsPass ? 'bg-gradient-to-r from-green-600 to-emerald-400' : 'bg-gradient-to-r from-[#8B0000] to-[#DC143C]'}`}
                  style={{ width: `${deadsPct}%` }}
                />
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                {me.simpleDeadsPass ? 'Minimum met' : `${fmtK(Math.max(0, me.simpleMinDeads - me.simpleTotalDeaths))} more deads needed`}
              </div>
            </div>
          </div>

          {/* What passing takes */}
          {gaps && gaps.dkpGap > 0 && (
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/50 px-3.5 py-2.5 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--gold)] font-semibold uppercase tracking-wider mr-2">To pass:</span>
              ~<span className="font-mono text-[var(--foreground)]">{fmtBig(gaps.t5KillsNeeded)}</span> T5 kills
              <span className="mx-1.5 text-[var(--text-muted)]">or</span>
              ~<span className="font-mono text-[var(--foreground)]">{fmtBig(gaps.t4KillsNeeded)}</span> T4 kills
              <span className="mx-1.5 text-[var(--text-muted)]">or</span>
              ~<span className="font-mono text-[var(--foreground)]">{fmtBig(gaps.t5DeadsNeeded)}</span> T5 deads
            </div>
          )}
        </div>
      )}
    </section>
  );
}
