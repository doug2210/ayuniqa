# Conectar Supabase existente (sbslimrugkzgnfacmlnm)

## Passo 1 — Você conecta o Supabase no editor (ação manual)

A conexão com um projeto Supabase **existente** não pode ser feita por mim via ferramenta — apenas você pode autorizar, pois envolve login na sua conta Supabase. O fluxo é:

1. No canto superior direito do editor Lovable, clique no botão verde **Supabase**.
2. Faça login na sua conta Supabase (a que é dona do projeto `sbslimrugkzgnfacmlnm`).
3. Selecione a organização e depois o projeto **sbslimrugkzgnfacmlnm**.
4. Confirme a conexão.

Após isso, o Lovable injeta automaticamente as variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) e cria os arquivos de integração (`src/integrations/supabase/client.ts`, `auth-middleware.ts`, `client.server.ts`).

## Passo 2 — Eu confirmo a conexão e preparo a base

Assim que você confirmar que conectou, eu:

- Verifico os secrets disponíveis (`VITE_SUPABASE_URL`, etc.) para garantir que a conexão está ativa.
- Confirmo o URL apontando para `sbslimrugkzgnfacmlnm.supabase.co`.
- Listo as tabelas existentes no schema `public` (se houver) para entender o estado atual do banco.
- Verifico se há usuários/auth já configurados.

## Passo 3 — Próximos passos (definir depois)

Com a conexão pronta, podemos avançar com qualquer um destes (me diga qual é a prioridade):

- **Autenticação** — login/cadastro para a Client Zone e o Admin (email/senha + Google, por exemplo).
- **Catálogo de jogos no banco** — migrar `src/lib/games-data.ts` (hoje estático) para uma tabela `games` editável pelo Admin.
- **Formulário de contato** — salvar mensagens em uma tabela `contact_messages`.
- **Painel Admin funcional** — CRUD de jogos, gestão de partners, leitura de mensagens.
- **Storage** — upload de capas de jogos e assets para parceiros (Client Zone).

## Detalhes técnicos

- Stack: TanStack Start (não usaremos Edge Functions para lógica interna — todo backend será via `createServerFn`).
- RLS será habilitado em todas as tabelas com policies escopadas a `auth.uid()`.
- Roles (admin/partner/user) ficarão em tabela separada `user_roles` + função `has_role()` security definer, conforme padrão de segurança.
- Service role key fica server-only (`client.server.ts`), nunca exposta ao browser.

---

**Sua ação agora:** clique no botão verde Supabase no topo do editor e conecte o projeto `sbslimrugkzgnfacmlnm`. Me avise quando estiver feito que eu valido e seguimos.