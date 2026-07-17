'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, UserRound, Trophy } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { loadStandings, type GovernorStanding } from '@/lib/governor/profile';

const fmtM = (n: number) => `${(n / 1_000_000).toFixed(1)}M`;
const fmtBig = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return `${Math.round(n)}`;
};

export default function GovernorDirectoryPage() {
  const [standings, setStandings] = useState<GovernorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadStandings().then((s) => { if (!cancelled) { setStandings(s); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? standings.filter((s) => s.username.toLowerCase().includes(q) || String(s.characterId).includes(q))
      : standings;
    return list.slice(0, query ? 40 : 100);
  }, [standings, query]);

  return (
    <AppSidebar>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <UserRound className="w-6 h-6 text-[var(--gold)]" />
          <h1 className="font-display text-2xl font-bold tracking-wide text-[var(--foreground)]">Governors</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Every governor&apos;s permanent record — rank, KvK standing and MGE history. Search a name or ID to open a profile,
          or share a link when vetting a migrant.
        </p>

        <div className="relative max-w-md mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search governor name or ID…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]/50"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading kingdom scan…</div>
        ) : standings.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">No kingdom scan available yet. Upload one on the DKP page.</p>
          </div>
        ) : (
          <>
            <div className="text-xs text-[var(--text-muted)] mb-2">
              {query ? `${results.length} match${results.length === 1 ? '' : 'es'}` : `${standings.length} governors · showing top ${results.length} by DKP`}
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] overflow-hidden divide-y divide-[var(--border)]">
              {results.map((s) => (
                <Link
                  key={s.characterId}
                  href={`/governor/${s.characterId}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--background-hover)] transition-colors"
                >
                  <span className="w-12 shrink-0 flex items-center gap-1 text-xs font-mono text-[var(--text-muted)]">
                    <Trophy size={11} className="text-[var(--gold)]/60" />#{s.rank}
                  </span>
                  <span className="flex-1 min-w-0 text-sm font-medium text-[var(--foreground)] truncate">{s.username}</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono hidden sm:block w-24 text-right">DKP {fmtBig(s.simpleDkp)}</span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono w-14 text-right">{fmtM(s.power)}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.simpleStatus === 'PASS' ? 'bg-emerald-400' : 'bg-rose-400/70'}`} title={s.simpleStatus === 'PASS' ? 'Passing' : 'Below target'} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppSidebar>
  );
}
