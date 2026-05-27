-- Seed Data: Initial attributes, habits, achievements, and quests

-- Attributes
INSERT INTO public.attributes (name, slug, icon, color, description) VALUES
  ('Vitalidade', 'vitality', '💧', '#4FC3F7', 'Saúde e hidratação do corpo'),
  ('Força', 'strength', '💪', '#F44336', 'Resistência e capacidade física'),
  ('Inteligência', 'intelligence', '📚', '#9C27B0', 'Conhecimento e capacidade mental'),
  ('Foco', 'focus', '🎯', '#FF9800', 'Concentração e presença'),
  ('Clareza Mental', 'clarity', '✍️', '#00BCD4', 'Organização de pensamentos'),
  ('Carisma', 'charisma', '🗣️', '#E91E63', 'Habilidades sociais'),
  ('Controle Mental', 'mindfulness', '🧘', '#4CAF50', 'Equilíbrio e calma interior'),
  ('Recuperação', 'recovery', '😴', '#3F51B5', 'Descanso e regeneração');

-- Habits
INSERT INTO public.habits (name, slug, description, icon, category, frequency, default_goal, base_xp) VALUES
  ('Beber Água', 'water', 'Mantenha-se hidratado bebendo 8 copos de água por dia', '💧', 'health', 'daily', '{"type": "quantity", "target": 8, "unit": "copos"}', 15),
  ('Exercício Físico', 'exercise', 'Pratique pelo menos 30 minutos de atividade física', '🏋️', 'health', 'daily', '{"type": "duration", "target": 30, "unit": "minutos"}', 25),
  ('Leitura', 'reading', 'Leia pelo menos 20 páginas por dia', '📖', 'mind', 'daily', '{"type": "quantity", "target": 20, "unit": "páginas"}', 20),
  ('Tempo sem Telas', 'screen-free', 'Passe pelo menos 1 hora sem telas', '📵', 'focus', 'daily', '{"type": "duration", "target": 60, "unit": "minutos"}', 20);

-- Habit-Attribute mappings
INSERT INTO public.habit_attribute_map (habit_id, attribute_id, xp_multiplier)
SELECT h.id, a.id, 1
FROM public.habits h, public.attributes a
WHERE (h.slug = 'water' AND a.slug = 'vitality')
   OR (h.slug = 'exercise' AND a.slug = 'strength')
   OR (h.slug = 'reading' AND a.slug = 'intelligence')
   OR (h.slug = 'screen-free' AND a.slug = 'focus');

-- Initial Achievements
INSERT INTO public.achievements (title, description, icon, rarity, condition) VALUES
  ('Primeiro Passo', 'Complete seu primeiro hábito', '🌟', 'common', '{"type": "habit_count", "count": 1}'),
  ('Semana Perfeita', 'Mantenha um streak de 7 dias', '🔥', 'uncommon', '{"type": "streak", "days": 7}'),
  ('Mês de Ferro', 'Mantenha um streak de 30 dias', '⚡', 'rare', '{"type": "streak", "days": 30}'),
  ('Centurião', 'Complete 100 hábitos no total', '🏆', 'epic', '{"type": "habit_count", "count": 100}'),
  ('Social', 'Adicione seu primeiro amigo', '🤝', 'common', '{"type": "friends", "count": 1}'),
  ('Competidor', 'Complete seu primeiro desafio PvP', '⚔️', 'uncommon', '{"type": "pvp", "count": 1}'),
  ('Hidratado', 'Beba água por 14 dias seguidos', '💧', 'uncommon', '{"type": "streak", "habit_slug": "water", "days": 14}'),
  ('Atleta', 'Exercite-se por 21 dias seguidos', '💪', 'rare', '{"type": "streak", "habit_slug": "exercise", "days": 21}'),
  ('Bookworm', 'Leia por 30 dias seguidos', '📚', 'epic', '{"type": "streak", "habit_slug": "reading", "days": 30}'),
  ('Lenda Viva', 'Alcance o nível 50', '👑', 'legendary', '{"type": "level", "level": 50}');

-- Initial Daily Quests
INSERT INTO public.quests (title, description, type, requirements, rewards, available_date) VALUES
  ('Dia Completo', 'Complete todos os 4 hábitos do dia', 'daily', '{"type": "complete_all_habits"}', '{"xp": 50, "coins": 20}', CURRENT_DATE),
  ('Hidratação Total', 'Beba 8 copos de água hoje', 'daily', '{"type": "specific_habit", "habit_slug": "water", "target": 8}', '{"xp": 25, "coins": 10}', CURRENT_DATE),
  ('Corpo Ativo', 'Faça 30 minutos de exercício', 'daily', '{"type": "specific_habit", "habit_slug": "exercise", "target": 30}', '{"xp": 30, "coins": 15}', CURRENT_DATE);
