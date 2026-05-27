/**
 * AvatarRenderer
 *
 * Componente visual central do Avatar Identity System.
 * Recebe um AvatarState e renderiza as camadas em ordem:
 *   1. Aura (fundo, animada)
 *   2. Corpo do avatar (SVG base)
 *   3. Acessórios (desbloqueados por atributo)
 *   4. Efeitos de estado visual (partículas, brilhos)
 *   5. Animação idle (loop suave)
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import type { AvatarState, AccessoryId } from '../../types/avatar';

// ─── Animated SVG wrappers ───────────────────────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

// ─── Props ───────────────────────────────────────────────────────────────────
type AvatarRendererProps = {
  state: AvatarState;
  size?: number;
};

// ─── Constantes visuais ──────────────────────────────────────────────────────
const STATE_BODY_COLOR: Record<AvatarState['visualState'], string> = {
  energetic: '#FDE68A',
  inspired:  '#DDD6FE',
  balanced:  '#A7F3D0',
  focused:   '#BFDBFE',
  tired:     '#E2E8F0',
};

const STATE_OUTLINE_COLOR: Record<AvatarState['visualState'], string> = {
  energetic: '#D97706',
  inspired:  '#7C3AED',
  balanced:  '#059669',
  focused:   '#2563EB',
  tired:     '#94A3B8',
};

// ─── Componente principal ────────────────────────────────────────────────────
export function AvatarRenderer({ state, size = 160 }: AvatarRendererProps) {
  const cx = size / 2;
  const cy = size / 2;

  // ── Valores animados ───────────────────────────────────────────────────────
  const auraScale    = useSharedValue(1);
  const auraOpacity  = useSharedValue(state.aura.intensity * 0.6);
  const bodyFloat    = useSharedValue(0);
  const bodyScale    = useSharedValue(1);
  const eyeBlink     = useSharedValue(1); // 1 = aberto, 0 = fechado

  // ── Inicia animações ao montar / quando estado muda ───────────────────────
  useEffect(() => {
    // Aura pulsa se momentum alto
    if (state.aura.animated) {
      auraScale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.00, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
      auraOpacity.value = withRepeat(
        withSequence(
          withTiming(state.aura.intensity * 0.9, { duration: 1800 }),
          withTiming(state.aura.intensity * 0.4, { duration: 1800 })
        ),
        -1,
        false
      );
    } else {
      auraScale.value   = withTiming(1, { duration: 600 });
      auraOpacity.value = withTiming(state.aura.intensity * 0.5, { duration: 600 });
    }

    // Idle float — velocidade depende do variant
    const floatDuration =
      state.idleVariant === 'active'  ? 1400 :
      state.idleVariant === 'calm'    ? 2200 :
      /* sleepy */                      3200;

    const floatAmount =
      state.idleVariant === 'active'  ? 6 :
      state.idleVariant === 'calm'    ? 4 :
      /* sleepy */                      2;

    bodyFloat.value = withRepeat(
      withSequence(
        withTiming(-floatAmount, { duration: floatDuration, easing: Easing.inOut(Easing.sin) }),
        withTiming( floatAmount, { duration: floatDuration, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Breathing scale sutil
    bodyScale.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: floatDuration * 0.8, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.975, { duration: floatDuration * 0.8, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Piscar — sleepy pisca mais lento e de olhos quase fechados
    const blinkInterval = state.idleVariant === 'sleepy' ? 2800 : 4500;
    eyeBlink.value = withDelay(
      blinkInterval,
      withRepeat(
        withSequence(
          withTiming(0,   { duration: 80 }),
          withTiming(1,   { duration: 120 }),
          withDelay(blinkInterval, withTiming(1, { duration: 0 }))
        ),
        -1,
        false
      )
    );
  }, [state.idleVariant, state.aura.animated, state.aura.intensity]);

  // ── Animated styles (wrapper View) ────────────────────────────────────────
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bodyFloat.value },
      { scale: bodyScale.value },
    ],
  }));

  // ── Animated props (aura circle) ──────────────────────────────────────────
  const auraProps = useAnimatedProps(() => ({
    r:       interpolate(auraScale.value, [1, 1.12], [cx * 0.88, cx * 0.98]),
    opacity: auraOpacity.value,
  }));

  // ── Eye scale (blink) ─────────────────────────────────────────────────────
  const eyeScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeBlink.value }],
  }));

  const bodyColor   = STATE_BODY_COLOR[state.visualState];
  const outlineColor = STATE_OUTLINE_COLOR[state.visualState];
  const headR = size * 0.26;
  const bodyW = size * 0.38;
  const bodyH = size * 0.28;

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor={state.aura.color} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={state.aura.color} stopOpacity="0"   />
          </RadialGradient>
        </Defs>

        {/* ── Camada 1: Aura ─────────────────────────────────────────────── */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          fill={`url(#auraGrad)`}
          animatedProps={auraProps}
        />

        {/* ── Camada 2: Sombra suave no chão ─────────────────────────────── */}
        <Ellipse
          cx={cx}
          cy={size * 0.91}
          rx={size * 0.22}
          ry={size * 0.04}
          fill="#000"
          opacity={0.08}
        />

        {/* ── Camada 3: Corpo ────────────────────────────────────────────── */}
        {/* Torso */}
        <Rect
          x={cx - bodyW / 2}
          y={cy + headR * 0.6}
          width={bodyW}
          height={bodyH}
          rx={bodyW * 0.3}
          fill={bodyColor}
          stroke={outlineColor}
          strokeWidth={1.5}
        />

        {/* Cabeça */}
        <Circle
          cx={cx}
          cy={cy - headR * 0.1}
          r={headR}
          fill={bodyColor}
          stroke={outlineColor}
          strokeWidth={1.5}
        />

        {/* ── Camada 4: Face ─────────────────────────────────────────────── */}
        <AvatarFace
          cx={cx}
          cy={cy - headR * 0.1}
          headR={headR}
          visualState={state.visualState}
          eyeScaleStyle={eyeScaleStyle}
          outlineColor={outlineColor}
        />

        {/* ── Camada 5: Acessórios ───────────────────────────────────────── */}
        {state.accessories.map(id => (
          <AccessoryLayer
            key={id}
            id={id}
            cx={cx}
            cy={cy}
            headR={headR}
            size={size}
            auraColor={state.aura.color}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

// ─── Face ────────────────────────────────────────────────────────────────────
type FaceProps = {
  cx: number;
  cy: number;
  headR: number;
  visualState: AvatarState['visualState'];
  eyeScaleStyle: object;
  outlineColor: string;
};

function AvatarFace({ cx, cy, headR, visualState, eyeScaleStyle, outlineColor }: FaceProps) {
  const eyeY    = cy - headR * 0.15;
  const eyeOffX = headR * 0.35;
  const eyeRx   = headR * 0.14;
  const eyeRy   = visualState === 'tired' ? headR * 0.08 : headR * 0.16;
  const eyeColor = outlineColor;

  // Boca — muda por estado
  const mouthY = cy + headR * 0.38;
  const mouthPath = {
    energetic: `M ${cx - headR * 0.28} ${mouthY} Q ${cx} ${mouthY + headR * 0.22} ${cx + headR * 0.28} ${mouthY}`,
    inspired:  `M ${cx - headR * 0.22} ${mouthY} Q ${cx} ${mouthY + headR * 0.18} ${cx + headR * 0.22} ${mouthY}`,
    balanced:  `M ${cx - headR * 0.22} ${mouthY} Q ${cx} ${mouthY + headR * 0.14} ${cx + headR * 0.22} ${mouthY}`,
    focused:   `M ${cx - headR * 0.20} ${mouthY + headR * 0.04} Q ${cx} ${mouthY + headR * 0.04} ${cx + headR * 0.20} ${mouthY + headR * 0.04}`,
    tired:     `M ${cx - headR * 0.20} ${mouthY + headR * 0.08} Q ${cx} ${mouthY - headR * 0.04} ${cx + headR * 0.20} ${mouthY + headR * 0.08}`,
  }[visualState];

  return (
    <G>
      {/* Olhos com blink */}
      <AnimatedG style={eyeScaleStyle} origin={`${cx - eyeOffX}, ${eyeY}`}>
        <Ellipse cx={cx - eyeOffX} cy={eyeY} rx={eyeRx} ry={eyeRy} fill={eyeColor} />
      </AnimatedG>
      <AnimatedG style={eyeScaleStyle} origin={`${cx + eyeOffX}, ${eyeY}`}>
        <Ellipse cx={cx + eyeOffX} cy={eyeY} rx={eyeRx} ry={eyeRy} fill={eyeColor} />
      </AnimatedG>

      {/* Brilho dos olhos */}
      {visualState !== 'tired' && (
        <>
          <Circle cx={cx - eyeOffX + eyeRx * 0.4} cy={eyeY - eyeRy * 0.3} r={eyeRx * 0.28} fill="white" opacity={0.7} />
          <Circle cx={cx + eyeOffX + eyeRx * 0.4} cy={eyeY - eyeRy * 0.3} r={eyeRx * 0.28} fill="white" opacity={0.7} />
        </>
      )}

      {/* Bochecha rosada — só em estados positivos */}
      {(visualState === 'energetic' || visualState === 'balanced' || visualState === 'inspired') && (
        <>
          <Ellipse cx={cx - headR * 0.52} cy={cy + headR * 0.12} rx={headR * 0.18} ry={headR * 0.10} fill="#FCA5A5" opacity={0.45} />
          <Ellipse cx={cx + headR * 0.52} cy={cy + headR * 0.12} rx={headR * 0.18} ry={headR * 0.10} fill="#FCA5A5" opacity={0.45} />
        </>
      )}

      {/* Boca */}
      <Path
        d={mouthPath}
        fill="none"
        stroke={outlineColor}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </G>
  );
}

// ─── Acessórios ──────────────────────────────────────────────────────────────
type AccessoryProps = {
  id: AccessoryId;
  cx: number;
  cy: number;
  headR: number;
  size: number;
  auraColor: string;
};

function AccessoryLayer({ id, cx, cy, headR, size, auraColor }: AccessoryProps) {
  // Cada acessório é um SVG decorativo simples e legível
  switch (id) {
    case 'book_float':
      return (
        <G opacity={0.85}>
          {/* Livrinho flutuando à direita */}
          <Rect x={cx + headR * 0.9} y={cy - headR * 1.1} width={headR * 0.5} height={headR * 0.62} rx={3} fill="#FDE68A" stroke="#D97706" strokeWidth={1} />
          <Path d={`M ${cx + headR * 1.15} ${cy - headR * 1.1} L ${cx + headR * 1.15} ${cy - headR * 0.48}`} stroke="#D97706" strokeWidth={0.8} />
        </G>
      );

    case 'glasses':
      return (
        <G opacity={0.9}>
          {/* Óculos redondos */}
          <Circle cx={cx - headR * 0.35} cy={cy - headR * 0.15} r={headR * 0.22} fill="none" stroke="#7C3AED" strokeWidth={1.5} />
          <Circle cx={cx + headR * 0.35} cy={cy - headR * 0.15} r={headR * 0.22} fill="none" stroke="#7C3AED" strokeWidth={1.5} />
          <Path d={`M ${cx - headR * 0.13} ${cy - headR * 0.15} L ${cx + headR * 0.13} ${cy - headR * 0.15}`} stroke="#7C3AED" strokeWidth={1.5} />
          {/* Hastes */}
          <Path d={`M ${cx - headR * 0.57} ${cy - headR * 0.15} L ${cx - headR * 0.72} ${cy - headR * 0.10}`} stroke="#7C3AED" strokeWidth={1.2} />
          <Path d={`M ${cx + headR * 0.57} ${cy - headR * 0.15} L ${cx + headR * 0.72} ${cy - headR * 0.10}`} stroke="#7C3AED" strokeWidth={1.2} />
        </G>
      );

    case 'sparkles':
      // 3 estrelinhas ao redor — vitalidade alta
      return (
        <G opacity={0.9}>
          <SparkStar x={cx - headR * 1.1} y={cy - headR * 0.9} r={headR * 0.12} color="#22C55E" />
          <SparkStar x={cx + headR * 1.0} y={cy - headR * 0.5} r={headR * 0.09} color="#22C55E" />
          <SparkStar x={cx - headR * 0.8} y={cy + headR * 0.6} r={headR * 0.08} color="#22C55E" />
        </G>
      );

    case 'focus_ring':
      // Anel fino ao redor da cabeça
      return (
        <Circle
          cx={cx}
          cy={cy - headR * 0.1}
          r={headR * 1.18}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={0.6}
        />
      );

    case 'warm_halo':
      // Halo dourado acima da cabeça
      return (
        <Ellipse
          cx={cx}
          cy={cy - headR * 1.22}
          rx={headR * 0.52}
          ry={headR * 0.12}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2.5}
          opacity={0.8}
        />
      );

    case 'strength_glow':
      // Contorno extra brilhante no corpo — força
      return (
        <Circle
          cx={cx}
          cy={cy - headR * 0.1}
          r={headR * 1.06}
          fill="none"
          stroke={auraColor}
          strokeWidth={2}
          opacity={0.5}
        />
      );

    default:
      return null;
  }
}

// ─── Estrela decorativa (sparkles) ───────────────────────────────────────────
function SparkStar({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const pts = Array.from({ length: 4 }, (_, i) => {
    const angle = (i * Math.PI) / 2 - Math.PI / 4;
    return `${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`;
  }).join(' ');
  return <Path d={`M ${pts.split(' ').map((p, i) => (i === 0 ? `M ${p}` : `L ${p}`)).join(' ')} Z`} fill={color} opacity={0.85} />;
}
