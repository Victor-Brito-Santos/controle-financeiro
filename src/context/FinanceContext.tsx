import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Entrada {
  id: number;
  name: string;
  value: number;
  date: string;
  status: "recebido" | "pendente";
}

export interface GastoFixo {
  id: number;
  name: string;
  dueDay: number;
  category: string;
  paymentMethod: string;
  value: number;
  paid: boolean;
}

export interface GastoVariavel {
  id: number;
  name: string;
  date: string;
  category: string;
  paymentMethod: string;
  value: number;
  paid: boolean;
}

export interface Parcelamento {
  id: number;
  name: string;
  totalParcelas: number;
  parcelaAtual: number;
  category: string;
  paymentMethod: string;
  valorParcela: number;
  paid: boolean;
}

interface FinanceContextValue {
  loading: boolean;
  error: string | null;

  entradas: Entrada[];
  gastosFixes: GastoFixo[];
  gastosVariaveis: GastoVariavel[];
  parcelamentos: Parcelamento[];

  addEntrada: (data: Omit<Entrada, "id">) => Promise<void>;
  addGastoFixo: (data: Omit<GastoFixo, "id">) => Promise<void>;
  addGastoVariavel: (data: Omit<GastoVariavel, "id">) => Promise<void>;
  addParcelamento: (data: Omit<Parcelamento, "id">) => Promise<void>;

  removeEntrada: (id: number) => Promise<void>;
  removeGastoFixo: (id: number) => Promise<void>;
  removeGastoVariavel: (id: number) => Promise<void>;
  removeParcelamento: (id: number) => Promise<void>;

  toggleGastoFixoPago: (id: number) => Promise<void>;
  toggleGastoVariavelPago: (id: number) => Promise<void>;
  toggleParcelamentoPago: (id: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

// ---- Conversores: linha do banco (snake_case) <-> objeto do app (camelCase) ----

const rowToEntrada = (r: any): Entrada => ({
  id: r.id, name: r.name, value: Number(r.value), date: r.date, status: r.status,
});

const rowToGastoFixo = (r: any): GastoFixo => ({
  id: r.id, name: r.name, dueDay: r.due_day, category: r.category,
  paymentMethod: r.payment_method, value: Number(r.value), paid: r.paid,
});

const rowToGastoVariavel = (r: any): GastoVariavel => ({
  id: r.id, name: r.name, date: r.date, category: r.category,
  paymentMethod: r.payment_method, value: Number(r.value), paid: r.paid,
});

const rowToParcelamento = (r: any): Parcelamento => ({
  id: r.id, name: r.name, totalParcelas: r.total_parcelas, parcelaAtual: r.parcela_atual,
  category: r.category, paymentMethod: r.payment_method, valorParcela: Number(r.valor_parcela), paid: r.paid,
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [gastosFixes, setGastosFixes] = useState<GastoFixo[]>([]);
  const [gastosVariaveis, setGastosVariaveis] = useState<GastoVariavel[]>([]);
  const [parcelamentos, setParcelamentos] = useState<Parcelamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega tudo do Supabase quando o app abre
  useEffect(() => {
    (async () => {
      try {
        const [e, gf, gv, p] = await Promise.all([
          supabase.from("entradas").select("*").order("date", { ascending: false }),
          supabase.from("gastos_fixos").select("*").order("due_day", { ascending: true }),
          supabase.from("gastos_variaveis").select("*").order("date", { ascending: false }),
          supabase.from("parcelamentos").select("*").order("id", { ascending: true }),
        ]);
        if (e.error) throw e.error;
        if (gf.error) throw gf.error;
        if (gv.error) throw gv.error;
        if (p.error) throw p.error;

        setEntradas((e.data || []).map(rowToEntrada));
        setGastosFixes((gf.data || []).map(rowToGastoFixo));
        setGastosVariaveis((gv.data || []).map(rowToGastoVariavel));
        setParcelamentos((p.data || []).map(rowToParcelamento));
      } catch (err: any) {
        console.error("Erro ao carregar dados do Supabase:", err);
        setError(err.message || "Erro ao carregar dados do Supabase");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---- Entradas ----
  const addEntrada = async (data: Omit<Entrada, "id">) => {
    const { data: row, error } = await supabase
      .from("entradas")
      .insert({ name: data.name, value: data.value, date: data.date, status: data.status })
      .select().single();
    if (error) throw error;
    setEntradas(list => [rowToEntrada(row), ...list]);
  };

  const removeEntrada = async (id: number) => {
    const { error } = await supabase.from("entradas").delete().eq("id", id);
    if (error) throw error;
    setEntradas(list => list.filter(item => item.id !== id));
  };

  // ---- Gastos Fixos ----
  const addGastoFixo = async (data: Omit<GastoFixo, "id">) => {
    const { data: row, error } = await supabase
      .from("gastos_fixos")
      .insert({
        name: data.name, due_day: data.dueDay, category: data.category,
        payment_method: data.paymentMethod, value: data.value, paid: data.paid,
      })
      .select().single();
    if (error) throw error;
    setGastosFixes(list => [...list, rowToGastoFixo(row)]);
  };

  const removeGastoFixo = async (id: number) => {
    const { error } = await supabase.from("gastos_fixos").delete().eq("id", id);
    if (error) throw error;
    setGastosFixes(list => list.filter(item => item.id !== id));
  };

  const toggleGastoFixoPago = async (id: number) => {
    const current = gastosFixes.find(item => item.id === id);
    if (!current) return;
    const { error } = await supabase.from("gastos_fixos").update({ paid: !current.paid }).eq("id", id);
    if (error) throw error;
    setGastosFixes(list => list.map(item => item.id === id ? { ...item, paid: !item.paid } : item));
  };

  // ---- Gastos do Mês (variáveis) ----
  const addGastoVariavel = async (data: Omit<GastoVariavel, "id">) => {
    const { data: row, error } = await supabase
      .from("gastos_variaveis")
      .insert({
        name: data.name, date: data.date, category: data.category,
        payment_method: data.paymentMethod, value: data.value, paid: data.paid,
      })
      .select().single();
    if (error) throw error;
    setGastosVariaveis(list => [rowToGastoVariavel(row), ...list]);
  };

  const removeGastoVariavel = async (id: number) => {
    const { error } = await supabase.from("gastos_variaveis").delete().eq("id", id);
    if (error) throw error;
    setGastosVariaveis(list => list.filter(item => item.id !== id));
  };

  const toggleGastoVariavelPago = async (id: number) => {
    const current = gastosVariaveis.find(item => item.id === id);
    if (!current) return;
    const { error } = await supabase.from("gastos_variaveis").update({ paid: !current.paid }).eq("id", id);
    if (error) throw error;
    setGastosVariaveis(list => list.map(item => item.id === id ? { ...item, paid: !item.paid } : item));
  };

  // ---- Parcelamentos ----
  const addParcelamento = async (data: Omit<Parcelamento, "id">) => {
    const { data: row, error } = await supabase
      .from("parcelamentos")
      .insert({
        name: data.name, total_parcelas: data.totalParcelas, parcela_atual: data.parcelaAtual,
        category: data.category, payment_method: data.paymentMethod,
        valor_parcela: data.valorParcela, paid: data.paid,
      })
      .select().single();
    if (error) throw error;
    setParcelamentos(list => [...list, rowToParcelamento(row)]);
  };

  const removeParcelamento = async (id: number) => {
    const { error } = await supabase.from("parcelamentos").delete().eq("id", id);
    if (error) throw error;
    setParcelamentos(list => list.filter(item => item.id !== id));
  };

  const toggleParcelamentoPago = async (id: number) => {
    const current = parcelamentos.find(item => item.id === id);
    if (!current) return;
    const { error } = await supabase.from("parcelamentos").update({ paid: !current.paid }).eq("id", id);
    if (error) throw error;
    setParcelamentos(list => list.map(item => item.id === id ? { ...item, paid: !item.paid } : item));
  };

  return (
    <FinanceContext.Provider
      value={{
        loading, error,
        entradas, gastosFixes, gastosVariaveis, parcelamentos,
        addEntrada, addGastoFixo, addGastoVariavel, addParcelamento,
        removeEntrada, removeGastoFixo, removeGastoVariavel, removeParcelamento,
        toggleGastoFixoPago, toggleGastoVariavelPago, toggleParcelamentoPago,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance precisa ser usado dentro de um FinanceProvider");
  return ctx;
}
