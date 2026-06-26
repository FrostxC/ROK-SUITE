// Rise of Kingdoms game-data constants used by the calculators.
// Sourced from community references (riseofkingdomsguides.com, RoK wiki). These are
// editable in one place so they can be corrected if the game changes.

// VIP cumulative points required to REACH each level.
// Source: riseofkingdomsguides.com VIP guide (cumulative running totals).
export const VIP_THRESHOLDS: { level: number; points: number }[] = [
  { level: 0, points: 0 },
  { level: 1, points: 200 },
  { level: 2, points: 600 },
  { level: 3, points: 1_800 },
  { level: 4, points: 5_300 },
  { level: 5, points: 11_300 },
  { level: 6, points: 22_800 },
  { level: 7, points: 40_300 },
  { level: 8, points: 75_300 },
  { level: 9, points: 150_300 },
  { level: 10, points: 300_300 },
  { level: 11, points: 550_300 },
  { level: 12, points: 900_300 },
  { level: 13, points: 1_400_300 },
  { level: 14, points: 2_150_300 },
  { level: 15, points: 3_150_300 },
];

// Total commander sculptures to FULLY MAX (6 stars, skills 5/5/5/5).
// Source: riseofkingdomsguides.com sculptures guide.
export const SCULPTURES_TO_MAX: Record<string, number> = {
  legendary: 690,
  epic: 440,
};

// Commander XP. Total XP to take a commander from level 1 to 60 (~49 million).
// Tome of Knowledge XP values by tier.
export const XP_TO_LEVEL_60 = 49_000_000;
export const TOME_VALUES: { label: string; xp: number }[] = [
  { label: '1,000 XP', xp: 1_000 },
  { label: '5,000 XP', xp: 5_000 },
  { label: '10,000 XP', xp: 10_000 },
  { label: '50,000 XP', xp: 50_000 },
];
