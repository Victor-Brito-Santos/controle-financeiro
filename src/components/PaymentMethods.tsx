import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { paymentMethods, gastosFixes, gastosVariaveis, parcelamentos, formatCurrency } from "../data/mockData";

export default function PaymentMethods() {
  const pmTotals = paymentMethods.map(pm => {
    const fixo = gastosFixes.filter(g => g.paymentMethod === pm.id).reduce((s, g) => s + g.value, 0);
    const vari = gastosVariaveis.filter(g => g.paymentMethod === pm.id).reduce((s, g) => s + g.value, 0);
    const parc = parcelamentos.filter(p => p.paymentMethod === pm.id).reduce((s, p) => s + p.valorParcela, 0);
    return { ...pm, total: fixo + vari + parc };
  }).sort((a, b) => b.total - a.total);

  const typeIcon: Record<string, string> = {
    "Crédito": "💳",
    "Pix/Débito": "📱",
    "Carteira Digital": "💰",
    "Espécie": "💵",
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Formas de Pagamento</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Distribuição de gastos em Setembro 2026</p>
      </div>

      {/* Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pmTotals.map(pm => (
          <div
            key={pm.id}
            className="rounded-[var(--radius)] p-5 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all"
            style={{ background: pm.total > 0 ? pm.color : "var(--card)", border: `1px solid ${pm.total > 0 ? pm.color + "40" : "var(--border)"}` }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{typeIcon[pm.type] || "💳"}</span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: pm.total > 0 ? "rgba(255,255,255,0.2)" : "var(--muted)",
                    color: pm.total > 0 ? "white" : "var(--muted-foreground)"
                  }}
                >
                  {pm.type}
                </span>
              </div>
              <p className={`font-bold text-lg ${pm.total > 0 ? "text-white" : "text-[var(--card-foreground)]"}`}>{pm.name}</p>
              <p className={`text-2xl font-bold num mt-1 ${pm.total > 0 ? "text-white" : "text-[var(--card-foreground)]"}`}>{formatCurrency(pm.total)}</p>
              {pm.limit && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: pm.total > 0 ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>
                    <span>Limite usado</span>
                    <span>{((pm.total / pm.limit) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: pm.total > 0 ? "rgba(255,255,255,0.2)" : "var(--muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((pm.total / pm.limit) * 100, 100)}%`,
                        background: pm.total > 0 ? "white" : pm.color
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: pm.total > 0 ? "rgba(255,255,255,0.6)" : "var(--muted-foreground)" }}>
                    Limite: {formatCurrency(pm.limit)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
        <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Comparativo por Forma de Pagamento</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pmTotals} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {pmTotals.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
