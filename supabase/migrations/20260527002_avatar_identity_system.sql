-- Migration: avatar_identity_system
-- Description: Adiciona suporte ao Avatar Identity System
--              (momentum, custom habits, avatar_config expandido)

-- ─── 1. momentum_score em profiles ──────────────────────────────────────────
-- Cache do momentum calculado pelo cliente. Atualizado a cada sync.
-- O valor autoritativo é sempre calculado em lib/avatar/momentum.ts,
-- essa coluna serve apenas para leitura rápida (ex: leaderboard futuro).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS momentum_score INT DEFAULT 0
    CHECK (momentum_score >= 0 AND momentum_score <= 100);

-- ─── 2. custom_habits ────────────────────────────────────────────────────────
-- Hábitos criados pelo próprio usuário.
-- XP base é fixado por categoria (evita exploits).
-- O usuário define nome, ícone e ritual — não os números.

CREATE TABLE IF NOT EXISTS public.custom_habits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT '⭐',
  category      TEXT NOT NULL
    CHECK (category IN ('health', 'mind', 'social', 'focus')),
  -- attribute_id aponta para qual atributo esse hábito alimenta
  attribute_id  UUID REFERENCES public.attributes(id),
  -- XP base é definido automaticamente pelo sistema via categoria:
  --   health  → 12 xp  (alimenta vitality / strength)
  --   mind    → 12 xp  (alimenta intelligence)
  --   focus   → 10 xp  (alimenta focus)
  --   social  → 10 xp  (alimenta social)
  base_xp       INT NOT NULL DEFAULT 10 CHECK (base_xp > 0 AND base_xp <= 20),
  frequency     TEXT NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('daily', 'weekly')),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_habits_user
  ON public.custom_habits(user_id);

-- ─── 3. habit_logs: aceitar custom_habits ────────────────────────────────────
-- Adiciona FK opcional para custom_habits.
-- Uma log tem EITHER habit_id OR custom_habit_id, nunca ambos.

ALTER TABLE public.habit_logs
  ADD COLUMN IF NOT EXISTS custom_habit_id UUID
    REFERENCES public.custom_habits(id) ON DELETE CASCADE;

-- Garante que log pertence a exatamente um tipo de hábito
ALTER TABLE public.habit_logs
  DROP CONSTRAINT IF EXISTS chk_habit_log_source;

ALTER TABLE public.habit_logs
  ADD CONSTRAINT chk_habit_log_source CHECK (
    (habit_id IS NOT NULL AND custom_habit_id IS NULL)
    OR
    (habit_id IS NULL AND custom_habit_id IS NOT NULL)
  );

-- Índice para queries de custom habits
CREATE INDEX IF NOT EXISTS idx_habit_logs_custom
  ON public.habit_logs(user_id, custom_habit_id, log_date);

-- ─── 4. RLS para custom_habits ───────────────────────────────────────────────
ALTER TABLE public.custom_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "custom_habits: owner access"
  ON public.custom_habits
  FOR ALL
  USING (
    user_id = (
      SELECT id FROM public.profiles
      WHERE auth_user_id = auth.uid()
      LIMIT 1
    )
  );

-- ─── 5. Função para sincronizar momentum_score ───────────────────────────────
-- Chamada pelo cliente após recalcular o momentum localmente.
CREATE OR REPLACE FUNCTION public.sync_momentum_score(
  p_profile_id UUID,
  p_momentum   INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    momentum_score = GREATEST(0, LEAST(100, p_momentum)),
    updated_at     = now()
  WHERE id = p_profile_id
    AND auth_user_id = auth.uid();
END;
$$;
