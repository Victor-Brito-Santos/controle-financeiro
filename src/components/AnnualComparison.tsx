import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { annualData, formatCurrency } from "../data/mockData";

export default function AnnualComparison() {
  const dataWithSaldo = annualData.map(d => ({ ...d, saldo: d.entradas - d.saidas }));
  const active = dataWithSaldo.filter(d => d.entradas > 0);
  const bestMonth = active.length ? active.reduce((a, b) => b.saldo > a.saldo ? b : a) : null;
  const worstMonth = active.length ? active.reduce((a, b) => b.saldo < a.saldo ? b : a) : null;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Comparativo Anual</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Entradas vs Saídas — 2026</p>
      </div>

      {/* Best/Worst */}
      {bestMonth && worstMonth && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-[var(--radius)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">🏆 Melhor mês</p>
            <p className="font-bold text-[var(--foreground)]">{bestMonth.month}</p>
            <p className="text-lg font-bold num text-[var(--positive)]">+{formatCurrency(bestMonth.saldo)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-[var(--radius)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">📉 Pior mês</p>
            <p className="font-bold text-[var(--foreground)]">{worstMonth.month}</p>
            <p className="text-lg font-bold num text-[var(--negative)]">+{formatCurrency(worstMonth.saldo)}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
        <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Entradas × Saídas por mês</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataWithSaldo} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              />
              <Legend formatter={v => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{v}</span>} />
              <Bar dataKey="entradas" name="Entradas" fill="var(--positive)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="saidas" name="Saídas" fill="var(--negative)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--card-foreground)]">Resumo por Mês</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Mês</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--positive)]">Entradas</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--negative)]">Saídas</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {dataWithSaldo.map(row => (
                <tr key={row.month} className={`hover:bg-[var(--muted)]/30 transition-colors ${row.entradas === 0 ? "opacity-40" : ""}`}>
                  <td className="px-5 py-3 font-semibold text-[var(--card-foreground)]">{row.month}</td>
                  <td className="px-5 py-3 text-right num text-[var(--positive)] font-medium">{row.entradas > 0 ? formatCurrency(row.entradas) : "—"}</td>
                  <td className="px-5 py-3 text-right num text-[var(--negative)] font-medium">{row.saidas > 0 ? formatCurrency(row.saidas) : "—"}</td>
                  <td className={`px-5 py-3 text-right num font-bold ${row.saldo >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {row.entradas > 0 ? (row.saldo >= 0 ? "+" : "") + formatCurrency(row.saldo) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
