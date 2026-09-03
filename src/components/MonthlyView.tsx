import { useState } from "react";
import { Plus, Check, ChevronDown, Trash2 } from "lucide-react";
import {
  categories, paymentMethods, formatCurrency, months
} from "../data/mockData";
import { StatusBadge } from "./Dashboard";
import { useFinance } from "../context/FinanceContext";
import type { TransactionType } from "./AddTransactionModal";

const tabs = ["Entradas", "Gastos Fixos", "Gastos do Mês", "Parcelamentos"] as const;

export default function MonthlyView({
  month, year, onMonthChange, onYearChange, onAddClick
}: {
  month: number; year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onAddClick?: (type: TransactionType) => void;
}) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Entradas");

  const {
    entradas: entradasData, gastosFixes: fixosData,
    gastosVariaveis: varData, parcelamentos: parcData,
    removeEntrada, removeGastoFixo, removeGastoVariavel, removeParcelamento,
    toggleGastoFixoPago, toggleGastoVariavelPago, toggleParcelamentoPago,
  } = useFinance();

  const totalEntradas = entradasData.reduce((s, e) => s + e.value, 0);
  const totalFixos = fixosData.reduce((s, g) => s + g.value, 0);
  const paidFixos = fixosData.filter(g => g.paid).reduce((s, g) => s + g.value, 0);
  const totalVar = varData.reduce((s, g) => s + g.value, 0);
  const paidVar = varData.filter(g => g.paid).reduce((s, g) => s + g.value, 0);
  const totalParc = parcData.reduce((s, p) => s + p.valorParcela, 0);
  const paidParc = parcData.filter(p => p.paid).reduce((s, p) => s + p.valorParcela, 0);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Month selector */}
      <div className="flex items-center justify-between bg-[var(--card)] rounded-[var(--radius)] p-3 shadow-sm border border-[var(--border)]">
        <button
          onClick={() => {
            if (month === 0) { onMonthChange(11); onYearChange(year - 1); }
            else onMonthChange(month - 1);
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-[var(--foreground)]">{months[month]} {year}</h2>
          <ChevronDown size={16} className="text-[var(--muted-foreground)]" />
        </div>
        <button
          onClick={() => {
            if (month === 11) { onMonthChange(0); onYearChange(year + 1); }
            else onMonthChange(month + 1);
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
        >
          →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "Entradas" && (
        <Section title="Entradas" total={totalEntradas} totalLabel="Total recebido" totalColor="text-[var(--positive)]">
          <div className="divide-y divide-[var(--border)]">
            {entradasData.map(e => (
              <Row key={e.id}>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[var(--positive)] shrink-0">↑</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold num text-[var(--positive)]">+{formatCurrency(e.value)}</p>
                  <StatusBadge status={e.status} />
                </div>
                <DeleteButton onClick={() => removeEntrada(e.id)} />
              </Row>
            ))}
          </div>
          <AddRow label="Adicionar entrada" onClick={() => onAddClick?.("entrada")} />
        </Section>
      )}

      {activeTab === "Gastos Fixos" && (
        <Section title="Gastos Fixos" total={totalFixos} pago={paidFixos} pendente={totalFixos - paidFixos}>
          <div className="divide-y divide-[var(--border)]">
            {fixosData.map(g => {
              const cat = categories.find(c => c.id === g.category);
              const pm = paymentMethods.find(p => p.id === g.paymentMethod);
              return (
                <Row key={g.id}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: cat?.bg, color: cat?.color }}>{cat?.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Dia {g.dueDay} · {pm?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold num">{formatCurrency(g.value)}</p>
                    <StatusBadge status={g.paid ? "pago" : "pendente"} />
                  </div>
                  <button
                    onClick={() => toggleGastoFixoPago(g.id)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${g.paid ? "bg-[var(--positive)] border-[var(--positive)]" : "border-[var(--border)]"}`}
                  >
                    {g.paid && <Check size={12} color="white" strokeWidth={3} />}
                  </button>
                  <DeleteButton onClick={() => removeGastoFixo(g.id)} />
                </Row>
              );
            })}
          </div>
          <AddRow label="Adicionar gasto fixo" onClick={() => onAddClick?.("gasto-fixo")} />
        </Section>
      )}

      {activeTab === "Gastos do Mês" && (
        <Section title="Gastos Variáveis" total={totalVar} pago={paidVar} pendente={totalVar - paidVar}>
          <div className="divide-y divide-[var(--border)]">
            {varData.map(g => {
              const cat = categories.find(c => c.id === g.category);
              const pm = paymentMethods.find(p => p.id === g.paymentMethod);
              return (
                <Row key={g.id}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: cat?.bg, color: cat?.color }}>{cat?.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{new Date(g.date + "T12:00:00").toLocaleDateString("pt-BR")} · {pm?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold num">{formatCurrency(g.value)}</p>
                    <StatusBadge status={g.paid ? "pago" : "pendente"} />
                  </div>
                  <button
                    onClick={() => toggleGastoVariavelPago(g.id)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${g.paid ? "bg-[var(--positive)] border-[var(--positive)]" : "border-[var(--border)]"}`}
                  >
                    {g.paid && <Check size={12} color="white" strokeWidth={3} />}
                  </button>
                  <DeleteButton onClick={() => removeGastoVariavel(g.id)} />
                </Row>
              );
            })}
          </div>
          <AddRow label="Adicionar gasto" onClick={() => onAddClick?.("gasto-mes")} />
        </Section>
      )}

      {activeTab === "Parcelamentos" && (
        <Section title="Parcelamentos do Mês" total={totalParc} pago={paidParc} pendente={totalParc - paidParc}>
          <div className="divide-y divide-[var(--border)]">
            {parcData.map(p => {
              const cat = categories.find(c => c.id === p.category);
              const pm = paymentMethods.find(pm => pm.id === p.paymentMethod);
              const pct = p.parcelaAtual / p.totalParcelas;
              return (
                <Row key={p.id}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: cat?.bg, color: cat?.color }}>{cat?.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{pm?.name} · Parcela {p.parcelaAtual}/{p.totalParcelas}</p>
                    <div className="mt-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${pct * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold num">{formatCurrency(p.valorParcela)}</p>
                    <StatusBadge status={p.paid ? "pago" : "pendente"} />
                  </div>
                  <button
                    onClick={() => toggleParcelamentoPago(p.id)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer ${p.paid ? "bg-[var(--positive)] border-[var(--positive)]" : "border-[var(--border)]"}`}
                  >
                    {p.paid && <Check size={12} color="white" strokeWidth={3} />}
                  </button>
                  <DeleteButton onClick={() => removeParcelamento(p.id)} />
                </Row>
              );
            })}
          </div>
          <AddRow label="Adicionar parcelamento" onClick={() => onAddClick?.("parcelamento")} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, total, totalLabel, totalColor, pago, pendente, children }: {
  title: string; total: number; totalLabel?: string; totalColor?: string;
  pago?: number; pendente?: number; children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-[var(--card-foreground)]">{title}</h3>
        <div className="flex items-center gap-4">
          {pago !== undefined && (
            <>
              <span className="text-xs text-[var(--positive)] font-semibold">Pago: {formatCurrency(pago)}</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Pendente: {formatCurrency(pendente!)}</span>
            </>
          )}
          <span className={`text-sm font-bold num ${totalColor || "text-[var(--card-foreground)]"}`}>
            {totalLabel || "Total"}: {formatCurrency(total)}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)]/30 transition-colors">
      {children}
    </div>
  );
}

function AddRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-5 py-3 text-sm text-[var(--primary)] font-semibold hover:bg-[var(--accent)] transition-colors border-t border-[var(--border)]"
    >
      <Plus size={16} /> {label}
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-50 hover:text-[var(--negative)] dark:hover:bg-red-950/40 transition-colors shrink-0"
      aria-label="Excluir lançamento"
    >
      <Trash2 size={15} />
    </button>
  );
}
