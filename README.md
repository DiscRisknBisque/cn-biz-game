# 测测你适不适合在中国做企业主

**Can You Really Run a Business in China?** — a pixel-art mobile web game about
the law a foreigner needs to know to start a company in China.

You land in China with a business plan and whatever visa happens to be in your
passport — tourist, student or business. Eight chapters later you either have a
company that survives its first annual audit, or you are on the judgment-defaulter
list and cannot book a flight home. Every question is a real decision, every
answer is followed by the rule that actually governs it and a citation you can
go and read.

Chinese by default, English one tap away. No build step, no dependencies, no
image or audio files — open `index.html` and play.

---

## Playing it

```bash
python3 -m http.server 8123    # or: npm run serve
```

Then open <http://localhost:8123>. Opening `index.html` straight off the disk
works too — everything is plain `<script>` tags, so there is no module/CORS
problem to trip over.

Designed portrait-first for a phone; on a desktop it sits in a console frame in
the middle of the window. Progress is saved to `localStorage`.

## What's in it

Eight chapters, then a four-question boss. Chapter 1 runs to six scenarios
because visa status is where most people go wrong before they start; the rest
are three each:

| # | Chapter | Ground covered |
|---|---------|----------------|
| 1 | 落地 Landing | Owning vs working, students on X1 visas, tourist and visa-free entry, the Work Permit Notice chain, A/B/C grading, legal reps living abroad |
| 2 | 立业 Setting Up | WFOE vs JV vs rep office, the negative list, registered capital under the 2024 Company Law |
| 3 | 印章 The Chop | Chop custody, legal representative liability, business scope and invoicing |
| 4 | 钱流 Money In, Money Out | Capital accounts, use restrictions on converted capital, profit repatriation and withholding tax |
| 5 | 税务 Tax | Fapiao as a deduction voucher, zero-returns, the 183-day and six-year rules |
| 6 | 用人 Hiring | Written contracts and double wages, probation caps, mandatory social insurance |
| 7 | 护城河 The Moat | First-to-file trademarks, squatters, copyright vs patent vs trade secret |
| 8 | 数据 Data | ICP recordal, PIPL cross-border transfer, buying personal data |
| ★ | 年终大考 The Annual Review | False invoicing, surviving an audit, labour arbitration, deregistration |

### The Law Dex

Seventeen creatures, caught three different ways:

- **Ten chapter creatures** (No.001–010), caught by clearing a chapter above its
  threshold. Fall short and it escapes, leaving only a "seen" record.
- **Six rare encounters** (No.011–016) — 双倍工资鬼, 抢注鸦, 虚开鬼, 限高锁,
  负面清单蛇, 出境门. Each is released by getting one specific question right, so
  they reward precision rather than an aggregate score, and stay catchable on a
  replay if you missed them.
- **One secret** (No.017), which appears the moment the other sixteen are caught.
  It is the punchline of the whole game.

Clear a chapter with a flawless score and its creature turns **✦ shiny** — a
hue-rotated palette of the same sprite. That is the reason to go back to a
chapter you merely passed.

Every dex page is a Pokédex-style sheet: number, type, where it is found, danger
and rarity ratings, the flavour entry, and — the useful part — **弱点 WEAK TO**,
the practical countermeasure. A completed dex is a checklist of everything that
actually protects you.

Four stats track the run — 资金 cash, 合规 compliance, 声誉 reputation,
精力 energy. Between chapters the quarter closes: you rest, the company books
revenue scaled to how well you played, and if compliance has slipped the
regulator sends a bill and you spend the next quarter firefighting.

Five endings, from 合规大师 (Compliance Master) down to 已被限制高消费
(Barred from High Consumption).

> **This is educational, not legal advice.** The content summarises publicly
> available Chinese law, and the rules move — tax reliefs, FX quotas and the
> negative list change often. Before acting, talk to a licensed PRC lawyer or
> accountant and check the current official text. The disclaimer is in the game
> too, on the About screen and again at the end.

## Layout

```
index.html          markup and script tags — that's the whole shell
css/style.css       pixel UI; light and dark, mobile first
js/pixel.js         sprite data as character grids, canvas renderer, shiny palette
js/audio.js         chiptune SFX synthesised from oscillators
js/content.js       every scene, tip, citation, dex entry and ending, in zh and en
js/balance.js       the numbers, kept separate so they can be simulated
js/game.js          state machine and rendering
tools/simulate.js   plays the game headlessly; checks content and balance
tools/e2e.js        drives the real game in a real browser
```

### Art

There are no image files. Each of the twenty sprites is a grid of characters
against a shared 27-colour palette in `js/pixel.js`, painted to a canvas and
scaled up with `image-rendering: pixelated`:

```js
visa: [
  '................',
  '....KKKKKKKK....',
  '...KRRRRRRRRK...',
  ...
]
```

`Pixel.validate()` runs on load and warns in the console about any row of the
wrong width or any character not in the palette — `npm run sim` checks the same
thing without a browser. It is the only way hand-authoring these stays sane.

Shiny variants are not separate art. `shinyPalette()` converts every palette
colour to HSL and rotates its hue, sending greys and whites to gold instead
since they have no hue to turn. Every creature gets a variant that still reads
as itself, and a new creature gets one for free.

### Content

Scenes live in `js/content.js`. Each choice carries a `score` — 2 is the right
call, 1 is survivable but costly, 0 is how people get hurt — plus `fx` deltas
for the four stats, a `verdict`, a `tip` explaining the actual rule, and a `law`
citation. To add a scene, append to a chapter's `scenes` array; nothing else
needs to change.

The `fx` numbers are deliberately written by feel. `js/balance.js` damps them
per stat so they survive 31 scenes on a 0–100 bar, which means you can write
"this wrecks your compliance" without holding a spreadsheet in your head.

## Testing

```bash
npm run sim     # headless playthroughs + content validation, no deps needed
npm install     # only needed for the browser test
npm run e2e     # drives the real game (expects `npm run serve` running)
```

`npm run sim` validates the content — every scene bilingual, with at least two
choices and a right answer; every dex entry complete; every rare reachable from
exactly one scene; every sprite row the right width — then plays the whole game
under four strategies:

```
best      grade S  score 100  pts 62/62   cash 154  compliance 100  reputation 100  energy  72
cheapest  grade D  score   7  pts  6/62   cash   0  compliance   0  reputation   0  energy   0
worst     grade D  score   1  pts  1/62   cash   0  compliance   0  reputation   0  energy   0
random    grade B:4% C:33% D:63%  score 34  pts 26/62   cash  76  compliance  11  reputation  10  energy  43
```

Run it after touching any `fx` value or anything in `balance.js` — it is much
faster than discovering by hand that a perfect run ends broke and exhausted.

## Browser support

Anything current. It uses `color-mix()` in CSS and `Object.assign` in JS, so
roughly Safari 16.2+, Chrome 111+, Firefox 113+. Sound needs a tap first, as
browsers require; `prefers-reduced-motion` turns off the bobbing and the
typewriter caret.

## Licence

MIT.
