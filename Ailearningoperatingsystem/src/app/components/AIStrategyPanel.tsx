interface AIStrategyPanelProps {
  readiness: number;
  risk: 'Low' | 'Medium' | 'High';
  plan: string[];
}

function riskColor(risk: 'Low' | 'Medium' | 'High') {
  if (risk === 'Low') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (risk === 'Medium') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

export function AIStrategyPanel({ readiness, risk, plan }: AIStrategyPanelProps) {
  return (
    <div className="bg-white border border-border/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Strategy</h3>
          <p className="text-xs text-muted-foreground">5-day tactical focus plan</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 border rounded-full ${riskColor(risk)}`}>
          {risk} Risk
        </span>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border/50">
        <p className="text-xs text-muted-foreground">Exam Readiness</p>
        <p className="text-lg font-bold text-foreground">{readiness}%</p>
      </div>

      <ul className="space-y-2">
        {plan.map((item, idx) => (
          <li key={idx} className="text-xs text-foreground flex items-start gap-2">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
