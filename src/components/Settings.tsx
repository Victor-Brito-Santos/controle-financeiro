import { useState, useRef } from "react";
import { Plus, Trash2, Check, X, Camera, User, Pencil, FileSpreadsheet } from "lucide-react";
import { PaymentMethod, Category, themePresets, formatCurrency } from "../data/mockData";
import ColorPicker from "./ColorPicker";

const PM_COLORS = ["#820AD1","#00C880","#32BCAD","#F5C518","#6B7280","#3B82F6","#EF4444","#F97316","#EC4899","#8B5CF6"];
const PM_TYPES = ["Crédito", "Débito", "Pix/Débito", "Carteira Digital", "Espécie", "Outro"];
const CATEGORY_COLORS = ["#F97316","#8B5CF6","#EC4899","#EAB308","#EF4444","#10B981","#3B82F6","#06B6D4","#6366F1","#6B7280","#14B8A6","#F43F5E","#84CC16","#A855F7","#0EA5E9"];
const CURRENCIES = ["BRL – R$", "USD – $", "EUR – €", "GBP – £", "JPY – ¥", "ARS – $", "CLP – $"];
const DATE_FORMATS = ["DD/MM/AAAA", "MM/DD/AAAA", "AAAA-MM-DD"];

interface Props {
  theme: string; onThemeChange: (t: string) => void;
  paymentMethods: PaymentMethod[];
  onAddPM: (pm: PaymentMethod) => void;
  onDeletePM: (id: string) => void;
  onEditPM: (id: string, pm: Partial<PaymentMethod>) => void;
  categories: Category[];
  onAddCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (id: string, upd: Partial<Category>) => void;
  userName: string; onUserNameChange: (n: string) => void;
  userPhoto: string; onUserPhotoChange: (p: string) => void;
  currency: string; onCurrencyChange: (c: string) => void;
  dateFormat: string; onDateFormatChange: (f: string) => void;
  onOpenImport: () => void;
}

export default function Settings({
  theme, onThemeChange,
  paymentMethods, onAddPM, onDeletePM, onEditPM,
  categories, onAddCategory, onDeleteCategory, onEditCategory,
  userName, onUserNameChange,
  userPhoto, onUserPhotoChange,
  currency, onCurrencyChange,
  dateFormat, onDateFormatChange,
  onOpenImport,
}: Props) {
  const [showPMForm, setShowPMForm]   = useState(false);
  const [pmName, setPmName]           = useState("");
  const [pmType, setPmType]           = useState(PM_TYPES[0]);
  const [pmColor, setPmColor]         = useState(PM_COLORS[0]);
  const [pmLimit, setPmLimit]         = useState("");

  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName]         = useState("");
  const [catColor, setCatColor]       = useState(CATEGORY_COLORS[0]);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState(userName);
  const [photoError, setPhotoError]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingPMId, setEditingPMId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [showCustomTheme, setShowCustomTheme] = useState(false);

  const isCustomTheme = theme.startsWith("#");
  const currentColor = isCustomTheme ? theme : (themePresets[theme]?.primary ?? "#2563EB");

  const handleSaveName = () => {
    if (nameInput.trim()) onUserNameChange(nameInput.trim());
    setEditingName(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Imagem muito grande. Máximo 5 MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) onUserPhotoChange(ev.target.result as string); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddPM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmName.trim()) return;
    const id = pmName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const limit = pmLimit ? parseFloat(pmLimit.replace(",", ".")) : null;
    onAddPM({ id, name: pmName.trim(), type: pmType, color: pmColor, limit });
    setPmName(""); setPmType(PM_TYPES[0]); setPmColor(PM_COLORS[0]); setPmLimit(""); setShowPMForm(false);
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const id = catName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    onAddCategory({ id, name: catName.trim(), color: catColor, bg: catColor + "20" });
    setCatName(""); setCatColor(CATEGORY_COLORS[0]); setShowCatForm(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Configurações</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Personalize seu app financeiro</p>
      </div>

      {/* Profile */}
      <Card title="Perfil">
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[var(--muted)] border-2 border-[var(--border)] flex items-center justify-center">
                {userPhoto
                  ? <img src={userPhoto} alt="Foto de perfil" className="w-full h-full object-cover" />
                  : <User size={32} className="text-[var(--muted-foreground)]" />}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-md hover:opacity-90 transition">
                <Camera size={13} color="white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex gap-2">
                  <input autoFocus type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] border border-[var(--border)]" />
                  <button onClick={handleSaveName} className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center hover:opacity-90 transition">
                    <Check size={14} color="white" />
                  </button>
                  <button onClick={() => setEditingName(false)} className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center hover:bg-[var(--border)] transition">
                    <X size={14} className="text-[var(--muted-foreground)]" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[var(--card-foreground)] truncate">{userName || "Meu Perfil"}</p>
                  <button onClick={() => { setNameInput(userName); setEditingName(true); }}
                    className="text-xs text-[var(--primary)] font-semibold hover:underline shrink-0">Editar</button>
                </div>
              )}
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Foto: máx. 5 MB (JPG, PNG, WebP)</p>
              {photoError && <p className="text-xs text-[var(--negative)] mt-1 font-semibold">{photoError}</p>}
              {userPhoto && (
                <button onClick={() => onUserPhotoChange("")}
                  className="text-xs text-[var(--negative)] mt-1 font-semibold hover:underline block">Remover foto</button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
      </Card>

      {/* Theme */}
      <Card title="Tema / Cor Principal">
        <div className="px-4 py-4 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">Escolha a cor de destaque do app</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(themePresets).map(([key, preset]) => (
              <button key={key} type="button" onClick={() => { onThemeChange(key); setShowCustomTheme(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${theme === key ? "border-transparent shadow-sm scale-105" : "border-[var(--border)] hover:border-opacity-50"}`}
                style={theme === key ? { background: preset.primary, borderColor: preset.primary } : {}}>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: preset.primary }} />
                <span className={`text-sm font-semibold ${theme === key ? "text-white" : "text-[var(--card-foreground)]"}`}>{preset.label}</span>
                {theme === key && <Check size={14} color="white" className="ml-auto" />}
              </button>
            ))}
            {/* Custom color tile */}
            <button type="button" onClick={() => setShowCustomTheme(s => !s)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all col-span-3 ${isCustomTheme || showCustomTheme ? "border-transparent shadow-sm" : "border-[var(--border)] hover:border-opacity-50"}`}
              style={isCustomTheme || showCustomTheme ? { background: currentColor } : {}}>
              <div className="w-4 h-4 rounded-full shrink-0 border border-white/30"
                style={{ background: isCustomTheme ? currentColor : "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }} />
              <span className={`text-sm font-semibold ${isCustomTheme || showCustomTheme ? "text-white" : "text-[var(--card-foreground)]"}`}>
                Personalizado{isCustomTheme ? ` · ${currentColor.toUpperCase()}` : ""}
              </span>
              {isCustomTheme && <Check size={14} color="white" className="ml-auto" />}
            </button>
          </div>

          {/* Custom color picker */}
          {showCustomTheme && (
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--muted)]/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Cor personalizada</p>
              <ColorPicker
                value={isCustomTheme ? currentColor : "#2563EB"}
                onChange={hex => onThemeChange(hex)}
              />
              {isCustomTheme && (
                <div className="mt-3 p-3 rounded-xl flex items-center gap-3" style={{ background: currentColor + "15", border: `1px solid ${currentColor}40` }}>
                  <div className="w-6 h-6 rounded-full shrink-0" style={{ background: currentColor }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: currentColor }}>Cor ativa</p>
                    <p className="text-xs font-mono text-[var(--muted-foreground)]">{currentColor.toUpperCase()}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card title="Formas de Pagamento"
        action={
          <button onClick={() => setShowPMForm(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition">
            {showPMForm ? <X size={13} /> : <Plus size={13} />} {showPMForm ? "Cancelar" : "Adicionar"}
          </button>
        }>
        {showPMForm && (
          <form onSubmit={handleAddPM} className="px-4 py-4 border-b border-[var(--border)] space-y-3 bg-[var(--muted)]/30">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Nome</label>
                <input type="text" value={pmName} onChange={e => setPmName(e.target.value)} required placeholder="Ex: Nubank, Pix..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] border border-[var(--border)] transition" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Tipo</label>
                <select value={pmType} onChange={e => setPmType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] text-[var(--foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] border border-[var(--border)] transition">
                  {PM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Limite (opcional)</label>
              <input type="text" inputMode="decimal" value={pmLimit} onChange={e => setPmLimit(e.target.value.replace(/[^0-9,.]/g, ""))} placeholder="Ex: 5000,00"
                className="w-full px-3 py-2 rounded-xl bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] border border-[var(--border)] num transition" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">Cor</label>
              <ColorPicker value={pmColor} onChange={setPmColor} />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">
              Adicionar forma de pagamento
            </button>
          </form>
        )}

        {paymentMethods.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center text-[var(--muted-foreground)]">Nenhuma forma de pagamento cadastrada ainda.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {paymentMethods.map(pm => (
              <div key={pm.id}>
                <div className="flex items-center gap-3 px-4 py-3 group hover:bg-[var(--muted)]/30 transition">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: pm.color }}>
                    {pm.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--card-foreground)]">{pm.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{pm.type}{pm.limit ? ` · Limite: ${formatCurrency(pm.limit)}` : ""}</p>
                  </div>
                  <button onClick={() => setEditingPMId(editingPMId === pm.id ? null : pm.id)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDeletePM(pm.id)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
                {editingPMId === pm.id && (
                  <div className="px-4 pb-4 bg-[var(--muted)]/20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Editar cor de {pm.name}</p>
                    <ColorPicker value={pm.color} onChange={c => onEditPM(pm.id, { color: c })} />
                    <button onClick={() => setEditingPMId(null)} className="mt-3 w-full py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">Concluído</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Categories */}
      <Card title="Categorias"
        action={
          <button onClick={() => setShowCatForm(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition">
            {showCatForm ? <X size={13} /> : <Plus size={13} />} {showCatForm ? "Cancelar" : "Adicionar"}
          </button>
        }>
        {showCatForm && (
          <form onSubmit={handleAddCat} className="px-4 py-4 border-b border-[var(--border)] space-y-3 bg-[var(--muted)]/30">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">Nome</label>
              <input type="text" value={catName} onChange={e => setCatName(e.target.value)} required placeholder="Ex: Pet, Viagem, Academia..."
                className="w-full px-3 py-2 rounded-xl bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] border border-[var(--border)] transition" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">Cor</label>
              <ColorPicker value={catColor} onChange={setCatColor} />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">
              Criar Categoria
            </button>
          </form>
        )}
        {categories.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center text-[var(--muted-foreground)]">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          <div className="p-3 space-y-1">
            {categories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--muted)]/50 transition group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: cat.color }}>
                    {cat.name[0]}
                  </div>
                  <span className="text-sm font-medium text-[var(--card-foreground)] truncate flex-1">{cat.name}</span>
                  <button onClick={() => setEditingCatId(editingCatId === cat.id ? null : cat.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all shrink-0">
                    <Pencil size={11} />
                  </button>
                  <button onClick={() => onDeleteCategory(cat.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-600 transition-all shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
                {editingCatId === cat.id && (
                  <div className="mx-2 mb-2 p-3 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Cor de {cat.name}</p>
                    <ColorPicker value={cat.color} onChange={c => onEditCategory(cat.id, { color: c })} />
                    <button onClick={() => setEditingCatId(null)} className="mt-3 w-full py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">Concluído</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Import */}
      <Card title="Importar Dados">
        <div className="px-4 py-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={20} className="text-[var(--primary)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--card-foreground)]">Importar do Excel ou CSV</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 mb-3">Leia arquivos .xlsx ou .csv e converta automaticamente para entradas, gastos e parcelamentos.</p>
            <button onClick={onOpenImport}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm">
              <FileSpreadsheet size={15} /> Abrir importador
            </button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card title="Preferências">
        <div className="divide-y divide-[var(--border)]">
          <PrefSelect label="Moeda" value={currency} options={CURRENCIES} onChange={onCurrencyChange} />
          <PrefSelect label="Formato de data" value={dateFormat} options={DATE_FORMATS} onChange={onDateFormatChange} last />
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="font-semibold text-sm text-[var(--muted-foreground)] uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function PrefSelect({ label, value, options, onChange, last }: { label: string; value: string; options: string[]; onChange: (v: string) => void; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 gap-3`}>
      <p className="text-sm font-medium text-[var(--card-foreground)]">{label}</p>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--ring)] border border-[var(--border)] transition cursor-pointer">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
