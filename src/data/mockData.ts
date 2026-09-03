export const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const categories = [
  { id: "alimentacao", name: "Alimentação", icon: "UtensilsCrossed", color: "#F97316", bg: "#FFF7ED" },
  { id: "transporte", name: "Transporte", icon: "Car", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "compras", name: "Compras", icon: "ShoppingBag", color: "#EC4899", bg: "#FDF2F8" },
  { id: "contas", name: "Contas", icon: "Zap", color: "#EAB308", bg: "#FEFCE8" },
  { id: "saude", name: "Saúde", icon: "Heart", color: "#EF4444", bg: "#FEF2F2" },
  { id: "mercado", name: "Mercado", icon: "ShoppingCart", color: "#10B981", bg: "#ECFDF5" },
  { id: "assinaturas", name: "Assinaturas", icon: "Tv", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "lazer", name: "Lazer", icon: "Gamepad2", color: "#06B6D4", bg: "#ECFEFF" },
  { id: "educacao", name: "Educação", icon: "BookOpen", color: "#6366F1", bg: "#EEF2FF" },
  { id: "outros", name: "Outros", icon: "MoreHorizontal", color: "#6B7280", bg: "#F9FAFB" },
];

export const paymentMethods = [
  { id: "nubank", name: "Nubank", type: "Crédito", color: "#820AD1", limit: 5000 },
  { id: "next", name: "Next", type: "Crédito", color: "#00C880", limit: 3000 },
  { id: "pix", name: "Pix", type: "Pix/Débito", color: "#32BCAD", limit: null },
  { id: "99pay", name: "99Pay", type: "Carteira Digital", color: "#F5C518", limit: null },
  { id: "dinheiro", name: "Dinheiro", type: "Espécie", color: "#6B7280", limit: null },
];

export const entradas = [
  { id: 1, name: "Salário", value: 5800, date: "2026-09-05", status: "recebido" },
  { id: 2, name: "Freelance - Site Loja", value: 1200, date: "2026-09-12", status: "recebido" },
  { id: 3, name: "Reembolso plano de saúde", value: 180, date: "2026-09-18", status: "pendente" },
];

export const gastosFixes = [
  { id: 1, name: "Aluguel", dueDay: 5, category: "contas", paymentMethod: "pix", value: 1450, paid: true },
  { id: 2, name: "Internet", dueDay: 10, category: "contas", paymentMethod: "nubank", value: 99.90, paid: true },
  { id: 3, name: "Academia", dueDay: 1, category: "saude", paymentMethod: "nubank", value: 89.90, paid: true },
  { id: 4, name: "Spotify", dueDay: 15, category: "assinaturas", paymentMethod: "nubank", value: 21.90, paid: false },
  { id: 5, name: "Netflix", dueDay: 20, category: "assinaturas", paymentMethod: "nubank", value: 39.90, paid: false },
  { id: 6, name: "Energia elétrica", dueDay: 8, category: "contas", paymentMethod: "pix", value: 187, paid: true },
  { id: 7, name: "Água", dueDay: 12, category: "contas", paymentMethod: "pix", value: 54.80, paid: true },
];

export const gastosVariaveis = [
  { id: 1, name: "Supermercado Pão de Açúcar", date: "2026-09-02", category: "mercado", paymentMethod: "nubank", value: 312.40, paid: true },
  { id: 2, name: "Posto Ipiranga - gasolina", date: "2026-09-04", category: "transporte", paymentMethod: "pix", value: 150, paid: true },
  { id: 3, name: "Farmácia São João", date: "2026-09-06", category: "saude", paymentMethod: "pix", value: 87.30, paid: true },
  { id: 4, name: "iFood - Jantar", date: "2026-09-08", category: "alimentacao", paymentMethod: "99pay", value: 64.90, paid: true },
  { id: 5, name: "Reserva Natural - roupas", date: "2026-09-10", category: "compras", paymentMethod: "next", value: 189.90, paid: true },
  { id: 6, name: "Cinema Cinemark", date: "2026-09-14", category: "lazer", paymentMethod: "nubank", value: 52, paid: false },
  { id: 7, name: "Mercado Municipal", date: "2026-09-15", category: "mercado", paymentMethod: "dinheiro", value: 95.50, paid: true },
  { id: 8, name: "Uber - viagens", date: "2026-09-16", category: "transporte", paymentMethod: "99pay", value: 78.20, paid: false },
  { id: 9, name: "Restaurante Don Curras", date: "2026-09-19", category: "alimentacao", paymentMethod: "nubank", value: 143, paid: false },
  { id: 10, name: "Alura - curso JavaScript", date: "2026-09-22", category: "educacao", paymentMethod: "nubank", value: 79.90, paid: false },
];

export const parcelamentos = [
  { id: 1, name: "MacBook Air M3", totalParcelas: 12, parcelaAtual: 4, category: "compras", paymentMethod: "nubank", valorParcela: 624.17, paid: true },
  { id: 2, name: "Geladeira Brastemp 500L", totalParcelas: 10, parcelaAtual: 7, category: "compras", paymentMethod: "next", valorParcela: 198.90, paid: true },
  { id: 3, name: "Nike Air Max 2026", totalParcelas: 6, parcelaAtual: 3, category: "compras", paymentMethod: "nubank", valorParcela: 189.83, paid: false },
  { id: 4, name: "Curso Inglês Wizard", totalParcelas: 12, parcelaAtual: 1, category: "educacao", paymentMethod: "nubank", valorParcela: 299, paid: false },
  { id: 5, name: "Smart TV LG 55\"", totalParcelas: 8, parcelaAtual: 8, category: "compras", paymentMethod: "next", valorParcela: 187.50, paid: true },
  { id: 6, name: "Notebook Dell Inspiron", totalParcelas: 10, parcelaAtual: 2, category: "compras", paymentMethod: "nubank", valorParcela: 387.40, paid: false },
];

export const investments = [
  { id: 1, name: "Reserva de Emergência", target: 30000, current: 18500, type: "Poupança Nubank", color: "#2563EB" },
  { id: 2, name: "Viagem Europa 2027", target: 15000, current: 4200, type: "CDB Inter", color: "#8B5CF6" },
  { id: 3, name: "Entrada Apartamento", target: 80000, current: 12800, type: "Tesouro Direto", color: "#10B981" },
];

export const investmentHistory = [
  { month: "Mar", value: 31200 },
  { month: "Abr", value: 33500 },
  { month: "Mai", value: 34100 },
  { month: "Jun", value: 35500 },
  { month: "Jul", value: 34900 },
  { month: "Ago", value: 35500 },
  { month: "Set", value: 35500 },
];

export const annualData = [
  { month: "Jan", entradas: 5800, saidas: 4200, saldo: 1600 },
  { month: "Fev", entradas: 6100, saidas: 5100, saldo: 1000 },
  { month: "Mar", entradas: 5800, saidas: 3900, saldo: 1900 },
  { month: "Abr", entradas: 7200, saidas: 4800, saldo: 2400 },
  { month: "Mai", entradas: 5800, saidas: 5500, saldo: 300 },
  { month: "Jun", entradas: 5800, saidas: 4100, saldo: 1700 },
  { month: "Jul", entradas: 6500, saidas: 4600, saldo: 1900 },
  { month: "Ago", entradas: 5800, saidas: 4300, saldo: 1500 },
  { month: "Set", entradas: 7000, saidas: 4200, saldo: 2800 },
  { month: "Out", entradas: 0, saidas: 0, saldo: 0 },
  { month: "Nov", entradas: 0, saidas: 0, saldo: 0 },
  { month: "Dez", entradas: 0, saidas: 0, saldo: 0 },
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};
