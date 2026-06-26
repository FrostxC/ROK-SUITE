// Curated Rise of Kingdoms commander pairing meta — a COMMUNITY BASELINE, not gospel.
// Meta shifts every patch; this is an editable starting point. Tiers are role-relative
// (S = top pick for that role, A = strong, B = budget/situational).

export type Tier = 'S' | 'A' | 'B';

export interface Pairing {
  primary: string;
  secondary: string;
  tier: Tier;
  troop: 'Infantry' | 'Cavalry' | 'Archer' | 'Leadership' | 'Mixed';
  note?: string;
}

export interface MetaCategory {
  id: string;
  name: string;
  desc: string;
  pairings: Pairing[];
}

// Patch label so users know how fresh this snapshot is.
export const META_PATCH = 'Community baseline · last reviewed 2026-06';

export const COMMANDER_META: MetaCategory[] = [
  {
    id: 'open-field',
    name: 'Open Field',
    desc: 'Best pairs for fighting other players in the open field (rallies aside).',
    pairings: [
      { primary: 'Yi Seong-Gye', secondary: 'Ramesses II', tier: 'S', troop: 'Archer', note: 'Premier archer nuking duo with strong sustained damage.' },
      { primary: 'Yi Seong-Gye', secondary: 'Nebuchadnezzar II', tier: 'S', troop: 'Archer', note: 'Tanky archer line that shreds in prolonged fights.' },
      { primary: 'Alexander Nevsky', secondary: 'Scipio Africanus', tier: 'A', troop: 'Infantry', note: 'Durable infantry wall with shielding and rage control.' },
      { primary: 'William I', secondary: 'Takeda Shingen', tier: 'A', troop: 'Cavalry', note: 'High-mobility cavalry burst for picking targets.' },
      { primary: 'Alexander the Great', secondary: 'Chandragupta Maurya', tier: 'A', troop: 'Cavalry', note: 'Aggressive cavalry duelists.' },
    ],
  },
  {
    id: 'rally',
    name: 'Rally / Attack',
    desc: 'Lead commanders for rallying enemy cities, flags, and structures.',
    pairings: [
      { primary: 'Guan Yu', secondary: 'Cleopatra VII', tier: 'S', troop: 'Mixed', note: 'Classic rally nuke — Cleo amplifies Guan Yu burst.' },
      { primary: 'Ramesses II', secondary: 'Sun Tzu', tier: 'A', troop: 'Archer', note: 'Reliable f2p-friendly rally damage.' },
      { primary: 'Cao Cao', secondary: 'Baibars', tier: 'A', troop: 'Cavalry', note: 'Fast cavalry rallies and hit-and-run.' },
    ],
  },
  {
    id: 'garrison',
    name: 'Garrison / Defense',
    desc: 'Best pairs for defending cities, flags, and structures against rallies.',
    pairings: [
      { primary: 'Charles Martel', secondary: 'Yi Seong-Gye', tier: 'S', troop: 'Infantry', note: 'Gold-standard garrison: damage reduction + counter damage.' },
      { primary: 'Richard I', secondary: 'Constantine I', tier: 'A', troop: 'Infantry', note: 'Healing-heavy garrison that outlasts attackers.' },
      { primary: 'Charles Martel', secondary: 'Theodora', tier: 'A', troop: 'Infantry', note: 'Strong shielded garrison wall.' },
    ],
  },
  {
    id: 'mobility',
    name: 'Mobility / Cavalry',
    desc: 'Fast commanders for flag chaining, ganking, and map control.',
    pairings: [
      { primary: 'Cao Cao', secondary: 'Minamoto no Yoshitsune', tier: 'S', troop: 'Cavalry', note: 'Top mobility duo — extra march speed and burst.' },
      { primary: 'Saladin', secondary: 'Baibars', tier: 'A', troop: 'Cavalry', note: 'Sustained cavalry pressure.' },
    ],
  },
  {
    id: 'farming',
    name: 'Barbarians / Farming',
    desc: 'Best picks for barbarian/fort hunting and resource gathering efficiency.',
    pairings: [
      { primary: 'Lohar', secondary: 'Any healer', tier: 'S', troop: 'Mixed', note: 'Cheapest reliable barbarian farmer with self-heal.' },
      { primary: 'Cao Cao', secondary: 'Lohar', tier: 'A', troop: 'Cavalry', note: 'Fast barb clears with low losses.' },
      { primary: 'Boudica', secondary: 'Sun Tzu', tier: 'B', troop: 'Mixed', note: 'Early-game budget barb farming.' },
    ],
  },
];
