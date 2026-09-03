Crie o design de um web app de controle financeiro pessoal, moderno, limpo e fácil de usar no dia a dia (uso pessoal, não é para empresa). O app substitui uma planilha do Google Sheets que hoje é organizada em abas por mês. A ideia é transformar essas "abas" em telas/seções de navegação dentro do app, mantendo o raciocínio de organização mensal, mas com uma experiência muito mais visual e rápida de usar no celular e no desktop.

### Estrutura de navegação
Menu lateral (desktop) / bottom navigation ou menu hambúrguer (mobile) com:
1. Dashboard (visão geral)
2. Mês atual (com seletor de mês/ano no topo, tipo um dropdown ou setas ← Setembro 2026 →)
3. Categorias
4. Cartões e Formas de Pagamento
5. Parcelamentos
6. Investimentos e Metas
7. Comparativo Anual
8. Configurações (perfil, categorias, cartões)

### Tela 1 — Dashboard (visão geral)
- Cards de resumo no topo: Saldo do mês, Total de Entradas, Total de Saídas, Total em Parcelamentos em aberto
- Indicador visual de saldo positivo/negativo (cor verde/vermelho)
- Gráfico de rosca (donut) "Gastos por Categoria" do mês atual
- Gráfico de rosca "Gastos Fixos vs Parcelamentos vs Gastos do Mês"
- Lista rápida dos últimos lançamentos (entradas e saídas), com ícone da categoria, nome, valor e status (pago/pendente)
- Botão flutuante "+" para adicionar novo lançamento rapidamente (entrada, gasto fixo, gasto do mês ou parcelamento)

### Tela 2 — Visão Mensal (equivalente à aba de cada mês na planilha)
Organizar em sub-abas ou seções expansíveis dentro da mesma tela:
- **Entradas**: tabela/lista com nome, valor, data — botão de adicionar entrada
- **Gastos Fixos do Mês**: nome, dia de vencimento, tipo, categoria, valor, checkbox de "pago"
- **Gastos do Mês (variáveis)**: nome, tipo (cartão/pix/dinheiro), categoria, valor, checkbox de "pago"
- **Parcelamentos**: nome da compra, número da parcela (ex: 03/06), tipo/cartão, categoria, valor, checkbox de "pago"
- Cada seção deve ter um total ao final (total gasto, total pago, total pendente)
- Todas as linhas editáveis inline (clique para editar, sem precisar abrir modal para tudo)

### Tela 3 — Categorias
- Grid de categorias com ícone + cor (Alimentação, Transporte, Compras, Contas, Saúde, Mercado, Assinaturas, Outros etc.)
- Cada categoria mostra o total gasto no mês atual
- Botão para criar nova categoria (escolher ícone e cor)

### Tela 4 — Cartões e Formas de Pagamento
- Cards visuais representando cada cartão/forma de pagamento (ex: Pix, Cartão Next, Cartão de crédito X, 99Pay)
- Total gasto por forma de pagamento no mês
- Gráfico de barras comparando formas de pagamento

### Tela 5 — Parcelamentos
- Lista de todas as compras parceladas, mostrando progresso (ex: parcela 3 de 6, barra de progresso)
- Total ainda restante a pagar em parcelamentos
- Filtro por cartão/categoria

### Tela 6 — Investimentos e Metas
- Cards de metas (ex: "Reserva de emergência") com barra de progresso (valor guardado / meta)
- Lista de "onde guardei" (ex: poupança, CDB, corretora) com valor alocado
- Gráfico simples mostrando evolução dos investimentos

### Tela 7 — Comparativo Anual
- Gráfico de linha ou barras comparando entradas x saídas mês a mês ao longo do ano
- Tabela resumo por mês (saldo final de cada mês)
- Indicadores de melhor e pior mês

### Tela 8 — Configurações
- Dados do perfil
- Gerenciar categorias, cartões e formas de pagamento
- Preferências (moeda, formato de data)

### Estilo visual
- Design limpo, tipo fintech pessoal, com cara de produto premium (referências de estilo: dashboards financeiros modernos, com cards flutuantes, gráficos suaves e boa hierarquia visual — pense em algo entre um app bancário digital e uma ferramenta de gestão financeira pessoal)
- **Paleta de cores**: base em Azul, Preto e Branco.
  - Branco/cinza muito claro como fundo principal (modo claro), preto/cinza muito escuro como fundo no modo escuro
  - Azul como cor primária de marca — usado em botões principais, links, elementos ativos do menu, destaques de gráficos e no ícone/logo do app
  - Preto usado em textos de maior peso, títulos grandes e em alguns cards de destaque (ex: card de saldo total ou card de cartão, em estilo "premium" preto fosco)
  - **Verde** reservado como cor semântica de status positivo: saldo positivo, entradas, item marcado como "pago", confirmações
  - **Vermelho** reservado como cor semântica de status negativo/ação destrutiva: saldo negativo, gastos/saídas, botão de excluir, item "pendente/atrasado"
  - Essas cores semânticas (verde/vermelho) não competem com o azul da marca — usar tons suaves (ex: fundo verde/vermelho bem clarinho com texto na cor mais saturada) para não parecer "alerta" demais
- **Formato**: visual bem arredondado — cantos com raio generoso em cards, botões, inputs e badges (nada de cantos retos ou quase retos); ícones também em estilo mais "soft"/arredondado
- Cards com sombra leve e sutil, bastante espaço em branco, sensação "flutuante" (cards um pouco elevados sobre o fundo)
- Tipografia moderna, sem serifa, números com peso mais forte (semibold/bold) para destacar valores em destaque (ex: saldo)
- Ícones consistentes, estilo outline arredondado (bibliotecas como Lucide ou Phosphor funcionam bem), um ícone por categoria de gasto
- Suporte a modo claro e escuro
- Totalmente responsivo (mobile first, já que o uso principal deve ser no celular), mas com boa versão desktop também

### Componentes principais a desenhar
- Card de resumo (saldo/entradas/saídas)
- Gráfico de rosca (donut chart)
- Gráfico de linha/barras (comparativo)
- Linha de lançamento (ícone categoria + nome + valor + status pago/pendente)
- Badge de status (Pago / Pendente / Atrasado)
- Barra de progresso (metas e parcelamentos)
- Modal/drawer de "Adicionar lançamento" com campos: tipo (entrada/gasto fixo/gasto do mês/parcelamento), nome, categoria, forma de pagamento, valor, data, parcelas (se aplicável)
- Seletor de mês/ano no topo da Visão Mensal