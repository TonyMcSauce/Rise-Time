# Rise Time

A daily weekday refresher for mechatronics and robotics. About 15 minutes each morning, Monday to Friday, over 12 weeks and 60 sessions.

In control systems, *rise time* is how quickly a system responds to a step. Here it's how quickly you get back up to speed.

## What's inside

- **Today:** the day's session, a weekday streak (weekends never break it), programme progress and mastery bars for each topic.
- **Sessions:** each one has four parts:
  1. **Warm-up:** three spaced-review questions from earlier sessions, with your weakest coming back first
  2. **Learn:** a short lesson with schematics, diagrams and a live simulator on key days
  3. **Work it:** a worked example you reveal step by step, then problems with instant feedback
  4. **On the plant:** how the topic shows up on real equipment
- **Map:** all 12 weeks at a glance.
- **Lab:** six interactive tools:
  - phasor and sine wave
  - rotation matrix
  - voltage divider with loading
  - RC rise time
  - PID loop tuner
  - two-link robot arm with inverse kinematics
- **Drill:** five quick questions, starting with the ones you find hardest.

Weeks 1 to 3 (maths and circuits) are written in full. Weeks 4 to 12 are planned topic by topic and still need their lessons written.

## Works offline (PWA)

Rise Time is a Progressive Web App:

- A service worker (`sw.js`) caches the whole app, including fonts, the first time you open it. After that it runs with no connection.
- Progress is saved on the device in `localStorage`, and the app asks the browser to keep that storage.
- You can install it to the home screen or desktop:
  - **iPhone:** in Safari, tap Share, then Add to Home Screen
  - **Android:** in Chrome, open the menu, then tap Install app
  - **Laptop:** in Chrome or Edge, click the install icon in the address bar

### Moving progress between devices

Each device keeps its own progress. To move it to another device:

1. In the footer on the first device, tap **Back up progress**. This saves a `.json` file.
2. On the other device, tap **Restore** and choose that file.

## Deploying on GitHub Pages

1. In this repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**.
3. Pick the **main** branch and the **/ (root)** folder, then click Save.
4. After a minute or so the app goes live at `https://tonymcsauce.github.io/Rise-Time/`.

All paths are relative, so the app works from that subfolder as it is.

### Shipping an update

After changing any file, bump `VERSION` in `sw.js` (for example `rise-time-v1.0.1`). Installed copies download the new files in the background and show a **Reload** prompt.

## Project structure

```
index.html              app shell
css/style.css           styling, with the fonts bundled locally
js/content.js           curriculum: sessions, questions, diagrams, outline for weeks 4-12
js/app.js               app logic: routing, progress tracking, spaced review, simulators
sw.js                   service worker for offline use
manifest.webmanifest    install metadata
icons/                  app icons
fonts/                  Chakra Petch, IBM Plex Sans and Martian Mono (SIL Open Font License)
```

## Adding a new session

Add an object to `SESSIONS` in `js/content.js`. Its `id` is `(week − 1) × 5 + day`. Give it:

- `learn`: the lesson HTML
- `pins`: the key points to remember
- `worked`: the worked example
- `tryit`: the questions
- `plant`: the "On the plant" section
- optionally a `diagram` and a `sim`

Once a session exists, it takes the place of that week's outline entry automatically.

Number questions use `num(id, question, answer, unit, explanation, tolerance)`, and multiple-choice questions use `mcq(id, question, choices, correctIndex, explanation)`. Every question id must be unique, because progress tracking is keyed on it.
