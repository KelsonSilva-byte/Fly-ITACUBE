# Space Survivors: you are in command

Prototype for the **Build a Junior Astronaut Mission Trainer** challenge (NASA Space Apps 2026), by team Fly ITACUBE.
Open `index.html` in a browser (serve the folder over HTTP for the full pixel-art HUD, see [Run it](#run-it)). No install, no account, and the game needs no internet.
It is playable in English and Portuguese (language button on every screen).

## The game

A child (ages 7–12) commands a base at the Moon's south pole for 10 days. Each day brings 4 or 5 cards.
Every card is a decision: swipe it one way or the other (or tap the buttons, or use the ← → keys).

There are three meters and one counter:

- 🫧 **Air**: the crew breathes 2 every night. If it runs out, the mission ends.
- ⚡ **Power**: comes from the Sun and changes every day, because craters and mountains shade the solar panels. The battery holds 10.
- ☢️ **Radiation**: rises a little every night (cosmic rays) and a lot during a solar storm. At 100 the crew goes home.
- 🔬 **Science**: the reason to be on the Moon.

**The main lesson:** power is limited, and protecting the crew from a solar storm costs power that would be useful elsewhere.
When there is not enough power for an option, that option is locked. No choice is free: every card trades one thing for another.

A day goes like this:

1. **Day card:** the panels collect the day's sunlight (0 to 2 power).
2. **Life support:** spend power to make air, or save it. There are 12 variations of this card (generator, purifier, water electrolysis and others), all with the same costs.
3. **Research:** a **science card** with two kinds of research. One is inside the base (lab or telescope) and costs power. The other is outside (rover or a walk to the ice) and costs radiation.
   When power is very low, the inside option becomes "recharge batteries".
4. **End of the day:** a real event, a solar storm, a **problem** to fix (dusty panels, a leak, a clogged filter) or **good news** (spare air, a backup battery, a cargo pod). Both problems and good news still have a cost.

**Stars:** surviving all 10 days is 1 star. Reaching **8 science points** or keeping radiation **below 70** is 2 stars. Both together is 3 stars.

## What you see and hear

- **Pixel-art identity.** The HUD, buttons, icons and every text use the pixel font (Press Start 2P, SIL OFL) and one fixed palette.
- **Home screen with the live scene.** The real game scene runs behind the title, with a moving camera, the astronauts at work and a solar storm now and then.
- **Guided tutorial.** Eleven short animated screens (the meters, swiping, costs, the shield, science, the discovery report and memory questions), plus a "Full guide" with every rule and number. The numbers are read from the game rules, so the tutorial follows balance changes.
- **Animated lunar scene.** Each choice has its own animation: the rover leaves for craters, an astronaut walks to the ice, panels get cleaned, leaks and filters get fixed, the terminal is used for oxygen, power and research.
  When an astronaut does a task, the **action camera** zooms in 2× on them and follows until the task ends. Events (alert, storm, meteors, eclipse) keep the normal camera.
- **Sound.** A calm synthesized soundtrack plays on the home screen and the tutorial and **keeps going into the game** without restarting. It gets tenser during storms. Buttons, windows, alerts and discoveries have their own effects. All audio can be muted.
- **Reduced motion.** With `prefers-reduced-motion`, the camera zoom, waiting animations and decorative loops are turned off.

## Learning without lectures

Nothing here stops the game; it is one sentence in a strip below the card.

- **Named discoveries:** 40 real facts from NASA pages, 10 per group (lab, rover, ice and water, telescope), such as the water found by LCROSS,
  the 98% water recycling on the Space Station or the May 2024 auroras. Each one says how it matters at the base and links to its NASA source.
  The crew makes one discovery per day, so a mission gives up to 10 and the full album takes several missions. Discoveries missing from the album are twice as likely to come up.
  The album (the **discovery terminal**) can be opened from the home screen, during the mission, and from the end screen.
- **Memory questions:** a few days after a discovery, the game asks about it. A right answer gives +3 air and +2 power; a wrong one costs 2 air and 2 power, and the child can reopen that discovery to read it again. Every one of the 40 discoveries has a question.
- **Tips in context:** the first time a topic comes up (the oxygen machine, cosmic rays, shadows at the south pole), one sentence explains it. Each tip shows only once.
- **Final report:** see below.

## The real story

The solar storms in the game really happened. Each mission draws 1 to 3 real storms from 2024 and 2025 and puts them on random days, together with up to 2 real dated events:
three lunar eclipses (March 2024, September 2024, March 2025), the X8.7 solar flare of 14 May 2024, and the Geminid and Quadrantid meteor showers (December 2024 and January 2025).

- When NASA's record links a solar flare to the storm, the child gets an **alert card** with the real time and class of the flare.
  Charging the shield right then (3 power) blocks 90% of the particles. Waiting and turning it on in a rush blocks only 50%.
- The arrival card shows the **real warning time** between the flare and the particles.
- When the record links no flare, the storm arrives **with no warning**, and only the emergency shield is available.
- Anyone outside the base during a storm takes extra radiation, with no shield.
- Eclipses dim the solar panels, and meteor showers cover them with dust. Cleaning the dust outside costs radiation.

### Final screen and report

The game ends with the crew heading home: a capsule heats up entering the atmosphere, opens its parachute and floats over a pixel-art Earth (a returning-home animation for every ending, with sparkles on a successful mission).
The end screen shows the stars, science, radiation and days, and three buttons: **play again**, **final report** and **discoveries**.

The **final report** opens in a window with the same title bar and red close button as the in-game discovery report. It gives up to three facts taken from what the child actually did
(for example "shield charged for the storm on day 6" or "left the base 3 times: +18 radiation"), each one a "well done" or "to improve", with a tip for next time.

Every fact also has an **In real life** block with the real data behind it, and a **See more** button (or **Open all** at the top) that opens the rest:

- **Real record.** For storms: the real date, flare class, warning time, GOES detection and gas cloud speed from DONKI, with the link. For dated events: the real record of that eclipse, meteor shower or flare.
- **How it works in the game**, with the numbers read from the game rules (shield cost and blocking, air per night, power limits, radiation limit and goals).
- **More from NASA:** three to five related discoveries from the album (for example "8 minutes", "Eye on the Sun" and "Gas clouds from the Sun" for a shield fact, or "The lunar day" for a power fact).
- **Links** to all the sources.

Nothing in these blocks is invented: the facts, "at the base" lines and links all come from the game's own NASA data.

## NASA data used

- **32 solar particle storms (SEP events) from 2024 and 2025**, recorded in [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) and downloaded through [api.nasa.gov](https://api.nasa.gov/).
- From each storm we use: the time the particles arrived, the linked solar flare (time and class) and the speed of the linked coronal mass ejection (CME).
- Storm strength comes from what the instruments recorded:
  - **strong**: the GOES satellite detected particles above 100 MeV (7 storms);
  - **medium**: GOES detected particles above 10 MeV (15 storms);
  - **weak**: only other probes, such as SOHO and STEREO-A, detected it (10 storms).
- 18 of the 32 storms have a linked flare (warning from about 1.5 hours to almost 18 hours); 14 have none. 13 have a flare class (M5.5 to X4.0).
- **40 discoveries** from NASA pages (Apollo, LRO, LCROSS, SOFIA, Lunar Prospector, SDO, Parker Solar Probe, the Space Station and astronaut health research), each with its source link.
- The data is embedded in the file. **It is not live**, and the game says so.

**Why this data:** the time between seeing the flare and the particles arriving is the real time a crew would have to take cover.
In the game, that warning decides whether the shield can be charged.

## Simplifications

- The air, power and radiation numbers are game numbers, chosen to create the right trade-off. They are not engineering values.
- The "shield" stands for a protected shelter. The 90% and 50% figures are game numbers.
- Only real detections are used; model predictions in the record were discarded. Records less than 48 hours apart count as one storm.
- The alert and the arrival happen on the same game day, even when the real flare was the day before. The card shows the real time (UTC).
- "No warning" means DONKI links no flare to that storm.
- Real events are placed on random game days; a mission is not a replay of one real calendar window.

## Balance (automatic games)

`node tools/sim.mjs 4000` plays 4,000 games per strategy through the game engine. Memory questions are answered at random.
Latest run (numbers move by a point or two between runs):

| Strategy | Wins | 3 stars |
|---|---|---|
| Studious: plays like Careful but always answers the memory questions right | 55% | 45% |
| Master: masters the engine's math (best air/power trades) | 76% | 28% |
| Intuitive child | 7% | 3% |
| Careful: keeps air up, saves 3 power for the shield, researches with the rest | 4% | 3% |
| Science only: never uses the shield, always researches outside | 4% | 1% |
| Random choices | 1% | 0% |
| Forgets the air | 0% | 0% |

The gap between Careful and Studious shows how much the memory questions matter: right answers give back air and power.
Surviving is not enough for 3 stars: **8 science points and radiation below 70** are needed, so ignoring the shield never reaches 3 stars.
The hand-written strategies in `tools/sim.mjs` were written for an earlier version of the rules and are being re-tuned by the team, so read this table as a rough check, not a final balance.
The interface was also played automatically in a browser in both languages; swiping with a finger on a real phone has not been tested yet.

## Run it

- **Quick look:** open `index.html` in a browser.
- **Full experience:** serve the folder over HTTP, for example `npx serve .` or `python -m http.server`, and open `http://localhost:8000`. The pixel-art HUD sprites use CSS masks that browsers only load over HTTP, not from a `file://` page.

## Files

- `index.html`: the game engine, cards, discoveries, tutorial, home and end screens (HTML + plain JavaScript, no libraries).
- `style.css`: the pixel-art HUD, cards, album, final report and the responsive layout (portrait and landscape).
- `assets/scene/lunar-scene.js`: the animated lunar scene on a 256 × 88 pixel grid, including the action camera and `LunarScene.actionsFor`, which maps each choice to an animation.
- `assets/hud/`: icons, the HUD sprites, the Earth sprite, the cover art and the pixel font (`press-start-2p.ttf`, SIL Open Font License in `OFL.txt`).
- `assets/audio/`: sound file for the shelter run. The soundtrack and effects are synthesized in code.
- `tools/fetch-donki.mjs`, `tools/build-storms.mjs`, `tools/embed-storms.mjs`: download the DONKI data, merge it and embed it in the game.
- `tools/sim.mjs`, `tools/scene-test.mjs`, `tools/ui-test.html`, `tools/scene-ui-test.html`: balance test, scene tests and interface tests.
- `data/`: raw NASA JSON and the merged `storms.json`.
- `CONTEXTO.md`, `AGENTS.md`: internal project notes in Portuguese (team decisions and where we stopped).

## Tests

- `node tools/scene-test.mjs`: choice-to-animation routes, persistent states, completion of every sequence, the action camera and reduced motion.
- `node tools/sim.mjs 100`: simulation of the engine, independent of animations and screens.
- `tools/scene-ui-test.html` and `tools/ui-test.html`: browser tests of the scene and the interface; serve the repository over HTTP and open the page.
- The local `artes/` folder (art rules, references, drafts and captures) is excluded by `.gitignore`; the published game works without it.

## Ideas to continue

1. More real events from other years, and a mode that replays one real calendar window.
2. A voice or sound for the astronauts' calls during the alert.
3. Use RadLab (real ISS dosimetry) to compare the game's radiation with what real astronauts receive.
4. Mars mode: delayed communication (the order only arrives later).
5. Test swiping with a finger on real phones and run an accessibility pass (keyboard and screen reader) on the final report.
