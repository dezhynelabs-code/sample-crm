import { scoreRingColor } from '@/lib/format';

interface ScoreRingProps {
  score: number;
  size?: 32 | 48 | 24;
}

// Ported pixel-for-pixel from scoreRingSVG() in the original app.js.
export function ScoreRing({ score, size = 32 }: ScoreRingProps) {
  const stroke = size <= 32 ? 3 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const fillColor = scoreRingColor(score);

  return (
    <div className={`score-ring-wrap ${size <= 32 ? 'sm' : 'lg'}`} title={`Lead score: ${score}/100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span className="score-ring-value">{score}</span>
    </div>
  );
}
