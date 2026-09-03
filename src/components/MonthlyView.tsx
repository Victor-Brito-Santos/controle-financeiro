import { useState, useRef, useEffect, type ReactElement } from "react";
import { Check, Trash2, ChevronDown, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Entrada, GastoFixo, GastoVariavel, Parcelamento, Category, PaymentMethod, formatCurrency, months } from "../data/mockData";
import { StatusBadge } from "./Dashboard";

const tabs = ["Geral", "Entradas", "Gastos Fixos", "Gastos do Mês", "Parcelamentos"] as const;
type Tab = typeof tabs[number];

interface Props {
  month: number; year: number;
  onMonthChange: (m: number) => void; onYearChange: (y: number) => void;
  entradas: Entrada[]; gastosFixos: GastoFixo[];
  gastosVariaveis: GastoVariavel[]; parcelamentos: Parcelamento[];
  categories: Category[]; paymentMethods: PaymentMethod[];
  onDeleteEntrada: (id: number) => void;
  onDeleteFixo: (id: number) => void;
  onDeleteVariavel: (id: number) => void;
  onDeleteParcelamento: (id: number) => void;
  onToggleFixo: (id: number) => void;
  onToggleVariavel: (id: number) => void;
  onToggleParcelamento: (id: number) => void;
  onEditEntrada: (e: Entrada) => void;
  onEditFixo: (g: GastoFixo) => void;
  onEditVariavel: (g: GastoVariavel) => void;
  onEditParcelamento: (p: Parcelamento) => void;
}

export default function MonthlyView(props: Props) {
  const { month, year, onMonthChange, onYearChange,
    entradas, gastosFixos, gastosVariaveis, parcelamentos,
    categories, paymentMethods,
    onDeleteEntrada, onDeleteFixo, onDeleteVariavel, onDeleteParcelamento,
    onToggleFixo, onToggleVariavel, onToggleParcelamento,
    onEditEntrada, onEditFixo, onEditVariavel, onEditParcelamento,
  } = props;

  const [activeTab, setActiveTab] = useState<Tab>("Geral");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalEntradas = entradas.reduce((s, e) => s + e.value, 0);
  const totalFixos    = gastosFixos.reduce((s, g) => s + g.value, 0);
  const paidFixos     = gastosFixos.filter(g => g.paid).reduce((s, g) => s + g.value, 0);
  const totalVar      = gastosVariaveis.reduce((s, g) => s + g.value, 0);
  const paidVar       = gastosVariaveis.filter(g => g.paid).reduce((s, g) => s + g.value, 0);
  const totalParc     = parcelamentos.reduce((s, p) => s + p.valorParcela, 0);
  const paidParc      = parcelamentos.filter(p => p.paid).reduce((s, p) => s + p.valorParcela, 0);

  const prevMonth = () => { if (month === 0) { onMonthChange(11); onYearChange(year - 1); } else onMonthChange(month - 1); };
  const nextMonth = () => { if (month === 11) { onMonthChange(0); onYearChange(year + 1); } else onMonthChange(month + 1); };

  const selectMonth = (m: number) => { onMonthChange(m); setPickerOpen(false); };
  const selectYear  = (y: number) => { setPickerYear(y); onYearChange(y); };

  // Geral: unified list sorted newest first (gastos fixos use a synthetic date based on dueDay)
  type UnifiedItem = { sortKey: number; render: () => ReactElement };
  const unified: UnifiedItem[] = [
    ...entradas.map(e => ({
      sortKey: new Date(e.date + "T12:00:00").getTime(),
      render: () => (
        <Row key={`ent-${e.id}`}>
          <TypeDot color="#059669" bg="#ECFDF5" label="↑" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-[var(--card-foreground)] truncate">{e.name}</p>
              <TypeTag label="Entrada" color="#059669" bg="#ECFDF5" />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold num text-[var(--positive)]">+{formatCurrency(e.value)}</p>
            <StatusBadge status={e.status} />
          </div>
          <EditBtn onClick={() => onEditEntrada(e)} />
          <DeleteBtn onClick={() => onDeleteEntrada(e.id)} />
        </Row>
      )
    })),
    ...gastosFixos.map(g => {
      const cat = categories.find(c => c.id === g.category);
      const pm  = paymentMethods.find(p => p.id === g.paymentMethod);
      return {
        sortKey: new Date().setDate(g.dueDay),
        render: () => (
          <Row key={`fix-${g.id}`}>
            <CatDot cat={cat} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-[var(--card-foreground)] truncate">{g.name}</p>
                <TypeTag label="Fixo" color="#2563EB" bg="#EFF6FF" />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">Dia {g.dueDay}{pm ? ` · ${pm.name}` : ""}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold num text-[var(--negative)]">{formatCurrency(g.value)}</p>
              <StatusBadge status={g.paid ? "pago" : "pendente"} />
            </div>
            <ToggleBtn checked={g.paid} onToggle={() => onToggleFixo(g.id)} />
            <EditBtn onClick={() => onEditFixo(g)} />
            <DeleteBtn onClick={() => onDeleteFixo(g.id)} />
          </Row>
        )
      };
    }),
    ...gastosVariaveis.map(g => {
      const cat = categories.find(c => c.id === g.category);
      const pm  = paymentMethods.find(p => p.id === g.paymentMethod);
      return {
        sortKey: new Date(g.date + "T12:00:00").getTime(),
        render: () => (
          <Row key={`var-${g.id}`}>
            <CatDot cat={cat} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-[var(--card-foreground)] truncate">{g.name}</p>
                <TypeTag label="Gasto" color="#EA580C" bg="#FFF7ED" />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">{new Date(g.date + "T12:00:00").toLocaleDateString("pt-BR")}{pm ? ` · ${pm.name}` : ""}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold num text-[var(--negative)]">{formatCurrency(g.value)}</p>
              <StatusBadge status={g.paid ? "pago" : "pendente"} />
            </div>
            <ToggleBtn checked={g.paid} onToggle={() => onToggleVariavel(g.id)} />
            <EditBtn onClick={() => onEditVariavel(g)} />
            <DeleteBtn onClick={() => onDeleteVariavel(g.id)} />
          </Row>
        )
      };
    }),
    ...parcelamentos.map(p => {
      const cat = categories.find(c => c.id === p.category);
      const pm  = paymentMethods.find(pm => pm.id === p.paymentMethod);
      return {
        sortKey: 0,
        render: () => (
          <Row key={`par-${p.id}`}>
            <CatDot cat={cat} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-[var(--card-foreground)] truncate">{p.name}</p>
                <TypeTag label="Parcela" color="#7C3AED" bg="#F5F3FF" />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">{pm ? `${pm.name} · ` : ""}Parcela {p.parcelaAtual}/{p.totalParcelas}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold num text-[var(--negative)]">{formatCurrency(p.valorParcela)}</p>
              <StatusBadge status={p.paid ? "pago" : "pendente"} />
            </div>
            <ToggleBtn checked={p.paid} onToggle={() => onToggleParcelamento(p.id)} />
            <EditBtn onClick={() => onEditParcelamento(p)} />
            <DeleteBtn onClick={() => onDeleteParcelamento(p.id)} />
          </Row>
        )
      };
    }),
  ].sort((a, b) => b.sortKey - a.sortKey);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Month selector with picker */}
      <div className="relative" ref={pickerRef}>
        <div className="flex items-center justify-between bg-[var(--card)] rounded-[var(--radius)] p-3 shadow-sm border border-[var(--border)]">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setPickerOpen(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--muted)] transition-colors group">
            <h2 className="font-bold text-lg text-[var(--foreground)]">{months[month]} {year}</h2>
            <ChevronDown size={16} className={`text-[var(--muted-foreground)] transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
          </button>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Month/Year Picker Dropdown */}
        {pickerOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] rounded-[var(--radius)] shadow-xl border border-[var(--border)] z-30 p-4">
            {/* Year row */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => selectYear(pickerYear - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition">
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-[var(--foreground)]">{pickerYear}</span>
              <button onClick={() => selectYear(pickerYear + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition">
                <ChevronRight size={16} />
              </button>
            </div>
            {/* Month grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {months.map((m, i) => (
                <button key={m} onClick={() => selectMonth(i)}
                  className={`px-1 py-2 rounded-xl text-sm font-semibold transition-all ${month === i && year === pickerYear ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--muted)] text-[var(--card-foreground)]"}`}>
                  {m.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab ? "bg-[var(--primary)] text-white shadow-sm" : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Geral tab */}
      {activeTab === "Geral" && (
        <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-[var(--card-foreground)]">Todos os Lançamentos</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[var(--positive)] font-semibold">Entradas: {formatCurrency(totalEntradas)}</span>
              <span className="text-xs text-[var(--negative)] font-semibold">Saídas: {formatCurrency(totalFixos + totalVar + totalParc)}</span>
            </div>
          </div>
          {unified.length === 0 ? <Empty /> : (
            <div className="divide-y divide-[var(--border)]">
              {unified.map((item, i) => <div key={i}>{item.render()}</div>)}
            </div>
          )}
        </div>
      )}

      {activeTab === "Entradas" && (
        <Section title="Entradas" total={totalEntradas} totalColor="text-[var(--positive)]" totalLabel="Total">
          {entradas.length === 0 ? <Empty /> : (
            <div className="divide-y divide-[var(--border)]">
              {entradas.map(e => (
                <Row key={e.id}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[var(--positive)] shrink-0">↑</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{e.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold num text-[var(--positive)]">+{formatCurrency(e.value)}</p>
                    <StatusBadge status={e.status} />
                  </div>
                  <EditBtn onClick={() => onEditEntrada(e)} />
                  <DeleteBtn onClick={() => onDeleteEntrada(e.id)} />
                </Row>
              ))}
            </div>
          )}
        </Section>
      )}

      {activeTab === "Gastos Fixos" && (
        <Section title="Gastos Fixos" total={totalFixos} pago={paidFixos} pendente={totalFixos - paidFixos}>
          {gastosFixos.length === 0 ? <Empty /> : (
            <div className="divide-y divide-[var(--border)]">
              {gastosFixos.map(g => {
                const cat = categories.find(c => c.id === g.category);
                const pm  = paymentMethods.find(p => p.id === g.paymentMethod);
                return (
                  <Row key={g.id}>
                    <CatDot cat={cat} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--card-foreground)]">{g.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Dia {g.dueDay}{pm ? ` · ${pm.name}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold num">{formatCurrency(g.value)}</p>
                      <StatusBadge status={g.paid ? "pago" : "pendente"} />
                    </div>
                    <ToggleBtn checked={g.paid} onToggle={() => onToggleFixo(g.id)} />
                    <EditBtn onClick={() => onEditFixo(g)} />
                    <DeleteBtn onClick={() => onDeleteFixo(g.id)} />
                  </Row>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {activeTab === "Gastos do Mês" && (
        <Section title="Gastos Variáveis" total={totalVar} pago={paidVar} pendente={totalVar - paidVar}>
          {gastosVariaveis.length === 0 ? <Empty /> : (
            <div className="divide-y divide-[var(--border)]">
              {gastosVariaveis.map(g => {
                const cat = categories.find(c => c.id === g.category);
                const pm  = paymentMethods.find(p => p.id === g.paymentMethod);
                return (
                  <Row key={g.id}>
                    <CatDot cat={cat} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--card-foreground)]">{g.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{new Date(g.date + "T12:00:00").toLocaleDateString("pt-BR")}{pm ? ` · ${pm.name}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold num">{formatCurrency(g.value)}</p>
                      <StatusBadge status={g.paid ? "pago" : "pendente"} />
                    </div>
                    <ToggleBtn checked={g.paid} onToggle={() => onToggleVariavel(g.id)} />
                    <EditBtn onClick={() => onEditVariavel(g)} />
                    <DeleteBtn onClick={() => onDeleteVariavel(g.id)} />
                  </Row>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {activeTab === "Parcelamentos" && (
        <Section title="Parcelamentos do Mês" total={totalParc} pago={paidParc} pendente={totalParc - paidParc}>
          {parcelamentos.length === 0 ? <Empty /> : (
            <div className="divide-y divide-[var(--border)]">
              {parcelamentos.map(p => {
                const cat = categories.find(c => c.id === p.category);
                const pm  = paymentMethods.find(pm => pm.id === p.paymentMethod);
                const pct = p.parcelaAtual / p.totalParcelas;
                return (
                  <Row key={p.id}>
                    <CatDot cat={cat} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--card-foreground)]">{p.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{pm ? `${pm.name} · ` : ""}Parcela {p.parcelaAtual}/{p.totalParcelas}</p>
                      <div className="mt-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${pct * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold num">{formatCurrency(p.valorParcela)}</p>
                      <StatusBadge status={p.paid ? "pago" : "pendente"} />
                    </div>
                    <ToggleBtn checked={p.paid} onToggle={() => onToggleParcelamento(p.id)} />
                    <EditBtn onClick={() => onEditParcelamento(p)} />
                    <DeleteBtn onClick={() => onDeleteParcelamento(p.id)} />
                  </Row>
                );
              })}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

function TypeTag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color }}>{label}</span>;
}

function TypeDot({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold" style={{ background: bg, color }}>{label}</div>
  );
}

function CatDot({ cat }: { cat?: { bg: string; color: string; name: string } }) {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: cat?.bg || "#F3F4F6", color: cat?.color || "#6B7280" }}>{cat?.name[0] || "•"}</div>
  );
}

function ToggleBtn({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${checked ? "bg-[var(--positive)] border-[var(--positive)]" : "border-[var(--border)]"}`}>
      {checked && <Check size={12} color="white" strokeWidth={3} />}
    </div>
  );
}

function Section({ title, total, totalLabel, totalColor, pago, pendente, children }: {
  title: string; total: number; totalLabel?: string; totalColor?: string; pago?: number; pendente?: number; children: React.ReactNode;
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
          <span className={`text-sm font-bold num ${totalColor || "text-[var(--card-foreground)]"}`}>{totalLabel || "Total"}: {formatCurrency(total)}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)]/30 transition-colors">{children}</div>;
}

function Empty() {
  return <p className="px-5 py-6 text-sm text-center text-[var(--muted-foreground)]">Nenhum item. Use o botão + para adicionar.</p>;
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-colors shrink-0">
      <Trash2 size={14} />
    </button>
  );
}

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors shrink-0">
      <Pencil size={13} />
    </button>
  );
}
