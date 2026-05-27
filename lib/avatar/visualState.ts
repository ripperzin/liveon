import type {
  AttributeSlug,
  AvatarVisualState,
  AuraStyle,
  AccessoryId,
  IdleVariant,
  RawHabitLog,
} from '../../types/avatar';

// ─── Cores de aura por atributo dominante ───────────────────────────────────
const ATTRIBUTE_AURA_COLOR: Record<AttributeSlug, string> = {
  intelligence: '#8B5CF6', // roxo
  strength:     '#F97316', // laranja
  focus:        '#3B82F6', // azul
  vitality:     '#22C55E', // verde
  social:       '#EC4899', // rosa
};

// ─── Cor de aura por estado visual ──────────────────────────────────────────
const STATE_AURA_COLOR: Record<AvatarVisualState, string> = {
  energetic: '#F59E0B', // âmbar quente
  inspired:  '#8B5CF6', // roxo
  balanced:  '#6EE7B7', // verde-teal suave
  focused:   '#3B82F6', // azul
  tired:     '#94A3B8', // cinza frio — nunca punitivo, só suave
};

// ─── Derivação do estado visual ──────────────────────────────────────────────

/**
 * Deriva o AvatarVisualState a partir de:
 *  - momentum (0–100)
 *  - atributos do usuário
 *  - logs recentes (últimas 48h)
 *
 * Hierarquia de prioridade:
 *  1. tired     — se momentum muito baixo ou 3+ dias inativos
 *  2. energetic — se momentum muito alto
 *  3. focused   — se foco dominante + atividade recente
 *  4. inspired  — se inteligência dominante + consistência média+
 *  5. balanced  — se todos os atributos equilibrados
 *  6. energetic — fallback para momentum bom
 */
export function deriveVisualState(
  momentum: number,
  attributeScores: Partial<Record<AttributeSlug, number>>,
  recentLogs: RawHabitLog[]
): AvatarVisualState {
  const daysSinceActive = calcDaysSinceLastActivity(recentLogs);

  // 1. Tired — o único estado "negativo", mas acolhedor
  if (momentum < 30 || daysSinceActive >= 3) return 'tired';

  // 2. Energetic — momentum alto
  if (momentum >= 75) return 'energetic';

  const dominant = getDominantAttribute(attributeScores);
  const isBalanced = checkBalance(attributeScores);

  // 3. Focused
  if (dominant === 'focus' && daysSinceActive <= 1) return 'focused';

  // 4. Inspired
  if (dominant === 'intelligence' && momentum >= 45) return 'inspired';

  // 5. Balanced
  if (isBalanced) return 'balanced';

  // 6. Fallback
  return momentum >= 50 ? 'energetic' : 'balanced';
}

// ─── Aura ────────────────────────────────────────────────────────────────────

export function deriveAura(
  visualState: AvatarVisualState,
  momentum: number,
  dominantAttribute: AttributeSlug | null
): AuraStyle {
  // Tired tem aura própria suave — nunca intimidante
  if (visualState === 'tired') {
    return { color: STATE_AURA_COLOR.tired, intensity: 0.2, animated: false };
  }

  const color = dominantAttribute
    ? ATTRIBUTE_AURA_COLOR[dominantAttribute]
    : STATE_AURA_COLOR[visualState];

  const intensity = Math.max(0.2, Math.min(1.0, momentum / 100));
  const animated = momentum >= 60;

  return { color, intensity, animated };
}

// ─── Acessórios ──────────────────────────────────────────────────────────────

/** Retorna os acessórios desbloqueados baseado nos atributos */
export function deriveAccessories(
  attributeScores: Partial<Record<AttributeSlug, number>>
): AccessoryId[] {
  const accessories: AccessoryId[] = [];
  const s = attributeScores;

  if ((s.intelligence ?? 0) >= 60) accessories.push('book_float');
  if ((s.intelligence ?? 0) >= 80) accessories.push('glasses');
  if ((s.vitality ?? 0) >= 60)     accessories.push('sparkles');
  if ((s.focus ?? 0) >= 60)        accessories.push('focus_ring');
  if ((s.social ?? 0) >= 60)       accessories.push('warm_halo');
  if ((s.strength ?? 0) >= 60)     accessories.push('strength_glow');

  return accessories;
}

// ─── Idle variant ─────────────────────────────────────────────────────────
export function deriveIdleVariant(momentum: number): IdleVariant {
  if (momentum >= 65) return 'active';
  if (momentum >= 35) return 'calm';
  return 'sleepy';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDominantAttribute(
  scores: Partial<Record<AttributeSlug, number>>
): AttributeSlug | null {
  const entries = Object.entries(scores) as [AttributeSlug, number][];
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(([, a], [, b]) => b - a);
  const [topSlug, topValue] = sorted[0];
  const secondValue = sorted[1]?.[1] ?? 0;

  // Só considera dominante se estiver pelo menos 15 pts acima do segundo
  return topValue - secondValue >= 15 ? topSlug : null;
}

/** Verifica se todos os atributos estão dentro de 20 pts entre si */
function checkBalance(scores: Partial<Record<AttributeSlug, number>>): boolean {
  const values = Object.values(scores).filter((v): v is number => v !== undefined);
  if (values.length < 3) return false;

  const max = Math.max(...values);
  const min = Math.min(...values);
  return max - min <= 20;
}

/** Quantos dias se passaram desde o último hábito completado */
function calcDaysSinceLastActivity(logs: RawHabitLog[]): number {
  const completedDates = logs
    .filter(l => l.completed)
    .map(l => l.log_date)
    .sort()
    .reverse();

  if (completedDates.length === 0) return 999;

  const lastDate = new Date(completedDates[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
