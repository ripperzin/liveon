// ─── Attribute slugs ────────────────────────────────────────────────────────
// Must match the `slug` values in the `attributes` table.
export type AttributeSlug =
  | 'intelligence'
  | 'strength'
  | 'focus'
  | 'vitality'
  | 'social';

// ─── Visual states ───────────────────────────────────────────────────────────
export type AvatarVisualState =
  | 'energetic'   // momentum > 75 — avatar vivo, pulsante
  | 'inspired'    // inteligência dominante + consistência
  | 'balanced'    // todos atributos dentro de 20 pts entre si
  | 'focused'     // foco dominante + ativo nas últimas 48h
  | 'tired';      // momentum < 30 ou 3+ dias sem completar hábito

// ─── Idle animation variant ──────────────────────────────────────────────────
export type IdleVariant = 'active' | 'calm' | 'sleepy';

// ─── Aura ────────────────────────────────────────────────────────────────────
export type AuraStyle = {
  color: string;        // hex
  intensity: number;    // 0–1 (escala a opacidade / tamanho do efeito)
  animated: boolean;
};

// ─── Accessory ───────────────────────────────────────────────────────────────
export type AccessoryId =
  | 'book_float'        // inteligência ≥ 60
  | 'glasses'           // inteligência ≥ 80
  | 'sparkles'          // vitalidade ≥ 60
  | 'focus_ring'        // foco ≥ 60
  | 'warm_halo'         // social ≥ 60
  | 'strength_glow';    // força ≥ 60

// ─── Estado central do avatar ────────────────────────────────────────────────
export type AvatarState = {
  // Momentum (substitui streak como métrica principal)
  momentum: number;                         // 0–100
  momentumTrend: 'rising' | 'stable' | 'falling';

  // Estado visual derivado
  visualState: AvatarVisualState;

  // Atributos (0–100 cada)
  attributeScores: Partial<Record<AttributeSlug, number>>;
  dominantAttribute: AttributeSlug | null;

  // Camadas visuais
  aura: AuraStyle;
  accessories: AccessoryId[];
  idleVariant: IdleVariant;

  // Meta
  isLoading: boolean;
  error: string | null;
};

// ─── Dado bruto do Supabase ──────────────────────────────────────────────────
export type RawHabitLog = {
  log_date: string;     // 'YYYY-MM-DD'
  completed: boolean;
};

export type RawUserAttribute = {
  value: number;
  attributes: {
    slug: string;
  };
};
