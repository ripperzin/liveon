import type { RawHabitLog } from '../../types/avatar';

// ─── Configuração ────────────────────────────────────────────────────────────
const WINDOW_DAYS = 14;       // janela de análise
const DECAY_BASE = 0.88;      // decaimento por dia de ausência (perde ~12%)
const CONSISTENCY_BONUS = 15; // bônus por 7 dias consecutivos
const MAX_MOMENTUM = 100;
const MIN_MOMENTUM = 0;

// ─── Tipos internos ──────────────────────────────────────────────────────────
type DayActivity = {
  date: string;       // 'YYYY-MM-DD'
  completionRate: number; // 0–1 (proporção de hábitos completados nesse dia)
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna 'YYYY-MM-DD' para N dias atrás */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/** Agrupa logs por data e calcula taxa de completude por dia */
function groupByDay(logs: RawHabitLog[]): DayActivity[] {
  const map = new Map<string, { total: number; done: number }>();

  for (const log of logs) {
    const entry = map.get(log.log_date) ?? { total: 0, done: 0 };
    entry.total += 1;
    if (log.completed) entry.done += 1;
    map.set(log.log_date, entry);
  }

  return Array.from(map.entries()).map(([date, { total, done }]) => ({
    date,
    completionRate: total > 0 ? done / total : 0,
  }));
}

/** Verifica se há 7 dias consecutivos com completionRate > 0.5 */
function hasConsistencyStreak(activities: DayActivity[]): boolean {
  const dateSet = new Set(
    activities
      .filter(a => a.completionRate >= 0.5)
      .map(a => a.date)
  );

  for (let start = 0; start <= WINDOW_DAYS - 7; start++) {
    const allPresent = Array.from({ length: 7 }, (_, i) =>
      dateSet.has(daysAgo(start + i))
    ).every(Boolean);
    if (allPresent) return true;
  }
  return false;
}

// ─── Cálculo principal ───────────────────────────────────────────────────────

/**
 * Calcula o momentum (0–100) a partir dos logs dos últimos 14 dias.
 *
 * Filosofia:
 *  - Dias recentes pesam mais (decaimento exponencial retroativo)
 *  - Faltar um dia perde ~12 pts, não zera
 *  - Consistência saudável por 7 dias dá bônus
 *  - Nunca pune com zero agressivo — mínimo decai gradualmente
 */
export function calcMomentum(logs: RawHabitLog[]): number {
  const activities = groupByDay(logs);
  const activityMap = new Map(activities.map(a => [a.date, a.completionRate]));

  let momentum = 0;

  // Acumula contribuição de cada dia, com peso maior para dias recentes
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const date = daysAgo(i);
    const rate = activityMap.get(date) ?? 0;

    // Peso decresce exponencialmente: hoje = 1.0, ontem = 0.88, etc.
    const weight = Math.pow(DECAY_BASE, i);
    momentum += rate * weight * (MAX_MOMENTUM / WINDOW_DAYS) * (1 / DECAY_BASE);
  }

  // Normaliza para 0–100
  const maxPossible = Array.from({ length: WINDOW_DAYS }, (_, i) =>
    Math.pow(DECAY_BASE, i) * (MAX_MOMENTUM / WINDOW_DAYS) * (1 / DECAY_BASE)
  ).reduce((a, b) => a + b, 0);

  momentum = (momentum / maxPossible) * MAX_MOMENTUM;

  // Bônus de consistência saudável
  if (hasConsistencyStreak(activities)) {
    momentum = Math.min(MAX_MOMENTUM, momentum + CONSISTENCY_BONUS);
  }

  return Math.round(
    Math.max(MIN_MOMENTUM, Math.min(MAX_MOMENTUM, momentum))
  );
}

/**
 * Deriva a tendência do momentum comparando os últimos 3 dias vs os 3 anteriores.
 */
export function calcMomentumTrend(
  logs: RawHabitLog[]
): 'rising' | 'stable' | 'falling' {
  const activities = groupByDay(logs);
  const activityMap = new Map(activities.map(a => [a.date, a.completionRate]));

  const recent = [0, 1, 2]
    .map(i => activityMap.get(daysAgo(i)) ?? 0)
    .reduce((a, b) => a + b, 0) / 3;

  const previous = [3, 4, 5]
    .map(i => activityMap.get(daysAgo(i)) ?? 0)
    .reduce((a, b) => a + b, 0) / 3;

  const delta = recent - previous;
  if (delta > 0.15) return 'rising';
  if (delta < -0.15) return 'falling';
  return 'stable';
}
