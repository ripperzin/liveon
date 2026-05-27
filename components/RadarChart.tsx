import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

interface RadarChartProps {
  data: { label: string; value: number; color: string; max: number }[];
  size?: number;
}

export default function RadarChart({ data, size = 260 }: RadarChartProps) {
  const center = size / 2;
  const radius = center - 30; // padding for labels
  const angleStep = (Math.PI * 2) / data.length;

  const getPoint = (value: number, max: number, index: number) => {
    const ratio = Math.max(0, Math.min(1, value / max));
    const currentRadius = ratio * radius;
    const angle = index * angleStep - Math.PI / 2; // start from top
    return {
      x: center + currentRadius * Math.cos(angle),
      y: center + currentRadius * Math.sin(angle),
    };
  };

  // Generate web polygon points (the stat shape)
  const polygonPoints = data.map((d, i) => {
    const p = getPoint(d.value, d.max, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Generate background grid polygons
  const gridLevels = 4;
  const gridPolygons = Array.from({ length: gridLevels }).map((_, levelIndex) => {
    const ratio = (levelIndex + 1) / gridLevels;
    return data.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = ratio * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background Grid */}
        {gridPolygons.map((points, index) => (
          <Polygon
            key={`grid-${index}`}
            points={points}
            fill="none"
            stroke={Colors.surfaceLight}
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {data.map((_, i) => {
          const p = getPoint(1, 1, i); // max point
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke={Colors.surfaceLight}
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <Polygon
          points={polygonPoints}
          fill={Colors.primary + '40'}
          stroke={Colors.primary}
          strokeWidth="2"
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const p = getPoint(d.value, d.max, i);
          return (
            <Circle
              key={`point-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={d.color || Colors.primary}
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const p = getPoint(1.2, 1, i); // label point further out
          return (
            <SvgText
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              fill={Colors.textSecondary}
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
