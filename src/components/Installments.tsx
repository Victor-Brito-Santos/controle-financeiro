import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { Parcelamento, Category, PaymentMethod, formatCurrency } from "../data/mockData";

interface Props {
  parcelamentos: Parcelamento[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onDelete: (id: number) => void;
  onEdit: (p: Parcelamento) => void;
}

export default function Installments({ parcelamentos, categories, paymentMethods, onDelete, onEdit }: Props) {
  const [filter, setFilter] = useState("all");

  const totalRestante = parcelamentos.reduce((s, p) => s + p.valorParcela * (p.totalParcelas - p.parcelaAtual), 0);
  const totalMes      = parcelamentos.reduce((s, p) => s + p.valorParcela, 0);
  const filtered      = filter === "all" ? parcelamentos : parcelamentos.filter(p => p.paymentMethod === filter);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Parcelamentos</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Compras parceladas em aberto</p>
      </div>

      {parcelamentos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--card)] rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Este mês</p>
            <p className="text-2xl font-bold num text-[var(--negative)]">{formatCurrency(totalMes)}</p>
          </div>
          <div className="bg-[var(--card)] rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Total restante</p>
            <p className="text-2xl font-bold num text-purple-600 dark:text-purple-400">{formatCurrency(totalRestante)}</p>
          </div>
        </div>
      )}

      {paymentMethods.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>Todos</FilterBtn>
          {paymentMethods.map(pm => (
            <FilterBtn key={pm.id} active={filter === pm.id} onClick={() => setFilter(pm.id)}>{pm.name}</FilterBtn>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-[var(--card)] rounded-[var(--radius)] p-12 text-center shadow-sm border border-[var(--border)]">
          <p className="text-4xl mb-3">💳</p>
          <p className="font-semibold text-[var(--card-foreground)]">{parcelamentos.length === 0 ? "Nenhum parcelamento ainda" : "Nenhum resultado para este filtro"}</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Use o botão + para adicionar um parcelamento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const cat = categories.find(c => c.id === p.category);
            const pm  = paymentMethods.find(pm => pm.id === p.paymentMethod);
            const pct = p.parcelaAtual / p.totalParcelas;
            const restante = p.valorParcela * (p.totalParcelas - p.parcelaAtual);
            return (
              <div key={p.id} className="bg-[var(--card)] rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)] group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: cat?.color || "#6B7280" }}>
                    {cat?.name[0] || "•"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold text-[var(--card-foreground)]">{p.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{pm ? `${pm.name} · ` : ""}{cat?.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-right">
                          <p className="font-bold num text-[var(--card-foreground)]">{formatCurrency(p.valorParcela)}<span className="text-xs text-[var(--muted-foreground)] font-normal">/parc.</span></p>
                          <p className="text-xs text-[var(--muted-foreground)]">Restam {formatCurrency(restante)}</p>
                        </div>
                        <button onClick={() => onEdit(p)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-all ml-1">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-all ml-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${pct * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[var(--primary)] whitespace-nowrap">{p.parcelaAtual}/{p.totalParcelas}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${active ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
      {children}
    </button>
  );
}
