// Rise of Kingdoms commander pairing meta — current as of mid-2026.
// Sourced from current community tier lists (allclash, lootbar, riseofkingdomsguides,
// rok.guide). Meta shifts every patch and "best" is partly opinion — this is an
// editable, role-relative baseline (S = top pick, A = strong, B = budget/situational).
// Commander names match apps/web/lib/sunset-canyon/commander-reference.ts so portraits resolve.

export type Tier = 'S' | 'A' | 'B';

export interface Pairing {
  primary: string;
  secondary: string;
  tier: Tier;
  troop: 'Infantry' | 'Cavalry' | 'Archer' | 'Mixed';
  note?: string;
}

export interface MetaCategory {
  id: string;
  name: string;
  desc: string;
  pairings: Pairing[];
}

export const META_PATCH = 'Current meta · reviewed June 2026';

export const COMMANDER_META: MetaCategory[] = [
  {
    id: 'open-field',
    name: 'Open Field',
    desc: 'Best marches for open-field PvP. The current "murderball" runs 2 cavalry + 2 infantry + 2 archer.',
    pairings: [
      { primary: 'Zhuge Liang', secondary: 'Hermann Prime', tier: 'S', troop: 'Archer', note: 'Top archer line of 2026 — Zhuge overtook YSG as the #1 archer; massive AoE + true damage.' },
      { primary: 'Ashurbanipal', secondary: 'Nebuchadnezzar II', tier: 'S', troop: 'Archer', note: 'Murderball archer pair — relentless true damage and debuffs.' },
      { primary: 'Xiang Yu', secondary: 'Alexander Nevsky', tier: 'S', troop: 'Cavalry', note: 'Premier cavalry murderball — huge charge burst and mobility.' },
      { primary: 'Liu Che', secondary: 'Scipio Africanus Prime', tier: 'S', troop: 'Infantry', note: 'Top infantry open-field bruiser duo right now.' },
      { primary: 'Alexander Nevsky', secondary: 'Joan of Arc Prime', tier: 'A', troop: 'Cavalry', note: 'Charge damage with heal-over-time to survive long swarm fights.' },
      { primary: 'Gorgo', secondary: 'Hector', tier: 'A', troop: 'Infantry', note: 'Tanky infantry anchor for the murderball.' },
      { primary: 'Sun Tzu Prime', secondary: 'Scipio Africanus Prime', tier: 'A', troop: 'Infantry', note: 'Sun Tzu Prime revitalized infantry; strong into cavalry.' },
    ],
  },
  {
    id: 'rally',
    name: 'Rally / Attack',
    desc: 'Lead commanders for rallying enemy cities, flags, and structures. Anti-healing dominates.',
    pairings: [
      { primary: 'Nebuchadnezzar II', secondary: 'Gilgamesh', tier: 'S', troop: 'Mixed', note: 'Strongest city-attack rally — anti-healing + conquering combo.' },
      { primary: 'Harald Sigurdsson', secondary: 'Alexander the Great', tier: 'S', troop: 'Infantry', note: 'Anti-healing infantry rally that shuts down garrison healers.' },
      { primary: 'Guan Yu', secondary: 'Xiang Yu', tier: 'A', troop: 'Cavalry', note: 'High-burst cavalry rally — still a strong nuke.' },
    ],
  },
  {
    id: 'garrison',
    name: 'Garrison / Defense',
    desc: 'Best pairs for defending cities, flags, and structures against rallies.',
    pairings: [
      { primary: 'Yi Sun-sin', secondary: 'Theodora', tier: 'S', troop: 'Mixed', note: 'Premier mixed-troop garrison — excellent against rallies.' },
      { primary: 'Zenobia', secondary: 'Gorgo', tier: 'A', troop: 'Infantry', note: 'Tanky infantry garrison wall.' },
      { primary: 'Yi Seong-Gye', secondary: 'Charles Martel', tier: 'B', troop: 'Infantry', note: 'Budget all-around structure defense — older but still serviceable.' },
    ],
  },
  {
    id: 'mobility',
    name: 'Mobility / Cavalry',
    desc: 'Fast commanders for flag chaining, ganking, and map control.',
    pairings: [
      { primary: 'Xiang Yu', secondary: 'Alexander Nevsky', tier: 'S', troop: 'Cavalry', note: 'Fast, hard-hitting cavalry for flag chains and map control.' },
      { primary: 'Saladin', secondary: 'Baibars', tier: 'B', troop: 'Cavalry', note: 'Budget mobility for harassing and flagging.' },
    ],
  },
  {
    id: 'farming',
    name: 'Barbarians / Farming',
    desc: 'Best picks for barbarian/fort hunting and efficient leveling.',
    pairings: [
      { primary: 'Boudica Prime', secondary: 'Lohar', tier: 'A', troop: 'Mixed', note: 'Strong fort/barb clears with self-sustain.' },
      { primary: 'Lohar', secondary: 'Yi Seong-Gye', tier: 'B', troop: 'Mixed', note: 'Cheap, reliable barbarian XP farming.' },
    ],
  },
];
