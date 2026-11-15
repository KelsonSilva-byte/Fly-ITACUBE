# Continuidade do Fly ITACUBE

Base Lunar é um jogo de navegador, em português e inglês, para crianças de 7 a 12 anos administrarem uma base lunar. O modo de jogo, o desafio e as fontes científicas estão em [CONTEXTO.md](CONTEXTO.md) e [README-jogo.md](README-jogo.md).

## Onde paramos

A branch `arte` foi publicada em `origin/arte` no commit `1edf8c4` com o cenário animado integrado à partida. O cenário de 256 × 88 pixels inclui Sol e estrelas com brilho variável, tripulação, hover, abrigo e caixas que ficam onde caem até serem recolhidas.

As cenas seguem o resultado da escolha. Recusar uma viagem mantém o hover parado, buscar gelo usa um astronauta a pé e limpar os painéis remove a poeira. A tempestade usa a proteção escolhida. Durante a cena, a partida aguarda a sequência antes de atualizar os medidores e apresentar eventuais descobertas. As descobertas ficam no lugar da carta até o jogador avançar e podem reaparecer como perguntas de memória.

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

## Próxima etapa

O responsável por esta sessão vai continuar o trabalho visual. Retome pela avaliação das cenas numa partida real. Confira se o ritmo funciona em sequência, se cada ação comunica a escolha e se cartas, descobertas e medidores continuam legíveis em telas pequenas. As artes dedicadas para a abertura e o fim da missão continuam em aberto.

O balanceamento provavelmente ficará com outra pessoa. Se surgir um problema de equilíbrio durante os testes visuais, registre o caso para quem assumir essa frente.

Este arquivo é o ponto de retomada compartilhado. Se o Claude Code não carregar `AGENTS.md` automaticamente, indique o arquivo no início da sessão.
