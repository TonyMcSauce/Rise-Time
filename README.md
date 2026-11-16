# Rise Time

A daily weekday refresher for mechatronics and robotics. About 15 minutes each morning, Monday to Friday, over 12 core weeks (60 sessions) plus a 2 week optional extension (10 more).

In control systems, *rise time* is how quickly a system responds to a step. Here it's how quickly you get back up to speed.

## What's inside

- **Today:** the day's session, a weekday streak (weekends never break it), programme progress and mastery bars for each topic.
- **Sessions:** each one has four parts:
  1. **Warm-up:** three spaced-review questions from earlier sessions, with your weakest coming back first
  2. **Learn:** a short lesson with schematics, diagrams and a live simulator on key days
  3. **Work it:** a worked example you reveal step by step, then problems with instant feedback
  4. **On the plant:** how the topic shows up on real equipment
- **Map:** all 14 weeks at a glance.
- **Lab:** interactive instruments, including:
  - phasor and sine wave
  - rotation matrix
  - voltage divider with loading
  - RC rise time
  - PID loop tuner
  - two-link robot arm with inverse kinematics
- **Drill:** five quick questions, starting with the ones you find hardest.

All 14 weeks are written in full, with a worked example, graded questions, hints, watch-outs and formulas for every session.

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

## Update 1.1

- Weeks 4 to 6 are live: AC power, op amps, resonance, diodes and rectifiers, transistors, PWM and H-bridges, three-phase power, RTDs and thermocouples, filters, encoders, ADCs. 30 of 60 sessions now have full content.
- Formula sheet (`#sheet`): searchable and offline. Formulas appear as sessions unlock, with always-on reference tables (prefixes, 4-20 mA, Pt100, thermocouples, colour code, E12, synchronous speeds).
- Hints on every question, "Watch out" boxes on every session, answers accept prefixes (4.7k, 54.5m, 680u).
- Stats page (`#stats`), a "Redo this session's questions" button, nine new lab instruments, and a new motion system (staggered entrances, drawn-in schematics, count-ups, feedback animations).
- A correct answer after a hint counts, but the question returns sooner in your warm-ups.
- Service worker is `rise-time-v1.1.0`. Bump it whenever you deploy file changes.

## Update 1.2

Weeks 7 to 9 are in (sessions 31 to 45): Laplace and transfer functions, first and second order responses, poles and stability, PID and tuning, DC motors, induction motors and VSDs, hydraulics, PLC scan cycle, ladder patterns, and interlocks and safety. Nine new diagrams, plus hints, watch-outs and formulas for every new session. Weeks 10 to 12 (robot kinematics, embedded, comms and fault finding) are next.

## Update 1.3

Weeks 10 to 12 complete the course (sessions 46 to 60): frames and transforms, forward and inverse kinematics, the Jacobian; microcontrollers, timers and interrupts, UART, I²C and SPI, Modbus and RS-485; and four fault-finding sessions (conveyor drive, hydraulic circuit, oscillating loop, robot cell) ending with a final review. Nine new diagrams, hints, watch-outs and formulas throughout. The existing two-link arm lab is used for the kinematics sessions.

## Update 1.4

- **Weeks 13 and 14 (sessions 61 to 70), optional extension:** PLC sequences and state machines, analogue scaling and alarms with deadband, counting and totalising, level, flow and pressure measurement; then a Safety and reliability channel: risk assessment and performance levels, electrical safety and isolation, reliability and availability, maintenance and condition monitoring. Each week ends with a review.
- **Three new labs:** second-order response (damping and natural frequency against overshoot, peak and settling time), DC motor torque-speed (with stall), and a hydraulic cylinder (force, speed, relief valve heat). They are linked from weeks 7, 8, 9 and 12.
- **Capstone exam:** 20 questions across every channel you have opened, scored by channel with the sessions worth revisiting. History shows on the Stats page. Open it from the Drill page footer or press `g` then `e`.
- **Weekly mixed review:** each Friday review opens with a warm-up drawn from the whole week.
- **Plant log and notes:** a note box on every session, and a Plant log page (`#log`) with tags, search, copy and download. Notes are saved and restored with your progress backup.
- **Formula sheet:** filter by phase, and print or save as PDF with print-friendly styles.
- **Settings (gear icon):** dark scope or light paper theme (or match the device), a morning reminder, and a keyboard shortcut list (`?`).
- **Reminders:** a notification where the browser supports background sync (installed Chromium apps), plus a repeating weekday calendar file that works everywhere. iPhones do not allow background notifications for web apps, so use the calendar file there.

Progress, notes and exam history live on each device. Use Back up and Restore in the page footer to move them between your laptop and phone.
