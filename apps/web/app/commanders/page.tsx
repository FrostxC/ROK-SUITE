'use client';

import { useState, useMemo } from 'react';
import { Swords, Search, Info } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { COMMANDER_META, META_PATCH, type Tier } from './meta-data';

const TIER_STYLE: Record<Tier, string> = {
  S: 'bg-gradient-to-br from-rose-500 to-red-600 text-white',
  A: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
  B: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white',
};

const TROOP_COLOR: Record<string, string> = {
  Infantry: 'text-sky-400',
  Cavalry: 'text-emerald-400',
  Archer: 'text-rose-400',
  Leadership: 'text-violet-400',
  Mixed: 'text-amber-400',
};

export default function CommandersPage() {
  const [activeCat, setActiveCat] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMANDER_META.map((cat) => ({
      ...cat,
      pairings: cat.pairings.filter(
        (p) =>
          (activeCat === 'all' || activeCat === cat.id) &&
          (!q ||
            p.primary.toLowerCase().includes(q) ||
            p.secondary.toLowerCase().includes(q) ||
            p.troop.toLowerCase().includes(q))
      ),
    })).filter((cat) => cat.pairings.length > 0);
  }, [activeCat, query]);

  return (
    <AppSidebar>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Swords className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Commander Pairings</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Recommended commander pairs by role, with tier ratings to help you build the right marches.
        </p>

        <div className="flex items-start gap-2 mb-6 text-[11px] text-[var(--text-muted)] bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            {META_PATCH}. The meta shifts every patch — treat this as a starting point, not gospel.
            Tiers are role-relative (S = top pick, A = strong, B = budget/situational).
          </span>
        </div>

        {/* Search + category filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a commander…"
              className="w-full pl-9 pr-3 py-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCat('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCat === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-secondary)]'
              }`}
            >
              All
            </button>
            {COMMANDER_META.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCat === cat.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-secondary)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.id}>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{cat.name}</h2>
              <p className="text-xs text-[var(--text-muted)] mb-3">{cat.desc}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {cat.pairings.map((p, i) => (
                  <div
                    key={i}
                    className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-4 flex gap-3"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${TIER_STYLE[p.tier]}`}>
                      {p.tier}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--foreground)]">
                        {p.primary} <span className="text-[var(--text-muted)]">+</span> {p.secondary}
                      </div>
                      <div className={`text-[11px] font-medium ${TROOP_COLOR[p.troop] || 'text-[var(--text-muted)]'}`}>{p.troop}</div>
                      {p.note && <div className="text-xs text-[var(--text-secondary)] mt-1">{p.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center text-[var(--text-muted)] py-12">No pairings match your search.</div>
          )}
        </div>
      </div>
    </AppSidebar>
  );
}
