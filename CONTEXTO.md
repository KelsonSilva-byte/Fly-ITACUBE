# Contexto do projeto — NASA Space Apps 2026 (14–15/nov)

Equipe Fly ITACUBE. Atualizado em 14/11/2026.

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
- **História real:** as tempestades reais do DONKI conduzem a missão. Elas viram cartas com data e hora reais,
  e não só uma tabela no final.
- **Missão de 10 dias** (por enquanto; 7 dias foi cogitado para encurtar a partida).
- **Sem commits por enquanto.** Os arquivos podem ser alterados, mas ninguém commita até a equipe liberar.

## Onde estão os arquivos
Pasta de trabalho: `Nasa Space\Fly-ITACUBE\` (repositório git).
- `index.html`: o jogo inteiro em um arquivo (HTML + CSS + JS puro, sem dependências, funciona offline).
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

Medidores (3 + contador):
- 🫧 Ar: começa 6, máx 10. Toda noite a tripulação gasta 2. Chegou a 0 → missão termina.
- ⚡ Energia: começa 4, máx 10 (o que passa é perdido). Todo dia entra a energia do Sol:
  padrão [3,4,2,1,2,3,4,2,1,2] com fase sorteada (sombras das crateras). Nunca fica negativa:
  a opção que custa mais energia do que há fica travada (🔒). Essa é a restrição central.
- ☢️ Radiação: +2 por noite (raios cósmicos) + tempestades + saídas da base. Chegou a 100 → missão termina.
- 🔬 Descobertas: contador, não é barra.

Cartas de cada dia, nesta ordem:
1. **Dia**: mostra o Sol do dia e dá a energia.
2. **Suporte de vida**: máquina de oxigênio (−2⚡, +4🫧) ou estufa (acender: −1⚡ +2🫧; apagar: +1⚡ −1🫧).
3. **Alerta de explosão** (só em dia de tempestade com explosão ligada no DONKI): hora e classe reais.
   Carregar o escudo (−3⚡) ou continuar a pesquisa (+1🔬).
4. **Ciência**: laboratório (−2⚡, +1🔬) ou jipe na cratera (−1⚡, +2🔬, +5☢️).
   Em dia de alerta, é sempre o jipe ("sair mesmo assim?"); em dia de tempestade sem aviso, é sempre o laboratório.
5. **Chegada da tempestade** (dia de tempestade) ou **evento** sorteado (poeira nos painéis, vazamento, telescópio, gelo perto da base).

Tempestade (dose fraca 20, média 40, forte 70):
- Escudo carregado no alerta: bloqueia 90%.
- Escudo de emergência, ligado na chegada (−3⚡): bloqueia 50%. É a única opção nas tempestades sem aviso.
- Sem escudo: 0%.
- Jipe lá fora no dia: +60% da dose, sem proteção.
- Depois da escolha roda a animação (partículas saem do Sol e param no escudo ou atingem a base) e uma carta de resultado.

Estrelas (só quem completa os 10 dias): 3 = descobertas ≥ 8 E radiação < 50; 2 = só uma das duas; 1 = nenhuma.
Derrotas têm texto leve ("voltando para casa", "tente de novo com outra estratégia") e botão de jogar de novo no topo.

Tela final: estrelas, resumo, "o que esta missão mostrou", o caderno de descobertas, a lista **"Isso aconteceu de verdade!"**
(cada tempestade real da janela: data e hora, o que o DONKI registrou, aviso, velocidade da CME, link do DONKI,
o que a criança fez) e a seção "Dados da NASA usados e simplificações".

Aprendizado sem texto obrigatório (nada disso trava o jogo; é uma faixa de uma frase abaixo da carta):
- **Descobertas com nome:** cada ponto de ciência vira um fato real sobre a Lua ou o Sol (16 no total, lista `DISC`
  no motor): regolito, vidro laranja da Apollo 17, água achada pela LCROSS, frio medido pela LRO, ciclo de 11 anos do Sol etc.
  O laboratório puxa fatos de pedras, o jipe de crateras, o telescópio do Sol, a caminhada do gelo.
  No fim aparecem no caderno; a coleção (X de 16) e o melhor resultado ficam no `localStorage` do navegador.
- **Dicas de contexto:** na primeira vez que um assunto aparece (máquina de oxigênio, raios cósmicos, sombra no polo sul,
  vazamento, abrigo, energia travada), uma frase explica o termo. Cada dica aparece uma vez só por sessão (lista `TIPS`).
- **"O que esta missão mostrou":** até 4 frases no fim, tiradas do que a criança fez (escudo a tempo ou às pressas,
  saídas da base e a radiação que custaram, vezes em que faltou energia, energia perdida com a bateria cheia).
- **Ajuda quando o ar está acabando:** com ar só para uma noite, a carta de suporte de vida é sempre a máquina de oxigênio,
  com o aviso "o ar só dá para esta noite", e o medidor pisca.

Outros detalhes: sons simples gerados na hora (botão 🔊 para silenciar), a cara da tripulação na base muda com o estado
(sem ar, radiação alta), e a primeira carta balança para mostrar que se desliza.

Código: o motor fica entre `/*ENGINE-START*/` e `/*ENGINE-END*/` no `index.html` e não usa DOM (por isso roda em Node).
Para testes no navegador: `window.__game` (G, R, STORMS, Engine, act, setLang).

## Dados reais
- **32 tempestades de partículas solares (eventos SEP) de 2024 e 2025** do DONKI (NASA), embutidas no array `STORMS`.
- Só entram detecções reais; registros que são previsão de modelo ("MODEL: ...") foram descartados.
  Registros com menos de 48 h de diferença do anterior viram uma tempestade. (O protótipo antigo tinha 25 só de 2024,
  contando também previsões; pelo critério novo, 2024 tem 22.)
- Hora de chegada = primeira detecção do GOES (perto da Terra e da Lua) quando há; senão, a primeira de qualquer sonda.
- Força: forte = GOES >100 MeV; média = GOES >10 MeV; fraca = só outras sondas (SOHO, STEREO-A).
- Explosão ligada: a mais recente das `linkedEvents` que começou antes da chegada (até 48 h antes).
  18 das 32 têm explosão; o aviso real vai de 92 minutos a quase 18 horas. As outras 14 aparecem no jogo como tempestade sem aviso.
- Classe da explosão: 13 têm (M5.5 a X4.0). Vem das notificações do DONKI, que só existem para M5 ou mais.
- Velocidade da CME ligada: 31 das 32 (769 a 3.529 km/s). Aparece só na tela final.
- Cada partida sorteia uma janela real de 10 dias com pelo menos uma tempestade (nunca no dia 1).

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

## Equilíbrio (tools/sim.mjs, 3.000 partidas por estratégia)
| Estratégia | Vitórias | 3★ | Derrota por ar | Derrota por radiação |
|---|---|---|---|---|
| Cuidadosa (mantém o ar, guarda 3⚡ para o escudo, pesquisa com a sobra) | 99% | 42% | 0% | 1% |
| Só ciência (nunca usa escudo, sempre sai de jipe) | 19% | 0% | 0% | 81% |
| Só segurança (sempre escudo, nenhuma pesquisa) | 100% | 0% | 0% | 0% |
| Esquece o ar | 0% | 0% | 100% | 0% |
| Sempre para a direita | 46% | 0% | 0% | 54% |
| Sempre para a esquerda | 0% | 0% | 100% | 0% |
| Aleatória | 24% | 1% | 66% | 10% |

Nenhuma estratégia de um lado só chega a 3 estrelas. Ao mudar qualquer número em `R` ou nas cartas, rodar `node tools/sim.mjs` de novo.

Interface: 20 partidas automáticas no Edge headless (15 em PT, 5 em EN) sem erros de JavaScript, com a tela final
e os links do DONKI presentes. Para repetir: `python -m http.server 8765` na pasta do projeto e abrir
`http://localhost:8765/tools/ui-test.html?games=20`.

## Simplificações (dizer no pitch)
- Os números de ar, energia e radiação são de jogo, não de engenharia.
- O "escudo" representa um abrigo protegido; os 90% e 50% são de jogo.
- O alerta e a chegada caem no mesmo dia de jogo, mesmo quando a explosão real foi na véspera; a hora real aparece na carta.
- Tempestade "sem aviso" significa que o DONKI não liga nenhuma explosão àquele registro.
- Uma tempestade por dia de jogo (se houver duas no mesmo dia, vale a mais forte).

## Pendências
- Testar com dedo em celular de verdade (o arrastar só foi testado por clique automático e teclado).
- Arte: a cena e as cartas usam emojis e formas em CSS; ilustrações próprias ainda não existem.
- A partida aleatória perde por falta de ar em 66% dos casos: observar se crianças de verdade travam nisso.
- Ideias não feitas: som, RadLab (dosimetria real da ISS) para comparar a radiação, modo Marte com atraso de comunicação.
