'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Pencil, Check, Swords } from 'lucide-react';

// ---------------------------------------------------------------------------
// Battle Day — a live 60-minute Ark of Osiris match companion.
// A countdown timer with phase callouts officers glance at DURING the fight.
// Phases/actions are editable and persist per plan (localStorage).
// ---------------------------------------------------------------------------

interface Phase {
  id: number;
  at: number; // minutes-remaining at which this phase becomes active (match counts down from 60)
  title: string;
  actions: string[];
}

const MATCH_SECONDS = 60 * 60;

const DEFAULT_PHASES: Phase[] = [
  { id: 1, at: 60, title: 'Opening Rush', actions: ['Rush the 2 obelisks nearest your spawn', 'Titled officers place markers immediately', 'Move as full rallies — do not split'] },
  { id: 2, at: 52, title: 'Secure Obelisks', actions: ['Hold both near obelisks for steady points', 'Garrison leads anchor, rally leads push out', 'Watch for enemy rotations'] },
  { id: 3, at: 40, title: 'Altar / Mid Push', actions: ['Contest the altars and center buildings', 'Rotate to wherever the enemy is weakest', 'Keep markers up at all times'] },
  { id: 4, at: 22, title: 'Ark Control', actions: ['Ark carrier picks up the Ark', 'Escort the carrier toward your sanctuary', 'Body-block enemy nukers off the carrier'] },
  { id: 5, at: 6, title: 'Final Push', actions: ['Ahead? Defend your lead and stall', 'Behind? All-in the highest-value building', 'Stack rallies — no solo marches'] },
];

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const card = 'bg-[var(--background-card)] border border-[var(--border)] rounded-2xl';

export default function BattleDayTab({ shareId, canEdit = true }: { shareId?: string; canEdit?: boolean }) {
  const storageKey = `aoo-battleday-${shareId || 'local'}`;
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [remaining, setRemaining] = useState(MATCH_SECONDS);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [flash, setFlash] = useState(false);
  const lastPhaseId = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // load saved phases
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setPhases(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const savePhases = (next: Phase[]) => {
    setPhases(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  // timer tick
  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) { setRunning(false); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running]);

  const sortedPhases = useMemo(() => [...phases].sort((a, b) => b.at - a.at), [phases]);
  const remainingMin = remaining / 60;
  const triggered = sortedPhases.filter((p) => p.at >= remainingMin);
  const active = triggered.length ? triggered[triggered.length - 1] : sortedPhases[0];
  const nextPhase = sortedPhases.find((p) => p.at < remainingMin) || null;
  const toNext = nextPhase ? Math.max(0, Math.round((remainingMin - nextPhase.at) * 60)) : 0;

  // flash on phase change
  useEffect(() => {
    if (active && lastPhaseId.current !== null && active.id !== lastPhaseId.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(t);
    }
    if (active) lastPhaseId.current = active.id;
  }, [active]);

  const reset = () => { setRunning(false); setRemaining(MATCH_SECONDS); lastPhaseId.current = null; };

  // ---- edit helpers ----
  const updatePhase = (id: number, patch: Partial<Phase>) => savePhases(phases.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const updateAction = (pid: number, idx: number, val: string) =>
    savePhases(phases.map((p) => (p.id === pid ? { ...p, actions: p.actions.map((a, i) => (i === idx ? val : a)) } : p)));
  const addAction = (pid: number) => savePhases(phases.map((p) => (p.id === pid ? { ...p, actions: [...p.actions, 'New callout'] } : p)));
  const removeAction = (pid: number, idx: number) =>
    savePhases(phases.map((p) => (p.id === pid ? { ...p, actions: p.actions.filter((_, i) => i !== idx) } : p)));
  const addPhase = () => savePhases([...phases, { id: Date.now(), at: 30, title: 'New Phase', actions: ['Callout'] }]);
  const removePhase = (id: number) => savePhases(phases.filter((p) => p.id !== id));

  const pct = ((MATCH_SECONDS - remaining) / MATCH_SECONDS) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">Battle Day</h2>
          <span className="text-xs text-[var(--text-muted)]">live 1-hour match companion</span>
        </div>
        {canEdit && (
          <button
            onClick={() => setEditing((e) => !e)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-secondary)]"
          >
            {editing ? <Check size={14} /> : <Pencil size={14} />}
            {editing ? 'Done' : 'Edit playbook'}
          </button>
        )}
      </div>

      {/* Timer */}
      <div className={`${card} p-6 mb-5 text-center relative overflow-hidden transition-colors ${flash ? 'ring-2 ring-emerald-400' : ''}`}>
        <div className={`text-6xl sm:text-7xl font-bold tabular-nums ${remaining <= 300 ? 'text-rose-400' : 'text-[var(--foreground)]'}`}>
          {fmt(remaining)}
        </div>
        <div className="mt-3 h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? 'Pause' : remaining === MATCH_SECONDS ? 'Start match' : 'Resume'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-secondary)]"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
        {nextPhase && (
          <div className="text-xs text-[var(--text-muted)] mt-3">
            Next: <span className="text-[var(--foreground)] font-medium">{nextPhase.title}</span> in {fmt(toNext)}
          </div>
        )}
      </div>

      {/* Active phase callout (big, glanceable) */}
      {active && (
        <div className={`${card} border-l-4 border-emerald-500 p-5 mb-5`}>
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Now · {active.at}:00 mark</div>
          <div className="text-2xl font-bold text-[var(--foreground)] mt-1 mb-3">{active.title}</div>
          <ul className="space-y-2">
            {active.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-[var(--foreground)]">
                <span className="text-emerald-400 mt-0.5">▸</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full playbook timeline */}
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">Match playbook</div>
      <div className="space-y-3">
        {sortedPhases.map((p) => {
          const isActive = active && p.id === active.id;
          return (
            <div key={p.id} className={`${card} p-4 ${isActive ? 'ring-1 ring-emerald-500/50' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                {editing ? (
                  <>
                    <input
                      type="number"
                      value={p.at}
                      onChange={(e) => updatePhase(p.id, { at: parseInt(e.target.value, 10) || 0 })}
                      className="w-16 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--foreground)]"
                      title="Minutes remaining when this phase starts"
                    />
                    <input
                      value={p.title}
                      onChange={(e) => updatePhase(p.id, { title: e.target.value })}
                      className="flex-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm font-semibold text-[var(--foreground)]"
                    />
                    <button onClick={() => removePhase(p.id)} className="text-rose-400 hover:text-rose-300"><Trash2 size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="w-12 text-center text-sm font-bold text-emerald-400 tabular-nums">{p.at}:00</span>
                    <span className="text-base font-semibold text-[var(--foreground)]">{p.title}</span>
                  </>
                )}
              </div>
              <ul className="space-y-1.5 pl-1">
                {p.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--text-muted)] mt-0.5">▸</span>
                    {editing ? (
                      <span className="flex-1 flex items-center gap-2">
                        <input
                          value={a}
                          onChange={(e) => updateAction(p.id, i, e.target.value)}
                          className="flex-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--foreground)]"
                        />
                        <button onClick={() => removeAction(p.id, i)} className="text-rose-400 hover:text-rose-300"><Trash2 size={14} /></button>
                      </span>
                    ) : (
                      <span>{a}</span>
                    )}
                  </li>
                ))}
                {editing && (
                  <li>
                    <button onClick={() => addAction(p.id)} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1">
                      <Plus size={12} /> Add callout
                    </button>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {editing && (
        <button onClick={addPhase} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--background-secondary)]">
          <Plus size={16} /> Add phase
        </button>
      )}

      <p className="text-[11px] text-[var(--text-muted)] mt-5">
        Tip: start the timer the moment the match begins. The active callout updates automatically as the clock
        counts down. Edits to the playbook are saved on this device per plan.
      </p>
    </div>
  );
}
