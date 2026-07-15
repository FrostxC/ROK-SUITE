'use client';

import { useMemo, useState } from 'react';
import { GitCompareArrows, Upload, Download, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';

// Compare two kingdom scans (before/after) and get per-player period deltas —
// kills gained, deads gained, power change. Accepts the kd-export .xlsx format
// or a players_data.json file. Everything runs locally in the browser.

interface Snap {
  characterId: number;
  username: string;
  power: number;
  t4Kills: number;
  t5Kills: number;
  deaths: number;
  totalKP: number;
}

interface Delta {
  characterId: number;
  username: string;
  powerBefore: number;
  powerAfter: number;
  powerChange: number;
  t4Kills: number;
  t5Kills: number;
  deaths: number;
  kp: number;
}

const fmtM = (n: number) => `${(n / 1_000_000).toFixed(2)}M`;
const fmtK = (n: number) => `${(n / 1_000).toFixed(0)}K`;
const fmtBig = (n: number) => {
  const sign = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a >= 1_000_000_000) return sign + (a / 1_000_000_000).toFixed(2) + 'B';
  if (a >= 1_000_000) return sign + (a / 1_000_000).toFixed(1) + 'M';
  if (a >= 1_000) return sign + (a / 1_000).toFixed(1) + 'K';
  return sign + Math.round(a);
};
const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[, ]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

async function parseFile(file: File): Promise<Snap[]> {
  if (file.name.toLowerCase().endsWith('.json')) {
    const arr = JSON.parse(await file.text());
    if (!Array.isArray(arr)) throw new Error('JSON is not a player array');
    return arr
      .map((p: Record<string, unknown>) => ({
        characterId: num(p.characterId),
        username: String(p.username ?? ''),
        power: num(p.power),
        t4Kills: num(p.t4Kills),
        t5Kills: num(p.t5Kills),
        deaths: num(p.t4Deaths) + num(p.t5Deaths),
        totalKP: num(p.totalKP),
      }))
      .filter((p) => p.characterId && p.username);
  }
  // xlsx — kd export format
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
  return rows
    .map((r) => ({
      characterId: num(r['Gov ID'] ?? r['GovID'] ?? r['governorId'] ?? r['ID']),
      username: String(r['Name'] ?? r['name'] ?? ''),
      power: num(r['Current Power'] ?? r['Power'] ?? r['power']),
      t4Kills: num(r['T4 Kills'] ?? r['t4Kills']),
      t5Kills: num(r['T5 Kills'] ?? r['t5Kills']),
      deaths: num(r['Dead'] ?? r['Deads'] ?? r['deaths']),
      totalKP: num(r['KP (T4+T5)'] ?? r['Kill Points'] ?? r['KP'] ?? r['totalKP']),
    }))
    .filter((p) => p.characterId && p.username);
}

export default function CompareScans() {
  const [before, setBefore] = useState<Snap[] | null>(null);
  const [after, setAfter] = useState<Snap[] | null>(null);
  const [names, setNames] = useState<{ before?: string; after?: string }>({});
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'kp' | 'deaths' | 'powerChange'>('kp');
  const [showAll, setShowAll] = useState(false);

  const onFile = (slot: 'before' | 'after') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    try {
      const snaps = await parseFile(f);
      if (!snaps.length) throw new Error('No players found in file');
      if (slot === 'before') setBefore(snaps); else setAfter(snaps);
      setNames((n) => ({ ...n, [slot]: f.name }));
    } catch (err) {
      setError(`${f.name}: ${err instanceof Error ? err.message : 'could not parse'}`);
    } finally {
      e.target.value = '';
    }
  };

  const deltas = useMemo<Delta[] | null>(() => {
    if (!before || !after) return null;
    const b = new Map(before.map((p) => [p.characterId, p]));
    const out: Delta[] = [];
    for (const a of after) {
      const prev = b.get(a.characterId);
      if (!prev) continue;
      out.push({
        characterId: a.characterId,
        username: a.username,
        powerBefore: prev.power,
        powerAfter: a.power,
        powerChange: a.power - prev.power,
        t4Kills: Math.max(0, a.t4Kills - prev.t4Kills),
        t5Kills: Math.max(0, a.t5Kills - prev.t5Kills),
        deaths: Math.max(0, a.deaths - prev.deaths),
        kp: Math.max(0, a.totalKP - prev.totalKP),
      });
    }
    return out;
  }, [before, after]);

  const sorted = useMemo(() => {
    if (!deltas) return [];
    const dir = (a: Delta, b: Delta) =>
      sortBy === 'deaths' ? b.deaths - a.deaths
      : sortBy === 'powerChange' ? a.powerChange - b.powerChange
      : b.kp - a.kp;
    return [...deltas].sort(dir);
  }, [deltas, sortBy]);

  const totals = useMemo(() => {
    if (!deltas) return null;
    return {
      matched: deltas.length,
      kp: deltas.reduce((s, d) => s + d.kp, 0),
      deaths: deltas.reduce((s, d) => s + d.deaths, 0),
      powerLost: deltas.reduce((s, d) => s + Math.min(0, d.powerChange), 0),
    };
  }, [deltas]);

  const exportJson = () => {
    if (!deltas || !after) return;
    const a = new Map(after.map((p) => [p.characterId, p]));
    const players = deltas.map((d) => ({
      characterId: d.characterId,
      username: d.username,
      power: a.get(d.characterId)?.power ?? d.powerAfter,
      highestPower: Math.max(d.powerBefore, d.powerAfter),
      t5Deaths: d.deaths,
      t4Deaths: 0,
      totalKP: d.kp,
      t5Kills: d.t5Kills,
      t4Kills: d.t4Kills,
      rssGathered: 0,
      allianceHelps: 0,
      dkp: 0,
      honorPoints: 0,
    }));
    const blob = new Blob([JSON.stringify(players)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'players_data_period.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const fileBtn = (slot: 'before' | 'after', label: string) => (
    <label className="flex-1 min-w-[220px] cursor-pointer rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--gold)]/40 bg-[var(--background-secondary)]/40 px-4 py-3 transition-colors">
      <input type="file" accept=".xlsx,.json" className="hidden" onChange={onFile(slot)} />
      <div className="flex items-center gap-2.5">
        <Upload size={15} className="text-[var(--gold)] flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">{label}</div>
          <div className="text-[11px] text-[var(--text-muted)] truncate">
            {names[slot] || '.xlsx export or players_data.json'}
          </div>
        </div>
      </div>
    </label>
  );

  return (
    <section className="mb-6 rounded-xl bg-[var(--background-card)] border border-[var(--border)] shadow-[var(--card-shadow)] overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 sm:px-5 py-3 flex items-center gap-3 border-b border-[var(--border)] hover:bg-[var(--background-hover)] transition-colors"
      >
        <GitCompareArrows size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-[var(--foreground)]">Compare Scans</span>
          <span className="ml-2 text-xs text-[var(--text-muted)]">before + after → kills, deads & power change per player</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
      </button>

      {expanded && (
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap gap-3">
            {fileBtn('before', '1 · Before scan')}
            {fileBtn('after', '2 · After scan')}
          </div>
          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

          {totals && deltas && (
            <>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Matched players', value: String(totals.matched) },
                  { label: 'Kill points gained', value: fmtBig(totals.kp) },
                  { label: 'Troops died', value: fmtBig(totals.deaths) },
                  { label: 'Power lost', value: fmtBig(totals.powerLost) },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]/50 px-2 py-2.5">
                    <div className="font-display text-lg font-bold text-[var(--gold)]">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1.5">
                  {([['kp', 'Top KP'], ['deaths', 'Top Deads'], ['powerChange', 'Power Drop']] as const).map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => setSortBy(k)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        sortBy === k
                          ? 'bg-[var(--primary)] text-white border-transparent'
                          : 'text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--background-secondary)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={exportJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--gold)]/40 transition-colors"
                >
                  <Download size={12} /> Export period JSON
                </button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-2 py-2 text-left">#</th>
                      <th className="px-2 py-2 text-left">Name</th>
                      <th className="px-2 py-2 text-right">T4K +</th>
                      <th className="px-2 py-2 text-right">T5K +</th>
                      <th className="px-2 py-2 text-right">KP +</th>
                      <th className="px-2 py-2 text-right">Deads +</th>
                      <th className="px-2 py-2 text-right">Power Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAll ? sorted : sorted.slice(0, 20)).map((d, i) => (
                      <tr key={d.characterId} className="border-b border-[var(--border)] hover:bg-[var(--background-hover)]">
                        <td className="px-2 py-1.5 text-[var(--text-muted)] tabular-nums">{i + 1}</td>
                        <td className="px-2 py-1.5 text-[var(--foreground)]">{d.username}</td>
                        <td className="px-2 py-1.5 text-right font-mono tabular-nums text-[var(--text-muted)]">{fmtM(d.t4Kills)}</td>
                        <td className="px-2 py-1.5 text-right font-mono tabular-nums text-[var(--text-muted)]">{fmtM(d.t5Kills)}</td>
                        <td className="px-2 py-1.5 text-right font-mono tabular-nums text-[var(--text-secondary)]">{fmtBig(d.kp)}</td>
                        <td className="px-2 py-1.5 text-right font-mono tabular-nums text-[var(--text-secondary)]">{fmtK(d.deaths)}</td>
                        <td className={`px-2 py-1.5 text-right font-mono tabular-nums ${d.powerChange < 0 ? 'text-rose-400' : 'text-green-400'}`}>
                          {fmtBig(d.powerChange)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sorted.length > 20 && (
                  <button
                    onClick={() => setShowAll((s) => !s)}
                    className="mt-2 text-xs text-[var(--gold)] hover:underline"
                  >
                    {showAll ? 'Show top 20' : `Show all ${sorted.length}`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
