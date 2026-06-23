# Astronauta interativo no header

## O que muda

Substituir a imagem do logo atual (`ayuniqa-logo.png`) no `Header.tsx` por uma ilustração de astronauta no mesmo estilo da referência enviada (sticker holográfico, com aberração cromática vermelho/ciano, traços marcados).

## Como será feito

### 1. Gerar a arte do astronauta
- Usar `imagegen` (premium) para criar um astronauta em pose flutuando, estilo sticker/illustration com efeito de aberração cromática vermelho-ciano igual à referência, sobre fundo transparente (PNG).
- Salvar como `src/assets/astronaut.png` e registrar como asset via `lovable-assets` para servir pelo CDN.
- Em seguida, gerar uma **segunda imagem** com apenas a **viseira/capacete** isolada (mesmo estilo, mesma escala, fundo transparente), para que ela possa ser sobreposta e rotacionada independentemente sobre o corpo.

> Alternativa: se isolar o capacete via imagegen ficar incoerente, faço o capacete como uma camada CSS — um círculo escuro com gradiente "espelhado" + estrelinhas — posicionado por cima do corpo. Decido durante a implementação com base no resultado da geração.

### 2. Novo componente `AstronautMascot.tsx`
Componente cliente em `src/components/site/AstronautMascot.tsx`:
- Wrapper `relative` com tamanho responsivo (≈ `h-10 sm:h-12`).
- Camada base: corpo do astronauta.
- Camada sobreposta: capacete, posicionado absolutamente sobre a cabeça, com `transform: rotate(Xdeg)` controlado por estado.
- Listener global `mousemove` (com `requestAnimationFrame` para throttle) calcula o ângulo entre o centro do capacete e o cursor → aplica rotação limitada (ex.: ±18°) para parecer natural, não uma "hélice".
- Cleanup do listener no unmount.
- Sem rotação em telas `prefers-reduced-motion` (acessibilidade) — fica estático.

### 3. Efeito de luz laranja
- Glow laranja pulsante atrás do astronauta usando `box-shadow`/`radial-gradient` com a cor `--primary` (laranja do projeto) — `blur-2xl opacity-60 animate-pulse`.
- Leve `drop-shadow` laranja no `img` para dar o brilho holográfico.
- Hover: intensifica o glow e aplica um pequeno `scale(1.05)`.

### 4. Integração no `Header.tsx`
- Trocar `<img src={logoAsset.url} ... />` por `<AstronautMascot />` dentro do mesmo `<Link to="/">`.
- Manter o texto "Ayuniqa" ao lado (ou apenas o astronauta — manter só o astronauta, fica mais limpo, como está hoje).
- Remover o import de `logoAsset` se não for mais usado.

## Arquivos afetados

- **Novo:** `src/assets/astronaut.png` (+ `astronaut.png.asset.json`)
- **Novo (opcional):** `src/assets/astronaut-helmet.png` (+ asset json)
- **Novo:** `src/components/site/AstronautMascot.tsx`
- **Editado:** `src/components/site/Header.tsx`

## Detalhes técnicos

- Cálculo do ângulo: `Math.atan2(mouseY - centerY, mouseX - centerX) * 180/Math.PI`, depois clamp em `[-18, 18]` graus em relação à orientação neutra.
- A rotação é aplicada apenas ao capacete; o corpo permanece estático para evitar parecer um boneco quebrando o pescoço.
- Performance: um único listener global no `window`, atualização via `requestAnimationFrame`, sem re-render por movimento (usa `ref` + manipulação direta de `style.transform`).
