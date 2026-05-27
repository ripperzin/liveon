// Design system constants for Live ON
export const Colors = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4A3DB8',
  secondary: '#00D2FF',
  secondaryLight: '#74E4FF',
  secondaryDark: '#00A3CC',
  accentGold: '#FDCB6E',
  accentCoral: '#FF6B6B',
  accentGreen: '#00B894',
  surfaceDark: '#0D1B2A',
  surface: '#1B2838',
  surfaceLight: '#243447',
  textPrimary: '#FFFFFF',
  textSecondary: '#B2BEC3',
  textMuted: '#636E72',
  // Attributes
  attrVitality: '#4FC3F7',
  attrStrength: '#F44336',
  attrIntelligence: '#9C27B0',
  attrFocus: '#FF9800',
  attrClarity: '#00BCD4',
  attrCharisma: '#E91E63',
  attrMindfulness: '#4CAF50',
  attrRecovery: '#3F51B5',
  // Rarity
  rarityCommon: '#B2BEC3',
  rarityUncommon: '#00B894',
  rarityRare: '#0984E3',
  rarityEpic: '#6C5CE7',
  rarityLegendary: '#FDCB6E',
  // Streak flames
  streakLow: '#FF9800',
  streakMedium: '#FF5722',
  streakHigh: '#2196F3',
  streakEpic: '#9C27B0',
  streakLegendary: '#FDCB6E',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'good_morning';
  if (hour < 18) return 'good_afternoon';
  return 'good_evening';
}

export function getStreakColor(streak: number): string {
  if (streak >= 30) return Colors.streakLegendary;
  if (streak >= 14) return Colors.streakEpic;
  if (streak >= 7) return Colors.streakHigh;
  if (streak >= 3) return Colors.streakMedium;
  return Colors.streakLow;
}

export function getStreakMultiplier(streak: number): number {
  return Math.min(2.0, 1.0 + streak * 0.05);
}

export function getRarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common: Colors.rarityCommon,
    uncommon: Colors.rarityUncommon,
    rare: Colors.rarityRare,
    epic: Colors.rarityEpic,
    legendary: Colors.rarityLegendary,
  };
  return map[rarity] || Colors.rarityCommon;
}

export function getAttributeColor(slug: string): string {
  const map: Record<string, string> = {
    vitality: Colors.attrVitality,
    strength: Colors.attrStrength,
    intelligence: Colors.attrIntelligence,
    focus: Colors.attrFocus,
    clarity: Colors.attrClarity,
    charisma: Colors.attrCharisma,
    mindfulness: Colors.attrMindfulness,
    recovery: Colors.attrRecovery,
  };
  return map[slug] || Colors.primary;
}

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}
