## Objetivo
Conectar o projeto atual ao GitHub para sincronização de código e deploy.

## Contexto Atual
- O projeto já possui repositório Git local (`.git` existe).
- Ainda não está conectado ao GitHub remoto.

## Passos

### 1. Conectar ao GitHub via Lovable
- No editor Lovable, abrir o menu **Plus (+)** no input do chat.
- Selecionar **GitHub → Connect project**.
- Autorizar o app Lovable no GitHub.
- Escolher conta/organização e criar o repositório.

### 2. Sincronização automática
- Após conectar, o Lovable sincroniza automaticamente em tempo real.
- Alterações no Lovable push para o GitHub.
- Alterações no GitHub (local ou via PR) sync de volta para o Lovable.

### 3. Deploy (opcional)
- Se o objetivo for hospedar o site via GitHub Pages ou outra plataforma (Vercel, Netlify, etc.), configurar o workflow de CI/CD no repositório GitHub.
- O código gerado é padrão (TanStack Start + Vite) e pode ser deployado em qualquer serviço que suporte Node.js/Edge.

## Pré-requisitos
- Conta GitHub ativa.
- Acesso ao menu de compartilhamento do Lovable (Workspace pago para algumas features avançadas, mas conexão GitHub geralmente está disponível).

## Resultado Esperado
- Repositório GitHub criado e sincronizado com o projeto.
- Código disponível para clone, pull requests e deploy externo.