'use client';

import { useMemo, useState } from 'react';
import { Shield, Swords, Hammer, ListOrdered, Info } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import equipmentData from '@/data/equipment.json';
import {
  META_BUILDS, PRIORITY, AWAKEN_COST, CRIT_COST, STAT_RULES,
  type Troop, type Mode,
} from './equipment-meta';

const TROOPS: Troop[] = ['Infantry', 'Cavalry', 'Archer'];

const card = 'bg-[var(--background-card)] border border-[var(--border)] rounded-xl';
const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
    active
      ? 'bg-gradient-to-r from-[#8B0000] to-[#A21232] text-white'
      : 'text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-secondary)]'
  }`;

// ── Tab 1: Meta builds ──────────────────────────────────────────────────────
function MetaBuilds() {
  const [troop, setTroop] = useState<Troop>('Infantry');
  const [mode, setMode] = useState<Mode>('openField');
  const build = META_BUILDS.find((b) => b.troop === troop && b.mode === mode)!;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {TROOPS.map((t) => (
          <button key={t} onClick={() => setTroop(t)} className={chip(troop === t)}>{t}</button>
        ))}
        <span className="mx-1 text-[var(--text-muted)]">·</span>
        <button onClick={() => setMode('openField')} className={chip(mode === 'openField')}>Open Field</button>
        <button onClick={() => setMode('rallyGarrison')} className={chip(mode === 'rallyGarrison')}>Rally & Garrison</button>
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]/50 flex items-center gap-2">
          <Shield size={15} className="text-[var(--gold)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {troop} · {mode === 'openField' ? 'Open Field' : 'Rally & Garrison'} — endgame build
          </span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {build.slots.map((s) => (
            <div key={s.slot} className="px-4 py-2.5 flex items-center gap-3">
              <span className="w-20 text-[11px] uppercase tracking-wider text-[var(--text-muted)] flex-shrink-0">{s.slot}</span>
              <span className="text-sm text-[var(--foreground)] font-medium">{s.item}</span>
              {s.note && <span className="text-[11px] text-[var(--gold)]/80">({s.note})</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {build.variants.map((v, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/40 px-3 py-2.5">
            <Info size={13} className="mt-0.5 flex-shrink-0 text-[var(--gold)]" />
            <span>{v}</span>
          </div>
        ))}
        <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)] rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/40 px-3 py-2.5">
          <Info size={13} className="mt-0.5 flex-shrink-0 text-[var(--gold)]" />
          <span>
            Per 10% stat for {troop.toLowerCase()}: HP {STAT_RULES[troop].hp} · DEF {STAT_RULES[troop].def} · ATK {STAT_RULES[troop].atk}.
            Gear choices vary with your pairing — a tanky pair can afford damage pieces; a squishy one wants the defensive swaps.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Awaken & crit priority ───────────────────────────────────────────
function AwakenPriority() {
  const [troop, setTroop] = useState<Troop>('Infantry');
  const steps = PRIORITY[troop];
  const numbered = steps.filter((s) => s.step !== 'LAST');
  const last = steps.filter((s) => s.step === 'LAST');

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {TROOPS.map((t) => (
          <button key={t} onClick={() => setTroop(t)} className={chip(troop === t)}>{t}</button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
            <span className="text-sm font-semibold text-[var(--foreground)]">Do in this order</span>
            <span className="ml-2 text-[11px] text-[var(--text-muted)]">open-field priority · same step = either first</span>
          </div>
          <div className="divide-y divide-[var(--border)] max-h-[430px] overflow-y-auto">
            {numbered.map((s, i) => (
              <div key={i} className="px-4 py-2 flex items-center gap-3 text-sm">
                <span className="w-7 h-7 rounded-md bg-[var(--background-secondary)] border border-[var(--gold)]/25 text-[var(--gold)] text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {s.step}
                </span>
                <span className="text-[var(--foreground)] flex-1">{s.slot}</span>
                <span className={`text-xs font-semibold ${s.action === 'Crit' ? 'text-[var(--crimson)]' : 'text-[var(--gold)]'}`}>{s.action}</span>
              </div>
            ))}
            {last.map((s, i) => (
              <div key={`l${i}`} className="px-4 py-2 flex items-center gap-3 text-sm opacity-70">
                <span className="w-7 h-7 rounded-md bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--text-muted)] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  LAST
                </span>
                <span className="text-[var(--text-secondary)] flex-1">{s.slot}</span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">{s.action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className={`${card} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]/50 text-sm font-semibold text-[var(--foreground)]">
              Awaken cost (special materials per tier)
            </div>
            <table className="w-full text-xs">
              <thead className="text-[var(--text-muted)] uppercase tracking-wider">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left">Gear</th>
                  <th className="px-2 py-2 text-right">II</th>
                  <th className="px-2 py-2 text-right">III</th>
                  <th className="px-2 py-2 text-right">IV</th>
                  <th className="px-2 py-2 text-right">V</th>
                </tr>
              </thead>
              <tbody>
                {AWAKEN_COST.map((r) => (
                  <tr key={r.gear} className="border-b border-[var(--border)]">
                    <td className="px-3 py-1.5 text-[var(--foreground)]">{r.gear}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-[var(--text-secondary)]">{r.t2}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-[var(--text-secondary)]">{r.t3}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-[var(--gold)]">{r.t4}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-[var(--text-muted)]">{r.t5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${card} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]/50 text-sm font-semibold text-[var(--foreground)]">
              Crit (special talent) cost — per stage, 4 stages
            </div>
            <div className="divide-y divide-[var(--border)]">
              {CRIT_COST.map((r) => (
                <div key={r.gear} className="px-4 py-2 flex items-center justify-between text-xs">
                  <span className="text-[var(--foreground)]">{r.gear}</span>
                  <span className="font-mono text-[var(--text-secondary)]">{r.perStage} / stage</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]">
              Rule of thumb: ~500 materials to awaken a full loadout to IV + ~525 to crit everything ≈ <span className="text-[var(--gold)]">~1,000 special materials</span> total.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Set builder (catalog) ────────────────────────────────────────────
interface CatalogItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  stats: Record<string, number>;
}

const RARITY_COLOR: Record<string, string> = {
  legendary: 'text-orange-400',
  epic: 'text-purple-400',
  elite: 'text-blue-400',
  advanced: 'text-green-400',
  normal: 'text-[var(--text-muted)]',
};

function statLabel(k: string): string {
  return k
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
}

function SetBuilder() {
  const catalog = (equipmentData as unknown as { equipment: CatalogItem[] }).equipment;
  const slots = ['weapon', 'helm', 'chest', 'gloves', 'boots', 'accessory'] as const;
  const [picked, setPicked] = useState<Record<string, string>>({});

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const slot of slots) {
      const item = catalog.find((c) => c.id === picked[slot]);
      if (!item) continue;
      for (const [k, v] of Object.entries(item.stats)) t[k] = (t[k] || 0) + v;
    }
    return Object.entries(t).sort((a, b) => b[1] - a[1]);
  }, [picked, catalog]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={`${card} p-4 space-y-3`}>
        {slots.map((slot) => (
          <div key={slot}>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{slot}</label>
            <select
              value={picked[slot] || ''}
              onChange={(e) => setPicked((p) => ({ ...p, [slot]: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]/50"
            >
              <option value="">— none —</option>
              {catalog.filter((c) => c.type === slot).map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.rarity})</option>
              ))}
            </select>
          </div>
        ))}
        <p className="text-[11px] text-[var(--text-muted)] pt-1">
          Catalog is a starter set — newer KvK gear (Eternal Empire etc.) will be added as data lands.
        </p>
      </div>

      <div className={`${card} p-4`}>
        <div className="text-sm font-semibold text-[var(--foreground)] mb-3">Total stats</div>
        {totals.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">Pick pieces on the left to see combined stats.</p>
        ) : (
          <div className="space-y-2">
            {totals.map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="w-44 text-xs text-[var(--text-secondary)]">{statLabel(k)}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#8B0000] to-[#C9A961]" style={{ width: `${Math.min(100, v * 2.2)}%` }} />
                </div>
                <span className="w-12 text-right font-mono text-sm text-[var(--gold)]">{v}%</span>
              </div>
            ))}
          </div>
        )}
        {/* picked list */}
        <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1">
          {slots.map((slot) => {
            const item = catalog.find((c) => c.id === picked[slot]);
            return item ? (
              <div key={slot} className="text-xs flex justify-between">
                <span className="text-[var(--text-muted)] capitalize">{slot}</span>
                <span className={RARITY_COLOR[item.rarity] || 'text-[var(--foreground)]'}>{item.name}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'builds', label: 'Meta Builds', icon: Shield, comp: MetaBuilds },
  { id: 'priority', label: 'Awaken & Crit Order', icon: ListOrdered, comp: AwakenPriority },
  { id: 'builder', label: 'Set Builder', icon: Hammer, comp: SetBuilder },
];

export default function EquipmentPage() {
  const [tab, setTab] = useState('builds');
  const Active = TABS.find((t) => t.id === tab)?.comp ?? MetaBuilds;

  return (
    <AppSidebar>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Swords className="w-6 h-6 text-[var(--gold)]" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Equipment</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          What to craft, what to awaken first, and how your set adds up — gear varies with your pairing, so every build lists its swaps.
        </p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 ${chip(tab === t.id)}`}>
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        <Active />
      </div>
    </AppSidebar>
  );
}
