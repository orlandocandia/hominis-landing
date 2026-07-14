// StatCard — tarjeta de estadísticas reutilizable.
// Responsive: 1 columna en mobile, se adapta a grid del padre.
import type { LucideIcon } from 'lucide-react';

type StatColor = 'blue' | 'red' | 'green' | 'purple' | 'yellow' | 'amber';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  emoji?: string;
  color?: StatColor;
  hint?: string;
}

const COLOR_STYLES: Record<StatColor, { box: string; icon: string; value: string }> = {
  blue: {
    box: 'border-blue-200/60 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20',
    icon: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    value: 'text-blue-600 dark:text-blue-400',
  },
  red: {
    box: 'border-red-200/60 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20',
    icon: 'bg-red-500/15 text-red-600 dark:text-red-400',
    value: 'text-red-600 dark:text-red-400',
  },
  green: {
    box: 'border-green-200/60 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20',
    icon: 'bg-green-500/15 text-green-600 dark:text-green-400',
    value: 'text-green-600 dark:text-green-400',
  },
  purple: {
    box: 'border-violet-200/60 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20',
    icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    value: 'text-violet-600 dark:text-violet-400',
  },
  yellow: {
    box: 'border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20',
    icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
  },
  amber: {
    box: 'border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20',
    icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
  },
};

export function StatCard({ title, value, icon: Icon, emoji, color = 'blue', hint }: StatCardProps) {
  const s = COLOR_STYLES[color] ?? COLOR_STYLES.blue;
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${s.box}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
          <p className={`mt-1 text-2xl font-bold sm:text-3xl ${s.value}`}>{value}</p>
          {hint && <p className="mt-0.5 text-[11px] text-muted-foreground/70">{hint}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${s.icon}`}>
          {Icon ? <Icon className="h-5 w-5" /> : emoji ?? '📊'}
        </div>
      </div>
    </div>
  );
}
