# Contexto do projeto — NASA Space Apps 2026 (14–15/nov)

Equipe Fly ITACUBE. Atualizado em 15/11/2026.

## Desafio
"Build a Junior Astronaut Mission Trainer": jogo/app para crianças de 7–12 anos administrarem um posto na Lua ou em Marte,
equilibrando suporte de vida, blindagem contra radiação, energia, comida e atraso de comunicação.
Página: https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=resources

Critérios da página (em ordem de importância):
1. A criança sai entendendo uma restrição REAL de missão (mais importante que diversão ou visual).
2. Nenhuma escolha sem custo (não pode existir opção "segura").
3. Linguagem simples para 7–12 anos; termos técnicos explicados no contexto.
4. Usar dados reais da NASA e citar as fontes DENTRO do jogo; se forem embutidos, não fingir que são ao vivo.
5. Jogável no navegador, sem download e sem conta.
6. Poucos recursos: 2 ou 3 é melhor que 5 ou 6.
7. Destaque: ligar a escolha do jogo a dados reais (ex.: escudo ↔ clima espacial real), rejogabilidade,
   errar sem se sentir punido, explicação curta dos dados usados.
Recursos sugeridos: api.nasa.gov (DONKI, fotos de Marte, APOD), DONKI, OSDR, RadLab (dosimetria da ISS), Mars Trek,
CSA (kit de produção de comida na Lua).

## Decisões da equipe
- **Referência de formato: o jogo Lapse (celular).** Cartas com uma situação; a criança desliza para um lado ou para o outro
  e cada escolha mexe em poucos medidores. Usamos só a mecânica: cartas, tema e arte são nossos.
- **História real:** as tempestades reais do DONKI e eventos astronômicos reais de 2024–2025 conduzem a missão.
  Eles viram cartas com data e hora reais, e não só uma tabela no final.
- **Missão de 10 dias** (por enquanto; 7 dias foi cogitado para encurtar a partida), sem data de calendário fixa no cabeçalho,
  para permitir sortear mais tempestades e eventos reais por partida.
- **Sem commits por enquanto.** Os arquivos podem ser alterados, mas ninguém commita até a equipe liberar.

## Onde estão os arquivos
Pasta de trabalho: `Nasa Space\Fly-ITACUBE\` (repositório git).
- `index.html`: estrutura HTML e motor/interface em JS puro (sem dependências externas, funciona offline).
- `style.css`: estilos da interface, cartas, álbum de descobertas e layout responsivo (retrato e paisagem).
- `assets/scene/lunar-scene.js`: cena lunar animada em `<canvas>` (base, painéis solares, jipe, astronautas, escudo e partículas).
- `assets/hud/`: ícones do HUD (álbum de descobertas, som ligado/desligado, descobertas).
- `CONTEXTO.md`: este arquivo.
- `README-jogo.md`: descrição para os jurados, em inglês e português, já na versão de cartas.
- `README.md`: README do repositório (duas linhas).
- `tools/fetch-donki.mjs`: baixa os dados brutos do DONKI para `data/`.
- `tools/build-storms.mjs`: cruza os dados e gera `data/storms.json`.
- `tools/embed-storms.mjs`: embute `data/storms.json` no `index.html`.
- `tools/sim.mjs`: teste de equilíbrio (milhares de partidas automáticas pelo motor do jogo, em Node).
- `tools/ui-test.html`: teste da interface (joga sozinho dentro de um iframe).
- `data/`: JSON brutos da NASA e `storms.json`.
O protótipo antigo (painel com barras e botões + e −) continua intacto em `Nasa Space\Junior Astronaut\`.

## Como o jogo funciona hoje (versão de cartas)
A criança comanda uma base no polo sul da Lua por 10 dias. Cada dia tem 4 ou 5 cartas; a partida tem cerca de 40.
Desliza a carta, toca nos botões ou usa as setas ← →. Bilíngue PT/EN (botão no topo; idioma inicial segue o navegador).
O cabeçalho mostra apenas `Dia X de 10` (sem data de calendário fixa), enquanto a data e a hora reais aparecem nas cartas de cada evento real.

Medidores (3 + contador):
- 🫧 Ar: começa 6, máx 10. Toda noite a tripulação gasta 2. Chegou a 0 → missão termina.
- ⚡ Energia: começa 4, máx 10 (o que passa é perdido). Todo dia entra a energia do Sol sorteada de
  `R.SUN = [0, 1, 1, 1, 1, 2, 2, 2, 2, 2]`: 0⚡ sem sol por sombra de montanha (10%), 1⚡ parcial por sombra de cratera (40%)
  e 2⚡ normal com Sol direto (50%). Opções que custam mais energia do que há ficam travadas (🔒). Se algum evento zerar
  a energia (`pw <= 0`), a missão também termina por falta de energia. Essa é a restrição central.
- ☢️ Radiação: +2 por noite (raios cósmicos) + tempestades + saídas da base. Chegou a 100 → missão termina.
- 🔬 Descobertas: contador, não é barra.

Cartas de cada dia, nesta ordem:
1. **Dia**: sorteia o Sol do dia (`0`, `1` ou `2`) e dá a energia correspondente.
2. **Suporte de vida**: máquina de oxigênio (−2⚡, +4🫧) ou estufa (acender: −1⚡ +2🫧; apagar: +1⚡ −2🫧).
3. **Alerta de explosão** (só em dia de tempestade com explosão ligada no DONKI): hora e classe reais.
   Carregar o escudo (−3⚡) ou continuar a pesquisa (−1🫧, +1🔬).
4. **Ciência** (`sciCard`): duas pesquisas, uma dentro da base (custa energia) e uma fora (custa radiação).
   Dentro: laboratório (−1⚡, +1🔬, grupo pedras) ou telescópio (−1⚡, +1🔬, grupo Sol), sorteado.
   Fora: jipe na cratera (−1⚡, +1🔬, +4☢️ — ou +3☢️ em dia de alerta solar — grupo crateras) ou buscar gelo a pé (+3☢️, +1🔬, grupo gelo), sorteado.
   Dia de alerta: dentro contra o jipe. Tempestade sem aviso: laboratório contra telescópio.
   Resgate: com energia ≤ 2 (`R.RESCUE_PW`) na hora da carta, a opção de dentro vira "Recarregar baterias" (+1⚡, −2🫧).
5. **Fim do dia**: em dia de tempestade, a chegada dela; em dia sorteado de evento real (`DATED_EVENTS`), a carta desse evento;
   nos outros dias, 50% **problema** (poeira nos painéis, vazamento, filtro entupido, poeira na câmara de ar),
   25% **boa notícia** (reserva de ar, bateria auxiliar, módulo de carga, sinal fraco) e 25% nada
   (`R.PROBLEM_CHANCE`, `R.GOOD_CHANCE`). Problemas e boas notícias saem de sacos embaralhados separados.
A pergunta de memória (`DISC_QUIZ`), quando há, entra numa posição sorteada entre a carta do dia e a carta final.
Os ganhos e perdas ficam definidos como constantes em `R` (`QUIZ_OK_AIR: 3`, `QUIZ_OK_PW: 2`, `QUIZ_FAIL_AIR: 2`, `QUIZ_FAIL_PW: 2`),
com trava acima do limite letal para que errar o quiz não encerre a partida.

Tempestade (dose fraca 20, média 40, forte 70):
- Escudo carregado no alerta: bloqueia 90%.
- Escudo de emergência, ligado na chegada (−3⚡): bloqueia 50%. É a única opção nas tempestades sem aviso.
- Sem escudo: 0%.
- Jipe lá fora no dia: +60% da dose, sem proteção.
- Depois da escolha roda a animação (partículas saem do Sol e param no escudo ou atingem a base) e uma carta de resultado.

Estrelas (só quem completa os 10 dias): 3 = descobertas ≥ 8 E radiação < 50; 2 = só uma das duas; 1 = nenhuma.
Derrotas (por falta de ar, falta de energia ou excesso de radiação) têm texto leve ("voltando para casa", "tente de novo com outra estratégia")
e botão de jogar de novo no topo.

Tela final: estrelas, resumo, "o que esta missão mostrou", o caderno de descobertas, a lista **"Isso aconteceu de verdade!"**
(em ordem cronológica da missão, reunindo cada tempestade real do DONKI e cada evento real datado sorteado: data e hora,
o que a NASA registrou, aviso, velocidade da CME, link oficial e o que a criança fez) e a seção "Dados da NASA usados e simplificações".

Aprendizado sem texto obrigatório (nada disso trava o jogo; é uma faixa de uma frase abaixo da carta):
- **Descobertas com nome:** 40 fatos reais de páginas da NASA (lista `DISC` no motor), 10 por grupo:
  laboratório (pedras, solo e corpo humano), jipe (crateras e terreno), gelo e água, telescópio (Sol e radiação).
  Cada uma tem o fato, uma frase "Na base:" que liga o fato a uma restrição da missão (ar, energia, radiação, comida)
  e o link da fonte (`src`), mostrado no álbum. Cada uma também tem uma pergunta de memória (`DISC_QUIZ`).
- **Uma descoberta por dia:** a primeira ação de ciência do dia revela uma descoberta do grupo dela. Se o dia passa sem ciência,
  à noite a equipe revisa os dados e ganha uma descoberta de um grupo sorteado. Os pontos de ciência (meta de 8 para as estrelas)
  continuam contando à parte. Uma missão completa dá exatamente 10 descobertas, então completar o álbum leva pelo menos 4 missões.
- **Sorteio e álbum dedicado (`#album`):** dentro do grupo, descobertas que ainda não estão no álbum têm o dobro de chance (`newGame(seen)` recebe o álbum).
  A coleção e o melhor resultado ficam no `localStorage` do navegador. O álbum tem uma tela própria acessível tanto pelo menu inicial
  quanto pelo botão do frasco no topo durante a missão (menos quando há uma carta de pergunta), exibindo descobertas desbloqueadas
  e dicas de onde encontrar as bloqueadas.
- **Dicas de contexto:** na primeira vez que um assunto aparece (máquina de oxigênio, raios cósmicos, sombra no polo sul,
  vazamento, abrigo, energia travada), uma frase explica o termo. Cada dica aparece uma vez só por sessão (lista `TIPS`).
- **"O que esta missão mostrou":** até 4 frases no fim, tiradas do que a criança fez (escudo a tempo ou às pressas,
  saídas da base e a radiação que custaram, vezes em que faltou energia, energia perdida com a bateria cheia).
- **Ajuda quando o ar está acabando:** com ar só para uma noite, a carta de suporte de vida é sempre a máquina de oxigênio,
  com o aviso "o ar só dá para esta noite", e o medidor pisca.

Outros detalhes: sons simples gerados na hora (botão 🔊 para silenciar), cena lunar animada em `<canvas>` (`lunar-scene.js`)
que muda conforme o estado da base e as ações, e a primeira carta balança para mostrar que se desliza.

Código: o motor fica entre `/*ENGINE-START*/` e `/*ENGINE-END*/` no `index.html` e não usa DOM (por isso roda em Node).
Para testes no navegador: `window.__game` (`G`, `busy`, `lunarScene`, `R`, `STORMS`, `Engine`, `act`, `setLang`).

## Dados reais
- **32 tempestades de partículas solares (eventos SEP) de 2024 e 2025** do DONKI (NASA), embutidas no array `STORMS`.
- **6 eventos astronômicos/espaciais reais de 2024 e 2025** em `DATED_EVENTS`: eclipses lunares de 25/03/2024, 18/09/2024 e 14/03/2025,
  explosão solar classe X8.7 de 14/05/2024 (DONKI) e picos das chuvas de meteoros Geminídeas (14/12/2024) e Quadrântidas (03/01/2025).
- Só entram detecções reais; registros que são previsão de modelo ("MODEL: ...") foram descartados.
  Registros com menos de 48 h de diferença do anterior viram uma tempestade. (O protótipo antigo tinha 25 só de 2024,
  contando também previsões; pelo critério novo, 2024 tem 22.)
- Hora de chegada = primeira detecção do GOES (perto da Terra e da Lua) quando há; senão, a primeira de qualquer sonda.
- Força: forte = GOES >100 MeV; média = GOES >10 MeV; fraca = só outras sondas (SOHO, STEREO-A).
- Explosão ligada: a mais recente das `linkedEvents` que começou antes da chegada (até 48 h antes).
  18 das 32 têm explosão; o aviso real vai de 92 minutos a quase 18 horas. As outras 14 aparecem no jogo como tempestade sem aviso.
- Classe da explosão: 13 têm (M5.5 a X4.0). Vem das notificações do DONKI, que só existem para M5 ou mais.
- Velocidade da CME ligada: 31 das 32 (769 a 3.529 km/s). Aparece só na tela final.
- **Sorteio da missão (`pickMission`):** desvinculado de uma janela contínua de 10 dias no calendário, cada partida sorteia
  **1 a 3 tempestades reais** (distribuídas entre os dias 2 e 10) e **0 a 2 eventos datados reais** nos dias livres,
  exibindo a data e hora reais de cada ocorrência na carta (`REAL · ...`) e na linha do tempo final.

Como atualizar os dados (PowerShell, na pasta do projeto):
```
$env:NASA_API_KEY="chave"; node tools/fetch-donki.mjs
node tools/build-storms.mjs
node tools/embed-storms.mjs
```
- A chave grátis sai na hora em https://api.nasa.gov. **Não colocar a chave em nenhum arquivo do repositório.**
- A DEMO_KEY esgota rápido (erro 429).
- Em 14/11/2026 o endpoint `/DONKI/FLR` retornava 404; por isso a classe vem de `/DONKI/notifications?type=FLR`.
- O endpoint direto kauai.ccmc.gsfc.nasa.gov não respondeu daqui e bloqueia CORS no navegador.
- A página do desafio só carrega com JavaScript; os critérios acima vieram do resumo da equipe.

## Equilíbrio (tools/sim.mjs, 4.000 partidas por estratégia, 15/11/2026, meta de ciência 8)
O simulador responde as perguntas de memória ao acaso.
| Estratégia | Vitórias | 3★ | Derrota por ar | Derrota por radiação | Derrota por energia |
|---|---|---|---|---|---|
| Cuidadosa (mantém o ar, guarda 3⚡ para o escudo, pesquisa com a sobra) | 64% | 43% | 11% | 1% | 24% |
| Só ciência (nunca usa escudo, sempre pesquisa fora da base) | 12% | 0% | 6% | 74% | 8% |
| Só segurança (sempre escudo, só pesquisa dentro da base) | 49% | 35% | 19% | 0% | 32% |
| Esquece o ar | 0% | 0% | 100% | 0% | 0% |
| Sempre para a direita | 13% | 0% | 0% | 11% | 76% |
| Sempre para a esquerda | 0% | 0% | 100% | 0% | 0% |
| Aleatória | 12% | 2% | 72% | 7% | 10% |

Atenção: com a carta de ciência, "só segurança" chega a 3 estrelas (35%), porque pesquisar dentro da base todo dia já soma
quase 8 pontos. Com meta 10, cai para 17% (cuidadosa: 37%). A tabela acima foi medida antes de aleatorizar `R.SUN` (`0–2`)
e ampliar `pickMission()` para 1–3 tempestades e 0–2 eventos datados; rodar `node tools/sim.mjs` de novo para recalibrar.

Interface: 20 partidas automáticas no Edge headless (15 em PT, 5 em EN) sem erros de JavaScript, com a tela final
e os links do DONKI presentes. Para repetir: `python -m http.server 8765` na pasta do projeto e abrir
`http://localhost:8765/tools/ui-test.html?games=20`.

## Simplificações (dizer no pitch)
- Os números de ar, energia e radiação são de jogo, não de engenharia.
- O "escudo" representa um abrigo protegido; os 90% e 50% são de jogo.
- Os eventos reais da partida vêm de datas diferentes de 2024–2025 reunidas na missão para fins educativos; o alerta e a chegada
  caem no mesmo dia de jogo, mesmo quando a explosão real foi na véspera, e a data e a hora reais aparecem na carta.
- Tempestade "sem aviso" significa que o DONKI não liga nenhuma explosão àquele registro.
- Uma tempestade por dia de jogo (se houver duas no mesmo dia, vale a mais forte).

## Pendências
- Rodar `node tools/sim.mjs` após os ajustes de `R.SUN` (0–2) e `pickMission()` (1–3 tempestades e 0–2 eventos datados).
- Testar com dedo em celular de verdade (o arrastar só foi testado por clique automático e teclado).
- Arte: a cena superior já tem pixel art animada em `<canvas>` (`lunar-scene.js`) e o HUD tem ícones próprios, mas as cartas ainda usam emojis.
- A partida aleatória perde por falta de ar em 72% dos casos: observar se crianças de verdade travam nisso (especialmente com a nova variação solar).
- Ideias não feitas: RadLab (dosimetria real da ISS) para comparar a radiação, modo Marte com atraso de comunicação.
