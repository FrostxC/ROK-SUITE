'use client';

import { useState } from 'react';
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp, Shield, Zap, Target, Crown } from 'lucide-react';
import { MGE_EVENT_TYPES, parseMgeEventType, type MgeEventType } from '@/lib/mge/commanders';
import { generateDefaultTiers } from '@/lib/mge/helpers';

interface TierConfig {
  label: string;
  pointCap: number | null;
  isFfa: boolean;
  rewardHeads: number | null;
}

interface CommanderConfig {
  name: string;
  isFocus: boolean;
}

interface MgeEventSetupProps {
  onSave: (data: {
    date: string;
    commanders: CommanderConfig[];
    tiers: TierConfig[];
    notes: string;
    deadline: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    date: string;
    commanders: CommanderConfig[];
    tiers: TierConfig[];
    notes: string;
    deadline: string;
  };
}

// Ensure initialData tiers have rewardHeads (backward compat)
function normalizeTiers(tiers: Partial<TierConfig>[]): TierConfig[] {
  return tiers.map(t => ({
    label: t.label || '',
    pointCap: t.pointCap ?? null,
    isFfa: t.isFfa ?? false,
    rewardHeads: t.rewardHeads ?? null,
  }));
}

const TYPE_ICONS: Record<MgeEventType, typeof Shield> = {
  Infantry: Shield,
  Cavalry: Zap,
  Archer: Target,
  Leadership: Crown,
};

export function MgeEventSetup({ onSave, onCancel, initialData }: MgeEventSetupProps) {
  const [date, setDate] = useState(initialData?.date || '');
  // Events are themed on a troop class (how MGE works in-game) — players pick
  // their own commander of that class when applying. Legacy events that named
  // a specific commander map back to a type when possible.
  const [eventType, setEventType] = useState<MgeEventType>(() => {
    const legacy = initialData?.commanders?.find(c => c.isFocus)?.name || initialData?.commanders?.[0]?.name;
    return (legacy && parseMgeEventType(legacy)) || 'Infantry';
  });
  const [tiers, setTiers] = useState<TierConfig[]>(initialData?.tiers ? normalizeTiers(initialData.tiers) : []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [saving, setSaving] = useState(false);

  // Section collapse
  const [showTiers, setShowTiers] = useState(true);

  // What gets stored: a single "type" pseudo-commander (keeps the existing
  // schema/API untouched — focused_commander becomes e.g. "Infantry MGE").
  const commanders: CommanderConfig[] = [{ name: `${eventType} MGE`, isFocus: true }];

  const addTier = () => {
    const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const idx = tiers.length;
    setTiers([...tiers, {
      label: `${ordinals[idx] || `${idx + 1}th`} Place`,
      pointCap: null,
      isFfa: false,
      rewardHeads: null,
    }]);
  };

  const removeTier = (idx: number) => {
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const updateTier = (idx: number, updates: Partial<TierConfig>) => {
    setTiers(tiers.map((t, i) => i === idx ? { ...t, ...updates } : t));
  };

  const autoFillTiers = (count: number) => {
    setTiers(generateDefaultTiers(count));
  };

  const handleSave = async () => {
    if (!date || commanders.length === 0) return;
    setSaving(true);
    try {
      await onSave({ date, commanders, tiers, notes, deadline });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50';
  const inputStyle = { backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  return (
    <div className="p-5 rounded-lg border mb-6" style={{ backgroundColor: 'var(--background-card)', borderColor: 'var(--border)' }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {initialData ? 'Edit Event' : 'Create New MGE Event'}
      </h2>

      {/* Event type — the troop class this MGE is themed on */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          MGE Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MGE_EVENT_TYPES.map(t => {
            const Icon = TYPE_ICONS[t];
            const active = eventType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setEventType(t)}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-sm font-medium transition-fast ${
                  active
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                    : 'border-[var(--border)] hover:bg-[var(--background-secondary)]'
                }`}
                style={!active ? { color: 'var(--text-secondary)' } : undefined}
              >
                <Icon size={18} className={active ? 'text-blue-400' : ''} />
                {t}
              </button>
            );
          })}
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          Players choose their own {eventType.toLowerCase()} commander when they apply.
        </p>
      </div>

      {/* Date and Deadline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Event Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className={inputClass + ' w-full'} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Application Deadline</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className={inputClass + ' w-full'} style={inputStyle}
            title="After this date, new applications are blocked" />
        </div>
      </div>

      {/* Rank Tiers */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowTiers(!showTiers)}
          className="flex items-center gap-2 text-xs font-medium mb-2 hover:opacity-80 transition-fast"
          style={{ color: 'var(--text-secondary)' }}
        >
          {showTiers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Rank Tiers ({tiers.length})
        </button>

        {showTiers && (
          <>
            {tiers.length > 0 && (
              <div className="mb-2">
                {/* Column headers */}
                <div className="flex items-center gap-2 mb-1 px-0.5">
                  <span className="w-20 shrink-0 text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>Rank</span>
                  <span className="w-24 shrink-0 text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>Points (M)</span>
                  <span className="w-20 shrink-0 text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>Gold Heads</span>
                  <span className="w-10 shrink-0 text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>FFA</span>
                </div>
                <div className="space-y-1">
                  {tiers.map((tier, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs w-20 shrink-0 text-blue-400 font-medium">{tier.label}</span>
                      <div className="relative w-24 shrink-0">
                        <input
                          type="number"
                          placeholder="—"
                          value={tier.pointCap !== null ? tier.pointCap / 1_000_000 : ''}
                          onChange={e => {
                            const val = e.target.value ? parseFloat(e.target.value) * 1_000_000 : null;
                            updateTier(i, { pointCap: val });
                          }}
                          className={inputClass + ' w-full pr-7'}
                          style={inputStyle}
                          title="Max points this rank can score (in millions)"
                        />
                        <span className="absolute right-2 top-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>M</span>
                      </div>
                      <div className="relative w-20 shrink-0">
                        <input
                          type="number"
                          placeholder="—"
                          value={tier.rewardHeads ?? ''}
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : null;
                            updateTier(i, { rewardHeads: val });
                          }}
                          className={inputClass + ' w-full'}
                          style={inputStyle}
                          title="Gold head reward for this rank"
                        />
                      </div>
                      <label className="flex items-center justify-center w-10 shrink-0 cursor-pointer"
                        title="Free for all — no assigned player, anyone can compete">
                        <input type="checkbox" checked={tier.isFfa}
                          onChange={e => updateTier(i, { isFfa: e.target.checked })}
                          className="rounded" />
                      </label>
                      <button type="button" onClick={() => removeTier(i)}
                        className="p-1 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-fast"
                        title="Remove tier">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={addTier}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md hover:bg-blue-500/10 text-blue-400/70 hover:text-blue-400 transition-fast">
                <Plus size={12} /> Add Tier
              </button>
              <button type="button" onClick={() => autoFillTiers(5)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md hover:bg-purple-500/10 text-purple-400/70 hover:text-purple-400 transition-fast"
                title="Auto-fill 5 ranks with default point caps and gold head rewards">
                <Wand2 size={12} /> 5 Ranks
              </button>
              <button type="button" onClick={() => autoFillTiers(10)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md hover:bg-purple-500/10 text-purple-400/70 hover:text-purple-400 transition-fast"
                title="Auto-fill 10 ranks with default point caps and gold head rewards">
                <Wand2 size={12} /> 10 Ranks
              </button>
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Points = max score for that rank. Gold Heads = reward. FFA = open to everyone (no assigned player). Use presets to auto-fill defaults.
            </p>
          </>
        )}
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g., Infantry MGE — Submit your Charles Martel stats"
          className={inputClass + ' w-full'}
          style={{ ...inputStyle, minHeight: '60px' }}
        />
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Shown to applicants and included in mail templates
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !date || commanders.length === 0}
          className="px-4 py-2 rounded-md text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-fast disabled:opacity-40"
        >
          {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Event'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-2 rounded-md text-sm hover:bg-[var(--background-secondary)] transition-fast"
          style={{ color: 'var(--text-secondary)' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
