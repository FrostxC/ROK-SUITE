// Equipment meta data — rebuilt July 2026 by transcribing BilegtROK's two
// guides frame-by-frame (icons identified against the in-game sprite table,
// see _ui-tools/equip-gamedata.json):
//   1. "Never Go Wrong Crafting These Sets" (Z0zoV7EGkNs) — the build grids
//      per troop with 2-3 open-field and 1-2 rally variants, siege, accessories.
//   2. "Step by Step Awaken & Crit Priority" (Or09gydysUI) — the open-field
//      awaken/crit order matrix and material cost tables (read off the sheet).
// Every item name below is validated against EQUIP_SPRITES (all legendary
// except Ancient Stratagems, an epic accessory the rally meta actually uses).

export type Troop = 'Infantry' | 'Cavalry' | 'Archer' | 'Siege';
export type Mode = 'openField' | 'rallyGarrison';

export type SlotKey = 'Helm' | 'Weapon' | 'Chest' | 'Gloves' | 'Legs' | 'Boots';

export interface BuildVariant {
  name: string;              // short variant label
  note?: string;             // the video's caption for when to use it
  slots: Record<SlotKey, string>;
}

export interface TroopBuilds {
  troop: Troop;
  openField: BuildVariant[];
  rallyGarrison: BuildVariant[];
}

export const TROOP_BUILDS: TroopBuilds[] = [
  {
    troop: 'Infantry',
    openField: [
      {
        name: 'Damage pants',
        note: 'If your pairing has HP, put Eternal Night.',
        slots: {
          Helm: 'Gold Helm of the Eternal Empire',
          Weapon: 'Shield of the Eternal Empire',
          Chest: 'Hope Cloak',
          Gloves: "Navar's Control",
          Legs: 'Eternal Night',
          Boots: 'Sturdy Boots of the Eternal Empire',
        },
      },
      {
        name: 'Tanky option',
        note: 'For tanky options.',
        slots: {
          Helm: 'Helm of the Conqueror',
          Weapon: 'Hammer of the Sun and Moon',
          Chest: 'Plate of the Eternal Empire',
          Gloves: "Navar's Control",
          Legs: 'Greaves of the Eternal Empire',
          Boots: 'Sturdy Boots of the Eternal Empire',
        },
      },
      {
        name: 'Leadership pants',
        note: 'If your pairing has DEF, put leadership pants.',
        slots: {
          Helm: 'Gold Helm of the Eternal Empire',
          Weapon: 'Shield of the Eternal Empire',
          Chest: 'Hope Cloak',
          Gloves: "Navar's Control",
          Legs: 'Chausses of the Glorious Goddess',
          Boots: 'Sturdy Boots of the Eternal Empire',
        },
      },
    ],
    rallyGarrison: [
      {
        name: 'Standard',
        note: 'If your pair has HP, put DEF equipment.',
        slots: {
          Helm: 'Helm of the Conqueror',
          Weapon: 'Hammer of the Sun and Moon',
          Chest: 'Hope Cloak',
          Gloves: "Navar's Control",
          Legs: 'Eternal Night',
          Boots: 'Sturdy Boots of the Eternal Empire',
        },
      },
      {
        name: 'HP version',
        note: 'If your pair has DEF, put the HP version.',
        slots: {
          Helm: 'Helm of the Conqueror',
          Weapon: 'Hammer of the Sun and Moon',
          Chest: 'Hope Cloak',
          Gloves: 'Sacred Grips',
          Legs: 'Chausses of the Glorious Goddess',
          Boots: 'Greaves of the Glorious Goddess',
        },
      },
    ],
  },
  {
    troop: 'Cavalry',
    openField: [
      {
        name: 'Khan build',
        slots: {
          Helm: 'Pride of the Khan',
          Weapon: 'Sacred Dominion',
          Chest: 'Heavy Armor of the Hellish Wasteland',
          Gloves: "Navar's Control",
          Legs: 'Ash of the Dawn',
          Boots: 'Boots of the Hellish Wasteland',
        },
      },
      {
        name: 'Hellish Wasteland',
        slots: {
          Helm: 'War Helm of the Hellish Wasteland',
          Weapon: 'Lance of the Hellish Wasteland',
          Chest: 'Heavy Armor of the Hellish Wasteland',
          Gloves: "Navar's Control",
          Legs: 'Ash of the Dawn',
          Boots: 'Boots of the Hellish Wasteland',
        },
      },
    ],
    rallyGarrison: [
      {
        name: 'Standard',
        slots: {
          Helm: 'Pride of the Khan',
          Weapon: 'Sacred Dominion',
          Chest: 'Heavy Armor of the Hellish Wasteland',
          Gloves: "Navar's Control",
          Legs: 'Ash of the Dawn',
          Boots: 'Boots of the Hellish Wasteland',
        },
      },
    ],
  },
  {
    troop: 'Archer',
    openField: [
      {
        name: 'Milky Way build',
        slots: {
          Helm: 'Ancestral Mask of Night',
          Weapon: "The Hydra's Blast",
          Chest: 'The Milky Way',
          Gloves: "Ian's Choice",
          Legs: 'Chausses of the Glorious Goddess',
          Boots: 'Greaves of the Glorious Goddess',
        },
      },
      {
        name: "Dragon's Breath",
        slots: {
          Helm: 'Ancestral Mask of Night',
          Weapon: "The Hydra's Blast",
          Chest: "Dragon's Breath Plate",
          Gloves: "Dragon's Breath Vambraces",
          Legs: "Dragon's Breath Tassets",
          Boots: "Dragon's Breath Boots",
        },
      },
      {
        name: 'No-Mask budget',
        note: "Otherwise this one (without Ancestral Mask / Hydra's Blast).",
        slots: {
          Helm: "Dragon's Breath Helm",
          Weapon: 'Twilight Epiphany',
          Chest: "Dragon's Breath Plate",
          Gloves: "Dragon's Breath Vambraces",
          Legs: "Dragon's Breath Tassets",
          Boots: "Dragon's Breath Boots",
        },
      },
    ],
    rallyGarrison: [
      {
        name: 'Standard',
        note: 'Otherwise this one.',
        slots: {
          Helm: 'Ancestral Mask of Night',
          Weapon: "The Hydra's Blast",
          Chest: "Dragon's Breath Plate",
          Gloves: "Dragon's Breath Vambraces",
          Legs: "Dragon's Breath Tassets",
          Boots: "Dragon's Breath Boots",
        },
      },
      {
        name: 'Leadership legs+boots',
        note: 'If your commanders have the leadership (Glorious Goddess) pieces.',
        slots: {
          Helm: 'Ancestral Mask of Night',
          Weapon: "The Hydra's Blast",
          Chest: "Dragon's Breath Plate",
          Gloves: "Dragon's Breath Vambraces",
          Legs: 'Chausses of the Glorious Goddess',
          Boots: 'Greaves of the Glorious Goddess',
        },
      },
    ],
  },
  {
    troop: 'Siege',
    openField: [
      {
        name: 'Wolf set',
        slots: {
          Helm: "Fierce Wolf's Helmet",
          Weapon: 'Twilight Epiphany',
          Chest: "Vigilant Wolf's Leather Armor",
          Gloves: "Wailing Wolf's Gauntlets",
          Legs: "Lone Wolf's Leather Tassets",
          Boots: "Roaring Wolf's Claws",
        },
      },
    ],
    rallyGarrison: [],
  },
];

// ── Accessories (video's dedicated section) ─────────────────────────────────
export interface AccessoryPair {
  items: [string, string];
  note: string;
}

export const ACCESSORIES: Record<Mode, AccessoryPair[]> = {
  openField: [
    { items: ['Horn of Fury', 'Ring of Doom'], note: 'Never go wrong with this — most versatile.' },
    { items: ['Horn of Fury', "Karuak's War Drums"], note: 'Unorthodox build.' },
    { items: ['Pendant of Eternal Night', 'Greatest Glory'], note: 'For 6th or 7th march options, for versatility.' },
  ],
  rallyGarrison: [
    { items: ['Horn of Fury', 'Ring of Doom'], note: 'Standard rally & garrison pair.' },
    { items: ['Ancient Stratagems', 'Greatest Glory'], note: 'Situational.' },
  ],
};

// ── Set Builder catalog (legendary only) ────────────────────────────────────
// Legendary-only pieces per slot with their in-game set. Names all resolve to
// EQUIP_SPRITES. The builder combines set membership (factual) into live
// set-bonus tracking — no fabricated stat numbers.

export interface CatalogPiece {
  name: string;
  slot: SlotKey;
  set?: string;   // named equipment set, if the piece belongs to one
}

export const EQUIP_SETS = [
  'Eternal Empire',
  'Dragon\'s Breath',
  'Hellish Wasteland',
  'Glorious Goddess',
] as const;

export const SET_BUILDER_CATALOG: CatalogPiece[] = [
  // Weapons
  { name: 'Shield of the Eternal Empire', slot: 'Weapon', set: 'Eternal Empire' },
  { name: 'Hammer of the Sun and Moon', slot: 'Weapon' },
  { name: 'Sacred Dominion', slot: 'Weapon' },
  { name: 'The Hydra\'s Blast', slot: 'Weapon' },
  { name: 'Lance of the Hellish Wasteland', slot: 'Weapon', set: 'Hellish Wasteland' },
  { name: 'Dragon\'s Breath Bow', slot: 'Weapon', set: 'Dragon\'s Breath' },
  { name: 'Twilight Epiphany', slot: 'Weapon' },
  // Helms
  { name: 'Gold Helm of the Eternal Empire', slot: 'Helm', set: 'Eternal Empire' },
  { name: 'Helm of the Conqueror', slot: 'Helm' },
  { name: 'Pride of the Khan', slot: 'Helm' },
  { name: 'Ancestral Mask of Night', slot: 'Helm' },
  { name: 'War Helm of the Hellish Wasteland', slot: 'Helm', set: 'Hellish Wasteland' },
  { name: 'Dragon\'s Breath Helm', slot: 'Helm', set: 'Dragon\'s Breath' },
  // Chests
  { name: 'Plate of the Eternal Empire', slot: 'Chest', set: 'Eternal Empire' },
  { name: 'Hope Cloak', slot: 'Chest' },
  { name: 'The Milky Way', slot: 'Chest' },
  { name: 'Heavy Armor of the Hellish Wasteland', slot: 'Chest', set: 'Hellish Wasteland' },
  { name: 'Dragon\'s Breath Plate', slot: 'Chest', set: 'Dragon\'s Breath' },
  { name: 'Vigilant Wolf\'s Leather Armor', slot: 'Chest' },
  // Gloves
  { name: 'Vambraces of the Eternal Empire', slot: 'Gloves', set: 'Eternal Empire' },
  { name: 'Navar\'s Control', slot: 'Gloves' },
  { name: 'Sacred Grips', slot: 'Gloves' },
  { name: 'Ian\'s Choice', slot: 'Gloves' },
  { name: 'Armband of the Hellish Wasteland', slot: 'Gloves', set: 'Hellish Wasteland' },
  { name: 'Dragon\'s Breath Vambraces', slot: 'Gloves', set: 'Dragon\'s Breath' },
  // Legs
  { name: 'Greaves of the Eternal Empire', slot: 'Legs', set: 'Eternal Empire' },
  { name: 'Eternal Night', slot: 'Legs' },
  { name: 'Ash of the Dawn', slot: 'Legs' },
  { name: 'Chausses of the Glorious Goddess', slot: 'Legs', set: 'Glorious Goddess' },
  { name: 'Tassets of the Hellish Wasteland', slot: 'Legs', set: 'Hellish Wasteland' },
  { name: 'Dragon\'s Breath Tassets', slot: 'Legs', set: 'Dragon\'s Breath' },
  // Boots
  { name: 'Sturdy Boots of the Eternal Empire', slot: 'Boots', set: 'Eternal Empire' },
  { name: 'Boots of the Hellish Wasteland', slot: 'Boots', set: 'Hellish Wasteland' },
  { name: 'Greaves of the Glorious Goddess', slot: 'Boots', set: 'Glorious Goddess' },
  { name: 'Dragon\'s Breath Boots', slot: 'Boots', set: 'Dragon\'s Breath' },
  { name: 'Commander\'s Boots', slot: 'Boots' },
  { name: 'Mountain Crushers', slot: 'Boots' },
];

// Set-bonus tiers — verified values (theriagames equipment guides). Only sets
// with confirmed bonuses are listed; a set absent here still shows its piece
// count in the builder, just without claimed bonus values.
export interface SetBonusTier { pieces: number; bonus: string }

export const SET_BONUSES: Record<string, SetBonusTier[]> = {
  'Eternal Empire': [
    { pieces: 2, bonus: 'Troop Defense +3%' },
    { pieces: 4, bonus: 'March Speed +10%' },
    { pieces: 6, bonus: 'Infantry Attack +5%' },
  ],
  'Dragon\'s Breath': [
    { pieces: 2, bonus: 'Troop Attack +3%' },
    { pieces: 4, bonus: 'Skill Damage +3%' },
    { pieces: 6, bonus: 'Archer Health +5%' },
  ],
  'Hellish Wasteland': [
    { pieces: 2, bonus: 'Troop Health +3%' },
    { pieces: 4, bonus: 'Counterattack Damage +3%' },
    { pieces: 6, bonus: 'Cavalry Defense +5%' },
  ],
};

// ── Awaken / Crit priority (open field) ─────────────────────────────────────
// Source: BilegtROK "OPEN FIELD AWAKEN/CRIT ORDER" sheet. Steps are global
// order — lower step first; same step = either first. "LAST" = the expensive
// Awaken V finishers on weapons/helms.

export interface PriorityStep {
  step: number | 'LAST';
  slot: string;
  action: string;
}

export const PRIORITY: Record<Exclude<Troop, 'Siege'>, PriorityStep[]> = {
  Infantry: [
    { step: 1, slot: 'Boots', action: 'Awaken IV' },
    { step: 2, slot: 'Weapon (KvK)', action: 'Awaken IV' },
    { step: 2, slot: 'Weapon', action: 'Awaken IV' },
    { step: 3, slot: 'Helm', action: 'Awaken IV' },
    { step: 3, slot: 'Pants', action: 'Awaken IV' },
    { step: 3, slot: 'Chest', action: 'Crit' },
    { step: 4, slot: 'Helm (KvK)', action: 'Awaken IV' },
    { step: 5, slot: 'Gloves', action: 'Crit' },
    { step: 6, slot: 'Weapon (KvK)', action: 'Crit' },
    { step: 7, slot: 'Helm (KvK)', action: 'Crit' },
    { step: 8, slot: 'Weapon', action: 'Crit' },
    { step: 9, slot: 'Helm', action: 'Crit' },
    { step: 9, slot: 'Pants', action: 'Crit' },
    { step: 10, slot: 'Boots', action: 'Awaken V' },
    { step: 11, slot: 'Boots', action: 'Crit' },
    { step: 12, slot: 'Chest', action: 'Awaken II' },
    { step: 12, slot: 'Accessory', action: 'Awaken II' },
    { step: 13, slot: 'Pants', action: 'Awaken V' },
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
    { step: 2, slot: 'Pants', action: 'Awaken IV' },
    { step: 3, slot: 'Chest', action: 'Awaken IV' },
    { step: 4, slot: 'Helm (KvK)', action: 'Awaken IV' },
    { step: 4, slot: 'Helm', action: 'Awaken IV' },
    { step: 5, slot: 'Boots', action: 'Crit' },
    { step: 6, slot: 'Gloves', action: 'Crit' },
    { step: 7, slot: 'Weapon (KvK)', action: 'Crit' },
    { step: 8, slot: 'Helm (KvK)', action: 'Crit' },
    { step: 9, slot: 'Weapon', action: 'Crit' },
    { step: 10, slot: 'Pants', action: 'Crit' },
    { step: 11, slot: 'Chest', action: 'Crit' },
    { step: 12, slot: 'Helm', action: 'Crit' },
    { step: 12, slot: 'Accessory', action: 'Awaken II' },
    { step: 13, slot: 'Pants', action: 'Awaken V' },
    { step: 13, slot: 'Gloves', action: 'Awaken V' },
    { step: 14, slot: 'Boots', action: 'Awaken V' },
    { step: 14, slot: 'Accessory', action: 'Awaken III' },
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
    { step: 3, slot: 'Pants', action: 'Awaken IV' },
    { step: 4, slot: 'Helm (KvK)', action: 'Awaken IV' },
    { step: 5, slot: 'Chest', action: 'Awaken II' },
    { step: 5, slot: 'Gloves', action: 'Crit' },
    { step: 6, slot: 'Chest', action: 'Crit' },
    { step: 6, slot: 'Weapon (KvK)', action: 'Crit' },
    { step: 7, slot: 'Helm (KvK)', action: 'Crit' },
    { step: 8, slot: 'Weapon', action: 'Crit' },
    { step: 9, slot: 'Helm', action: 'Crit' },
    { step: 9, slot: 'Pants', action: 'Crit' },
    { step: 10, slot: 'Boots', action: 'Awaken V' },
    { step: 11, slot: 'Boots', action: 'Crit' },
    { step: 12, slot: 'Accessory', action: 'Awaken II' },
    { step: 13, slot: 'Pants', action: 'Awaken V' },
    { step: 13, slot: 'Gloves', action: 'Awaken V' },
    { step: 14, slot: 'Accessory', action: 'Awaken III' },
    { step: 15, slot: 'Accessory', action: 'Crit' },
    { step: 'LAST', slot: 'Weapon (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Weapon', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm (KvK)', action: 'Awaken V' },
    { step: 'LAST', slot: 'Helm', action: 'Awaken V' },
  ],
};

// ── Material costs (from the same sheet) ────────────────────────────────────
// Awaken: special materials per tier (II / III / IV / V). Crit ("special
// talent"): flat cost per stage, 4 stages.

export const AWAKEN_COST: { gear: string; t2: number; t3: number; t4: number; t5: number }[] = [
  { gear: 'Weapon (lvl 50)', t2: 30, t3: 55, t4: 75, t5: 120 },
  { gear: 'Accessory (45)', t2: 35, t3: 50, t4: 70, t5: 100 },
  { gear: 'Helm (lvl 50)', t2: 25, t3: 30, t4: 55, t5: 90 },
  { gear: 'Weapon (45)', t2: 20, t3: 35, t4: 50, t5: 80 },
  { gear: 'Helm (45)', t2: 15, t3: 20, t4: 35, t5: 60 },
  { gear: 'Chest (45)', t2: 15, t3: 20, t4: 35, t5: 60 },
  { gear: 'Pants (45)', t2: 15, t3: 20, t4: 35, t5: 60 },
  { gear: 'Gloves (45)', t2: 10, t3: 15, t4: 20, t5: 40 },
  { gear: 'Boots (45)', t2: 10, t3: 15, t4: 20, t5: 40 },
];

export const CRIT_COST: { gear: string; perStage: number }[] = [
  { gear: 'Weapon (lvl 50)', perStage: 45 },
  { gear: 'Accessory (45)', perStage: 60 },
  { gear: 'Helm (lvl 50)', perStage: 30 },
  { gear: 'Weapon (45)', perStage: 44 },
  { gear: 'Helm / Chest / Pants (45)', perStage: 30 },
  { gear: 'Gloves / Boots (45)', perStage: 20 },
  { gear: 'Leadership gear', perStage: 19 },
];

// Damage rules of thumb per 10% stat (community analysis):
export const STAT_RULES: Record<Exclude<Troop, 'Siege'>, { hp: string; def: string; atk: string }> = {
  Infantry: { hp: '≈5.5% less damage taken', def: '≈4.0% less damage taken', atk: '≈4.1% more damage' },
  Cavalry: { hp: '≈5.6% less damage taken', def: '≈4.0% less damage taken', atk: '≈4.0% more damage' },
  Archer: { hp: '≈5.8% less damage taken', def: '≈4.1% less damage taken', atk: '≈3.7% more damage' },
};
