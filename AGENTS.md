# Continuidade do Fly ITACUBE

Base Lunar é um jogo de navegador, em português e inglês, para crianças de 7 a 12 anos administrarem uma base lunar. O modo de jogo, o desafio e as fontes científicas estão em [CONTEXTO.md](CONTEXTO.md) e [README-jogo.md](README-jogo.md).

## Onde paramos

Atualizado em 15/11/2026 (noite), depois da integração visual.

**Git.** Em 15/11 a branch `arte` recebeu o commit das alterações visuais (relatório de descobertas, alerta solar, áudio, ícones 16×16 e telas mínimas), foi enviada a `origin/arte` e mergeada com `origin/base`. O estado de `main` está no histórico do Git. As alterações de `base` (Kelson Silva e Luis Felipe Schmitt) incluem rebalanceamento de eventos e as telas de pesquisas e descobertas.

**Visual (fora do git, em `artes/`).** As decisões estão em `artes/REGRAS.md`, seção "Molduras e revelação de descobertas". Resumo:
- Descobertas: relatório no estilo de janela de computador, com barra de título, rolagem, selo ✦ Novo nos registros inéditos e um único X vermelho centralizado. As tarefas comuns mantêm o visual atual.
- Tempestade: moldura própria de alerta (janela com barra vermelha e exclamação amarela, borda lavanda em degraus), luzes vermelhas pulsando, rastros vermelhos e laranjas saindo do Sol e um tremor breve restrito ao cenário. Com movimento reduzido, tudo fica estático.
- Escudo: os rastros param na borda e viram pontos de luz que se apagam.
- Fonte: Press Start 2P, a mesma do jogo.
- Prévias: `artes/rascunhos/relatorio-descobertas/index.html` e `artes/rascunhos/cenario/index.html` (simulação de partida).

**Pendente e não verificado.**
- Nenhuma dessas prévias foi conferida no navegador, nem em celular.
- O som da descoberta inédita (cinco notas ascendentes) não foi confirmado. Na conversa, o usuário disse que o som do jogo não pareceu mudar. O efeito só toca no primeiro registro de cada descoberta.
- A duração da ida e volta do jipe (7,8 s, antes 12 s) foi relatada na conversa, mas não confirmei no código.
- Falta decidir se a direção dos raios acompanha a posição real do Sol no horizonte.

## Onde mexer

- [index.html](index.html) concentra o motor da partida, as cartas, as descobertas e a integração do HUD. Abra esse arquivo no navegador para jogar.
- [style.css](style.css) contém o HUD pixelado e as regras de layout para celular e tela horizontal.
- [assets/scene/lunar-scene.js](assets/scene/lunar-scene.js) desenha o cenário e associa resultados das cartas a sequências em `LunarScene.actionsFor`.
- A pasta local `artes/` é ignorada pelo Git. Se estiver disponível, consulte `artes/REGRAS.md` antes de editar a arte e use `artes/rascunhos/cenario/index.html` como bancada. Referências, rascunhos e capturas ficam nessa pasta. A versão publicada funciona sem ela.

## Como desenvolvemos o visual

1. **Registrar as regras antes de desenhar.** Consultávamos e atualizávamos `artes/REGRAS.md` com as decisões da identidade visual: paletas, escala dos pixels, enquadramento e referências. Os arquivos de referência ficavam em `artes/referencias/`.
2. **Experimentar localmente.** Criávamos versões em `artes/rascunhos/`, com artes separadas por elemento e prévias que podiam ser abertas no navegador. Para o cenário, montávamos a cena completa na bancada e revisávamos tanto os sprites quanto a interação entre eles, como a passagem pela porta, o embarque no hover e o recolhimento das caixas.
3. **Iterar e validar na bancada.** Os ajustes de arte e movimento eram feitos no rascunho. Quando uma decisão precisava valer para as próximas artes, ela voltava para `artes/REGRAS.md`. Conferíamos os quadros e as transições antes de levar a solução ao jogo.
4. **Integrar o material aprovado.** Levávamos para `assets/` apenas o que a versão jogável usa e adaptávamos o código na branch `arte`. Conferíamos a integração com as escolhas e o HUD, rodávamos os testes e então fazíamos commit e push quando solicitado. Regras, referências, versões descartadas e capturas permaneciam em `artes/`, pasta local ignorada pelo Git.

## Como validar

- Execute `node tools/scene-test.mjs` para verificar rotas de animação, estados persistentes e movimento reduzido.
- Sirva o repositório por HTTP e abra `tools/scene-ui-test.html`. Na última entrega, o Edge passou nos 11 casos e o layout foi conferido em celular e tela horizontal.
- Execute `node tools/sim.mjs 100` para rodar a simulação do motor. A simulação não substitui o teste manual da experiência.

## Alterações de 15/11 (fim da tarde) no código do jogo

- Raios da radiação: os radiais continuam saindo do Sol. Os que chegam à Lua são condensados (feixe estreito) e variam de comprimento. Quando estão na linha de visão, viram ponto.
- Volume do som de descoberta (`reveal`) reduzido pela metade. Suposição: "esse efeito" era esse som. Confirmar.
- Tensão: drone grave sintetizado (`syncTension`) sobe durante alerta e tempestade. Não usa o tema do Interstellar, que serve só de referência.
- Telas inicial e final mínimas, com a classe `.min` (`index.html` e `style.css`). Para voltar ao texto completo, remova `.min`.
- Ícones 16×16 (`assets/hud/pixel-icons.js`, bloco `hiRes`) para ☀ 🌑 🧑 🫧 ⚡ ⚠ ☢ 🔋. Os outros emojis continuam em 8×8. 🔬 ainda não foi refeito.
- Capa nova em `assets/hud/capa-base-lunar.svg`, gerada em pixel art na paleta Eclipse índigo. Substitui a `base-panoramica.png` só na tela inicial.
- Pendentes: gritos (aguardam os arquivos em `assets/audio/`), redesenho dos emojis em mais pixels (decisão de escopo: cerca de 50 ícones em 16×16) e conferência no navegador.

## Próxima etapa

Abrir as duas prévias no navegador e conferir a fonte, o relatório e o alerta. Depois testar uma partida real com som ligado, usando janela privativa para repetir o primeiro registro. Só então integrar ao `index.html`. As artes de abertura e de fim de missão continuam em aberto. O balanceamento fica com a equipe, não com esta frente; se surgir problema de equilíbrio durante os testes visuais, registre o caso para quem assumir essa frente.

Este arquivo é o ponto de retomada compartilhado. Se o Claude Code não carregar `AGENTS.md` automaticamente, indique o arquivo no início da sessão.
