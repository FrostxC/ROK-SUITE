// Equipment meta data — compiled July 2026 from community research:
// set builds per troop/mode (rokhub best-builds + creator set guides) and the
// BilegtROK open-field awaken/crit priority order with material cost tables.
// Equipment choices vary by pairing/playstyle — variant notes are included.

export type Troop = 'Infantry' | 'Cavalry' | 'Archer';
export type Mode = 'openField' | 'rallyGarrison';

export interface BuildSlot {
  slot: string;
  item: string;
  note?: string;
}

export interface MetaBuild {
  troop: Troop;
  mode: Mode;
  slots: BuildSlot[];
  variants: string[];
}

const EE = 'Eternal Empire';

export const META_BUILDS: MetaBuild[] = [
  {
    troop: 'Infantry',
    mode: 'openField',
    slots: [
      { slot: 'Weapon', item: `Shield of the ${EE}` },
      { slot: 'Helm', item: `Gold Helm of the ${EE}` },
      { slot: 'Chest', item: 'Hope Cloak', note: 'damage option' },
      { slot: 'Gloves', item: `Vambraces of the ${EE}` },
      { slot: 'Legs', item: 'Eternal Night', note: 'damage option' },
      { slot: 'Boots', item: `Sturdy Boots of the ${EE}` },
    ],
    variants: [
      'If your pairing lacks tankiness, swap Hope Cloak → Plate of the Eternal Empire and Eternal Night → Greaves of the Eternal Empire.',
      'Budget pre-KvK: Witch\'s Lineage · Quinn\'s Soul · Sakura Fubuki · Seth\'s Brutality · Karuak\'s Humility · Frost Treads.',
    ],
  },
  {
    troop: 'Infantry',
    mode: 'rallyGarrison',
    slots: [
      { slot: 'Weapon', item: `Shield of the ${EE}` },
      { slot: 'Helm', item: `Gold Helm of the ${EE}` },
      { slot: 'Chest', item: `Plate of the ${EE}` },
      { slot: 'Gloves', item: `Vambraces of the ${EE}` },
      { slot: 'Legs', item: `Greaves of the ${EE}` },
      { slot: 'Boots', item: `Sturdy Boots of the ${EE}` },
    ],
    variants: ['Full set bonus + max HP/DEF — garrison and rally caps favour survivability over raw attack.'],
  },
  {
    troop: 'Cavalry',
    mode: 'openField',
    slots: [
      { slot: 'Weapon', item: `Lance of the ${EE}`, note: 'or Pride of the Khan' },
      { slot: 'Helm', item: `Gold Helm of the ${EE}` },
      { slot: 'Chest', item: 'Hope Cloak', note: 'damage option' },
      { slot: 'Gloves', item: "Navar's Control" },
      { slot: 'Legs', item: 'Ash of the Dawn' },
      { slot: 'Boots', item: `Sturdy Boots of the ${EE}` },
    ],
    variants: [
      'If your pairing has built-in healing/tankiness (e.g. Nevsky + Joan Prime), keep both damage pieces; otherwise swap chest → Plate of the Eternal Empire.',
    ],
  },
  {
    troop: 'Cavalry',
    mode: 'rallyGarrison',
    slots: [
      { slot: 'Weapon', item: `Lance of the ${EE}` },
      { slot: 'Helm', item: `Gold Helm of the ${EE}` },
      { slot: 'Chest', item: `Plate of the ${EE}` },
      { slot: 'Gloves', item: `Vambraces of the ${EE}` },
      { slot: 'Legs', item: `Greaves of the ${EE}` },
      { slot: 'Boots', item: `Sturdy Boots of the ${EE}` },
    ],
    variants: ['If the pair has strong HP, defense pieces stretch further than attack.'],
  },
  {
    troop: 'Archer',
    mode: 'openField',
    slots: [
      { slot: 'Weapon', item: `Bow of the ${EE}`, note: 'or Dragon\'s Breath Bow' },
      { slot: 'Helm', item: `Gold Helm of the ${EE}` },
      { slot: 'Chest', item: 'Hope Cloak', note: 'damage option' },
      { slot: 'Gloves', item: `Vambraces of the ${EE}` },
      { slot: 'Legs', item: 'Eternal Night', note: 'skill-damage pants' },
      { slot: 'Boots', item: `Sturdy Boots of the ${EE}` },
    ],
    variants: [
      'Archers melt fast — if you get focused, trade Eternal Night for Greaves of the Eternal Empire.',
      'Skill-damage pairings value the Pendant of Eternal Night accessory highly.',
    ],
  },
  {
    troop: 'Archer',
    mode: 'rallyGarrison',
    slots: [
      { slot: 'Weapon', item: `Bow of the ${EE}` },
      { slot: 'Helm', item: `Gold Helm of the ${EE}` },
      { slot: 'Chest', item: `Plate of the ${EE}` },
      { slot: 'Gloves', item: `Vambraces of the ${EE}` },
      { slot: 'Legs', item: `Greaves of the ${EE}` },
      { slot: 'Boots', item: `Sturdy Boots of the ${EE}` },
    ],
    variants: ['Rally archers live longer in full set — the 4-piece bonus beats mixed damage pieces here.'],
  },
];

// ── Awaken / Crit priority (open field) ─────────────────────────────────────
// Source: BilegtROK's open-field awaken/crit order. Steps are global order —
// lower step = do it first. "LAST" steps are the expensive Awaken V finishers.

export interface PriorityStep {
  step: number | 'LAST';
  slot: string;
  action: string;
}

export const PRIORITY: Record<Troop, PriorityStep[]> = {
  Infantry: [
    { step: 1, slot: 'Boots', action: 'Awaken IV' },
    { step: 2, slot: 'Weapon (KvK)', action: 'Awaken IV' },
    { step: 2, slot: 'Weapon', action: 'Awaken IV' },
    { step: 3, slot: 'Helm', action: 'Awaken IV' },
    { step: 3, slot: 'Legs', action: 'Awaken IV' },
    { step: 3, slot: 'Chest', action: 'Crit' },
    { step: 4, slot: 'Helm (KvK)', action: 'Awaken IV' },
    { step: 5, slot: 'Gloves', action: 'Crit' },
    { step: 6, slot: 'Weapon (KvK)', action: 'Crit' },
    { step: 7, slot: 'Helm (KvK)', action: 'Crit' },
    { step: 8, slot: 'Weapon', action: 'Crit' },
    { step: 9, slot: 'Helm', action: 'Crit' },
    { step: 9, slot: 'Legs', action: 'Crit' },
    { step: 10, slot: 'Boots', action: 'Awaken V' },
    { step: 11, slot: 'Boots', action: 'Crit' },
    { step: 12, slot: 'Chest', action: 'Awaken II' },
    { step: 12, slot: 'Accessory', action: 'Awaken II' },
    { step: 13, slot: 'Legs', action: 'Awaken V' },
    { step: 13, slot: 'Gloves', action: 'Awaken V' },
    { step: 14, slot: 'Accessory', action: 'Awaken III' },
    { step: 15, slot: 'Accessory', action: 'Crit' },
    { step: 'LAST', slot: 'Weapon (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Weapon', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm', action: 'Awaken V' },
  ],
  Cavalry: [
    { step: 1, slot: 'Weapon (KvK)', action: 'Awaken IV' },
    { step: 1, slot: 'Weapon', action: 'Awaken IV' },
    { step: 2, slot: 'Legs', action: 'Awaken IV' },
    { step: 3, slot: 'Chest', action: 'Awaken IV' },
    { step: 4, slot: 'Helm (KvK)', action: 'Awaken IV' },
    { step: 4, slot: 'Helm', action: 'Awaken IV' },
    { step: 5, slot: 'Boots', action: 'Crit' },
    { step: 6, slot: 'Gloves', action: 'Crit' },
    { step: 7, slot: 'Weapon (KvK)', action: 'Crit' },
    { step: 8, slot: 'Helm (KvK)', action: 'Crit' },
    { step: 9, slot: 'Weapon', action: 'Crit' },
    { step: 10, slot: 'Legs', action: 'Crit' },
    { step: 11, slot: 'Chest', action: 'Crit' },
    { step: 12, slot: 'Helm', action: 'Crit' },
    { step: 12, slot: 'Accessory', action: 'Awaken III' },
    { step: 13, slot: 'Legs', action: 'Awaken V' },
    { step: 13, slot: 'Gloves', action: 'Awaken V' },
    { step: 14, slot: 'Boots', action: 'Awaken V' },
    { step: 15, slot: 'Accessory', action: 'Crit' },
    { step: 'LAST', slot: 'Weapon (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Weapon', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm', action: 'Awaken V' },
  ],
  Archer: [
    { step: 1, slot: 'Boots', action: 'Awaken IV' },
    { step: 2, slot: 'Weapon (KvK)', action: 'Awaken IV' },
    { step: 2, slot: 'Weapon', action: 'Awaken IV' },
    { step: 3, slot: 'Helm', action: 'Awaken IV' },
    { step: 3, slot: 'Legs', action: 'Awaken IV' },
    { step: 4, slot: 'Helm (KvK)', action: 'Awaken IV' },
    { step: 5, slot: 'Chest', action: 'Awaken IV' },
    { step: 5, slot: 'Gloves', action: 'Crit' },
    { step: 6, slot: 'Chest', action: 'Crit' },
    { step: 6, slot: 'Weapon (KvK)', action: 'Crit' },
    { step: 7, slot: 'Helm (KvK)', action: 'Crit' },
    { step: 8, slot: 'Weapon', action: 'Crit' },
    { step: 9, slot: 'Helm', action: 'Crit' },
    { step: 9, slot: 'Legs', action: 'Crit' },
    { step: 10, slot: 'Boots', action: 'Awaken V' },
    { step: 11, slot: 'Boots', action: 'Crit' },
    { step: 12, slot: 'Accessory', action: 'Awaken II' },
    { step: 13, slot: 'Legs', action: 'Awaken V' },
    { step: 13, slot: 'Gloves', action: 'Awaken V' },
    { step: 14, slot: 'Accessory', action: 'Awaken III' },
    { step: 15, slot: 'Accessory', action: 'Crit' },
    { step: 'LAST', slot: 'Weapon (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Weapon', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm', action: 'Awaken V' },
  ],
};

// ── Material costs ──────────────────────────────────────────────────────────
// Awaken: special materials per tier (II / III / IV / V). Crit ("special
// talent"): flat cost per stage, 4 stages. Rule of thumb: ~500 mats to awaken
// everything to IV + ~525 to crit everything ≈ ~1,000 special materials total.

export const AWAKEN_COST: { gear: string; t2: number; t3: number; t4: number; t5: number }[] = [
  { gear: 'Weapon (lvl 50)', t2: 30, t3: 55, t4: 75, t5: 120 },
  { gear: 'Accessory (45)', t2: 35, t3: 50, t4: 70, t5: 100 },
  { gear: 'Helm (lvl 50)', t2: 25, t3: 30, t4: 55, t5: 90 },
  { gear: 'Weapon (45)', t2: 20, t3: 35, t4: 50, t5: 80 },
  { gear: 'Helm (45)', t2: 15, t3: 20, t4: 35, t5: 60 },
  { gear: 'Chest (45)', t2: 15, t3: 20, t4: 35, t5: 60 },
  { gear: 'Legs (45)', t2: 15, t3: 20, t4: 35, t5: 60 },
  { gear: 'Gloves (45)', t2: 10, t3: 15, t4: 25, t5: 40 },
  { gear: 'Boots (45)', t2: 10, t3: 15, t4: 25, t5: 40 },
];

export const CRIT_COST: { gear: string; perStage: number }[] = [
  { gear: 'Weapon (lvl 50)', perStage: 45 },
  { gear: 'Accessory (45)', perStage: 60 },
  { gear: 'Helm (lvl 50)', perStage: 30 },
  { gear: 'Weapon (45)', perStage: 44 },
  { gear: 'Helm / Chest / Legs (45)', perStage: 30 },
  { gear: 'Gloves / Boots (45)', perStage: 20 },
];

// Damage rules of thumb per 10% stat (from the same analysis):
export const STAT_RULES: Record<Troop, { hp: string; def: string; atk: string }> = {
  Infantry: { hp: '≈5.5% less damage taken', def: '≈4.0% less damage taken', atk: '≈4.1% more damage' },
  Cavalry: { hp: '≈5.6% less damage taken', def: '≈4.0% less damage taken', atk: '≈4.0% more damage' },
  Archer: { hp: '≈5.8% less damage taken', def: '≈4.1% less damage taken', atk: '≈3.7% more damage' },
};
