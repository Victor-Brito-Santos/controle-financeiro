import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { Entrada, GastoFixo, GastoVariavel, Parcelamento, Category, formatCurrency } from "../data/mockData";

const RADIAN = Math.PI / 180;

interface Props {
  entradas: Entrada[]; gastosFixos: GastoFixo[]; gastosVariaveis: GastoVariavel[];
  parcelamentos: Parcelamento[]; categories: Category[];
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pago:     { label: "Pago",     cls: "bg-emerald-950 text-white" },
    recebido: { label: "Recebido", cls: "bg-emerald-950 text-white" },
    pendente: { label: "Pendente", cls: "bg-orange-500 text-white" },
    atrasado: { label: "Atrasado", cls: "bg-red-600 text-white" },
  };
  const s = map[status] || map.pendente;
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

type HistoryItem = {
  id: number; name: string; value: number; date: string;
  kind: "entrada" | "fixo" | "variavel" | "parcelamento";
  categoryId: string; status: string; extra?: string;
};

export default function Dashboard({ entradas, gastosFixos, gastosVariaveis, parcelamentos, categories }: Props) {
  const totalEntradas      = entradas.filter(e => e.status === "recebido").reduce((s, e) => s + e.value, 0);
  const totalSaidasFixas   = gastosFixos.reduce((s, g) => s + g.value, 0);
  const totalSaidasVar     = gastosVariaveis.reduce((s, g) => s + g.value, 0);
  const totalParcelamentos = parcelamentos.reduce((s, p) => s + p.valorParcela, 0);
  const totalSaidas = totalSaidasFixas + totalSaidasVar + totalParcelamentos;
  const saldo = totalEntradas - totalSaidas;

  const catTotals = categories.map(cat => {
    const fixo = gastosFixos.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
    const vari = gastosVariaveis.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
    const parc = parcelamentos.filter(p => p.category === cat.id).reduce((s, p) => s + p.valorParcela, 0);
    return { ...cat, total: fixo + vari + parc };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const donutData1 = catTotals.slice(0, 6).map(c => ({ name: c.name, value: Math.round(c.total), color: c.color }));
  const donutData2 = [
    { name: "Gastos Fixos",      value: Math.round(totalSaidasFixas),    color: "var(--primary)" },
    { name: "Parcelamentos",     value: Math.round(totalParcelamentos),   color: "#8B5CF6" },
    { name: "Gastos Variáveis",  value: Math.round(totalSaidasVar),       color: "#F97316" },
  ].filter(d => d.value > 0);

  // Build unified history from all types
  const today = new Date().toISOString().split("T")[0];
  const history: HistoryItem[] = [
    ...entradas.map(e => ({
      id: e.id, name: e.name, value: e.value, date: e.date,
      kind: "entrada" as const, categoryId: "", status: e.status,
    })),
    ...gastosFixos.map(g => ({
      id: g.id, name: g.name, value: g.value, date: today,
      kind: "fixo" as const, categoryId: g.category, status: g.paid ? "pago" : "pendente",
      extra: `Dia ${g.dueDay}`,
    })),
    ...gastosVariaveis.map(g => ({
      id: g.id, name: g.name, value: g.value, date: g.date,
      kind: "variavel" as const, categoryId: g.category, status: g.paid ? "pago" : "pendente",
    })),
    ...parcelamentos.map(p => ({
      id: p.id, name: p.name, value: p.valorParcela, date: today,
      kind: "parcelamento" as const, categoryId: p.category, status: p.paid ? "pago" : "pendente",
      extra: `${p.parcelaAtual}/${p.totalParcelas}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12);

  const kindMeta: Record<HistoryItem["kind"], { label: string; sign: 1 | -1; iconBg: string; iconColor: string; icon: string }> = {
    entrada:     { label: "Entrada",      sign: 1,  iconBg: "#ECFDF5", iconColor: "#059669", icon: "↑" },
    fixo:        { label: "Gasto Fixo",   sign: -1, iconBg: "#EFF6FF", iconColor: "#2563EB", icon: "📌" },
    variavel:    { label: "Gasto do Mês", sign: -1, iconBg: "#FFF7ED", iconColor: "#EA580C", icon: "🛒" },
    parcelamento:{ label: "Parcelamento", sign: -1, iconBg: "#F5F3FF", iconColor: "#7C3AED", icon: "💳" },
  };

  const isEmpty = entradas.length === 0 && gastosFixos.length === 0 && gastosVariaveis.length === 0 && parcelamentos.length === 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className={`col-span-2 lg:col-span-1 rounded-[var(--radius)] p-5 shadow-sm relative overflow-hidden ${saldo >= 0 ? "bg-[var(--primary)]" : "bg-[var(--negative)]"}`}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Saldo do Mês</p>
          <p className="text-2xl font-bold text-white num leading-tight">{formatCurrency(saldo)}</p>
          <div className="mt-3 flex items-center gap-1.5">
            <Wallet size={18} color="white" />
            <span className="text-xs text-white/70">{saldo >= 0 ? "Saldo positivo" : "Saldo negativo"}</span>
          </div>
        </div>
        <SummaryCard label="Total de Entradas" value={totalEntradas} icon={<TrendingUp size={20} />} colorClass="text-[var(--positive)]" bgClass="bg-emerald-900" iconBg="bg-white text-[var(--positive)]" labelClass="text-white" />
        <SummaryCard label="Total de Saídas" value={totalSaidas} icon={<TrendingDown size={20} />} colorClass="text-[var(--negative)]" bgClass="bg-red-950" iconBg="bg-white text-[var(--negative)]" labelClass="text-white" />
        <SummaryCard label="Parcelamentos" value={totalParcelamentos} icon={<CreditCard size={20} />} colorClass="text-purple-400" bgStyle={{ backgroundColor: "rgb(83, 0, 143)" }} iconBg="bg-white text-purple-600" labelClass="text-white" />
      </div>

      {isEmpty ? (
        <div className="bg-[var(--card)] rounded-[var(--radius)] p-12 text-center shadow-sm border border-[var(--border)]">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-[var(--card-foreground)]">Nenhum dado ainda</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Use o botão + para adicionar seu primeiro lançamento</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          {(donutData1.length > 0 || donutData2.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {donutData1.length > 0 && (
                <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
                  <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Gastos por Categoria</h3>
                  <div style={{ background: "var(--background)", borderRadius: 12 }}>
                    <ResponsiveContainer width="99%" height={224}>
                      <PieChart>
                        <Pie data={donutData1} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value" labelLine={false} label={CustomLabel}>
                          {donutData1.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
                        <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {donutData2.length > 0 && (
                <div className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)]">
                  <h3 className="font-semibold text-sm mb-4 text-[var(--muted-foreground)] uppercase tracking-wider">Distribuição de Gastos</h3>
                  <div style={{ background: "var(--background)", borderRadius: 12 }}>
                    <ResponsiveContainer width="99%" height={224}>
                      <PieChart>
                        <Pie data={donutData2} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value" labelLine={false} label={CustomLabel}>
                          {donutData2.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
                        <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)]">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--card-foreground)]">Histórico de Lançamentos</h3>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {(["entrada","fixo","variavel","parcelamento"] as const).map(k => (
                    <span key={k} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: kindMeta[k].iconBg, color: kindMeta[k].iconColor }}>
                      {kindMeta[k].label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {history.map((t, i) => {
                  const meta = kindMeta[t.kind];
                  const cat  = categories.find(c => c.id === t.categoryId);
                  const isEntrada = t.kind === "entrada";
                  return (
                    <div key={`${t.kind}-${t.id}-${i}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)]/30 transition-colors">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 font-semibold"
                        style={{ background: cat?.bg || meta.iconBg, color: cat?.color || meta.iconColor }}>
                        {isEntrada ? "↑" : (cat?.name?.[0] || meta.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--card-foreground)] truncate">{t.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: meta.iconBg, color: meta.iconColor }}>
                            {meta.label}
                          </span>
                          {cat && <span className="text-xs text-[var(--muted-foreground)]">{cat.name}</span>}
                          {t.extra && <span className="text-xs text-[var(--muted-foreground)]">· {t.extra}</span>}
                          <span className="text-xs text-[var(--muted-foreground)]">· {new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold num ${isEntrada ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                          {isEntrada ? "+" : "-"}{formatCurrency(t.value)}
                        </p>
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, colorClass, bgClass, bgStyle, iconBg, labelClass }: {
  label: string; value: number; icon: React.ReactNode;
  colorClass?: string; bgClass?: string; bgStyle?: React.CSSProperties; iconBg?: string; labelClass?: string;
}) {
  return (
    <div className={`rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)] ${bgClass ?? "bg-[var(--card)]"}`} style={bgStyle}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-semibold uppercase tracking-wider ${labelClass || "text-[var(--muted-foreground)]"}`}>{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg || "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>{icon}</div>
      </div>
      <p className={`text-xl font-bold num ${colorClass || "text-[var(--card-foreground)]"}`}>{formatCurrency(value)}</p>
    </div>
  );
}
