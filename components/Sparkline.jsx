export default function Sparkline({ data = [], colorClass = 'stroke-brand-500', height = 40 }) {
  if (!data || data.length < 2) {
    return <div style={{ height }} />;
  }

  const width = 100;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={areaPoints} className={colorClass} fill="currentColor" opacity="0.08" stroke="none" />
      <polyline
        points={points}
        fill="none"
        className={colorClass}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
