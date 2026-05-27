import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { calcMomentum, calcMomentumTrend } from './momentum';
import {
  deriveVisualState,
  deriveAura,
  deriveAccessories,
  deriveIdleVariant,
  getDominantAttribute,
} from './visualState';
import type {
  AvatarState,
  AttributeSlug,
  RawHabitLog,
  RawUserAttribute,
} from '../../types/avatar';

// ─── Estado inicial (loading) ────────────────────────────────────────────────
const INITIAL_STATE: AvatarState = {
  momentum: 0,
  momentumTrend: 'stable',
  visualState: 'balanced',
  attributeScores: {},
  dominantAttribute: null,
  aura: { color: '#6EE7B7', intensity: 0.3, animated: false },
  accessories: [],
  idleVariant: 'calm',
  isLoading: true,
  error: null,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useAvatarState
 *
 * Hook central do sistema de identidade do avatar.
 * Lê do Supabase e deriva o AvatarState completo de forma reativa.
 *
 * Uso:
 *   const { avatarState, refresh } = useAvatarState(profileId);
 */
export function useAvatarState(profileId: string | null) {
  const [state, setState] = useState<AvatarState>(INITIAL_STATE);

  const fetchAndDerive = useCallback(async () => {
    if (!profileId) {
      setState({ ...INITIAL_STATE, isLoading: false });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // ── 1. Busca logs dos últimos 14 dias ──────────────────────────────────
      const since = new Date();
      since.setDate(since.getDate() - 14);
      const sinceStr = since.toISOString().split('T')[0];

      const { data: logsData, error: logsError } = await supabase
        .from('habit_logs')
        .select('log_date, completed')
        .eq('user_id', profileId)
        .gte('log_date', sinceStr)
        .order('log_date', { ascending: false });

      if (logsError) throw logsError;

      const logs: RawHabitLog[] = logsData ?? [];

      // ── 2. Busca atributos do usuário ──────────────────────────────────────
      const { data: attrsData, error: attrsError } = await supabase
        .from('user_attributes')
        .select('value, attributes(slug)')
        .eq('user_id', profileId);

      if (attrsError) throw attrsError;

      // Mapeia para { slug: value }
      const attributeScores: Partial<Record<AttributeSlug, number>> = {};
      for (const row of (attrsData ?? []) as RawUserAttribute[]) {
        const slug = row.attributes?.slug as AttributeSlug;
        if (slug) attributeScores[slug] = row.value;
      }

      // ── 3. Deriva todos os valores ─────────────────────────────────────────
      const momentum = calcMomentum(logs);
      const momentumTrend = calcMomentumTrend(logs);
      const visualState = deriveVisualState(momentum, attributeScores, logs);
      const dominantAttribute = getDominantAttribute(attributeScores);
      const aura = deriveAura(visualState, momentum, dominantAttribute);
      const accessories = deriveAccessories(attributeScores);
      const idleVariant = deriveIdleVariant(momentum);

      setState({
        momentum,
        momentumTrend,
        visualState,
        attributeScores,
        dominantAttribute,
        aura,
        accessories,
        idleVariant,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar avatar';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      console.error('[useAvatarState]', err);
    }
  }, [profileId]);

  // Carrega ao montar e quando profileId muda
  useEffect(() => {
    fetchAndDerive();
  }, [fetchAndDerive]);

  // Reage a mudanças em tempo real nos habit_logs
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`avatar-logs-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_logs',
          filter: `user_id=eq.${profileId}`,
        },
        () => fetchAndDerive()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_attributes',
          filter: `user_id=eq.${profileId}`,
        },
        () => fetchAndDerive()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchAndDerive]);

  return {
    avatarState: state,
    refresh: fetchAndDerive,
  };
}
