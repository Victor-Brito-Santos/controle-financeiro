import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, Tag, CreditCard,
  Layers, TrendingUp, BarChart2, Settings as SettingsIcon,
  Plus, X, Moon, Sun, Menu, ChevronRight, User
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import MonthlyView from "./components/MonthlyView";
import Categories from "./components/Categories";
import PaymentMethods from "./components/PaymentMethods";
import Installments from "./components/Installments";
import Investments from "./components/Investments";
import AnnualComparison from "./components/AnnualComparison";
import Settings from "./components/Settings";
import AddTransactionModal, { TransactionType, TransactionData } from "./components/AddTransactionModal";

type Page = "dashboard" | "monthly" | "categories" | "payments" | "installments" | "investments" | "annual" | "settings";

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "monthly", label: "Mês Atual", icon: <CalendarDays size={20} /> },
  { id: "categories", label: "Categorias", icon: <Tag size={20} /> },
  { id: "payments", label: "Cartões", icon: <CreditCard size={20} /> },
  { id: "installments", label: "Parcelamentos", icon: <Layers size={20} /> },
  { id: "investments", label: "Investimentos", icon: <TrendingUp size={20} /> },
  { id: "annual", label: "Comparativo", icon: <BarChart2 size={20} /> },
  { id: "settings", label: "Configurações", icon: <SettingsIcon size={20} /> },
];

const bottomNav: Page[] = ["dashboard", "monthly", "categories", "investments", "settings"];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [dark, setDark] = useState(false);
  const [month, setMonth] = useState(8); // September
  const [year, setYear] = useState(2026);
  const [fabOpen, setFabOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("entrada");

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setFabOpen(false);
    setModalOpen(true);
  };

  const handleSave = (data: TransactionData) => {
    console.log("Novo lançamento:", data);
    // TODO: persist to state/store
  };

  const currentItem = navItems.find(n => n.id === page);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "monthly": return <MonthlyView month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />;
      case "categories": return <Categories />;
      case "payments": return <PaymentMethods />;
      case "installments": return <Installments />;
      case "investments": return <Investments />;
      case "annual": return <AnnualComparison />;
      case "settings": return <Settings />;
    }
  };

  return (
    <div className={dark ? "dark" : ""} style={{ height: "100%" }}>
      <div className="flex h-full bg-[var(--background)] text-[var(--foreground)]">

        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-60 bg-[var(--card)] border-r border-[var(--border)] shrink-0">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                <User size={18} color="white" />
              </div>
              <div>
                <p className="font-bold text-[var(--card-foreground)] leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Controle Finanças</p>
                <p className="text-xs text-[var(--muted-foreground)]">Controle Victor</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  page === item.id
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Bottom: theme toggle */}
          <div className="px-3 pb-4 border-t border-[var(--border)] pt-3">
            <button
              onClick={() => setDark(d => !d)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
              {dark ? "Modo claro" : "Modo escuro"}
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Mobile topbar */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <TrendingUp size={15} color="white" />
              </div>
              <p className="font-bold text-[var(--card-foreground)]" style={{ fontFamily: "Outfit, sans-serif" }}>FinançasPro</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark(d => !d)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <Menu size={18} />
              </button>
            </div>
          </header>

          {/* Desktop page heading */}
          <div className="hidden md:flex items-center gap-2 px-6 py-4 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
            <span className="text-[var(--primary)]">{currentItem?.icon}</span>
            <h1 className="text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Outfit, sans-serif" }}>{currentItem?.label}</h1>
          </div>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
            {renderPage()}
          </main>
        </div>

        {/* Mobile full-screen menu drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--card)] flex flex-col">
              <div className="px-5 py-5 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                    <TrendingUp size={18} color="white" />
                  </div>
                  <p className="font-bold text-[var(--card-foreground)]" style={{ fontFamily: "Outfit, sans-serif" }}>FinançasPro</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                  <X size={16} className="text-[var(--muted-foreground)]" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      page === item.id
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {page === item.id && <ChevronRight size={16} />}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--card)] border-t border-[var(--border)] px-2 pb-safe">
          <div className="flex items-center justify-around h-16">
            {bottomNav.map(id => {
              const item = navItems.find(n => n.id === id)!;
              const isActive = page === id;
              return (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                    isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  <span className={`transition-transform ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
                  <span className={`text-[10px] font-semibold ${isActive ? "opacity-100" : "opacity-60"}`}>{item.label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-[var(--primary)] mt-0.5" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* FAB */}
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
          {fabOpen && (
            <div className="flex flex-col items-end gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {([
                { label: "Entrada", type: "entrada" as TransactionType, color: "bg-[var(--positive)]" },
                { label: "Gasto Fixo", type: "gasto-fixo" as TransactionType, color: "bg-blue-500" },
                { label: "Gasto do Mês", type: "gasto-mes" as TransactionType, color: "bg-orange-500" },
                { label: "Parcelamento", type: "parcelamento" as TransactionType, color: "bg-purple-600" },
              ] as const).map(opt => (
                <div key={opt.type} className="flex items-center gap-2">
                  <span className="bg-[var(--card)] text-[var(--card-foreground)] text-sm font-semibold px-3 py-1.5 rounded-xl shadow-md border border-[var(--border)]">{opt.label}</span>
                  <button
                    onClick={() => openModal(opt.type)}
                    className={`w-10 h-10 rounded-xl ${opt.color} flex items-center justify-center shadow-md hover:opacity-90 transition`}
                  >
                    <Plus size={18} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setFabOpen(o => !o)}
            className={`w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg hover:opacity-90 transition-all ${fabOpen ? "rotate-45" : ""}`}
            style={{ boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}
          >
            <Plus size={26} color="white" strokeWidth={2.5} />
          </button>
        </div>

        <AddTransactionModal
          open={modalOpen}
          initialType={modalType}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
