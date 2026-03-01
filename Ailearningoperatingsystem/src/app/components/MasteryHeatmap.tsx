interface HeatmapCell {
  concept: string;
  mastery: number;
}

interface MasteryHeatmapProps {
  title?: string;
  data: HeatmapCell[];
}

function getCellColor(mastery: number) {
  if (mastery >= 80) return 'bg-emerald-500';
  if (mastery >= 60) return 'bg-lime-500';
  if (mastery >= 40) return 'bg-amber-400';
  if (mastery >= 20) return 'bg-orange-400';
  return 'bg-rose-500';
}

export function MasteryHeatmap({ title = 'Mastery Heatmap', data }: MasteryHeatmapProps) {
  return (
    <div className="bg-white border border-border/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">Concept-level strength</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.map((item) => (
          <div key={item.concept} className="border border-border/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-foreground">{item.concept}</p>
              <p className="text-xs text-muted-foreground">{item.mastery}%</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getCellColor(item.mastery)} transition-all`}
                style={{ width: `${Math.max(0, Math.min(100, item.mastery))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
