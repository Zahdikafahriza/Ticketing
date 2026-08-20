export default function DonutChart({ segments = [], centerLabel, centerSub, size = 160, thickness = 16 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={thickness}
        />
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const offset = -offsetAcc * circumference;
          offsetAcc += fraction;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap={segments.length > 1 ? 'butt' : 'round'}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{centerLabel}</span>
        {centerSub && <span className="text-xs text-slate-400 mt-0.5">{centerSub}</span>}
      </div>
    </div>
  );
}
