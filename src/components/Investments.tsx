import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Plus, Trash2, X, Pencil, Check } from "lucide-react";
import { Investment, formatCurrency } from "../data/mockData";
import ColorPicker from "./ColorPicker";

interface Props {
  investments: Investment[];
  onAdd: (inv: Omit<Investment, "id">) => void;
  onDelete: (id: number) => void;
  onEdit?: (id: number, upd: Partial<Omit<Investment, "id">>) => void;
}

export default function Investments({ investments, onAdd, onDelete, onEdit }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState("");
  const [target, setTarget]     = useState("");
  const [current, setCurrent]   = useState("");
  const [type, setType]         = useState("");
  const [color, setColor]       = useState("#2563EB");

  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editName, setEditName]     = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editCurrent, setEditCurrent] = useState("");
  const [editType, setEditType]     = useState("");
  const [editColor, setEditColor]   = useState("#2563EB");

  const totalInvestido = investments.reduce((s, inv) => s + inv.current, 0);
  const totalMeta      = investments.reduce((s, inv) => s + inv.target, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(target.replace(",", "."));
    const c = parseFloat(current.replace(",", "."));
    if (!name.trim() || isNaN(t) || t <= 0) return;
    onAdd({ name: name.trim(), target: t, current: isNaN(c) ? 0 : c, type: type.trim(), color });
    setName(""); setTarget(""); setCurrent(""); setType(""); setColor("#2563EB"); setShowForm(false);
  };

  const openEdit = (inv: Investment) => {
    setEditingId(inv.id);
    setEditName(inv.name); setEditTarget(String(inv.target)); setEditCurrent(String(inv.current));
    setEditType(inv.type); setEditColor(inv.color);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null || !onEdit) return;
    const t = parseFloat(editTarget.replace(",", "."));
    const c = parseFloat(editCurrent.replace(",", "."));
    onEdit(editingId, { name: editName.trim(), target: isNaN(t) ? undefined : t, current: isNaN(c) ? undefined : c, type: editType.trim(), color: editColor });
    setEditingId(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Investimentos e Metas</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Acompanhe seu progresso financeiro</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancelar" : "Nova meta"}
        </button>
      </div>

      {/* Summary cards */}
      {investments.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--primary)] rounded-[var(--radius)] p-4 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, white, transparent 60%)" }} />
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Total Investido</p>
            <p className="text-2xl font-bold num text-white">{formatCurrency(totalInvestido)}</p>
          </div>
          <div className="bg-[var(--card)] rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Total de Metas</p>
            <p className="text-2xl font-bold num text-[var(--card-foreground)]">{formatCurrency(totalMeta)}</p>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-[var(--card)] rounded-[var(--radius)] p-5 shadow-sm border border-[var(--border)] space-y-4">
          <h3 className="font-semibold text-[var(--card-foreground)]">Nova Meta / Investimento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Reserva de emergência"
                className="field-in" />
            </div>
            <div>
              <label className="label">Onde está guardado</label>
              <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="Ex: Poupança, CDB..."
                className="field-in" />
            </div>
            <div>
              <label className="label">Meta (R$)</label>
              <input type="text" inputMode="decimal" value={target} onChange={e => setTarget(e.target.value.replace(/[^0-9,.]/g, ""))} required placeholder="30.000,00"
                className="field-in num" />
            </div>
            <div>
              <label className="label">Valor atual (R$)</label>
              <input type="text" inputMode="decimal" value={current} onChange={e => setCurrent(e.target.value.replace(/[^0-9,.]/g, ""))} placeholder="0,00"
                className="field-in num" />
            </div>
          </div>
          <div>
            <label className="label">Cor</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">
            Adicionar Meta
          </button>
        </form>
      )}

      {/* Goals list — empty state */}
      {investments.length === 0 ? (
        <div className="bg-[var(--card)] rounded-[var(--radius)] p-12 text-center shadow-sm border border-[var(--border)]">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-[var(--card-foreground)]">Nenhuma meta ainda</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Adicione metas de investimento para acompanhar seu progresso</p>
        </div>
      ) : (
        <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden">
          {/* Inline bar chart */}
          <div className="p-5 border-b border-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Progresso das Metas</p>
            <ResponsiveContainer width="99%" height={Math.max(80, investments.length * 44)}>
              <BarChart
                data={investments.map(inv => ({ name: inv.name.split(" ")[0], atual: inv.current, meta: inv.target, color: inv.color }))}
                layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barSize={12} barGap={2}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={60} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
                <Bar dataKey="meta" name="Meta" fill="var(--muted)" radius={[0, 6, 6, 0]} />
                <Bar dataKey="atual" name="Atual" radius={[0, 6, 6, 0]}>
                  {investments.map((inv, i) => <Cell key={i} fill={inv.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cards */}
          <div className="divide-y divide-[var(--border)]">
            {investments.map(inv => {
              const pct = Math.min((inv.current / inv.target) * 100, 100);
              const remaining = inv.target - inv.current;
              const isEditingThis = editingId === inv.id;

              return (
                <div key={inv.id} className="p-5 group">
                  {isEditingThis ? (
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="label">Nome</label>
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="field-in" />
                        </div>
                        <div>
                          <label className="label">Meta (R$)</label>
                          <input value={editTarget} onChange={e => setEditTarget(e.target.value.replace(/[^0-9,.]/g, ""))} className="field-in num" />
                        </div>
                        <div>
                          <label className="label">Atual (R$)</label>
                          <input value={editCurrent} onChange={e => setEditCurrent(e.target.value.replace(/[^0-9,.]/g, ""))} className="field-in num" />
                        </div>
                        <div className="col-span-2">
                          <label className="label">Onde guardado</label>
                          <input value={editType} onChange={e => setEditType(e.target.value)} className="field-in" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Cor</label>
                        <ColorPicker value={editColor} onChange={setEditColor} />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5">
                          <Check size={14} /> Salvar
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold text-sm hover:bg-[var(--border)] transition">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: inv.color }} />
                          <div>
                            <p className="font-bold text-[var(--card-foreground)]">{inv.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{inv.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-right">
                            <p className="font-bold num text-[var(--card-foreground)]">{formatCurrency(inv.current)}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">meta: {formatCurrency(inv.target)}</p>
                          </div>
                          <button onClick={() => openEdit(inv)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-all">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => onDelete(inv.id)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: inv.color }} />
                        </div>
                        <span className="text-sm font-bold num" style={{ color: inv.color }}>{pct.toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                        {remaining > 0 ? `Faltam ${formatCurrency(remaining)} para a meta` : "Meta atingida! 🎉"}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`.label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted-foreground);margin-bottom:6px}.field-in{width:100%;padding:10px 14px;border-radius:12px;background:var(--muted);color:var(--foreground);font-size:14px;outline:none;border:none;transition:box-shadow .15s}.field-in:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
    </div>
  );
}
