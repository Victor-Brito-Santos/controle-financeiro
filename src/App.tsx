import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, CalendarDays, Tag,
  Layers, TrendingUp, BarChart2, Settings as SettingsIcon,
  Plus, X, Moon, Sun, Menu, ChevronRight, User
} from "lucide-react";
import {
  defaultCategories, defaultPaymentMethods,
  Entrada, GastoFixo, GastoVariavel, Parcelamento,
  Category, Investment, PaymentMethod, themePresets
} from "./data/mockData";
import Dashboard from "./components/Dashboard";
import MonthlyView from "./components/MonthlyView";
import Categories from "./components/Categories";
import Installments from "./components/Installments";
import Investments from "./components/Investments";
import AnnualComparison from "./components/AnnualComparison";
import Settings from "./components/Settings";
import AddTransactionModal, { TransactionType, TransactionData, EditInitial } from "./components/AddTransactionModal";
import ImportModal, { ImportResult } from "./components/ImportModal";
import { fetchAppState, saveAppState } from "../utils/api";

type Page = "dashboard" | "monthly" | "categories" | "installments" | "investments" | "annual" | "settings";

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard",    label: "Dashboard",      icon: <LayoutDashboard size={20} /> },
  { id: "monthly",      label: "Mês Atual",      icon: <CalendarDays size={20} /> },
  { id: "categories",   label: "Categorias",     icon: <Tag size={20} /> },
  { id: "installments", label: "Parcelamentos",  icon: <Layers size={20} /> },
  { id: "investments",  label: "Investimentos",  icon: <TrendingUp size={20} /> },
  { id: "annual",       label: "Comparativo",    icon: <BarChart2 size={20} /> },
  { id: "settings",     label: "Configurações",  icon: <SettingsIcon size={20} /> },
];

const bottomNav: Page[] = ["dashboard", "monthly", "categories", "investments", "settings"];

function useLocalState<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal] as const;
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [dark, setDark] = useLocalState("dark", false);
  const [theme, setTheme] = useLocalState("theme", "blue");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear]   = useState(new Date().getFullYear());
  const [fabOpen, setFabOpen]           = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalType, setModalType]       = useState<TransactionType>("entrada");
  const [editingItem, setEditingItem]   = useState<{ id: number; type: TransactionType; initial: EditInitial } | null>(null);
  const [importOpen,  setImportOpen]    = useState(false);

  const [entradas,        setEntradas]        = useLocalState<Entrada[]>       ("entradas",        []);
  const [gastosFixos,     setGastosFixos]      = useLocalState<GastoFixo[]>     ("gastosFixos",     []);
  const [gastosVariaveis, setGastosVariaveis]  = useLocalState<GastoVariavel[]> ("gastosVariaveis", []);
  const [parcelamentos,   setParcelamentos]    = useLocalState<Parcelamento[]>  ("parcelamentos",   []);
  const [categories,      setCategories]       = useLocalState<Category[]>      ("categories",      defaultCategories);
  const [investments,     setInvestments]      = useLocalState<Investment[]>    ("investments",     []);
  const [paymentMethods,  setPaymentMethods]   = useLocalState<PaymentMethod[]> ("paymentMethods",  defaultPaymentMethods);
  const [userName,        setUserName]         = useLocalState<string>          ("userName",        "Controle Victor");
  const [userPhoto,       setUserPhoto]        = useLocalState<string>          ("userPhoto",       "");
  const [currency,        setCurrency]         = useLocalState<string>          ("currency",        "BRL – R$");
  const [dateFormat,      setDateFormat]       = useLocalState<string>          ("dateFormat",      "DD/MM/AAAA");

  // --- Sincronização com o Supabase (a nuvem) ---
  // O app continua funcionando na hora via localStorage; isso só mantém
  // uma cópia na nuvem em segundo plano, pra acessar de qualquer aparelho.
  const [syncStatus, setSyncStatus] = useState<"loading" | "synced" | "saving" | "error">("loading");
  const remoteLoaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const remote = await fetchAppState();
        if (remote) {
          if (remote.entradas)        setEntradas(remote.entradas);
          if (remote.gastosFixos)     setGastosFixos(remote.gastosFixos);
          if (remote.gastosVariaveis) setGastosVariaveis(remote.gastosVariaveis);
          if (remote.parcelamentos)   setParcelamentos(remote.parcelamentos);
          if (remote.categories)      setCategories(remote.categories);
          if (remote.investments)     setInvestments(remote.investments);
          if (remote.paymentMethods)  setPaymentMethods(remote.paymentMethods);
          if (remote.userName)        setUserName(remote.userName);
          if (remote.userPhoto)       setUserPhoto(remote.userPhoto);
          if (remote.currency)        setCurrency(remote.currency);
          if (remote.dateFormat)      setDateFormat(remote.dateFormat);
        }
        setSyncStatus("synced");
      } catch (err) {
        console.error("Erro ao carregar dados da nuvem, usando dados locais:", err);
        setSyncStatus("error");
      } finally {
        remoteLoaded.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!remoteLoaded.current) return; // evita sobrescrever a nuvem antes de terminar de carregar
    const timeout = setTimeout(() => {
      setSyncStatus("saving");
      saveAppState({
        entradas, gastosFixos, gastosVariaveis, parcelamentos,
        categories, investments, paymentMethods,
        userName, userPhoto, currency, dateFormat,
      })
        .then(() => setSyncStatus("synced"))
        .catch(err => {
          console.error("Erro ao salvar na nuvem (os dados continuam salvos localmente):", err);
          setSyncStatus("error");
        });
    }, 800); // espera 800ms sem mudanças antes de salvar, pra não disparar a cada tecla
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entradas, gastosFixos, gastosVariaveis, parcelamentos, categories, investments, paymentMethods, userName, userPhoto, currency, dateFormat]);

  // Toggle dark class on <html> so CSS variables and inline overrides share the same element
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else      document.documentElement.classList.remove("dark");
  }, [dark]);

  // Apply theme primary color (preset key OR raw "#hex") — inline style wins over .dark rules
  useEffect(() => {
    if (theme.startsWith("#")) {
      document.documentElement.style.setProperty("--primary", theme);
      document.documentElement.style.setProperty("--ring", theme + "99");
    } else {
      const t = themePresets[theme] || themePresets.blue;
      document.documentElement.style.setProperty("--primary", t.primary);
      document.documentElement.style.setProperty("--ring", t.ring);
    }
  }, [theme]);

  const nextId = (arr: { id: number }[]) =>
    arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;

  const handleSave = (data: TransactionData) => {
    if (data.type === "entrada") {
      setEntradas(prev => [...prev, {
        id: nextId(prev), name: data.title, value: data.value, date: data.date, status: "recebido"
      }]);
    } else if (data.type === "gasto-fixo") {
      setGastosFixos(prev => [...prev, {
        id: nextId(prev), name: data.title, dueDay: new Date(data.date + "T12:00:00").getDate(),
        category: data.category || "outros", paymentMethod: data.paymentMethod || "",
        value: data.value, paid: false
      }]);
    } else if (data.type === "gasto-mes") {
      setGastosVariaveis(prev => [...prev, {
        id: nextId(prev), name: data.title, date: data.date,
        category: data.category || "outros", paymentMethod: data.paymentMethod || "",
        value: data.value, paid: false
      }]);
    } else if (data.type === "parcelamento") {
      setParcelamentos(prev => [...prev, {
        id: nextId(prev), name: data.title, totalParcelas: data.installments || 2,
        parcelaAtual: 1, category: data.category || "outros",
        paymentMethod: data.paymentMethod || "", valorParcela: data.value / (data.installments || 2),
        paid: false
      }]);
    }
  };

  const openModal = (type: TransactionType) => { setModalType(type); setFabOpen(false); setModalOpen(true); };

  const handleImport = (result: ImportResult) => {
    if (result.entradas.length)
      setEntradas(prev => { let id = prev.length ? Math.max(...prev.map(x => x.id)) : 0; return [...prev, ...result.entradas.map(e => ({ ...e, id: ++id }))]; });
    if (result.gastosFixos.length)
      setGastosFixos(prev => { let id = prev.length ? Math.max(...prev.map(x => x.id)) : 0; return [...prev, ...result.gastosFixos.map(g => ({ ...g, id: ++id }))]; });
    if (result.gastosVariaveis.length)
      setGastosVariaveis(prev => { let id = prev.length ? Math.max(...prev.map(x => x.id)) : 0; return [...prev, ...result.gastosVariaveis.map(g => ({ ...g, id: ++id }))]; });
    if (result.parcelamentos.length)
      setParcelamentos(prev => { let id = prev.length ? Math.max(...prev.map(x => x.id)) : 0; return [...prev, ...result.parcelamentos.map(p => ({ ...p, id: ++id }))]; });
  };

  const handleEdit = (id: number, data: TransactionData) => {
    if (data.type === "entrada") {
      setEntradas(p => p.map(e => e.id === id ? { ...e, name: data.title, value: data.value, date: data.date } : e));
    } else if (data.type === "gasto-fixo") {
      setGastosFixos(p => p.map(g => g.id === id ? {
        ...g, name: data.title, value: data.value,
        category: data.category || g.category,
        paymentMethod: data.paymentMethod || g.paymentMethod,
        dueDay: data.dueDay ?? g.dueDay,
      } : g));
    } else if (data.type === "gasto-mes") {
      setGastosVariaveis(p => p.map(g => g.id === id ? {
        ...g, name: data.title, value: data.value, date: data.date,
        category: data.category || g.category,
        paymentMethod: data.paymentMethod || g.paymentMethod,
      } : g));
    } else if (data.type === "parcelamento") {
      setParcelamentos(p => p.map(p2 => p2.id === id ? {
        ...p2, name: data.title, valorParcela: data.value,
        totalParcelas: data.installments ?? p2.totalParcelas,
        parcelaAtual: data.currentInstallment ?? p2.parcelaAtual,
        category: data.category || p2.category,
        paymentMethod: data.paymentMethod || p2.paymentMethod,
      } : p2));
    }
    setEditingItem(null);
  };

  const openEditEntrada = (e: typeof entradas[0]) => setEditingItem({ id: e.id, type: "entrada", initial: { title: e.name, value: String(e.value), date: e.date } });
  const openEditFixo    = (g: typeof gastosFixos[0]) => setEditingItem({ id: g.id, type: "gasto-fixo", initial: { title: g.name, value: String(g.value), category: g.category, paymentMethod: g.paymentMethod, dueDay: String(g.dueDay) } });
  const openEditVariavel= (g: typeof gastosVariaveis[0]) => setEditingItem({ id: g.id, type: "gasto-mes", initial: { title: g.name, value: String(g.value), date: g.date, category: g.category, paymentMethod: g.paymentMethod } });
  const openEditParc    = (p: typeof parcelamentos[0]) => setEditingItem({ id: p.id, type: "parcelamento", initial: { title: p.name, value: String(p.valorParcela), installments: String(p.totalParcelas), currentInstallment: String(p.parcelaAtual), category: p.category, paymentMethod: p.paymentMethod } });

  const currentItem = navItems.find(n => n.id === page);

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <Dashboard entradas={entradas} gastosFixos={gastosFixos} gastosVariaveis={gastosVariaveis} parcelamentos={parcelamentos} categories={categories} />;
      case "monthly":      return <MonthlyView month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} entradas={entradas} gastosFixos={gastosFixos} gastosVariaveis={gastosVariaveis} parcelamentos={parcelamentos} categories={categories} paymentMethods={paymentMethods} onDeleteEntrada={id => setEntradas(p => p.filter(x => x.id !== id))} onDeleteFixo={id => setGastosFixos(p => p.filter(x => x.id !== id))} onDeleteVariavel={id => setGastosVariaveis(p => p.filter(x => x.id !== id))} onDeleteParcelamento={id => setParcelamentos(p => p.filter(x => x.id !== id))} onToggleFixo={id => setGastosFixos(p => p.map(x => x.id === id ? { ...x, paid: !x.paid } : x))} onToggleVariavel={id => setGastosVariaveis(p => p.map(x => x.id === id ? { ...x, paid: !x.paid } : x))} onToggleParcelamento={id => setParcelamentos(p => p.map(x => x.id === id ? { ...x, paid: !x.paid } : x))} onEditEntrada={openEditEntrada} onEditFixo={openEditFixo} onEditVariavel={openEditVariavel} onEditParcelamento={openEditParc} />;
      case "categories":   return <Categories categories={categories} entradas={entradas} gastosFixos={gastosFixos} gastosVariaveis={gastosVariaveis} parcelamentos={parcelamentos} onAdd={cat => setCategories(p => [...p, cat])} onDelete={id => setCategories(p => p.filter(c => c.id !== id))} onEdit={(id, upd) => setCategories(p => p.map(c => c.id === id ? { ...c, ...upd, bg: (upd.color || c.color) + "20" } : c))} />;
      case "installments": return <Installments parcelamentos={parcelamentos} categories={categories} paymentMethods={paymentMethods} onDelete={id => setParcelamentos(p => p.filter(x => x.id !== id))} onEdit={openEditParc} />;
      case "investments":  return <Investments investments={investments} onAdd={inv => setInvestments(p => [...p, { ...inv, id: nextId(p) }])} onDelete={id => setInvestments(p => p.filter(x => x.id !== id))} onEdit={(id, upd) => setInvestments(p => p.map(x => x.id === id ? { ...x, ...upd } : x))} />;
      case "annual":       return <AnnualComparison entradas={entradas} gastosFixos={gastosFixos} gastosVariaveis={gastosVariaveis} parcelamentos={parcelamentos} />;
      case "settings":     return <Settings theme={theme} onThemeChange={setTheme} paymentMethods={paymentMethods} onAddPM={pm => setPaymentMethods(p => [...p, pm])} onDeletePM={id => setPaymentMethods(p => p.filter(x => x.id !== id))} onEditPM={(id, pm) => setPaymentMethods(p => p.map(x => x.id === id ? { ...x, ...pm } : x))} categories={categories} onAddCategory={cat => setCategories(p => [...p, cat])} onDeleteCategory={id => setCategories(p => p.filter(c => c.id !== id))} onEditCategory={(id, upd) => setCategories(p => p.map(c => c.id === id ? { ...c, ...upd, bg: (upd.color || c.color) + "20" } : c))} userName={userName} onUserNameChange={setUserName} userPhoto={userPhoto} onUserPhotoChange={setUserPhoto} currency={currency} onCurrencyChange={setCurrency} dateFormat={dateFormat} onDateFormatChange={setDateFormat} onOpenImport={() => setImportOpen(true)} />;
    }
  };

  return (
    <div style={{ height: "100%" }}>
      <div className="flex h-full bg-[var(--background)] text-[var(--foreground)]">

        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col w-60 bg-[var(--card)] border-r border-[var(--border)] shrink-0">
          <div className="px-5 py-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center overflow-hidden shrink-0">
                {userPhoto ? <img src={userPhoto} alt="perfil" className="w-full h-full object-cover" /> : <User size={18} color="white" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[var(--card-foreground)] leading-tight truncate" style={{ fontFamily: "Outfit, sans-serif" }}>Controle Finanças</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{userName}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${page === item.id ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                {item.icon}{item.label}
              </button>
            ))}
          </nav>
          <div className="px-3 pb-4 border-t border-[var(--border)] pt-3">
            <button onClick={() => setDark(d => !d)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
              {dark ? "Modo claro" : "Modo escuro"}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile topbar */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center overflow-hidden shrink-0">
                {userPhoto ? <img src={userPhoto} alt="perfil" className="w-full h-full object-cover" /> : <User size={15} color="white" />}
              </div>
              <div>
                <p className="font-bold text-[var(--card-foreground)] leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Controle Finanças</p>
                <p className="text-xs text-[var(--muted-foreground)]">{userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDark(d => !d)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]">
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button onClick={() => setMobileMenuOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]">
                <Menu size={18} />
              </button>
            </div>
          </header>

          {/* Desktop page heading */}
          <div className="hidden md:flex items-center justify-between gap-2 px-6 py-4 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[var(--primary)]">{currentItem?.icon}</span>
              <h1 className="text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Outfit, sans-serif" }}>{currentItem?.label}</h1>
            </div>
            <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === "synced" ? "bg-[var(--positive)]" :
                syncStatus === "error" ? "bg-[var(--negative)]" : "bg-amber-400 animate-pulse"
              }`} />
              {syncStatus === "synced" && "Salvo na nuvem"}
              {syncStatus === "saving" && "Salvando..."}
              {syncStatus === "loading" && "Carregando..."}
              {syncStatus === "error" && "Sem conexão com a nuvem — salvo só neste aparelho"}
            </span>
          </div>

          <main className="flex-1 overflow-y-auto pb-24 md:pb-6">{renderPage()}</main>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--card)] flex flex-col">
              <div className="px-5 py-5 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center overflow-hidden shrink-0">
                    {userPhoto ? <img src={userPhoto} alt="perfil" className="w-full h-full object-cover" /> : <User size={18} color="white" />}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--card-foreground)]" style={{ fontFamily: "Outfit, sans-serif" }}>Controle Finanças</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{userName}</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                  <X size={16} className="text-[var(--muted-foreground)]" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${page === item.id ? "bg-[var(--primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
                    {item.icon}<span className="flex-1 text-left">{item.label}</span>
                    {page === item.id && <ChevronRight size={16} />}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Bottom nav mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--card)] border-t border-[var(--border)] px-2">
          <div className="flex items-center justify-around h-16">
            {bottomNav.map(id => {
              const item = navItems.find(n => n.id === id)!;
              const isActive = page === id;
              return (
                <button key={id} onClick={() => setPage(id)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                  <span className={isActive ? "scale-110" : ""}>{item.icon}</span>
                  <span className={`text-[10px] font-semibold ${isActive ? "opacity-100" : "opacity-60"}`}>{item.label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-[var(--primary)]" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* FAB */}
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
          {fabOpen && (
            <div className="flex flex-col items-end gap-2 mb-2">
              {([
                { label: "Entrada",      type: "entrada"      as TransactionType, color: "bg-[var(--positive)]" },
                { label: "Gasto Fixo",   type: "gasto-fixo"   as TransactionType, color: "bg-blue-500" },
                { label: "Gasto do Mês", type: "gasto-mes"    as TransactionType, color: "bg-orange-500" },
                { label: "Parcelamento", type: "parcelamento" as TransactionType, color: "bg-purple-600" },
              ] as const).map(opt => (
                <div key={opt.type} className="flex items-center gap-2">
                  <span className="bg-[var(--card)] text-[var(--card-foreground)] text-sm font-semibold px-3 py-1.5 rounded-xl shadow-md border border-[var(--border)]">{opt.label}</span>
                  <button onClick={() => openModal(opt.type)} className={`w-10 h-10 rounded-xl ${opt.color} flex items-center justify-center shadow-md hover:opacity-90 transition`}>
                    <Plus size={18} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setFabOpen(o => !o)}
            className={`w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg hover:opacity-90 transition-all ${fabOpen ? "rotate-45" : ""}`}
            style={{ boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent)" }}>
            <Plus size={26} color="white" strokeWidth={2.5} />
          </button>
        </div>

        <ImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          categories={categories}
          paymentMethods={paymentMethods}
          onImport={handleImport}
        />

        <AddTransactionModal
          open={modalOpen || editingItem !== null}
          initialType={editingItem ? editingItem.type : modalType}
          editId={editingItem?.id}
          editInitial={editingItem?.initial}
          paymentMethods={paymentMethods}
          categories={categories}
          onClose={() => { setModalOpen(false); setEditingItem(null); }}
          onSave={handleSave}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}
