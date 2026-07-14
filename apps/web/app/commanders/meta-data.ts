// Rise of Kingdoms commander pairing meta — built from REAL live battle data.
// Source: rokbattles.com live battle-report feed (what top players actually run),
// aggregated across multiple samples June–July 2026 and ranked by usage frequency
// + kill output. Attacker-side pairings feed Open Field / Rally; the most-seen
// defender pairings feed Defense. Editable; tiers are usage/impact-based.

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

export const META_PATCH = 'From live battle data (rokbattles.com) · sampled July 2026';

export const COMMANDER_META: MetaCategory[] = [
  {
    id: 'open-field',
    name: 'Open Field',
    desc: 'The marches top players actually run in open-field PvP, ranked by how often they appear in live battle reports.',
    pairings: [
      { primary: 'Qin Shi Huang', secondary: 'Yi Seong-Gye', tier: 'S', troop: 'Archer', note: 'Most consistent top march across every sample — huge sustained kills.' },
      { primary: 'Bai Qi', secondary: 'Sun Tzu', tier: 'S', troop: 'Infantry', note: 'Everywhere on live servers — run on both attack and defense.' },
      { primary: 'Alp Arslan', secondary: 'Zhuge Liang', tier: 'S', troop: 'Archer', note: 'Surging archer line in the latest battles.' },
      { primary: 'Achilles', secondary: 'Vercingetorix', tier: 'S', troop: 'Cavalry', note: 'High-frequency cavalry attacker with big trades.' },
      { primary: 'Liu Che', secondary: 'Sun Tzu', tier: 'S', troop: 'Infantry', note: 'Core infantry murderball march.' },
      { primary: 'Qin Shi Huang', secondary: 'Zhuge Liang', tier: 'A', troop: 'Archer', note: 'Top archer variant — common on both sides of fights.' },
      { primary: 'Shapur I', secondary: 'Zhuge Liang', tier: 'A', troop: 'Archer', note: 'Highest single-battle kills tracked (1.1M).' },
      { primary: 'Alexander Nevsky', secondary: 'Joan of Arc', tier: 'A', troop: 'Cavalry', note: 'Cavalry burst with strong kill output.' },
      { primary: 'David IV', secondary: 'Hector', tier: 'A', troop: 'Infantry', note: 'Monster infantry carry — million-kill fights.' },
      { primary: 'Sun Tzu', secondary: 'William Wallace', tier: 'B', troop: 'Infantry', note: 'Budget infantry bruiser pairing.' },
    ],
  },
  {
    id: 'rally',
    name: 'Rally / Attack',
    desc: 'The highest-kill offensive pairings seen attacking objectives and structures in the live feed.',
    pairings: [
      { primary: 'Arthur Pendragon', secondary: 'Gang Gamchan', tier: 'S', troop: 'Archer', note: 'Top attacker kills in the latest sample (79K+ per session).' },
      { primary: 'Ragnar Lodbrok', secondary: 'Scipio Africanus', tier: 'A', troop: 'Infantry', note: 'Reliable offensive infantry line.' },
      { primary: 'Hermann', secondary: 'Zhuge Liang', tier: 'A', troop: 'Archer', note: 'Archer burst for assaults.' },
      { primary: 'Bai Qi', secondary: 'Liu Che', tier: 'A', troop: 'Infantry', note: 'Heavy infantry damage with strong trades.' },
      { primary: 'Arthur Pendragon', secondary: 'Huo Qubing', tier: 'B', troop: 'Mixed', note: 'Mobile harass with solid kill output.' },
      { primary: 'Liu Che', secondary: 'Philip II', tier: 'B', troop: 'Infantry', note: 'Offensive infantry burst variant.' },
    ],
  },
  {
    id: 'garrison',
    name: 'Garrison / Defense',
    desc: 'The pairings most often seen DEFENDING in live battles — the current top defensive setups.',
    pairings: [
      { primary: 'Achilles', secondary: 'Attila', tier: 'S', troop: 'Cavalry', note: 'The wall of the current meta — 34 defensive appearances in one sample.' },
      { primary: 'Qin Shi Huang', secondary: 'Zhuge Liang', tier: 'S', troop: 'Archer', note: 'Most-seen archer defense.' },
      { primary: 'Bai Qi', secondary: 'Sun Tzu', tier: 'A', troop: 'Infantry', note: 'Sturdy infantry defense that trades well.' },
      { primary: 'Gorgo', secondary: 'Tokugawa Ieyasu', tier: 'A', troop: 'Infantry', note: 'Frequent garrison pairing across samples.' },
      { primary: 'Achilles', secondary: 'Gang Gamchan', tier: 'A', troop: 'Mixed', note: 'Common defensive setup.' },
      { primary: 'Cao Cao', secondary: 'Seondeok', tier: 'B', troop: 'Cavalry', note: 'Budget defensive line seen holding objectives.' },
    ],
  },
  {
    id: 'farming',
    name: 'Barbarians / Farming',
    desc: 'Best picks for barbarian/fort hunting and efficient leveling.',
    pairings: [
      { primary: 'Boudica', secondary: 'Lohar', tier: 'A', troop: 'Mixed', note: 'Strong fort/barb clears with self-sustain.' },
      { primary: 'Lohar', secondary: 'Yi Seong-Gye', tier: 'B', troop: 'Mixed', note: 'Cheap, reliable barbarian XP farming.' },
    ],
  },
];
