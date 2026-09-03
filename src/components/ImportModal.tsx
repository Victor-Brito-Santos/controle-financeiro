import { useState, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  X, Upload, ArrowRight, ArrowLeft, Check,
  FileSpreadsheet, AlertCircle, Loader2
} from "lucide-react";
import { Entrada, GastoFixo, GastoVariavel, Parcelamento, Category, PaymentMethod } from "../data/mockData";

export interface ImportResult {
  entradas:        Omit<Entrada, "id">[];
  gastosFixos:     Omit<GastoFixo, "id">[];
  gastosVariaveis: Omit<GastoVariavel, "id">[];
  parcelamentos:   Omit<Parcelamento, "id">[];
}

interface Props {
  open:           boolean;
  onClose:        () => void;
  categories:     Category[];
  paymentMethods: PaymentMethod[];
  onImport:       (result: ImportResult) => void;
}

type Step           = "upload" | "map" | "preview" | "done";
type TransactionType = "entrada" | "gasto-fixo" | "gasto-mes" | "parcelamento";
type FieldKey       = "title" | "value" | "date" | "type" | "category" | "paymentMethod" | "installments";

const FIELDS: { key: FieldKey; label: string; required?: boolean }[] = [
  { key: "title",         label: "Título / Nome",       required: true },
  { key: "value",         label: "Valor",               required: true },
  { key: "date",          label: "Data" },
  { key: "type",          label: "Tipo de lançamento" },
  { key: "category",      label: "Categoria" },
  { key: "paymentMethod", label: "Forma de pagamento" },
  { key: "installments",  label: "Nº de parcelas" },
];

const FIELD_ALIASES: Record<FieldKey, string[]> = {
  title:         ["titulo", "nome", "descricao", "description", "name", "item", "historico", "produto", "lancamento", "lançamento"],
  value:         ["valor", "value", "amount", "quantia", "preco", "custo", "total", "montante"],
  date:          ["data", "date", "dt", "vencimento", "competencia"],
  type:          ["tipo", "type", "natureza"],
  category:      ["categoria", "category", "cat", "grupo", "classificacao"],
  paymentMethod: ["pagamento", "payment", "forma pagamento", "forma de pagamento", "cartao", "banco", "metodo"],
  installments:  ["parcelas", "installments", "num parcelas", "qtd parcelas", "total parcelas"],
};

const TYPE_LABELS: Record<TransactionType, string> = {
  "entrada":      "Entrada",
  "gasto-fixo":   "Gasto Fixo",
  "gasto-mes":    "Gasto do Mês",
  "parcelamento": "Parcelamento",
};

const TYPE_COLOR: Record<string, string> = {
  "Entrada":      "#10B981",
  "Gasto Fixo":   "#3B82F6",
  "Gasto do Mês": "#F97316",
  "Parcelamento": "#8B5CF6",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function detectField(header: string): FieldKey | null {
  const n = norm(header);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [FieldKey, string[]][]) {
    if (aliases.some(a => n.includes(a))) return field;
  }
  return null;
}

function parseValue(raw: unknown): number | null {
  if (typeof raw === "number") return Math.abs(raw);
  if (!raw) return null;
  let s = String(raw).replace(/R\$\s*/gi, "").replace(/\s/g, "");
  if (/\d+\.\d{3},/.test(s))      s = s.replace(/\./g, "").replace(",", ".");
  else if (/,/.test(s) && !/\./.test(s)) s = s.replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.abs(n);
}

function parseDate(raw: unknown): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!raw) return today;
  if (typeof raw === "number") {
    try {
      const d = XLSX.SSF.parse_date_code(raw);
      if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    } catch {}
    return today;
  }
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const br = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (br) {
    const [, d, m, y] = br;
    const year = y.length === 2 ? (parseInt(y) > 50 ? "19" + y : "20" + y) : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? today : dt.toISOString().slice(0, 10);
}

function detectType(raw: unknown): TransactionType | null {
  if (!raw) return null;
  const s = norm(String(raw));
  if (s.includes("entrada") || s.includes("receita") || s.includes("recebimento") || s === "e") return "entrada";
  if (s.includes("fixo") || s === "gf" || s.includes("despesa fixa")) return "gasto-fixo";
  if (s.includes("parcel") || s.includes("credito") || s === "p") return "parcelamento";
  if (s.includes("gasto") || s.includes("variavel") || s.includes("despesa") || s === "gm" || s === "g") return "gasto-mes";
  return null;
}

function findCategory(raw: unknown, categories: Category[]): string {
  if (!raw) return "outros";
  const n = norm(String(raw));
  return categories.find(c => norm(c.name) === n || n.includes(norm(c.name)))?.id || "outros";
}

function findPM(raw: unknown, pms: PaymentMethod[]): string {
  if (!raw) return "";
  const n = norm(String(raw));
  return pms.find(p => norm(p.name) === n || n.includes(norm(p.name)))?.id || "";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImportModal({ open, onClose, categories, paymentMethods, onImport }: Props) {
  const [step,        setStep]        = useState<Step>("upload");
  const [rows,        setRows]        = useState<unknown[][]>([]);
  const [headers,     setHeaders]     = useState<string[]>([]);
  const [fileName,    setFileName]    = useState("");
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [mapping,     setMapping]     = useState<Record<FieldKey, number>>({
    title: -1, value: -1, date: -1, type: -1,
    category: -1, paymentMethod: -1, installments: -1,
  });
  const [defaultType, setDefaultType] = useState<TransactionType>("gasto-mes");

  const reset = () => {
    setStep("upload"); setRows([]); setHeaders([]); setFileName(""); setError(""); setLoading(false);
    setMapping({ title: -1, value: -1, date: -1, type: -1, category: -1, paymentMethod: -1, installments: -1 });
    setDefaultType("gasto-mes");
  };

  const handleClose = () => { reset(); onClose(); };

  const buildItems = useCallback((): ImportResult => {
    const result: ImportResult = { entradas: [], gastosFixos: [], gastosVariaveis: [], parcelamentos: [] };
    const today = new Date().toISOString().slice(0, 10);
    for (const row of rows) {
      const r = row as unknown[];
      const get = (col: number) => col >= 0 ? r[col] : undefined;
      const title = String(get(mapping.title) ?? "").trim();
      const value = parseValue(get(mapping.value));
      if (!title || value === null || value <= 0) continue;
      const date    = parseDate(get(mapping.date) || today);
      const rawType = get(mapping.type);
      const txType: TransactionType = (rawType ? detectType(rawType) : null) ?? defaultType;
      const catId   = findCategory(get(mapping.category), categories);
      const pmId    = findPM(get(mapping.paymentMethod), paymentMethods);
      const installsRaw = parseValue(get(mapping.installments));
      const installments = Math.max(1, Math.round(installsRaw ?? 1));

      if (txType === "entrada") {
        result.entradas.push({ name: title, value, date, status: "recebido" });
      } else if (txType === "gasto-fixo") {
        const dueDay = new Date(date + "T12:00:00").getDate();
        result.gastosFixos.push({ name: title, value, dueDay, category: catId, paymentMethod: pmId, paid: false });
      } else if (txType === "gasto-mes") {
        result.gastosVariaveis.push({ name: title, value, date, category: catId, paymentMethod: pmId, paid: false });
      } else {
        result.parcelamentos.push({
          name: title, totalParcelas: installments, parcelaAtual: 1,
          valorParcela: value / installments, category: catId, paymentMethod: pmId, paid: false,
        });
      }
    }
    return result;
  }, [rows, mapping, defaultType, categories, paymentMethods]);

  const previewItems = useMemo(
    () => (step === "preview" ? buildItems() : null),
    [step, buildItems]
  );

  const totalPreview = previewItems
    ? previewItems.entradas.length + previewItems.gastosFixos.length +
      previewItems.gastosVariaveis.length + previewItems.parcelamentos.length
    : 0;

  const processFile = (file: File) => {
    setError(""); setLoading(true);
    const isCSV = file.name.toLowerCase().endsWith(".csv");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target!.result;
        const wb = isCSV
          ? XLSX.read(data as string,              { type: "string" })
          : XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
        const sheet   = wb.Sheets[wb.SheetNames[0]];
        const parsed  = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" }) as unknown[][];
        const hIdx    = parsed.findIndex(r => (r as unknown[]).some(c => String(c).trim() !== ""));
        if (hIdx < 0 || parsed.length < hIdx + 2) {
          setError("Arquivo vazio ou sem dados suficientes."); setLoading(false); return;
        }
        const hdrs     = (parsed[hIdx] as unknown[]).map(c => String(c).trim());
        const dataRows = parsed.slice(hIdx + 1).filter(r => (r as unknown[]).some(c => String(c).trim() !== ""));
        if (dataRows.length === 0) {
          setError("Nenhuma linha de dados encontrada."); setLoading(false); return;
        }
        setHeaders(hdrs); setRows(dataRows); setFileName(file.name);
        const autoMap: Record<FieldKey, number> = {
          title: -1, value: -1, date: -1, type: -1, category: -1, paymentMethod: -1, installments: -1,
        };
        hdrs.forEach((h, i) => {
          const f = detectField(h);
          if (f && autoMap[f] === -1) autoMap[f] = i;
        });
        setMapping(autoMap); setLoading(false); setStep("map");
      } catch {
        setError("Erro ao ler o arquivo. Verifique se é um .xlsx ou .csv válido."); setLoading(false);
      }
    };
    if (isCSV) reader.readAsText(file, "UTF-8");
    else       reader.readAsArrayBuffer(file);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleNext = () => {
    if (mapping.title < 0 || mapping.value < 0) {
      setError("Selecione pelo menos as colunas Título e Valor."); return;
    }
    setError(""); setStep("preview");
  };

  const handleImport = () => {
    const items = buildItems();
    const count = items.entradas.length + items.gastosFixos.length +
                  items.gastosVariaveis.length + items.parcelamentos.length;
    onImport(items);
    setImportedCount(count);
    setStep("done");
  };

  const colOptions = [
    { label: "— Ignorar —", value: -1 },
    ...headers.map((h, i) => ({
      label: `Col. ${String.fromCharCode(65 + Math.min(i, 25))}: ${h.slice(0, 24)}${h.length > 24 ? "…" : ""}`,
      value: i,
    })),
  ];

  const sampleRows = useMemo(() => {
    if (!previewItems) return [];
    return [
      ...previewItems.entradas.slice(0, 3).map(e        => ({ title: e.name,       value: e.value,       type: "Entrada" })),
      ...previewItems.gastosFixos.slice(0, 2).map(g      => ({ title: g.name,       value: g.value,       type: "Gasto Fixo" })),
      ...previewItems.gastosVariaveis.slice(0, 2).map(g  => ({ title: g.name,       value: g.value,       type: "Gasto do Mês" })),
      ...previewItems.parcelamentos.slice(0, 1).map(p    => ({ title: p.name,       value: p.valorParcela,type: "Parcelamento" })),
    ].slice(0, 8);
  }, [previewItems]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative w-full md:w-[560px] md:max-h-[88vh] bg-[var(--card)] md:rounded-[var(--radius)] rounded-t-[var(--radius)] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/15 flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--card-foreground)]">Importar Planilha</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {step === "upload" ? "Suporta .xlsx e .csv"
                 : step === "map"    ? `${fileName} · ${rows.length} linhas`
                 : step === "preview"? `${totalPreview} registros detectados`
                 : "Importação concluída"}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)] transition">
            <X size={15} />
          </button>
        </div>

        {/* Progress bar */}
        {step !== "done" && (
          <div className="flex gap-1.5 px-5 py-2.5 border-b border-[var(--border)] shrink-0">
            {(["upload", "map", "preview"] as Step[]).map((s, i) => {
              const done    = ["upload","map","preview"].indexOf(step) > i;
              const current = s === step;
              return (
                <div key={s} className="flex-1 flex flex-col gap-1">
                  <div className={`h-1 rounded-full transition-all duration-300 ${current ? "bg-[var(--primary)]" : done ? "bg-[var(--primary)]/40" : "bg-[var(--muted)]"}`} />
                  <span className={`text-[10px] font-semibold ${current ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                    {s === "upload" ? "Arquivo" : s === "map" ? "Mapeamento" : "Prévia"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Upload ── */}
          {step === "upload" && (
            <>
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById("import-file-input")?.click()}
                className="border-2 border-dashed border-[var(--border)] rounded-2xl p-10 text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group"
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={36} className="text-[var(--primary)] animate-spin" />
                    <p className="text-sm font-semibold text-[var(--muted-foreground)]">Processando arquivo…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-all">
                      <Upload size={24} className="text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--card-foreground)]">Arraste um arquivo aqui</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">ou clique para selecionar</p>
                    </div>
                    <div className="flex gap-2">
                      {[".xlsx", ".csv"].map(ext => (
                        <span key={ext} className="text-xs px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] font-mono font-semibold">{ext}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input id="import-file-input" type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileInput} />

              <div className="bg-[var(--muted)]/50 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Como funciona</p>
                {[
                  "A primeira linha da planilha será usada como cabeçalho",
                  "Colunas chamadas Valor, Data, Tipo, Categoria são detectadas automaticamente",
                  "Você ajusta o mapeamento antes de confirmar a importação",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    <p className="text-xs text-[var(--muted-foreground)]">{t}</p>
                  </div>
                ))}
              </div>

              {error && <ErrorBanner message={error} />}
            </>
          )}

          {/* ── Map ── */}
          {step === "map" && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Mapeamento de colunas</p>
                <div className="space-y-2.5">
                  {FIELDS.map(field => (
                    <div key={field.key} className="flex items-center gap-3">
                      <label className="text-sm font-medium text-[var(--card-foreground)] w-44 shrink-0 leading-tight">
                        {field.label}
                        {field.required && <span className="text-[var(--negative)] ml-0.5">*</span>}
                      </label>
                      <select
                        value={mapping[field.key]}
                        onChange={e => { setMapping(prev => ({ ...prev, [field.key]: Number(e.target.value) })); setError(""); }}
                        className="flex-1 px-3 py-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] border border-[var(--border)] transition"
                      >
                        {colOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Tipo padrão (quando não detectado)</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(TYPE_LABELS) as [TransactionType, string][]).map(([t, label]) => (
                    <button key={t} type="button" onClick={() => setDefaultType(t)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${defaultType === t ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40"}`}>
                      {defaultType === t && <Check size={13} />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <ErrorBanner message={error} />}
            </>
          )}

          {/* ── Preview ── */}
          {step === "preview" && previewItems && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Entradas",      count: previewItems.entradas.length,        color: "#10B981" },
                  { label: "Gastos do Mês", count: previewItems.gastosVariaveis.length, color: "#F97316" },
                  { label: "Gastos Fixos",  count: previewItems.gastosFixos.length,     color: "#3B82F6" },
                  { label: "Parcelamentos", count: previewItems.parcelamentos.length,   color: "#8B5CF6" },
                ].map(item => (
                  <div key={item.label} className="bg-[var(--muted)]/50 rounded-xl p-3 border border-[var(--border)]">
                    <p className="text-xl font-bold num" style={{ color: item.color }}>{item.count}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>

              {sampleRows.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Prévia dos primeiros registros</p>
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[var(--muted)]/50">
                          <th className="text-left px-3 py-2 font-semibold text-[var(--muted-foreground)]">Título</th>
                          <th className="text-right px-3 py-2 font-semibold text-[var(--muted-foreground)]">Valor</th>
                          <th className="text-center px-3 py-2 font-semibold text-[var(--muted-foreground)]">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {sampleRows.map((row, i) => (
                          <tr key={i} className="hover:bg-[var(--muted)]/20 transition">
                            <td className="px-3 py-2 text-[var(--card-foreground)] font-medium max-w-[160px] truncate">{row.title}</td>
                            <td className="px-3 py-2 text-right num text-[var(--card-foreground)]">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.value)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ background: TYPE_COLOR[row.type] || "#6B7280" }}>
                                {row.type.split(" ")[0]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalPreview > sampleRows.length && (
                      <div className="px-3 py-2 text-center text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/30 border-t border-[var(--border)]">
                        +{totalPreview - sampleRows.length} registros adicionais
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🤔</p>
                  <p className="font-semibold text-[var(--card-foreground)]">Nenhum registro válido encontrado</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">Verifique se as colunas Título e Valor foram mapeadas corretamente.</p>
                </div>
              )}
            </>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--positive)]/15 flex items-center justify-center mx-auto">
                <Check size={32} className="text-[var(--positive)]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--card-foreground)]">Importação concluída!</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1.5">
                  <span className="font-bold text-[var(--positive)] num">{importedCount}</span> {importedCount === 1 ? "registro adicionado" : "registros adicionados"} com sucesso.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border)] flex gap-3 shrink-0">
          {step === "upload" && (
            <button onClick={handleClose} className="flex-1 py-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold text-sm hover:bg-[var(--border)] transition">
              Cancelar
            </button>
          )}
          {step === "map" && (
            <>
              <button onClick={() => { setStep("upload"); setError(""); }}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold text-sm hover:bg-[var(--border)] transition">
                <ArrowLeft size={15} /> Voltar
              </button>
              <button onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">
                Visualizar <ArrowRight size={15} />
              </button>
            </>
          )}
          {step === "preview" && (
            <>
              <button onClick={() => { setStep("map"); }}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold text-sm hover:bg-[var(--border)] transition">
                <ArrowLeft size={15} /> Voltar
              </button>
              <button onClick={handleImport} disabled={totalPreview === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <Check size={15} /> Importar {totalPreview > 0 ? `${totalPreview} ${totalPreview === 1 ? "registro" : "registros"}` : ""}
              </button>
            </>
          )}
          {step === "done" && (
            <button onClick={handleClose}
              className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900">
      <AlertCircle size={15} className="text-[var(--negative)] shrink-0" />
      <p className="text-sm text-[var(--negative)]">{message}</p>
    </div>
  );
}
