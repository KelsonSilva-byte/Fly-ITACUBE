# Space Survivors

A browser game by team **Fly ITACUBE** for the **NASA Space Apps Challenge 2026**, in the *Build a Junior Astronaut Mission Trainer* challenge.

A child (ages 7–12) commands a base at the Moon's south pole for 10 days. Every card is a decision, swiped left or right, and **no choice is free**:
air, power and radiation trade against each other, and protecting the crew from a solar storm costs power that the base needs elsewhere.
The storms and events in the game really happened in 2024 and 2025, and the game links each choice to real NASA data.

Play it in English or Portuguese. No install, no account, and no internet needed.

## Highlights

- **Real NASA data.** 32 solar particle storms from DONKI, real eclipses, meteor showers and flares of 2024–2025, and 40 discoveries from NASA pages, each with its source link. The data is embedded and the game says it is not live.
- **Choices with a cost.** Three meters (air, power, radiation) and a science counter. Charging the shield at a real alert blocks 90% of the particles; waiting blocks only 50%.
- **Learning without lectures.** A discovery album, memory questions, short tips, a guided tutorial and a final report that explains what happened, with an *In real life* block for each fact.
- **Pixel-art identity.** A live animated lunar scene, an action camera that zooms in on whoever is working, a synthesized soundtrack and a pixel font throughout.

## Run it

- Open `index.html` in a browser for a quick look.
- For the full experience, serve the folder over HTTP (for example `npx serve .` or `python -m http.server`) and open it in the browser. The HUD sprites use CSS masks that only load over HTTP.

## Tests

```
node tools/scene-test.mjs     # choice-to-animation routes, camera, reduced motion
node tools/sim.mjs 4000       # balance simulation of the game engine
```

Browser tests are in `tools/scene-ui-test.html` and `tools/ui-test.html` (serve the repository over HTTP and open them).

## Repository

| Path | What it holds |
|---|---|
| `index.html` | The game: engine, cards, discoveries, tutorial, home and end screens |
| `style.css` | The pixel-art HUD, album, final report and responsive layout |
| `assets/` | Animated scene (`scene/lunar-scene.js`), HUD sprites and icons, the pixel font and audio |
| `tools/` | DONKI download and embedding scripts, simulation and tests |
| `data/` | Raw NASA JSON and the merged `storms.json` |
| `README-jogo.md` | The full description of the game, the data and the simplifications |

Branches: `main` has the delivered game, `base` is where the team merges work, and `arte` holds the art work in progress.

## Credits

- Game, art and code: team Fly ITACUBE.
- Data and facts: NASA ([DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/), [api.nasa.gov](https://api.nasa.gov/) and NASA Science pages).
- Font: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), SIL Open Font License (`assets/hud/OFL.txt`).
- The swipe-card format is inspired by the mobile game Lapse. We use only the mechanic; the cards, theme and art are ours.

Code license: MIT (see `LICENSE`).
