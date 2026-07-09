'use client';

import { useState, useMemo } from 'react';
import { Calculator, Timer, Pickaxe, Zap, Crown, Star, BookOpen } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { VIP_THRESHOLDS, SCULPTURES_TO_MAX, XP_TO_LEVEL_60, TOME_VALUES } from './game-data';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function fmtDuration(totalMinutes: number): string {
  if (!isFinite(totalMinutes) || totalMinutes <= 0) return '0m';
  let mins = Math.round(totalMinutes);
  const d = Math.floor(mins / 1440);
  mins -= d * 1440;
  const h = Math.floor(mins / 60);
  mins -= h * 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (mins) parts.push(`${mins}m`);
  return parts.join(' ') || '0m';
}

function fmtNum(n: number): string {
  if (!isFinite(n)) return '—';
  return Math.round(n).toLocaleString();
}

const cardClass =
  'bg-[var(--background-card)] border border-[var(--border)] rounded-2xl p-5';
const inputClass =
  'w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A961]/40';
const labelClass = 'text-xs text-[var(--text-muted)] mb-1 block';

// ---------------------------------------------------------------------------
// 1) Speedup Calculator — pure math, 100% accurate
// ---------------------------------------------------------------------------
const SPEEDUP_DENOMS: { label: string; minutes: number }[] = [
  { label: '1 min', minutes: 1 },
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '30 min', minutes: 30 },
  { label: '60 min', minutes: 60 },
  { label: '3 hours', minutes: 180 },
  { label: '8 hours', minutes: 480 },
  { label: '15 hours', minutes: 900 },
  { label: '24 hours', minutes: 1440 },
];

function SpeedupCalc() {
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [targetD, setTargetD] = useState('');
  const [targetH, setTargetH] = useState('');
  const [targetM, setTargetM] = useState('');

  const totalMinutes = useMemo(
    () =>
      SPEEDUP_DENOMS.reduce(
        (sum, d) => sum + (parseInt(counts[d.minutes] || '0', 10) || 0) * d.minutes,
        0
      ),
    [counts]
  );

  const targetMinutes =
    (parseInt(targetD || '0', 10) || 0) * 1440 +
    (parseInt(targetH || '0', 10) || 0) * 60 +
    (parseInt(targetM || '0', 10) || 0);

  const diff = totalMinutes - targetMinutes;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className={`${cardClass} lg:col-span-2`}>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Speedups you own</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SPEEDUP_DENOMS.map((d) => (
            <div key={d.minutes}>
              <label className={labelClass}>{d.label}</label>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                value={counts[d.minutes] ?? ''}
                onChange={(e) => setCounts({ ...counts, [d.minutes]: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setCounts({})}
          className="mt-4 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-5">
        <div className={cardClass}>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total speedup time</div>
          <div className="text-3xl font-bold text-[var(--gold)] mt-1">{fmtDuration(totalMinutes)}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {fmtNum(totalMinutes)} minutes · {(totalMinutes / 1440).toFixed(1)} days
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-sm font-semibold text-[var(--foreground)] mb-3">Will it finish this timer?</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>Days</label>
              <input type="number" min="0" placeholder="0" value={targetD} onChange={(e) => setTargetD(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hours</label>
              <input type="number" min="0" placeholder="0" value={targetH} onChange={(e) => setTargetH(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mins</label>
              <input type="number" min="0" placeholder="0" value={targetM} onChange={(e) => setTargetM(e.target.value)} className={inputClass} />
            </div>
          </div>
          {targetMinutes > 0 && (
            <div className="mt-3 text-sm">
              {diff >= 0 ? (
                <span className="text-emerald-400 font-medium">✓ Covered — {fmtDuration(diff)} to spare</span>
              ) : (
                <span className="text-rose-400 font-medium">✗ Short by {fmtDuration(-diff)}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2) Resource / Gathering Calculator — pure math
// ---------------------------------------------------------------------------
function ResourceCalc() {
  const [needed, setNeeded] = useState('');
  const [have, setHave] = useState('');
  const [rate, setRate] = useState('300000'); // RSS per hour per march (editable)
  const [marches, setMarches] = useState('5');

  const deficit = Math.max(0, (parseFloat(needed || '0') || 0) - (parseFloat(have || '0') || 0));
  const totalRate = (parseFloat(rate || '0') || 0) * (parseInt(marches || '0', 10) || 0);
  const hours = totalRate > 0 ? deficit / totalRate : Infinity;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">How much do you need?</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Resources needed</label>
            <input type="number" min="0" placeholder="e.g. 50000000" value={needed} onChange={(e) => setNeeded(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Resources you already have</label>
            <input type="number" min="0" placeholder="0" value={have} onChange={(e) => setHave(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Gather rate / march (per hr)</label>
              <input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Number of gathering marches</label>
              <input type="number" min="0" value={marches} onChange={(e) => setMarches(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Still needed</div>
        <div className="text-3xl font-bold text-amber-400 mt-1">{fmtNum(deficit)}</div>
        <div className="h-px bg-[var(--border)] my-4" />
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Gathering time</div>
        <div className="text-3xl font-bold text-[var(--gold)] mt-1">{fmtDuration(hours * 60)}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          at {fmtNum(totalRate)} RSS/hour across {marches || 0} marches
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3) Action Points Calculator — math with editable game assumptions
// ---------------------------------------------------------------------------
function ActionPointsCalc() {
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');
  const [regenMin, setRegenMin] = useState('5'); // minutes per 1 AP (editable)
  const [ap100, setAp100] = useState('');
  const [ap50, setAp50] = useState('');
  const [ap20, setAp20] = useState('');

  const fromItems =
    (parseInt(ap100 || '0', 10) || 0) * 100 +
    (parseInt(ap50 || '0', 10) || 0) * 50 +
    (parseInt(ap20 || '0', 10) || 0) * 20;
  const cur = parseInt(current || '0', 10) || 0;
  const tgt = parseInt(target || '0', 10) || 0;
  const afterItems = cur + fromItems;
  const remaining = Math.max(0, tgt - afterItems);
  const perAp = parseFloat(regenMin || '0') || 0;
  const regenMinutes = remaining * perAp;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Your action points</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Current AP</label>
              <input type="number" min="0" placeholder="0" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Target AP</label>
              <input type="number" min="0" placeholder="1000" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>AP items you have</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min="0" placeholder="100 AP ×" value={ap100} onChange={(e) => setAp100(e.target.value)} className={inputClass} />
              <input type="number" min="0" placeholder="50 AP ×" value={ap50} onChange={(e) => setAp50(e.target.value)} className={inputClass} />
              <input type="number" min="0" placeholder="20 AP ×" value={ap20} onChange={(e) => setAp20(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Regen: minutes per 1 AP (default 5)</label>
            <input type="number" min="0" step="0.5" value={regenMin} onChange={(e) => setRegenMin(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">AP from items</div>
        <div className="text-2xl font-bold text-emerald-400 mt-1">+{fmtNum(fromItems)}</div>
        <div className="h-px bg-[var(--border)] my-4" />
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Still need from regen</div>
        <div className="text-2xl font-bold text-amber-400 mt-1">{fmtNum(remaining)} AP</div>
        <div className="h-px bg-[var(--border)] my-4" />
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Time to reach target</div>
        <div className="text-3xl font-bold text-[var(--gold)] mt-1">{remaining > 0 ? fmtDuration(regenMinutes) : 'Done!'}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4) VIP Calculator — cumulative point thresholds
// ---------------------------------------------------------------------------
function VipCalc() {
  const [points, setPoints] = useState('');
  const [target, setTarget] = useState('15');
  const p = parseInt(points || '0', 10) || 0;

  const current = useMemo(() => {
    let lvl = 0;
    for (const t of VIP_THRESHOLDS) if (p >= t.points) lvl = t.level;
    return lvl;
  }, [p]);

  const nextEntry = VIP_THRESHOLDS.find((t) => t.level === current + 1);
  const toNext = nextEntry ? nextEntry.points - p : 0;
  const targetEntry = VIP_THRESHOLDS.find((t) => t.level === (parseInt(target, 10) || 0));
  const toTarget = targetEntry ? Math.max(0, targetEntry.points - p) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Your VIP progress</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Current VIP points</label>
            <input type="number" min="0" placeholder="e.g. 150300" value={points} onChange={(e) => setPoints(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Target VIP level</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
              {VIP_THRESHOLDS.filter((t) => t.level > 0).map((t) => (
                <option key={t.level} value={t.level}>VIP {t.level}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-4">Thresholds are cumulative points to reach each level.</p>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Current VIP level</div>
        <div className="text-3xl font-bold text-amber-400 mt-1">VIP {current}</div>
        <div className="h-px bg-[var(--border)] my-4" />
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Points to VIP {current + 1}</div>
        <div className="text-2xl font-bold text-[var(--gold)] mt-1">{nextEntry ? fmtNum(toNext) : 'Max'}</div>
        <div className="h-px bg-[var(--border)] my-4" />
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Points to VIP {target}</div>
        <div className="text-2xl font-bold text-emerald-400 mt-1">{toTarget > 0 ? fmtNum(toTarget) : 'Reached!'}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5) Sculpture Calculator — sculptures to fully max a commander
// ---------------------------------------------------------------------------
function SculptureCalc() {
  const [rarity, setRarity] = useState<'legendary' | 'epic'>('legendary');
  const [owned, setOwned] = useState('');
  const total = SCULPTURES_TO_MAX[rarity];
  const have = parseInt(owned || '0', 10) || 0;
  const remaining = Math.max(0, total - have);
  const pct = Math.min(100, (have / total) * 100);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Commander to max</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Rarity</label>
            <select value={rarity} onChange={(e) => setRarity(e.target.value as 'legendary' | 'epic')} className={inputClass}>
              <option value="legendary">Legendary (690 to max)</option>
              <option value="epic">Epic (440 to max)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sculptures already invested + owned</label>
            <input type="number" min="0" placeholder="0" value={owned} onChange={(e) => setOwned(e.target.value)} className={inputClass} />
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-4">Max = 6 stars with all skills 5/5/5/5.</p>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Sculptures still needed</div>
        <div className="text-3xl font-bold text-[var(--gold)] mt-1">{fmtNum(remaining)}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">of {fmtNum(total)} total</div>
        <div className="mt-4 h-3 rounded-full bg-[var(--background-secondary)] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#8B0000] to-[#DC143C]" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1">{pct.toFixed(1)}% maxed</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6) Commander XP / Tome Calculator
// ---------------------------------------------------------------------------
function TomeCalc() {
  const [counts, setCounts] = useState<Record<number, string>>({});
  const totalXp = TOME_VALUES.reduce((s, t) => s + (parseInt(counts[t.xp] || '0', 10) || 0) * t.xp, 0);
  const pctTo60 = Math.min(100, (totalXp / XP_TO_LEVEL_60) * 100);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Tomes of Knowledge you have</h3>
        <div className="space-y-3">
          {TOME_VALUES.map((t) => (
            <div key={t.xp}>
              <label className={labelClass}>{t.label} tome</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={counts[t.xp] ?? ''}
                onChange={(e) => setCounts({ ...counts, [t.xp]: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total commander XP</div>
        <div className="text-3xl font-bold text-[var(--gold)] mt-1">{fmtNum(totalXp)}</div>
        <div className="h-px bg-[var(--border)] my-4" />
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Toward a maxed commander (lvl 60)</div>
        <div className="mt-2 h-3 rounded-full bg-[var(--background-secondary)] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pctTo60}%` }} />
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          {pctTo60.toFixed(1)}% of ~{fmtNum(XP_TO_LEVEL_60)} XP needed for level 60
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page shell with tabs
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'speedup', label: 'Speedups', icon: Timer, comp: SpeedupCalc },
  { id: 'resources', label: 'Resources', icon: Pickaxe, comp: ResourceCalc },
  { id: 'ap', label: 'Action Points', icon: Zap, comp: ActionPointsCalc },
  { id: 'vip', label: 'VIP', icon: Crown, comp: VipCalc },
  { id: 'sculptures', label: 'Sculptures', icon: Star, comp: SculptureCalc },
  { id: 'tomes', label: 'Commander XP', icon: BookOpen, comp: TomeCalc },
];

export default function CalculatorsPage() {
  const [tab, setTab] = useState('speedup');
  const Active = TABS.find((t) => t.id === tab)?.comp ?? SpeedupCalc;

  return (
    <AppSidebar>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Calculator className="w-6 h-6 text-[var(--gold)]" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Calculators</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Quick, accurate planning tools for everyday Rise of Kingdoms decisions.
        </p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#DC143C] to-[#8B0000] text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--background-secondary)] border border-[var(--border)]'
                }`}
              >
                <Icon size={16} />
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
