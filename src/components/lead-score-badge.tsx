// Pure presentational component — no hooks, safe for both server and client components.
interface LeadScoreBadgeProps {
  score: number | null;
  priority: string | null;
  size?: 'sm' | 'md';
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; bar: string; dot: string }> = {
  ALTA: { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500', dot: 'bg-green-500' },
  MEDIA: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500', dot: 'bg-yellow-500' },
  BAJA: { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500', dot: 'bg-orange-500' },
  NULA: { bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-400', dot: 'bg-gray-400' },
};

export function LeadScoreBadge({ score, priority, size = 'md' }: LeadScoreBadgeProps) {
  const s = score ?? 0;
  const p = priority ?? 'NULA';
  const styles = PRIORITY_STYLES[p] || PRIORITY_STYLES.NULA;
  const isSm = size === 'sm';

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1.5 ${styles.bg} ${styles.text} ${isSm ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} rounded-full border border-current/20 font-medium`}>
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        <span>{p}</span>
        <span className="opacity-70">({s})</span>
      </div>
      {!isSm && (
        <div className={`w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden`}>
          <div className={`h-full ${styles.bar} transition-all`} style={{ width: `${s}%` }} />
        </div>
      )}
    </div>
  );
}
