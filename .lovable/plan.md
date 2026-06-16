## Objetivo

Sim, dá para editar os elementos do Hero individualmente. Hoje só o bloco "Textos do Hero" e os "Símbolos das laterais" são editáveis. Vou dividir o Hero em sub-abas e abrir controle fino do **HeroStage** (o quadro animado que reage ao mouse).

## Nova organização da aba "Hero" do admin

Sub-abas dentro de Hero:

1. **Textos** — o editor atual (badge, título, subtítulo, CTAs).
2. **Stats** — os três números (Slot titles / Markets / Uptime): número, sufixo, decimais, label e on/off por item.
3. **Badge inferior** — texto e on/off de "Studio of the year nominee".
4. **Palco central (HeroStage)** — novo (ver abaixo).
5. **Símbolos das laterais** — fica como aba separada de primeiro nível (já existe).

## Palco central (HeroStage) — novo editor

### Miolo central (substitui os reels animados)

Hoje o miolo é o slot animado. Vou trocar por um slot do tipo "personagem", com 3 opções de fonte:

- **Imagem custom** (upload PNG/SVG/JPG ou URL) — recomendada para o personagem.
- **Reels animados** (comportamento atual, mantido como fallback).
- **Nenhum** (só o halo + ícones flutuantes).

Campos adicionais quando "Imagem custom":
- `characterImageUrl` — upload/URL.
- `characterScale` (50–120%) e `characterOffsetY` (-20% a +20%) para encaixar bem.
- `characterShadow` on/off (mantém o glow atrás).
- `parallaxStrength` (0–1) para controlar o quanto o personagem se move com o mouse.

> A flag `heroImageUrl` que já existe passa a alimentar `characterImageUrl` automaticamente (migração silenciosa no `mergeConfig`) e some do editor de Textos para evitar duplicidade.

### Ícones flutuantes ao redor do personagem

Editor de lista (igual ao dos símbolos laterais), com Add/Remove/Reset para os 8 ícones atuais. Cada item tem:

- **Tipo**: `lucide` (escolher um nome — Crown, Diamond, Star, Cherry, Gem, Coins, Sparkles, Zap, …), `emoji` (texto livre) ou `image` (upload PNG/SVG).
- **Posição** `x` / `y` em % (0–100) — sliders com preview ao vivo.
- **Tamanho** (20–120 px).
- **Tint** (orange / yellow / light / grey) ou cor custom (hex).
- **Profundidade do parallax** (0–1).
- **Delay** e **duração** da animação `floaty`.

Botão "Reset palco" volta tudo aos 8 ícones default.

### Badges decorativos do palco

- "Mega Win" e "HTML5": texto editável + on/off + lado (esquerda/direita) cada.

## Detalhes técnicos

- `src/lib/site-config.ts`
  - `HeroConfig` ganha `stats: StatItem[]`, `award: { enabled; label }`, `stage: HeroStageConfig`.
  - `HeroStageConfig = { mode: 'character' | 'reels' | 'none'; character?: { imageUrl; scale; offsetY; shadow; parallax }; symbols: HeroStageSymbol[]; badges: { megaWin: {enabled,label,side}; html5: {enabled,label,side} } }`.
  - `HeroStageSymbol = { kind: 'lucide'|'emoji'|'image'; icon?: string; emoji?: string; imageUrl?: string|null; x; y; size; tint; color?; depth; delay; duration }`.
  - `DEFAULT_HERO_STAGE` espelha os 8 símbolos e os 2 badges atuais.
  - `mergeConfig` faz migração: se houver `hero.heroImageUrl` salvo, copia para `hero.stage.character.imageUrl` e troca `mode` para `character`.

- `src/components/site/HeroStage.tsx`
  - Recebe `config` (vem do `useSiteConfig`).
  - Substitui o array `SYMBOLS` por `config.stage.symbols` mapeado com um `iconMap` de Lucide.
  - Quando `mode === 'character'` renderiza `<img>` central com scale/offset/parallax; quando `'reels'` mantém o código atual; quando `'none'` esconde o miolo.
  - Badges "Mega Win" / "HTML5" leem do config (texto, on/off, lado).

- `src/routes/index.tsx`
  - Stats deixam de ser hardcoded e iteram sobre `h.stats`.
  - O `Trophy` badge passa por `h.award.enabled` e `h.award.label`.
  - Remove o branch `h.heroImageUrl ? <img/> : <HeroStage/>` (a imagem agora é só o miolo).

- `src/components/admin/AdminPanel.tsx`
  - Aba "Hero" vira `Tabs` internos: Textos / Stats / Badge / Palco.
  - Novos componentes: `HeroStatsEditor`, `HeroAwardEditor`, `HeroStageEditor` (com `CharacterEditor`, `StageSymbolsEditor`, `StageBadgesEditor`).
  - Reaproveita `ImageField`, `NumberField` e `Slider` existentes.
  - Para escolher ícone Lucide, um `<Select>` simples com a lista permitida (não importa o pacote inteiro).

## Fora do escopo

- Não vou tornar as cores/animações dos particles e do halo conic editáveis (mantém visual coeso).
- Strips dos reels antigos continuam fixos — só importam quando você escolher `mode: 'reels'`.
- Sem mudanças no resto do site (Strengths, Featured games, Services, CTA).
