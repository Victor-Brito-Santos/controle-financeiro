import { User, Bell, Palette, Globe, CreditCard, Tag, ChevronRight } from "lucide-react";
import { categories, paymentMethods } from "../data/mockData";

export default function Settings() {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Configurações</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Personalize o seu app financeiro</p>
      </div>

      {/* Profile */}
      <Section title="Perfil">
        <div className="flex items-center gap-4 p-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white text-xl font-bold">
            MF
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--card-foreground)]">Marcos Ferreira</p>
            <p className="text-sm text-[var(--muted-foreground)]">marcos@email.com</p>
          </div>
          <button className="text-xs font-semibold text-[var(--primary)] bg-[var(--accent)] px-3 py-1.5 rounded-lg hover:opacity-80 transition">
            Editar
          </button>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferências">
        <SettingRow icon={<Globe size={16} />} label="Moeda" value="R$ (BRL)" />
        <SettingRow icon={<Globe size={16} />} label="Formato de data" value="DD/MM/AAAA" />
        <SettingRow icon={<Bell size={16} />} label="Notificações" value="Ativadas" />
        <SettingRow icon={<Palette size={16} />} label="Tema" value="Sistema (claro/escuro)" last />
      </Section>

      {/* Categories */}
      <Section title="Categorias">
        <div className="grid grid-cols-2 gap-2 p-3">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--muted)]/50 transition cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: cat.bg, color: cat.color }}>
                {cat.name[0]}
              </div>
              <span className="text-sm font-medium text-[var(--card-foreground)] truncate">{cat.name}</span>
            </div>
          ))}
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm text-[var(--primary)] font-semibold hover:bg-[var(--accent)] transition border-t border-[var(--border)]">
          <Tag size={15} /> Adicionar categoria
        </button>
      </Section>

      {/* Payment Methods */}
      <Section title="Cartões e Formas de Pagamento">
        <div className="divide-y divide-[var(--border)]">
          {paymentMethods.map(pm => (
            <div key={pm.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)]/30 transition cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: pm.color }}>
                {pm.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--card-foreground)]">{pm.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{pm.type}</p>
              </div>
              <ChevronRight size={16} className="text-[var(--muted-foreground)]" />
            </div>
          ))}
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm text-[var(--primary)] font-semibold hover:bg-[var(--accent)] transition border-t border-[var(--border)]">
          <CreditCard size={15} /> Adicionar forma de pagamento
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h3 className="font-semibold text-sm text-[var(--muted-foreground)] uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)]/30 transition cursor-pointer ${!last ? "border-b border-[var(--border)]" : ""}`}>
      <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
        {icon}
      </div>
      <p className="flex-1 text-sm font-medium text-[var(--card-foreground)]">{label}</p>
      <p className="text-sm text-[var(--muted-foreground)]">{value}</p>
      <ChevronRight size={16} className="text-[var(--muted-foreground)]" />
    </div>
  );
}
