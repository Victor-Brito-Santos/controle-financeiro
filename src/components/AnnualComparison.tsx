import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Entrada, GastoFixo, GastoVariavel, Parcelamento, formatCurrency } from "../data/mockData";

interface Props {
  entradas: Entrada[]; gastosFixos: GastoFixo[];
  gastosVariaveis: GastoVariavel[]; parcelamentos: Parcelamento[];
}

export default function AnnualComparison({ entradas, gastosFixos, gastosVariaveis, parcelamentos }: Props) {
  const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  const dataWithSaldo = monthNames.map((month, i) => {
    const inMonth = (date: string) => new Date(date + "T12:00:00").getMonth() === i;
    const ent  = entradas.filter(e => inMonth(e.date)).reduce((s, e) => s + e.value, 0);
    const gfix = gastosFixos.length > 0 ? gastosFixos.reduce((s, g) => s + g.value, 0) / 12 : 0; // distribute evenly
    const gvar = gastosVariaveis.filter(g => inMonth(g.date)).reduce((s, g) => s + g.value, 0);
    const parc = parcelamentos.filter(p => {
      const created = p.parcelaAtual <= i + 1 && p.totalParcelas >= i + 1;
      return created;
    }).reduce((s, p) => s + p.valorParcela, 0);
    const saidas = gfix + gvar + parc;
    return { month, entradas: Math.round(ent), saidas: Math.round(saidas), saldo: Math.round(ent - saidas) };
  });

  const active      = dataWithSaldo.filter(d => d.entradas > 0 || d.saidas > 0);
  const bestMonth   = active.length ? active.reduce((a, b) => b.saldo > a.saldo ? b : a) : null;
  const worstMonth  = active.length ? active.reduce((a, b) => b.saldo < a.saldo ? b : a) : null;

  const isEmpty = entradas.length === 0 && gastosFixos.length === 0 && gastosVariaveis.length === 0 && parcelamentos.length === 0;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Comparativo Anual</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Entradas vs Saídas — {new Date().getFullYear()}</p>
      </div>

      {isEmpty ? (
        <div className="bg-[var(--card)] rounded-[var(--radius)] p-12 text-center shadow-sm border border-[var(--border)]">
          <p className="text-4xl mb-3">📈</p>
          <p className="font-semibold text-[var(--card-foreground)]">Nenhum dado ainda</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Adicione lançamentos para ver o comparativo anual</p>
        </div>
      ) : (
        <>
          {bestMonth && worstMonth && bestMonth.month !== worstMonth.month && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-900 rounded-[var(--radius)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">🏆 Melhor mês</p>
                <p className="font-bold text-white">{bestMonth.month}</p>
                <p className="text-lg font-bold num text-[var(--positive)]">+{formatCurrency(bestMonth.saldo)}</p>
              </div>
              <div className="bg-red-950 rounded-[var(--radius)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">📉 Pior mês</p>
                <p className="font-bold text-white">{worstMonth.month}</p>
                <p className="text-lg font-bold num text-[var(--negative)]">{formatCurrency(worstMonth.saldo)}</p>
              </div>
            </div>
          )}

          <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
            <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Entradas × Saídas por mês</h3>
            <div>
              <ResponsiveContainer width="99%" height={256}>
                <BarChart data={dataWithSaldo} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
                  <Legend formatter={v => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{v}</span>} />
                  <Bar dataKey="entradas" name="Entradas" fill="var(--positive)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="var(--negative)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                    <tr key={row.month} className={`hover:bg-[var(--muted)]/30 transition-colors ${row.entradas === 0 && row.saidas === 0 ? "opacity-40" : ""}`}>
                      <td className="px-5 py-3 font-semibold text-[var(--card-foreground)]">{row.month}</td>
                      <td className="px-5 py-3 text-right num text-[var(--positive)] font-medium">{row.entradas > 0 ? formatCurrency(row.entradas) : "—"}</td>
                      <td className="px-5 py-3 text-right num text-[var(--negative)] font-medium">{row.saidas > 0 ? formatCurrency(row.saidas) : "—"}</td>
                      <td className={`px-5 py-3 text-right num font-bold ${row.saldo >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                        {(row.entradas > 0 || row.saidas > 0) ? (row.saldo >= 0 ? "+" : "") + formatCurrency(row.saldo) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
