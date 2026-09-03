import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { investments, investmentHistory, formatCurrency } from "../data/mockData";

export default function Investments() {
  const totalInvestido = investments.reduce((s, inv) => s + inv.current, 0);
  const totalMeta = investments.reduce((s, inv) => s + inv.target, 0);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Investimentos e Metas</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Acompanhe seu progresso financeiro</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--primary)] rounded-[var(--radius)] p-4 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Total Investido</p>
          <p className="text-2xl font-bold num text-white">{formatCurrency(totalInvestido)}</p>
        </div>
        <div className="bg-[var(--card)] rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Total de Metas</p>
          <p className="text-2xl font-bold num text-[var(--card-foreground)]">{formatCurrency(totalMeta)}</p>
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-3">
        {investments.map(inv => {
          const pct = (inv.current / inv.target) * 100;
          const remaining = inv.target - inv.current;
          return (
            <div key={inv.id} className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-[var(--card-foreground)]">{inv.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{inv.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold num text-[var(--card-foreground)]">{formatCurrency(inv.current)}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">meta: {formatCurrency(inv.target)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(pct, 100)}%`, background: inv.color }}
                  />
                </div>
                <span className="text-sm font-bold num" style={{ color: inv.color }}>{pct.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-2">Faltam {formatCurrency(remaining)} para a meta</p>
            </div>
          );
        })}
      </div>

      {/* Evolution Chart */}
      <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
        <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Evolução Patrimonial</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={investmentHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
