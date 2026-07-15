'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Shield, Swords, Hammer, ListOrdered, Info, ChevronDown, X } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import equipmentData from '@/data/equipment.json';
import {
  META_BUILDS, PRIORITY, AWAKEN_COST, CRIT_COST, STAT_RULES,
  type Troop, type Mode,
} from './equipment-meta';
import { equipSprite } from './equip-sprites';

const TROOPS: Troop[] = ['Infantry', 'Cavalry', 'Archer'];

const card = 'bg-[var(--background-card)] border border-[var(--border)] rounded-xl';
const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
    active
      ? 'bg-gradient-to-r from-[#8B0000] to-[#A21232] text-white'
      : 'text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-secondary)]'
  }`;

// Rarity styling shared by tiles and pickers.
const RARITY_STYLE: Record<string, { border: string; glow: string; text: string }> = {
  legendary: { border: 'rgba(255,140,46,0.55)', glow: 'rgba(255,140,46,0.28)', text: 'text-orange-400' },
  epic: { border: 'rgba(168,85,247,0.55)', glow: 'rgba(168,85,247,0.28)', text: 'text-purple-400' },
  elite: { border: 'rgba(59,130,246,0.55)', glow: 'rgba(59,130,246,0.28)', text: 'text-blue-400' },
  advanced: { border: 'rgba(52,211,153,0.5)', glow: 'rgba(52,211,153,0.25)', text: 'text-emerald-400' },
  normal: { border: 'rgba(156,163,175,0.4)', glow: 'rgba(156,163,175,0.2)', text: 'text-[var(--text-muted)]' },
};

// Icon tile for a named item. Falls back to an initials badge when the
// sprite isn't bundled — never breaks on unknown names.
function EquipTile({ name, size = 64, rarity }: { name: string; size?: number; rarity?: string }) {
  const sprite = equipSprite(name);
  const r = RARITY_STYLE[rarity ?? sprite?.rarity ?? 'normal'] ?? RARITY_STYLE.normal;
  return (
    <div
      title={name}
      className="relative flex-shrink-0 rounded-lg border bg-[var(--background-secondary)] overflow-hidden transition-shadow duration-200 hover:shadow-[0_0_16px_var(--glow)]"
      style={{ width: size, height: size, borderColor: r.border, ['--glow' as string]: r.glow }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 60%, ${r.glow} 0%, transparent 72%)` }}
      />
      {sprite ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/equipment/${sprite.file}`}
          alt={name}
          loading="lazy"
          className="relative h-full w-full object-contain p-1"
        />
      ) : (
        <div className="relative h-full w-full flex items-center justify-center">
          <span className="font-display font-bold text-[var(--gold)]" style={{ fontSize: size / 3.2 }}>
            {name.split(' ').filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('')}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Tab 1: Meta builds (paper-doll) ─────────────────────────────────────────
const DOLL_LEFT = ['Weapon', 'Chest', 'Legs'];
const DOLL_RIGHT = ['Helm', 'Gloves', 'Boots'];

function Silhouette() {
  return (
    <svg viewBox="0 0 120 210" className="h-52 w-auto opacity-60" aria-hidden>
      <defs>
        <linearGradient id="eqSil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2416" />
          <stop offset="100%" stopColor="#15120A" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="105" r="56" fill="none" stroke="rgba(201,169,97,0.22)" strokeWidth="1" strokeDasharray="3 5" />
      {/* head */}
      <circle cx="60" cy="24" r="13" fill="url(#eqSil)" stroke="rgba(201,169,97,0.35)" strokeWidth="1" />
      {/* torso + arms */}
      <path
        d="M33 44 Q60 33 87 44 L97 92 L87 96 L82 64 L84 104 Q60 113 36 104 L38 64 L33 96 L23 92 Z"
        fill="url(#eqSil)" stroke="rgba(201,169,97,0.35)" strokeWidth="1"
      />
      {/* legs */}
      <path d="M42 110 L39 170 L52 170 L55 114 Z" fill="url(#eqSil)" stroke="rgba(201,169,97,0.35)" strokeWidth="1" />
      <path d="M65 114 L68 170 L81 170 L78 110 Z" fill="url(#eqSil)" stroke="rgba(201,169,97,0.35)" strokeWidth="1" />
      {/* base */}
      <path d="M30 186 Q60 194 90 186" fill="none" stroke="rgba(201,169,97,0.3)" strokeWidth="1.5" />
    </svg>
  );
}

function DollSlot({ slot, item, note, align }: { slot: string; item: string; note?: string; align: 'left' | 'right' }) {
  const textAlign = align === 'right' ? 'text-right items-end' : 'text-left items-start';
  const row = align === 'right' ? 'flex-row-reverse' : 'flex-row';
  return (
    <div className={`flex ${row} items-center gap-3`}>
      <EquipTile name={item} size={60} />
      <div className={`flex flex-col ${textAlign} min-w-0`}>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{slot}</span>
        <span className="text-[13px] leading-tight font-medium text-[var(--foreground)]">{item}</span>
        {note && <span className="text-[10px] text-[var(--gold)]/80 mt-0.5">({note})</span>}
      </div>
    </div>
  );
}

function MetaBuilds() {
  const [troop, setTroop] = useState<Troop>('Infantry');
  const [mode, setMode] = useState<Mode>('openField');
  const build = META_BUILDS.find((b) => b.troop === troop && b.mode === mode)!;
  const slotOf = (name: string) => build.slots.find((s) => s.slot === name);

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

      <div className={`${card} relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 45%, rgba(201,169,97,0.06) 0%, transparent 70%)' }}
        />
        <div className="relative px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]/50 flex items-center gap-2">
          <Shield size={15} className="text-[var(--gold)]" />
          <span className="font-display text-sm font-semibold tracking-wide text-[var(--foreground)]">
            {troop} · {mode === 'openField' ? 'Open Field' : 'Rally & Garrison'} — endgame build
          </span>
        </div>

        {/* paper-doll: slots flanking the silhouette on desktop, 2-col grid on mobile */}
        <div className="relative hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-8">
          <div className="flex flex-col gap-6 justify-self-end">
            {DOLL_LEFT.map((name) => {
              const s = slotOf(name);
              return s ? <DollSlot key={name} slot={s.slot} item={s.item} note={s.note} align="right" /> : null;
            })}
          </div>
          <div className="px-2"><Silhouette /></div>
          <div className="flex flex-col gap-6 justify-self-start">
            {DOLL_RIGHT.map((name) => {
              const s = slotOf(name);
              return s ? <DollSlot key={name} slot={s.slot} item={s.item} note={s.note} align="left" /> : null;
            })}
          </div>
        </div>
        <div className="relative grid sm:hidden grid-cols-2 gap-4 px-4 py-5">
          {build.slots.map((s) => (
            <DollSlot key={s.slot} slot={s.slot} item={s.item} note={s.note} align="left" />
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

function statLabel(k: string): string {
  return k
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
}

// Dropdown that renders icon + name rows (native <select> can't show images).
function IconPicker({
  options, value, onChange, placeholder,
}: {
  options: CatalogItem[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-left hover:border-[var(--border-hover)] transition-colors"
      >
        {selected ? (
          <>
            <EquipTile name={selected.name} size={30} rarity={selected.rarity} />
            <span className={`flex-1 truncate ${RARITY_STYLE[selected.rarity]?.text ?? 'text-[var(--foreground)]'}`}>{selected.name}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(''); } }}
              className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--foreground)]"
              aria-label="Clear"
            >
              <X size={13} />
            </span>
          </>
        ) : (
          <span className="flex-1 text-[var(--text-muted)]">{placeholder}</span>
        )}
        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background-card)] shadow-2xl shadow-black/60">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full px-3 py-2 text-left text-xs text-[var(--text-muted)] hover:bg-[var(--background-hover)]"
          >
            — none —
          </button>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-sm hover:bg-[var(--background-hover)] ${o.id === value ? 'bg-[var(--background-hover)]' : ''}`}
            >
              <EquipTile name={o.name} size={28} rarity={o.rarity} />
              <span className={`truncate ${RARITY_STYLE[o.rarity]?.text ?? 'text-[var(--foreground)]'}`}>{o.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BUILDER_SLOTS = ['weapon', 'helm', 'chest', 'gloves', 'boots', 'accessory'] as const;

function SetBuilder() {
  const catalog = (equipmentData as unknown as { equipment: CatalogItem[] }).equipment;
  const [picked, setPicked] = useState<Record<string, string>>({});

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const slot of BUILDER_SLOTS) {
      const item = catalog.find((c) => c.id === picked[slot]);
      if (!item) continue;
      for (const [k, v] of Object.entries(item.stats)) t[k] = (t[k] || 0) + v;
    }
    return Object.entries(t).sort((a, b) => b[1] - a[1]);
  }, [picked, catalog]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={`${card} p-4 space-y-3`}>
        {BUILDER_SLOTS.map((slot) => (
          <div key={slot}>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{slot}</label>
            <IconPicker
              options={catalog.filter((c) => c.type === slot)}
              value={picked[slot] || ''}
              onChange={(id) => setPicked((p) => ({ ...p, [slot]: id }))}
              placeholder={`Pick a ${slot}…`}
            />
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
        {/* picked pieces */}
        <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5">
          {BUILDER_SLOTS.map((slot) => {
            const item = catalog.find((c) => c.id === picked[slot]);
            return item ? (
              <div key={slot} className="flex items-center gap-2.5 text-xs">
                <EquipTile name={item.name} size={26} rarity={item.rarity} />
                <span className="text-[var(--text-muted)] capitalize w-20">{slot}</span>
                <span className={RARITY_STYLE[item.rarity]?.text ?? 'text-[var(--foreground)]'}>{item.name}</span>
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
          <h1 className="font-display text-2xl font-bold tracking-wide text-[var(--foreground)]">Equipment</h1>
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
