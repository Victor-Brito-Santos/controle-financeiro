import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { paymentMethods, categories } from "../data/mockData";

export type TransactionType = "entrada" | "gasto-fixo" | "gasto-mes" | "parcelamento";

interface Props {
  open: boolean;
  initialType?: TransactionType;
  onClose: () => void;
  onSave: (data: TransactionData) => void;
}

export interface TransactionData {
  type: TransactionType;
  title: string;
  value: number;
  paymentMethod?: string;
  installments?: number;
  date: string;
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

export default function AddTransactionModal({ open, initialType = "entrada", onClose, onSave }: Props) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [installments, setInstallments] = useState("2");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setType(initialType);
      setTitle("");
      setValue("");
      setPaymentMethod(paymentMethods[0].id);
      setInstallments("2");
      setSaved(false);
    }
  }, [open, initialType]);

  const needsPayment = type !== "entrada";
  const needsInstallments = type === "parcelamento";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(",", "."));
    if (!title.trim() || isNaN(numericValue) || numericValue <= 0) return;

    onSave({
      type,
      title: title.trim(),
      value: numericValue,
      paymentMethod: needsPayment ? paymentMethod : undefined,
      installments: needsInstallments ? parseInt(installments) : undefined,
      date: todayISO(),
    });

    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-[var(--card)] rounded-t-[28px] sm:rounded-[var(--radius)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--muted)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-bold text-lg text-[var(--card-foreground)]">Novo Lançamento</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:opacity-80 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Type Selector */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Tipo</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(typeLabels) as TransactionType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${
                  type === t
                    ? "border-transparent text-white shadow-sm"
                    : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                }`}
                style={type === t ? { background: typeColors[t] } : {}}
              >
                {typeLabels[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">
              Título / Descrição
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                type === "entrada" ? "Ex: Salário, Freelance..." :
                type === "gasto-fixo" ? "Ex: Aluguel, Academia..." :
                type === "gasto-mes" ? "Ex: Supermercado, iFood..." :
                "Ex: MacBook, Geladeira..."
              }
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition"
            />
          </div>

          {/* Value */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--muted-foreground)]">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={e => setValue(e.target.value.replace(/[^0-9,.]/g, ""))}
                placeholder="0,00"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--muted)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition num"
              />
            </div>
          </div>

          {/* Payment Method */}
          {needsPayment && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">
                Forma de Pagamento
              </label>
              <div className="flex gap-2 flex-wrap">
                {paymentMethods.map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      paymentMethod === pm.id
                        ? "text-white border-transparent shadow-sm"
                        : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                    }`}
                    style={paymentMethod === pm.id ? { background: pm.color } : {}}
                  >
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Installments */}
          {needsInstallments && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">
                Número de Parcelas
              </label>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setInstallments(String(n))}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-all border ${
                      installments === String(n)
                        ? "bg-purple-600 text-white border-transparent shadow-sm"
                        : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
              {value && parseFloat(value.replace(",", ".")) > 0 && (
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  ≈ <span className="font-semibold text-[var(--foreground)]">
                    R$ {(parseFloat(value.replace(",", ".")) / parseInt(installments || "1")).toFixed(2).replace(".", ",")}
                  </span> por parcela
                </p>
              )}
            </div>
          )}

          {/* Date display */}
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span className="w-4 h-4 rounded-full bg-[var(--muted)] flex items-center justify-center">📅</span>
            Data: <span className="font-semibold text-[var(--foreground)]">{new Date().toLocaleDateString("pt-BR")}</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              saved ? "bg-[var(--positive)] text-white" : "text-white hover:opacity-90 shadow-sm"
            }`}
            style={!saved ? { background: typeColors[type] } : {}}
          >
            {saved ? (
              <><Check size={18} strokeWidth={3} /> Salvo!</>
            ) : (
              `Adicionar ${typeLabels[type]}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
