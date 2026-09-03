export const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export type TransactionStatus = "recebido" | "pendente" | "pago" | "atrasado";

export interface Entrada {
  id: number; name: string; value: number; date: string; status: TransactionStatus;
}
export interface GastoFixo {
  id: number; name: string; dueDay: number; category: string; paymentMethod: string; value: number; paid: boolean;
}
export interface GastoVariavel {
  id: number; name: string; date: string; category: string; paymentMethod: string; value: number; paid: boolean;
}
export interface Parcelamento {
  id: number; name: string; totalParcelas: number; parcelaAtual: number; category: string; paymentMethod: string; valorParcela: number; paid: boolean;
}
export interface Category {
  id: string; name: string; color: string; bg: string;
}
export interface Investment {
  id: number; name: string; target: number; current: number; type: string; color: string;
}
export interface PaymentMethod {
  id: string; name: string; type: string; color: string; limit: number | null;
}

export const defaultCategories: Category[] = [
  { id: "alimentacao", name: "Alimentação", color: "#F97316", bg: "#FFF7ED" },
  { id: "transporte", name: "Transporte", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "compras", name: "Compras", color: "#EC4899", bg: "#FDF2F8" },
  { id: "contas", name: "Contas", color: "#EAB308", bg: "#FEFCE8" },
  { id: "saude", name: "Saúde", color: "#EF4444", bg: "#FEF2F2" },
  { id: "mercado", name: "Mercado", color: "#10B981", bg: "#ECFDF5" },
  { id: "assinaturas", name: "Assinaturas", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "lazer", name: "Lazer", color: "#06B6D4", bg: "#ECFEFF" },
  { id: "educacao", name: "Educação", color: "#6366F1", bg: "#EEF2FF" },
  { id: "outros", name: "Outros", color: "#6B7280", bg: "#F9FAFB" },
];

export const defaultPaymentMethods: PaymentMethod[] = [];

export const annualDataTemplate = [
  { month: "Jan" }, { month: "Fev" }, { month: "Mar" }, { month: "Abr" },
  { month: "Mai" }, { month: "Jun" }, { month: "Jul" }, { month: "Ago" },
  { month: "Set" }, { month: "Out" }, { month: "Nov" }, { month: "Dez" },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);

export const themePresets: Record<string, { label: string; primary: string; ring: string }> = {
  blue:   { label: "Azul",    primary: "#2563EB", ring: "#93C5FD" },
  violet: { label: "Roxo",    primary: "#7C3AED", ring: "#C4B5FD" },
  emerald:{ label: "Verde",   primary: "#059669", ring: "#6EE7B7" },
  rose:   { label: "Rosa",    primary: "#E11D48", ring: "#FDA4AF" },
  orange: { label: "Laranja", primary: "#EA580C", ring: "#FDBA74" },
  slate:  { label: "Cinza",   primary: "#475569", ring: "#CBD5E1" },
};
