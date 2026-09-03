import { useState } from "react";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import { Category, Entrada, GastoFixo, GastoVariavel, Parcelamento, formatCurrency } from "../data/mockData";
import ColorPicker from "./ColorPicker";


interface Props {
  categories: Category[];
  entradas: Entrada[]; gastosFixos: GastoFixo[];
  gastosVariaveis: GastoVariavel[]; parcelamentos: Parcelamento[];
  onAdd: (cat: Category) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, upd: Partial<Category>) => void;
}

export default function Categories({ categories, gastosFixos, gastosVariaveis, parcelamentos, onAdd, onDelete, onEdit }: Props) {
  const [showForm, setShowForm]     = useState(false);
  const [name, setName]             = useState("");
  const [color, setColor]           = useState("#F97316");
  const [editingId, setEditingId]   = useState<string | null>(null);

  const catTotals = categories.map(cat => {
    const fixo = gastosFixos.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
    const vari = gastosVariaveis.filter(g => g.category === cat.id).reduce((s, g) => s + g.value, 0);
    const parc = parcelamentos.filter(p => p.category === cat.id).reduce((s, p) => s + p.valorParcela, 0);
    return { ...cat, total: fixo + vari + parc };
  });
  const maxTotal = Math.max(...catTotals.map(c => c.total), 1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const bg = color + "20";
    onAdd({ id, name: name.trim(), color, bg });
    setName(""); setColor("#F97316"); setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Categorias</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{categories.length} categorias cadastradas</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancelar" : "Nova categoria"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-[var(--card)] rounded-[var(--radius)] p-4 shadow-sm border border-[var(--border)] space-y-4">
          <h3 className="font-semibold text-[var(--card-foreground)]">Nova Categoria</h3>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Academia, Pet, Viagem..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2">Cor</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">
            Criar Categoria
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <div className="bg-[var(--card)] rounded-[var(--radius)] p-12 text-center shadow-sm border border-[var(--border)]">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-semibold text-[var(--card-foreground)]">Nenhuma categoria ainda</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Crie categorias para organizar seus gastos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {catTotals.map(cat => (
            <div key={cat.id} className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden">
              <div className="p-4 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: cat.color }}>
                    {cat.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--card-foreground)] truncate">{cat.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{cat.total > 0 ? `${((cat.total / maxTotal) * 100).toFixed(0)}% do maior` : "Sem gastos"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold num" style={{ color: cat.color }}>{formatCurrency(cat.total)}</p>
                    <button onClick={() => setEditingId(editingId === cat.id ? null : cat.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-all">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => onDelete(cat.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(cat.total / maxTotal) * 100}%`, background: cat.color }} />
                </div>
              </div>
              {editingId === cat.id && (
                <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 bg-[var(--muted)]/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Editar cor</p>
                  <ColorPicker value={cat.color} onChange={c => onEdit(cat.id, { color: c })} />
                  <button onClick={() => setEditingId(null)} className="mt-3 w-full py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">Concluído</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
