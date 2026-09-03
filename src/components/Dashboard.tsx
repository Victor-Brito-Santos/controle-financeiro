import {
  TrendingUp, TrendingDown, Wallet, CreditCard,
  ArrowUpRight, ArrowDownRight, Check, Clock
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  entradas, gastosVariaveis, gastosFixes, parcelamentos,
  categories, formatCurrency
} from "../data/mockData";

const RADIAN = Math.PI / 180;

const totalEntradas = entradas.filter(e => e.status === "recebido").reduce((s, e) => s + e.value, 0);
const totalSaidasFixas = gastosFixes.reduce((s, e) => s + e.value, 0);
const totalSaidasVar = gastosVariaveis.reduce((s, e) => s + e.value, 0);
const totalParcelamentos = parcelamentos.reduce((s, p) => s + p.valorParcela, 0);
const totalSaidas = totalSaidasFixas + totalSaidasVar + totalParcelamentos;
const saldo = totalEntradas - totalSaidas;

const catTotals = categories.map(cat => {
  const fixo = gastosFixes.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
  const vari = gastosVariaveis.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
  const parc = parcelamentos.filter(p => p.category === cat.id).reduce((s, p) => s + p.valorParcela, 0);
  return { ...cat, total: fixo + vari + parc };
}).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

const donutData1 = catTotals.slice(0, 6).map(c => ({ name: c.name, value: Math.round(c.total), color: c.color }));

const donutData2 = [
  { name: "Gastos Fixos", value: Math.round(totalSaidasFixas), color: "#2563EB" },
  { name: "Parcelamentos", value: Math.round(totalParcelamentos), color: "#8B5CF6" },
  { name: "Gastos Variáveis", value: Math.round(totalSaidasVar), color: "#F97316" },
];

const recentTransactions = [
  ...gastosVariaveis.slice(-5).map(g => ({ ...g, type: "saida" as const })),
  ...entradas.map(e => ({ ...e, type: "entrada" as const, category: "outros", paymentMethod: "pix", date: e.date })),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <SummaryCard
          label="Saldo do Mês"
          value={saldo}
          icon={<Wallet size={20} />}
          positive={saldo >= 0}
          highlight
        />
        <SummaryCard
          label="Total de Entradas"
          value={totalEntradas}
          icon={<TrendingUp size={20} />}
          positive={true}
          colorClass="text-[var(--positive)]"
          bgClass="bg-emerald-900 dark:bg-emerald-950"
          iconBg="bg-white text-[var(--positive)]"
          labelClass="text-white"
        />
        <SummaryCard
          label="Total de Saídas"
          value={totalSaidas}
          icon={<TrendingDown size={20} />}
          positive={false}
          colorClass="text-[var(--negative)]"
          bgClass="bg-red-950"
          iconBg="bg-white text-[var(--negative)]"
          labelClass="text-white"
        />
        <SummaryCard
          label="Parcelamentos"
          value={totalParcelamentos}
          icon={<CreditCard size={20} />}
          positive={null}
          colorClass="text-purple-600"
          bgClass="bg-[var(--card)]"
          iconBg="bg-white text-purple-600"
          labelClass="text-white"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
          <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Gastos por Categoria</h3>
          <div className="h-56 rounded-xl" style={{ background: "var(--background)" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData1}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={CustomLabel}
                >
                  {donutData1.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
          <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Distribuição de Gastos</h3>
          <div className="h-56 rounded-xl" style={{ background: "var(--background)" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData2}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={CustomLabel}
                >
                  {donutData2.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)]">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--card-foreground)]">Últimos Lançamentos</h3>
          <span className="text-xs text-[var(--muted-foreground)]">Setembro 2026</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recentTransactions.map((t, i) => {
            const cat = categories.find(c => c.id === (t as any).category);
            const isEntrada = (t as any).type === "entrada";
            const value = isEntrada ? (t as any).value : -(t as any).value;
            const status = isEntrada ? (t as any).status : (t as any).paid ? "pago" : "pendente";
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)]/30 transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: cat?.bg || "#F3F4F6", color: cat?.color || "#6B7280" }}
                >
                  {isEntrada ? "↑" : cat?.name?.[0] || "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--card-foreground)] truncate">{(t as any).name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{cat?.name || "Entrada"} · {new Date((t as any).date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold num ${value >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {value >= 0 ? "+" : ""}{formatCurrency(Math.abs(value))}
                  </p>
                  <StatusBadge status={status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, positive, highlight, colorClass, bgClass, iconBg, labelClass }: {
  label: string; value: number; icon: React.ReactNode; positive: boolean | null;
  highlight?: boolean; colorClass?: string; bgClass?: string; iconBg?: string; labelClass?: string;
}) {
  const isPos = positive === true;
  const isNeg = positive === false;

  if (highlight) {
    return (
      <div className={`col-span-2 lg:col-span-1 rounded-[var(--radius)] p-5 shadow-sm relative overflow-hidden ${isPos ? "bg-[var(--primary)]" : "bg-[var(--negative)]"}`}>
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white num leading-tight">{formatCurrency(value)}</p>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-white/80 text-white">{icon}</span>
          <span className="text-xs text-white/70">{isPos ? "Saldo positivo" : "Saldo negativo"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)] ${bgClass || "bg-[var(--card)]"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-semibold uppercase tracking-wider ${labelClass || "text-[var(--muted-foreground)]"}`}>{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg || "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
          {icon}
        </div>
      </div>
      <p className={`text-xl font-bold num ${colorClass || "text-[var(--card-foreground)]"}`}>{formatCurrency(value)}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pago: { label: "Pago", cls: "bg-emerald-950 text-white" },
    recebido: { label: "Recebido", cls: "bg-emerald-950 text-white" },
    pendente: { label: "Pendente", cls: "bg-orange-500 text-white" },
    atrasado: { label: "Atrasado", cls: "bg-red-600 text-white" },
  };
  const s = map[status] || map.pendente;
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
  );
}
