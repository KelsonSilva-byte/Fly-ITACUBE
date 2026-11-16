# Space Survivors: you are in command

Prototype for the **Build a Junior Astronaut Mission Trainer** challenge (NASA Space Apps 2026), by team Fly ITACUBE.
Open `index.html` in a browser. No install, no internet, no account. The game is in English and Portuguese (button at the top).

[Versão em português abaixo](#base-lunar-você-no-comando)

## The game

A child (ages 7–12) commands a base at the Moon's south pole for 10 days. Each day brings 4 or 5 cards.
Every card is a decision: swipe it one way or the other (or tap the buttons, or use the ← → keys).

There are three meters and one counter:

- 🫧 **Air**: the crew breathes every night. If it runs out, the mission ends.
- ⚡ **Power**: comes from the Sun and changes every day, because craters and mountains shade the solar panels.
- ☢️ **Radiation**: rises a little every night (cosmic rays) and a lot during a solar storm. If the meter fills up, the crew goes home.
- 🔬 **Science**: the reason to be on the Moon.

**The main lesson:** power is limited, and protecting the crew from a solar storm costs power that would be useful elsewhere.
When there is not enough power for an option, that option is locked. No choice is free: every card trades one thing for another.

Every day has a **science card** with two kinds of research: one inside the base (lab or telescope), which costs power,
and one outside (rover or a walk to the ice), which costs radiation. When power is very low, the inside option becomes "recharge batteries".
Calm days may end with a **problem** to fix (dusty panels, a leak, a clogged filter) or with **good news** (spare air, a backup battery, a cargo pod), and both still have a cost.

## Learning without lectures

Nothing here stops the game; it is one sentence in a strip below the card.

- **Named discoveries:** 40 real facts from NASA pages, 10 per group (lab, rover, ice and water, telescope), such as the water found by LCROSS,
  the 98% water recycling on the Space Station or the May 2024 auroras. Each one says how it matters at the base and links to its NASA source.
  The crew makes one discovery per day, so a mission gives 10 and the full album takes several missions. Discoveries missing from the album are twice as likely to come up.
  The album can be opened during the mission.
- **Tips in context:** the first time a topic comes up (the oxygen machine, cosmic rays, shadows at the south pole), one sentence explains it. Each tip shows only once.
- **"What this mission showed":** up to four sentences at the end, taken from what the child actually did,
  such as how much radiation the trips outside cost or how many times power ran short.

## The real story

The solar storms in the game really happened. Each mission takes place in a real 10-day window of 2024 or 2025.

- When NASA's record links a solar flare to the storm, the child gets an **alert card** with the real time and class of the flare.
  Charging the shield right then blocks 90% of the particles. Waiting and turning it on in a rush blocks only 50%.
- The arrival card shows the **real warning time** between the flare and the particles. The shortest in our data is 92 minutes.
- When the record links no flare, the storm arrives **with no warning**, and only the emergency shield is available.
- At the end, the list **"This really happened!"** shows each real storm in the window: date and time, what the instruments recorded,
  the warning time, the speed of the gas cloud, a link to the event on DONKI, and what the child did.

## NASA data used

- **32 solar particle storms (SEP events) from 2024 and 2025**, recorded in [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) and downloaded through [api.nasa.gov](https://api.nasa.gov/).
- From each storm we use: the time the particles arrived, the linked solar flare (time and class) and the speed of the linked coronal mass ejection (CME).
- Storm strength comes from what the instruments recorded:
  - **strong**: the GOES satellite detected particles above 100 MeV (7 storms);
  - **medium**: GOES detected particles above 10 MeV (15 storms);
  - **weak**: only other probes, such as SOHO and STEREO-A, detected it (10 storms).
- 18 of the 32 storms have a linked flare (warning from 92 minutes to almost 18 hours); 14 have none. 13 have a flare class (M5.5 to X4.0).
- The data is embedded in the file. **It is not live**, and the game says so.

**Why this data:** the time between seeing the flare and the particles arriving is the real time a crew would have to take cover.
In the game, that warning decides whether the shield can be charged.

## Simplifications

- The air, power and radiation numbers are game numbers, chosen to create the right trade-off. They are not engineering values.
- The "shield" stands for a protected shelter. The 90% and 50% figures are game numbers.
- Only real detections are used; model predictions in the record were discarded. Records less than 48 hours apart count as one storm.
- The alert and the arrival happen on the same game day, even when the real flare was the day before. The card shows the real time (UTC).
- "No warning" means DONKI links no flare to that storm.

## Balance (tested with automatic games)

4,000 games per strategy, played through the game engine (`node tools/sim.mjs`). Memory questions are answered at random.

| Strategy | Wins | 3 stars |
|---|---|---|
| Careful: keeps air up, saves power for the shield, researches with what is left | 43% | 29% |
| Science only: never uses the shield, always researches outside | 14% | 0% |
| Safety only: always the shield, only researches inside | 26% | 19% |
| Forgets the air | 0% | 0% |
| Random choices | 5% | 1% |

3 stars need **8 science points and radiation below 70**. Surviving is not enough: ignoring the shield never reaches 3 stars.

The interface was also played automatically in a browser (20 full games, in both languages) with no errors.
Swiping with a finger on a real phone has not been tested yet.

## Files

- `index.html`: the whole game (HTML + CSS + plain JavaScript, no libraries).
- `tools/fetch-donki.mjs`, `tools/build-storms.mjs`, `tools/embed-storms.mjs`: download the DONKI data, merge it and embed it in the game.
- `tools/sim.mjs`, `tools/ui-test.html`: balance test and interface test.
- `data/`: raw NASA JSON and the merged `storms.json`.

## Ideas to continue

1. Art: replace the emojis with simple illustrations of the base and the Sun.
2. Sound for the alert and the storm.
3. Use RadLab (real ISS dosimetry) to compare the game's radiation with what real astronauts receive.
4. Mars mode: delayed communication (the order only arrives later).

---

# Space Survivors: você no comando

Protótipo para o desafio **Build a Junior Astronaut Mission Trainer** (NASA Space Apps 2026), da equipe Fly ITACUBE.
Abra `index.html` no navegador. Não precisa instalar nada, nem de internet, nem de conta. O jogo está em português e inglês (botão no topo).

## O jogo

A criança (7–12 anos) comanda uma base no polo sul da Lua por 10 dias. Cada dia traz 4 ou 5 cartas.
Cada carta é uma decisão: deslize para um lado ou para o outro (ou toque nos botões, ou use as setas ← →).

São três medidores e um contador:

- 🫧 **Ar**: a tripulação respira toda noite. Se acabar, a missão termina.
- ⚡ **Energia**: vem do Sol e muda todo dia, porque crateras e montanhas fazem sombra nos painéis solares.
- ☢️ **Radiação**: sobe um pouco toda noite (raios cósmicos) e muito durante uma tempestade solar. Se o medidor encher, a tripulação volta para casa.
- 🔬 **Ciência**: o motivo de estar na Lua.

**A lição principal:** energia é limitada, e proteger a tripulação de uma tempestade solar custa energia que faria falta em outra coisa.
Quando não há energia para uma opção, ela fica travada. Nenhuma escolha é de graça: toda carta troca uma coisa por outra.

A carta de manutenção do ar tem 12 variações (um gerador, um purificador, a eletrólise da água e outras), todas com os mesmos custos.
Todo dia tem uma **carta de ciência** com duas pesquisas: uma dentro da base (laboratório ou telescópio), que custa energia,
e uma fora (jipe ou buscar gelo a pé), que custa radiação. Com a energia muito baixa, a opção de dentro vira "recarregar baterias".
Os dias calmos podem terminar com um **problema** para resolver (painéis sujos, vazamento, filtro entupido) ou com uma **boa notícia** (reserva de ar, bateria auxiliar, módulo de carga), e as duas coisas têm custo.

## Aprender sem aula

Nada disso trava o jogo; é uma frase numa faixa abaixo da carta.

- **Descobertas com nome:** 40 fatos reais de páginas da NASA, 10 por grupo (laboratório, jipe, gelo e água, telescópio), como a água achada pela LCROSS,
  a reciclagem de 98% da água na Estação Espacial ou as auroras de maio de 2024. Cada uma diz como importa na base e traz o link da fonte da NASA.
  A equipe faz uma descoberta por dia, então uma missão dá 10 e o álbum completo leva várias missões. As descobertas que faltam no álbum têm o dobro de chance de aparecer.
  O álbum pode ser aberto durante a missão.
- **Dicas na hora:** na primeira vez que um assunto aparece (a máquina de oxigênio, os raios cósmicos, as sombras do polo sul), uma frase explica. Cada dica aparece uma vez só.
- **"O que esta missão mostrou":** até quatro frases no final, tiradas do que a criança fez de verdade,
  como quanta radiação as saídas da base custaram ou quantas vezes faltou energia.

## A história real

As tempestades solares do jogo aconteceram de verdade. Cada missão acontece numa janela real de 10 dias de 2024 ou 2025.

- Quando o registro da NASA liga uma explosão solar à tempestade, a criança recebe uma **carta de alerta** com a hora e a classe reais da explosão.
  Carregar o escudo nessa hora bloqueia 90% das partículas. Esperar e ligar às pressas bloqueia só 50%.
- A carta de chegada mostra o **tempo real de aviso** entre a explosão e as partículas. O menor nos nossos dados é de 92 minutos.
- Quando o registro não liga nenhuma explosão, a tempestade chega **sem aviso**, e só o escudo de emergência está disponível.
- No final, a lista **"Isso aconteceu de verdade!"** mostra cada tempestade real da janela: data e hora, o que os instrumentos registraram,
  o tempo de aviso, a velocidade da nuvem de gás, o link do evento no DONKI e o que a criança fez.

## Dados da NASA usados

- **32 tempestades de partículas solares (eventos SEP) de 2024 e 2025**, registradas no [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) e baixadas pela [api.nasa.gov](https://api.nasa.gov/).
- De cada tempestade usamos: a hora em que as partículas chegaram, a explosão solar ligada (hora e classe) e a velocidade da ejeção de massa coronal (CME) ligada.
- A força da tempestade vem do que os instrumentos registraram:
  - **forte**: o satélite GOES detectou partículas acima de 100 MeV (7 tempestades);
  - **média**: o GOES detectou partículas acima de 10 MeV (15 tempestades);
  - **fraca**: só outras sondas, como a SOHO e a STEREO-A, detectaram (10 tempestades).
- 18 das 32 tempestades têm explosão ligada (aviso de 92 minutos a quase 18 horas); 14 não têm. 13 têm a classe da explosão (M5.5 a X4.0).
- Os dados estão embutidos no arquivo. **Não são ao vivo**, e o jogo deixa isso claro.

**Por que esses dados:** o tempo entre ver a explosão e a chegada das partículas é o tempo real que uma tripulação teria para se proteger.
No jogo, esse aviso decide se dá para carregar o escudo.

## Simplificações

- Os números de ar, energia e radiação são de jogo, escolhidos para criar a troca certa. Não são valores de engenharia.
- O "escudo" representa um abrigo protegido. Os 90% e 50% são números de jogo.
- Só entram detecções reais; as previsões de modelo do registro foram descartadas. Registros com menos de 48 horas de diferença contam como uma tempestade.
- O alerta e a chegada caem no mesmo dia de jogo, mesmo quando a explosão real foi na véspera. A carta mostra a hora real (UTC).
- "Sem aviso" significa que o DONKI não liga nenhuma explosão àquela tempestade.

## Equilíbrio (testado com partidas automáticas)

4.000 partidas por estratégia, jogadas pelo motor do jogo (`node tools/sim.mjs`). As perguntas de memória são respondidas ao acaso.

| Estratégia | Vitórias | 3 estrelas |
|---|---|---|
| Cuidadosa: mantém o ar, guarda energia para o escudo, pesquisa com a sobra | 43% | 29% |
| Só ciência: nunca usa o escudo, sempre pesquisa fora da base | 14% | 0% |
| Só segurança: sempre o escudo, só pesquisa dentro da base | 26% | 19% |
| Esquece o ar | 0% | 0% |
| Escolhas aleatórias | 5% | 1% |

3 estrelas exigem **8 pontos de ciência e radiação abaixo de 70**. Não basta sobreviver: quem ignora o escudo nunca chega a 3 estrelas.

A interface também foi jogada automaticamente no navegador (20 partidas completas, nos dois idiomas) sem erros.
Arrastar com o dedo em um celular de verdade ainda não foi testado.

## Arquivos

- `index.html`: o jogo inteiro (HTML + CSS + JavaScript puro, sem bibliotecas).
- `tools/fetch-donki.mjs`, `tools/build-storms.mjs`, `tools/embed-storms.mjs`: baixam os dados do DONKI, cruzam e embutem no jogo.
- `tools/sim.mjs`, `tools/ui-test.html`: teste de equilíbrio e teste da interface.
- `data/`: JSON brutos da NASA e o `storms.json` cruzado.

## Ideias para continuar

1. Arte: trocar os emojis por ilustrações simples da base e do Sol.
2. Som para o alerta e para a tempestade.
3. Usar o RadLab (dosimetria real da ISS) para comparar a radiação do jogo com a de astronautas de verdade.
4. Modo Marte: comunicação atrasada (a ordem só chega depois).

## Cenário animado integrado (branch arte)

O cenário em `assets/scene/lunar-scene.js` usa uma grade de 256 × 88 pixels e não depende da pasta local `artes/`. O Sol e as estrelas variam o brilho; a iluminação acompanha o dia e a etapa da missão.

As animações partem do resultado da escolha: hover para viagens, astronauta a pé para gelo, limpeza para painéis, manutenção para vazamentos e filtros, operação do terminal para oxigênio, energia e pesquisa. O alerta prepara o abrigo; a chegada das partículas usa a proteção realmente escolhida. Meteoritos precedem a limpeza opcional. Caixas lançadas permanecem onde caíram até serem recolhidas.

Durante a execução, a carta dá lugar à cena e à descrição da tarefa. A interface bloqueia novas escolhas e atualiza os níveis após a sequência; descobertas aparecem em seguida. Movimento reduzido elimina a espera animada. Reiniciar a missão limpa o estado visual e encerra a sequência anterior.

Validação:

- `node tools/scene-test.mjs`: associação entre escolhas e cenas, estados persistentes, conclusão das sequências e movimento reduzido.
- `tools/scene-ui-test.html`: integração no navegador, incluindo atualização dos níveis, tempestade e descoberta; servir o repositório por HTTP e abrir essa página.
- `node tools/sim.mjs 100`: simulação do motor, independente das animações.

Referências, regras de arte, rascunhos e capturas de revisão continuam excluídos pelo `.gitignore`.
