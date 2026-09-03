import { useState, useEffect } from "react";
import { X, Check, Pencil } from "lucide-react";
import { PaymentMethod, Category } from "../data/mockData";

export type TransactionType = "entrada" | "gasto-fixo" | "gasto-mes" | "parcelamento";

interface Props {
  open: boolean;
  initialType?: TransactionType;
  paymentMethods: PaymentMethod[];
  categories: Category[];
  onClose: () => void;
  onSave: (data: TransactionData) => void;
  // Edit mode
  editId?: number;
  editInitial?: EditInitial;
  onEdit?: (id: number, data: TransactionData) => void;
}

export interface TransactionData {
  type: TransactionType;
  title: string;
  value: number;
  category?: string;
  paymentMethod?: string;
  installments?: number;
  currentInstallment?: number;
  date: string;
  dueDay?: number;
}

export interface EditInitial {
  title: string;
  value: string;
  category?: string;
  paymentMethod?: string;
  installments?: string;
  currentInstallment?: string;
  date?: string;
  dueDay?: string;
}

const typeLabels: Record<TransactionType, string> = {
  entrada: "Entrada",
  "gasto-fixo": "Gasto Fixo",
  "gasto-mes": "Gasto do Mês",
  parcelamento: "Parcelamento",
};

const typeColors: Record<TransactionType, string> = {
  entrada: "var(--positive)",
  "gasto-fixo": "var(--primary)",
  "gasto-mes": "#F97316",
  parcelamento: "#8B5CF6",
};

const todayISO = () => new Date().toISOString().split("T")[0];

export default function AddTransactionModal({
  open, initialType = "entrada", paymentMethods, categories,
  onClose, onSave, editId, editInitial, onEdit,
}: Props) {
  const isEdit = editId !== undefined && editInitial !== undefined;

  const [type, setType]             = useState<TransactionType>(initialType);
  const [title, setTitle]           = useState("");
  const [value, setValue]           = useState("");
  const [paymentMethod, setPM]      = useState("");
  const [category, setCategory]     = useState("");
  const [installments, setInstallments] = useState("2");
  const [currentInstallment, setCurrentInstallment] = useState("1");
  const [date, setDate]             = useState(todayISO());
  const [dueDay, setDueDay]         = useState("1");
  const [saved, setSaved]           = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaved(false);
    setType(initialType);
    if (isEdit && editInitial) {
      setTitle(editInitial.title);
      setValue(editInitial.value);
      setCategory(editInitial.category || "");
      setPM(editInitial.paymentMethod || paymentMethods[0]?.id || "");
      setInstallments(editInitial.installments || "2");
      setCurrentInstallment(editInitial.currentInstallment || "1");
      setDate(editInitial.date || todayISO());
      setDueDay(editInitial.dueDay || "1");
    } else {
      setTitle(""); setValue(""); setCategory("");
      setPM(paymentMethods[0]?.id || "");
      setInstallments("2"); setCurrentInstallment("1");
      setDate(todayISO()); setDueDay("1");
    }
  }, [open, initialType, isEdit]);

  const needsPayment     = type !== "entrada";
  const needsInstallments = type === "parcelamento";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(",", "."));
    if (!title.trim() || isNaN(numericValue) || numericValue <= 0) return;

    const data: TransactionData = {
      type, title: title.trim(), value: numericValue,
      category: category || undefined,
      paymentMethod: needsPayment ? paymentMethod : undefined,
      installments: needsInstallments ? parseInt(installments) : undefined,
      currentInstallment: needsInstallments ? parseInt(currentInstallment) : undefined,
      date: type === "gasto-fixo" ? todayISO() : date,
      dueDay: type === "gasto-fixo" ? parseInt(dueDay) : undefined,
    };

    if (isEdit && onEdit) {
      onEdit(editId!, data);
    } else {
      onSave(data);
    }
    setSaved(true);
    setTimeout(onClose, 600);
  };

  if (!open) return null;

  const accentColor = typeColors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[var(--card)] rounded-t-[28px] sm:rounded-[var(--radius)] shadow-2xl overflow-hidden">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--muted)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            {isEdit && <Pencil size={16} style={{ color: accentColor }} />}
            <h2 className="font-bold text-lg text-[var(--card-foreground)]">
              {isEdit ? `Editar ${typeLabels[type]}` : "Novo Lançamento"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
            <X size={16} />
          </button>
        </div>

        {/* Type selector — hidden in edit mode */}
        {!isEdit && (
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Tipo</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(typeLabels) as TransactionType[]).map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${type === t ? "border-transparent text-white shadow-sm" : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}
                  style={type === t ? { background: typeColors[t] } : {}}>
                  {typeLabels[t]}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Title */}
          <Field label="Título / Descrição">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              placeholder={type === "entrada" ? "Ex: Salário, Freelance..." : type === "gasto-fixo" ? "Ex: Aluguel, Academia..." : type === "gasto-mes" ? "Ex: Supermercado, iFood..." : "Ex: MacBook, Geladeira..."}
              className="field-input" />
          </Field>

          {/* Value */}
          <Field label={needsInstallments && isEdit ? "Valor por Parcela (R$)" : "Valor (R$)"}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--muted-foreground)]">R$</span>
              <input type="text" inputMode="decimal" value={value} onChange={e => setValue(e.target.value.replace(/[^0-9,.]/g, ""))} required placeholder="0,00"
                className="field-input pl-10 num" />
            </div>
          </Field>

          {/* Date — shown in edit mode for entrada/gasto-mes, and in add mode too */}
          {(type === "entrada" || type === "gasto-mes") && (
            <Field label="Data">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="field-input" />
            </Field>
          )}

          {/* Due day — for gasto-fixo */}
          {type === "gasto-fixo" && (
            <Field label="Dia de Vencimento">
              <input type="number" min={1} max={31} value={dueDay}
                onChange={e => setDueDay(e.target.value)}
                className="field-input w-24" />
            </Field>
          )}

          {/* Category */}
          {categories.length > 0 && type !== "entrada" && (
            <Field label="Categoria">
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${category === cat.id ? "text-white border-transparent" : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)]"}`}
                    style={category === cat.id ? { background: cat.color } : {}}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Payment */}
          {needsPayment && paymentMethods.length > 0 && (
            <Field label="Forma de Pagamento">
              <div className="flex gap-2 flex-wrap">
                {paymentMethods.map(pm => (
                  <button key={pm.id} type="button" onClick={() => setPM(pm.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${paymentMethod === pm.id ? "text-white border-transparent shadow-sm" : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)]"}`}
                    style={paymentMethod === pm.id ? { background: pm.color } : {}}>
                    {pm.name}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Installments */}
          {needsInstallments && (
            <Field label="Total de Parcelas">
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map(n => (
                  <button key={n} type="button" onClick={() => setInstallments(String(n))}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-all border ${installments === String(n) ? "bg-purple-600 text-white border-transparent shadow-sm" : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)]"}`}>
                    {n}x
                  </button>
                ))}
              </div>
              {value && parseFloat(value.replace(",", ".")) > 0 && !isEdit && (
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  ≈ <span className="font-semibold text-[var(--foreground)]">R$ {(parseFloat(value.replace(",", ".")) / parseInt(installments || "1")).toFixed(2).replace(".", ",")}</span> por parcela
                </p>
              )}
            </Field>
          )}

          {/* Parcela atual — only in edit mode for parcelamento */}
          {needsInstallments && isEdit && (
            <Field label={`Parcela Atual (de ${installments})`}>
              <input type="number" min={1} max={parseInt(installments) || 999} value={currentInstallment}
                onChange={e => setCurrentInstallment(e.target.value)}
                className="field-input w-24 num" />
            </Field>
          )}

          <button type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${saved ? "bg-[var(--positive)] text-white" : "text-white hover:opacity-90 shadow-sm"}`}
            style={!saved ? { background: accentColor } : {}}>
            {saved
              ? <><Check size={18} strokeWidth={3} /> Salvo!</>
              : isEdit ? `Salvar alterações` : `Adicionar ${typeLabels[type]}`}
          </button>
        </form>
      </div>

      <style>{`.field-input { width: 100%; padding: 12px 16px; border-radius: 12px; background: var(--muted); color: var(--foreground); font-size: 14px; outline: none; transition: box-shadow 0.15s; border: none; } .field-input:focus { box-shadow: 0 0 0 2px var(--ring); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
