import React from 'react';

interface LegendItem {
  id: string;
  label: string;
  color: string;
}

const DEFAULT_LEGEND: LegendItem[] = [
  { id: 'single', label: 'Single flux domain', color: '#f59e0b' }, // amber-500
  { id: 'double', label: 'Double flux domain', color: '#ef4444' }, // red-500
  { id: 'nameserver', label: 'Nameserver / NS flux', color: '#38bdf8' }, // sky-400
];

type Props = {
  items?: LegendItem[];
};

/**
 * Small overlay legend placed on top-left of the Globe visualization.
 * Shows which color corresponds to Single / Double / Nameserver flux bullets.
 */
const Legend: React.FC<Props> = ({ items = DEFAULT_LEGEND }) => {
  return (
    <div
      aria-hidden={false}
      className={
        // Positioning handled by parent; this controls visual styling and responsiveness
        // Use smaller base text on very small screens and scale up at sm breakpoint
        'bg-slate-900/90 text-slate-100 rounded-lg p-2.5 shadow-lg text-xs sm:text-sm min-w-[140px] sm:min-w-[180px] border border-white/5'
      }
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="font-semibold mb-1.5 text-xs sm:text-sm">Legend</div>
      <div className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="6" fill={it.color} stroke="rgba(255,255,255,0.08)" />
            </svg>
            <div className="truncate text-[11px] sm:text-sm">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
