'use client';

import { useState } from 'react';

export default function TrendChart({ data = [], height = 260 }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-slate-400 text-sm">Belum ada data.</div>;
  }

  const width = 700;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);

  const points = data.map((d, i) => {
    const x = padding.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = padding.top + innerH - (d.value / max) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Garis grid horizontal tipis */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * (1 - f)}
            y2={padding.top + innerH * (1 - f)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#trendFill)" />
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 6 : 4}
              fill="#6366f1"
              stroke="white"
              strokeWidth="2"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <rect
              x={p.x - 15}
              y={padding.top}
              width="30"
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            />
            <text x={p.x} y={height - 8} textAnchor="middle" className="fill-slate-400" fontSize="12">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none shadow-lg"
          style={{
            left: `${(points[hoverIndex].x / width) * 100}%`,
            top: `${(points[hoverIndex].y / height) * 100 - 3}%`,
          }}
        >
          <span className="font-semibold">{points[hoverIndex].value}</span> tiket · {points[hoverIndex].label}
        </div>
      )}
    </div>
  );
}
