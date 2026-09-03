import { Plus } from "lucide-react";
import {
  categories, gastosFixes, gastosVariaveis, parcelamentos, formatCurrency
} from "../data/mockData";

export default function Categories() {
  const catTotals = categories.map(cat => {
    const fixo = gastosFixes.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
    const vari = gastosVariaveis.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
    const parc = parcelamentos.filter(p => p.category === cat.id).reduce((s, p) => s + p.valorParcela, 0);
    return { ...cat, total: fixo + vari + parc };
  });

  const maxTotal = Math.max(...catTotals.map(c => c.total));

  const iconMap: Record<string, string> = {
    alimentacao: "🍽️",
    transporte: "🚗",
    compras: "🛍️",
    contas: "⚡",
    saude: "❤️",
    mercado: "🛒",
    assinaturas: "📺",
    lazer: "🎮",
    educacao: "📚",
    outros: "•••",
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Categorias</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Gastos por categoria em Setembro 2026</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {catTotals.map(cat => (
          <div
            key={cat.id}
            className="bg-[var(--card)] rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: cat.bg, color: cat.color }}
              >
                {iconMap[cat.id] || cat.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[var(--card-foreground)]">{cat.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {cat.total > 0 ? `${((cat.total / (maxTotal || 1)) * 100).toFixed(0)}% do maior` : "Sem gastos"}
                </p>
              </div>
              <p className="text-base font-bold num" style={{ color: cat.color }}>
                {formatCurrency(cat.total)}
              </p>
            </div>
            <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: maxTotal > 0 ? `${(cat.total / maxTotal) * 100}%` : "0%",
                  background: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
