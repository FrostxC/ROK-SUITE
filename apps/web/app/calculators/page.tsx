'use client';

import { useState, useMemo } from 'react';
import { Calculator, Timer, Pickaxe, Zap } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';

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
  'w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40';
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
          <div className="text-3xl font-bold text-violet-400 mt-1">{fmtDuration(totalMinutes)}</div>
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
        <div className="text-3xl font-bold text-violet-400 mt-1">{fmtDuration(hours * 60)}</div>
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
        <div className="text-3xl font-bold text-violet-400 mt-1">{remaining > 0 ? fmtDuration(regenMinutes) : 'Done!'}</div>
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
];

export default function CalculatorsPage() {
  const [tab, setTab] = useState('speedup');
  const Active = TABS.find((t) => t.id === tab)?.comp ?? SpeedupCalc;

  return (
    <AppSidebar>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Calculator className="w-6 h-6 text-violet-400" />
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
                    ? 'bg-gradient-to-r from-[#4318ff] to-[#7c3aed] text-white shadow-lg'
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
