# LAÇO — Plataforma de Convites Digitais Personalizados & Gestão de Eventos

Uma solução web refinada e responsiva para criação de identidades visuais exclusivas de convites e gestão completa de celebrações (Casamentos, Bodas, Aniversários Infantis/Adultos, Chás de Bebê, Batizados e Formaturas).

---

## 🌟 Funcionalidades Entregues no MVP

1. **Painel Inicial (Dashboard):**
   - Métricas em tempo real: eventos ativos, total de convidados, confirmações RSVP, orçamento total e realizado.
   - Listagem com filtros por categoria (Casamentos, Infantis, Bodas, etc.) e status (ativos ou arquivados).
   - Busca instantânea por título, anfitrião ou localidade.
   - Ações rápidas: copiar link público, visualizar convite, editar e arquivar.

2. **Cadastro & Editor de Convites Autorais:**
   - Formulário com dados essenciais: título, anfitriões, data/horário, local, link Google Maps, textos afetivos, traje e avisos.
   - **Identidade Visual Personalizável:**
     - Presets temáticos: *Editorial & Botânico*, *Lúdico & Aconchegante*, *Clássico & Minimalista*, *Romântico & Floral*.
     - Paleta de cores flexível (Vinho Queimado, Areia, Verde-Oliva, Rosa Antigo, Dourado).
     - Selo / Monograma personalizado para o casal ou homenageado.
   - **Prévia ao Vivo:** alternância instantânea entre simulador mobile (smartphone) e desktop.

3. **Convite Digital Interativo (Página Pública):**
   - Endereço exclusivo via slug (ex: `#invite=casamento-clara-e-lucas`).
   - Contagem regressiva dinâmica para o grande dia.
   - Integração com Google Maps para traçar rota.
   - **Confirmação de Presença (RSVP):**
     - Seleção de comparecimento (Sim / Não comparecerá).
     - Quantidade de adultos e crianças acompanhantes.
     - Registro de restrições alimentares e recados com efeito de confetes celebratórios.
     - Proteção contra confirmações duplicadas.
     - Compartilhamento no WhatsApp e cópia de link.

4. **Gerenciamento de Convidados:**
   - Lista completa com status visual (*Confirmado*, *Pendente*, *Recusado*).
   - Contadores automáticos de adultos e crianças.
   - Importação e Exportação em formato **CSV**.
   - Cadastro e edição individual com validações.

5. **Calculadora Inteligente de Alimentos & Bebidas:**
   - Dimensionamento baseado na quantidade de convidados confirmados.
   - Fórmulas transparentes com cotas ajustáveis por pessoa para salgados, doces, bolo, refrigerantes, água, sucos e bebidas alcoólicas.
   - Sugestão de arredondamento em fardos/caixas de compra.
   - **Botão de envio direto para a Lista de Compras.**

6. **Lista de Compras:**
   - Itens organizados por categorias (*Alimentos, Bebidas, Descartáveis, Decoração, Lembranças*).
   - Acompanhamento de quantidades necessárias vs. já compradas.
   - Comparativo de preço estimado vs. preço real pago.
   - Exportação em CSV.

7. **Controle Orçamentário (Budget):**
   - Definição de teto orçamentário com barra de progresso visual.
   - Lançamento de despesas por fornecedor/categoria e status (*Pago*, *Pendente*, *Planejado*).
   - Alerta visual caso o teto seja ultrapassado.
   - Exportação em CSV.

8. **Ficha Executiva & Impressão:**
   - Resumo completo para impressão (ou salvar em PDF) com ficha do evento, convidados confirmados e despesas.

9. **Banco de Dados & Segurança (Supabase + RLS):**
   - Arquivo [`supabase_schema.sql`](supabase_schema.sql) com tabelas relacionais e regras de **Row Level Security (RLS)** que protegem a privacidade e os telefones dos convidados, em conformidade com as boas práticas da LGPD.
   - Configuração de deploy contínuo pronta para o Netlify ([`netlify.toml`](netlify.toml)).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v20+)
- npm

### Passos
```bash
# 1. Instalar dependências (já instaladas neste ambiente)
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev

# 3. Compilar para produção
npm run build
```

---

## 🎨 Tipografia e Paleta de Cores
- **Títulos:** *DM Serif Display*
- **Textos:** *DM Sans*
- **Cores Oficiais:**
  - Marfim (`#FAF7F2`)
  - Vinho Queimado (`#722F37`)
  - Areia (`#EFE9DF`)
  - Verde-Oliva (`#4E6037`)
  - Rosa Antigo (`#D8A49B`)
  - Dourado suave (`#C69F54`)
