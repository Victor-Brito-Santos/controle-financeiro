import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-db571421/health", (c) => {
  return c.json({ status: "ok" });
});

// Carrega o estado salvo do app (todas as listas, categorias, config etc.)
app.get("/make-server-db571421/state", async (c) => {
  try {
    const value = await kv.get("app-state");
    return c.json({ value: value ?? null });
  } catch (err) {
    console.log("Erro ao buscar app-state:", err);
    return c.json({ error: "Erro ao buscar dados salvos" }, 500);
  }
});

// Salva o estado completo do app (sobrescreve o anterior)
app.post("/make-server-db571421/state", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("app-state", body);
    return c.json({ ok: true });
  } catch (err) {
    console.log("Erro ao salvar app-state:", err);
    return c.json({ error: "Erro ao salvar dados" }, 500);
  }
});

Deno.serve(app.fetch);