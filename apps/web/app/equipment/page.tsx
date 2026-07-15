'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Shield, Swords, Hammer, ListOrdered, Info, ChevronDown, X, Gem, Sparkles } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import {
  TROOP_BUILDS, ACCESSORIES, PRIORITY, AWAKEN_COST, CRIT_COST, STAT_RULES,
  SET_BUILDER_CATALOG, SET_BONUSES, EQUIP_SETS,
  type Troop, type Mode, type SlotKey, type BuildVariant, type CatalogPiece,
} from './equipment-meta';
import { equipSprite } from './equip-sprites';

const TROOPS: Troop[] = ['Infantry', 'Cavalry', 'Archer', 'Siege'];
const SLOT_ORDER: SlotKey[] = ['Weapon', 'Helm', 'Chest', 'Gloves', 'Legs', 'Boots'];

const card = 'bg-[var(--background-card)] border border-[var(--border)] rounded-xl';
const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
    active
      ? 'bg-gradient-to-r from-[#8B0000] to-[#A21232] text-white'
      : 'text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-secondary)]'
  }`;

const RARITY_STYLE: Record<string, { border: string; glow: string; text: string }> = {
  legendary: { border: 'rgba(255,140,46,0.55)', glow: 'rgba(255,140,46,0.28)', text: 'text-orange-400' },
  epic: { border: 'rgba(168,85,247,0.55)', glow: 'rgba(168,85,247,0.28)', text: 'text-purple-400' },
  elite: { border: 'rgba(59,130,246,0.55)', glow: 'rgba(59,130,246,0.28)', text: 'text-blue-400' },
  advanced: { border: 'rgba(52,211,153,0.5)', glow: 'rgba(52,211,153,0.25)', text: 'text-emerald-400' },
  normal: { border: 'rgba(156,163,175,0.4)', glow: 'rgba(156,163,175,0.2)', text: 'text-[var(--text-muted)]' },
};

// Icon tile for a named item — falls back to an initials badge when a sprite
// isn't bundled, so an unmapped name never breaks the layout.
function EquipTile({ name, size = 60, rarity }: { name: string; size?: number; rarity?: string }) {
  const sprite = equipSprite(name);
  const r = RARITY_STYLE[rarity ?? sprite?.rarity ?? 'legendary'] ?? RARITY_STYLE.legendary;
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
        <img src={`/equipment/${sprite.file}`} alt={name} loading="lazy" className="relative h-full w-full object-contain p-1" />
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

// ── Tab 1: Meta builds ──────────────────────────────────────────────────────
// One card per build variant, showing all 6 slots as icon tiles. Multiple
// variants per troop/mode are shown side by side (the video's build columns).
function BuildCard({ variant }: { variant: BuildVariant }) {
  return (
    <div className={`${card} overflow-hidden flex flex-col`}>
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
        <div className="text-[13px] font-semibold text-[var(--foreground)]">{variant.name}</div>
        {variant.note && <div className="text-[10px] text-[var(--gold)]/85 mt-0.5 leading-snug">{variant.note}</div>}
      </div>
      <div className="p-3 grid grid-cols-2 gap-2.5">
        {SLOT_ORDER.map((slot) => (
          <div key={slot} className="flex items-center gap-2 min-w-0">
            <EquipTile name={variant.slots[slot]} size={44} />
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">{slot}</div>
              <div className="text-[11px] leading-tight text-[var(--foreground)] truncate" title={variant.slots[slot]}>
                {variant.slots[slot]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaBuilds() {
  const [troop, setTroop] = useState<Troop>('Infantry');
  const [mode, setMode] = useState<Mode>('openField');
  const builds = TROOP_BUILDS.find((b) => b.troop === troop)!;
  const hasRally = builds.rallyGarrison.length > 0;
  const effectiveMode: Mode = troop === 'Siege' ? 'openField' : mode;
  const variants = effectiveMode === 'openField' ? builds.openField : builds.rallyGarrison;
  const accessories = ACCESSORIES[effectiveMode];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {TROOPS.map((t) => (
          <button key={t} onClick={() => setTroop(t)} className={chip(troop === t)}>{t}</button>
        ))}
        {troop !== 'Siege' && (
          <>
            <span className="mx-1 text-[var(--text-muted)]">·</span>
            <button onClick={() => setMode('openField')} className={chip(mode === 'openField')}>Open Field</button>
            <button onClick={() => setMode('rallyGarrison')} className={chip(mode === 'rallyGarrison')} disabled={!hasRally}>
              Rally & Garrison
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Shield size={15} className="text-[var(--gold)]" />
        <span className="font-display text-sm font-semibold tracking-wide text-[var(--foreground)]">
          {troop} · {effectiveMode === 'openField' ? 'Open Field' : 'Rally & Garrison'}
          <span className="ml-2 text-[11px] font-normal text-[var(--text-muted)]">
            {variants.length} build{variants.length > 1 ? 's' : ''} — pick the one that fits your pairing
          </span>
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {variants.map((v, i) => <BuildCard key={i} variant={v} />)}
      </div>

      {/* Accessories */}
      <div className="flex items-center gap-2 mt-7 mb-3">
        <Gem size={15} className="text-[var(--gold)]" />
        <span className="font-display text-sm font-semibold tracking-wide text-[var(--foreground)]">
          Accessories <span className="ml-2 text-[11px] font-normal text-[var(--text-muted)]">2 accessory slots</span>
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accessories.map((a, i) => (
          <div key={i} className={`${card} p-3 flex items-center gap-3`}>
            <div className="flex gap-1.5">
              <EquipTile name={a.items[0]} size={44} />
              <EquipTile name={a.items[1]} size={44} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[var(--foreground)] leading-tight">
                {a.items[0]} <span className="text-[var(--text-muted)]">+</span> {a.items[1]}
              </div>
              <div className="text-[10px] text-[var(--gold)]/80 mt-0.5">{a.note}</div>
            </div>
          </div>
        ))}
      </div>

      {troop !== 'Siege' && (
        <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)] rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/40 px-3 py-2.5 mt-5">
          <Info size={13} className="mt-0.5 flex-shrink-0 text-[var(--gold)]" />
          <span>
            Per 10% stat for {troop.toLowerCase()}: HP {STAT_RULES[troop as Exclude<Troop, 'Siege'>].hp} ·
            DEF {STAT_RULES[troop as Exclude<Troop, 'Siege'>].def} · ATK {STAT_RULES[troop as Exclude<Troop, 'Siege'>].atk}.
            A tanky pairing can afford the damage pieces; a squishy one wants the defensive swaps — that's what the variants above are for.
          </span>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Awaken & crit priority ───────────────────────────────────────────
function AwakenPriority() {
  const [troop, setTroop] = useState<Exclude<Troop, 'Siege'>>('Infantry');
  const steps = PRIORITY[troop];
  const numbered = steps.filter((s) => s.step !== 'LAST');
  const last = steps.filter((s) => s.step === 'LAST');

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {(['Infantry', 'Cavalry', 'Archer'] as const).map((t) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Set Builder (legendary only) ─────────────────────────────────────
function IconPicker({
  options, value, onChange, placeholder,
}: {
  options: CatalogPiece[];
  value: string;
  onChange: (name: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.name === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
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
            <EquipTile name={selected.name} size={30} />
            <span className="flex-1 min-w-0">
              <span className="block truncate text-orange-400">{selected.name}</span>
              {selected.set && <span className="block text-[10px] text-[var(--text-muted)] truncate">{selected.set} set</span>}
            </span>
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
          <button type="button" onClick={() => { onChange(''); setOpen(false); }}
            className="w-full px-3 py-2 text-left text-xs text-[var(--text-muted)] hover:bg-[var(--background-hover)]">
            — none —
          </button>
          {options.map((o) => (
            <button key={o.name} type="button" onClick={() => { onChange(o.name); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-sm hover:bg-[var(--background-hover)] ${o.name === value ? 'bg-[var(--background-hover)]' : ''}`}>
              <EquipTile name={o.name} size={28} />
              <span className="min-w-0">
                <span className="block truncate text-orange-400">{o.name}</span>
                {o.set && <span className="block text-[10px] text-[var(--text-muted)] truncate">{o.set} set</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SetBuilder() {
  const [picked, setPicked] = useState<Record<string, string>>({});

  // count picked pieces per set
  const setCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const slot of SLOT_ORDER) {
      const item = SET_BUILDER_CATALOG.find((c) => c.name === picked[slot]);
      if (item?.set) counts[item.set] = (counts[item.set] || 0) + 1;
    }
    return counts;
  }, [picked]);

  const activeSets = EQUIP_SETS.filter((s) => (setCounts[s] || 0) > 0);
  const anyPicked = SLOT_ORDER.some((s) => picked[s]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={`${card} p-4 space-y-3`}>
        {SLOT_ORDER.map((slot) => (
          <div key={slot}>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{slot}</label>
            <IconPicker
              options={SET_BUILDER_CATALOG.filter((c) => c.slot === slot)}
              value={picked[slot] || ''}
              onChange={(name) => setPicked((p) => ({ ...p, [slot]: name }))}
              placeholder={`Pick a legendary ${slot.toLowerCase()}…`}
            />
          </div>
        ))}
        <p className="text-[11px] text-[var(--text-muted)] pt-1">
          Legendary pieces only. Mixing sets is fine — the panel tracks how many pieces of each set you have and which set bonuses light up.
        </p>
      </div>

      <div className={`${card} p-4`}>
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] mb-3">
          <Sparkles size={15} className="text-[var(--gold)]" /> Set bonuses
        </div>

        {!anyPicked ? (
          <p className="text-xs text-[var(--text-muted)]">Pick pieces on the left to track set completion and bonuses.</p>
        ) : activeSets.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">
            No set pieces picked yet — your current selection is all standalone legendary gear (no set bonus).
          </p>
        ) : (
          <div className="space-y-4">
            {activeSets.map((setName) => {
              const n = setCounts[setName] || 0;
              const tiers = SET_BONUSES[setName];
              return (
                <div key={setName} className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-orange-400">{setName}</span>
                    <span className="text-xs font-mono text-[var(--text-secondary)]">{n}/6 pieces</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden mb-2.5">
                    <div className="h-full bg-gradient-to-r from-[#8B0000] to-[#C9A961]" style={{ width: `${(n / 6) * 100}%` }} />
                  </div>
                  {tiers ? (
                    <div className="space-y-1">
                      {tiers.map((t) => {
                        const active = n >= t.pieces;
                        return (
                          <div key={t.pieces} className={`flex items-center gap-2 text-[11px] ${active ? '' : 'opacity-45'}`}>
                            <span className={`w-9 flex-shrink-0 font-mono ${active ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>{t.pieces}-pc</span>
                            <span className={active ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)]'}>{t.bonus}</span>
                            {active && <span className="ml-auto text-[10px] text-emerald-400">active</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[var(--text-muted)]">Set-bonus values not yet catalogued for this set.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* picked pieces list */}
        {anyPicked && (
          <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5">
            {SLOT_ORDER.map((slot) => {
              const item = SET_BUILDER_CATALOG.find((c) => c.name === picked[slot]);
              return item ? (
                <div key={slot} className="flex items-center gap-2.5 text-xs">
                  <EquipTile name={item.name} size={26} />
                  <span className="text-[var(--text-muted)] capitalize w-16">{slot}</span>
                  <span className="text-orange-400 truncate">{item.name}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
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
          Legendary endgame gear — what to craft per troop, what to awaken first, and how your set bonuses add up.
          Builds transcribed from BilegtROK&apos;s crafting &amp; priority guides.
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
