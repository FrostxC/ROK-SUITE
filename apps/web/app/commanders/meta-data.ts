// Rise of Kingdoms commander pairing meta — current as of June 2026.
// Compiled from current community pairing guides (riseofkingdomsguides.com,
// allclash.com, lootbar). Meta shifts with every Legendary/Prime release; "best"
// is partly opinion. Editable, role-relative baseline (S = top pick, A = strong,
// B = budget/situational).

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
    desc: 'Best marches for open-field PvP. The current murderball runs 2 cavalry + 2 infantry + 2 archer.',
    pairings: [
      { primary: 'Xiang Yu', secondary: 'Honda Tadakatsu', tier: 'S', troop: 'Cavalry', note: 'Top cavalry open-field duo — huge single-target burst with sustain.' },
      { primary: 'Alexander Nevsky', secondary: 'Joan of Arc Prime', tier: 'S', troop: 'Cavalry', note: 'Charge damage with heal-over-time to survive long swarm fights.' },
      { primary: 'Zhuge Liang', secondary: 'Hermann Prime', tier: 'S', troop: 'Archer', note: 'Top archer line of 2026 — Zhuge displaced YSG as the #1 archer; massive AoE + true damage.' },
      { primary: 'Nebuchadnezzar II', secondary: 'Henry V', tier: 'A', troop: 'Archer', note: 'Strong AoE archer with skill-damage buffs.' },
      { primary: 'Liu Che', secondary: 'Scipio Africanus Prime', tier: 'S', troop: 'Infantry', note: 'Top infantry open-field bruiser — holds its own even into archers.' },
      { primary: 'Guan Yu', secondary: 'Scipio Africanus Prime', tier: 'A', troop: 'Infantry', note: 'Balanced damage + defense for sustained field fights.' },
      { primary: 'Sun Tzu Prime', secondary: 'Scipio Africanus Prime', tier: 'A', troop: 'Infantry', note: 'Sun Tzu Prime revitalized infantry; strong into cavalry.' },
    ],
  },
  {
    id: 'rally',
    name: 'Rally / Attack',
    desc: 'Lead commanders for rallying cities, flags, forts, and AoO objectives. Anti-healing dominates.',
    pairings: [
      { primary: 'Nebuchadnezzar II', secondary: 'Gilgamesh', tier: 'S', troop: 'Mixed', note: 'Strongest city-attack rally — anti-healing + conquering combo.' },
      { primary: 'Zhuge Liang', secondary: 'Gilgamesh', tier: 'S', troop: 'Archer', note: 'Highest archer burst for objective assaults.' },
      { primary: 'Harald Sigurdsson', secondary: 'Alexander the Great', tier: 'S', troop: 'Infantry', note: 'Anti-healing infantry rally that shuts down garrison healers.' },
      { primary: 'Alexander Nevsky', secondary: 'Justinian I', tier: 'S', troop: 'Cavalry', note: 'Insane for rallying flags, forts and AoO objectives.' },
      { primary: 'Tariq ibn Ziyad', secondary: 'Sargon the Great', tier: 'A', troop: 'Infantry', note: 'Great skill + talent synergy for coordinated infantry rallies.' },
      { primary: 'Attila', secondary: 'Chandragupta Maurya', tier: 'A', troop: 'Cavalry', note: 'High-burst cavalry rally for city attacks.' },
    ],
  },
  {
    id: 'garrison',
    name: 'Garrison / Defense',
    desc: 'Best pairs for defending cities, flags, and structures against rallies.',
    pairings: [
      { primary: 'Gorgo', secondary: 'Constantine I', tier: 'S', troop: 'Infantry', note: 'Top garrison — heavy damage mitigation, healing, and counter damage.' },
      { primary: 'Yi Sun-sin', secondary: 'Theodora', tier: 'A', troop: 'Mixed', note: 'Strong mixed-troop garrison, great against rallies.' },
      { primary: 'Zenobia', secondary: 'Gorgo', tier: 'A', troop: 'Infantry', note: 'Tanky infantry garrison wall.' },
    ],
  },
  {
    id: 'mobility',
    name: 'Mobility / Canyon',
    desc: 'Fast commanders for Sunset Canyon, flag chaining, ganking, and map control.',
    pairings: [
      { primary: 'Aethelflaed', secondary: 'Yi Seong-Gye', tier: 'S', troop: 'Mixed', note: 'Excellent AoE + rage regen — premier Sunset Canyon combo.' },
      { primary: 'Xiang Yu', secondary: 'Alexander Nevsky', tier: 'A', troop: 'Cavalry', note: 'Fast, hard-hitting cavalry for flag chains and map control.' },
    ],
  },
  {
    id: 'farming',
    name: 'Barbarians / Farming',
    desc: 'Best picks for barbarian/fort hunting and efficient leveling.',
    pairings: [
      { primary: 'Charles Martel', secondary: 'Sun Tzu', tier: 'S', troop: 'Infantry', note: 'Damage + utility for efficient, low-loss barb farming.' },
      { primary: 'Boudica Prime', secondary: 'Lohar', tier: 'A', troop: 'Mixed', note: 'Strong fort/barb clears with self-sustain.' },
      { primary: 'Lohar', secondary: 'Yi Seong-Gye', tier: 'B', troop: 'Mixed', note: 'Cheap, reliable barbarian XP farming.' },
    ],
  },
];
