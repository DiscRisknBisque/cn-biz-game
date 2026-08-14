# 测测你适不适合在中国做企业主

**Can You Really Run a Business in China?** — a pixel-art mobile web game about
the law you need to know to run a company in China.

Two routes, two kinds of founder:

- **外国人来华创业** — you land with a business plan and whatever visa happens to
  be in your passport. Eight chapters later you either have a company that
  survives its first annual audit, or you are on the judgment-defaulter list and
  cannot book a flight home.
- **一人公司** — you built something with AI, people started paying for it, and
  you have not registered anything. Six chapters on the one rule that catches
  almost every solo founder: for a single-shareholder company, proving your money
  is separate from the company's is *your* job, not the creditor's.

Every question is a real decision, every answer is followed by the rule that
actually governs it and a citation you can go and read.

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

52 scenarios across two routes. Progress is tracked per route; both fill the
same dex.

### 外国人来华创业 — Founding as a Foreigner

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

### 一人公司 — The One-Person Company

Written for the solo builder shipping with AI. Six chapters, then a three-part
boss where somebody reaches past the company for you personally:

| # | Chapter | Ground covered |
|---|---------|----------------|
| 1 | 开张 Going Live | Individual household vs sole proprietorship vs single-shareholder company; what the 2024 Company Law changed for OPCs (no more one-per-person limit, no more mandatory audit, five-year paid-in capital) |
| 2 | 防火墙 The Firewall | Art. 23(3): the reversed burden of proof; shareholder loans deemed dividends at year end; why business money must never touch a personal wallet |
| 3 | 记账 The Books | The two tax layers of a company vs one for an individual household; the tightening of assessed collection; small-scale VAT thresholds and special invoices |
| 4 | 代码 The Code | Works made in employment and non-competes for the night-and-weekend founder; copyright in AI-generated output; GPL copyleft arriving via AI completion |
| 5 | 上线 Shipping It | Generative AI security assessment and algorithm filing; the 2025 labelling rules; ICP and app filings; PIPL for a one-person team |
| 6 | 收摊 Winding Down | Zombie entities; directors as liquidation obligors; why deregistration does not extinguish debts |
| ★ | 穿透 Piercing the Veil | Defending joint liability, the shareholder receivable in a tax interview, a demand letter from your former employer |

### The Law Dex

Twenty-nine creatures across both routes, numbered continuously, caught three
different ways:

- **Chapter creatures**, caught by clearing a chapter above its threshold. Fall
  short and it escapes, leaving only a "seen" record.
- **Ten rare encounters** — 双倍工资鬼, 抢注鸦, 虚开鬼, 限高锁, 负面清单蛇,
  出境门 on the foreign route; 借款鬼, 职务影, 传染藤, 标识印 on the solo route.
  Each is released by getting one specific question right, so they reward
  precision rather than an aggregate score, and stay catchable on a replay.
- **One secret per route** — 律师 and 会计师 — each appearing the moment
  everything else on that route is caught. They are the punchline.

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

Each route has its own five endings — 合规大师 down to 已被限制高消费 on one,
干净的一人公司 down to 判决：由你个人承担 on the other.

### Risk disclosure

This is educational, not legal advice — and the game says so in four places
rather than burying it in an About screen:

- **A risk notice before the first game.** A full screen, not a modal: the game
  cannot assess your situation, the content has a shelf life, the grades are
  entertainment, and one consultation costs less than the fix. It has to be
  acknowledged once, and stays reachable from the ⚠ chip in the top bar.
- **Per-scene risk categories.** Every one of the 52 scenes is tagged with the
  kind of trouble it is about — 刑事 criminal, 税务 tax, 行政 regulatory,
  民事 civil, 资格 status — shown as colour-coded badges with the actual
  consequence spelled out. This is the difference between a mistake that costs a
  fine and one that costs a criminal record, and it is the single most useful
  thing here after the citations.
- **Volatility flags.** Six scenes rest on time-limited policy — VAT thresholds,
  assessed collection, the negative list, cross-border data thresholds, visa-free
  entry, the AI labelling rules. Those carry a ⚠ 政策易变 marker telling you to
  check the current announcement.
- **A content-as-of date**, shown on the notice, the About screen and the result.

The result screen ends with concrete next steps for that route rather than a
generic "consult a professional", and the shareable result string carries the
disclaimer with it so a screenshot cannot read as a compliance certificate.

## Layout

```
index.html             markup and script tags — that's the whole shell
css/style.css          pixel UI; light and dark, mobile first
js/pixel.js            sprite data as character grids, canvas renderer, shiny palette
js/audio.js            chiptune SFX synthesised from oscillators
js/campaign-foreign.js the 外国人来华创业 route
js/campaign-solo.js    the 一人公司 route
js/content.js          shared UI strings, and the campaign list
js/balance.js          the numbers, kept separate so they can be simulated
js/game.js             state machine and rendering
tools/simulate.js      plays every route headlessly; checks content and balance
tools/e2e.js           drives the real game in a real browser
```

### Art

There are no image files. Each of the thirty-two sprites is a grid of characters
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

Scenes live in the `campaign-*.js` files. Each choice carries a `score` — 2 is
the right call, 1 is survivable but costly, 0 is how people get hurt — plus `fx`
deltas for the four stats, a `verdict`, a `tip` explaining the actual rule, and a
`law` citation. To add a scene, append to a chapter's `scenes` array; nothing
else needs to change.

A campaign is self-contained: chapters, a boss, dex metadata, rare encounters, a
secret and its own endings. **Adding a third route means adding one file and one
entry in `CAMPAIGNS` — the engine does not change.** Rare encounters are wired up
by putting `rare: 'someId'` on the scene that releases them; `npm run sim` fails
if one is unreachable, triggered twice, or missing its art.

Every scene also carries `risk: ['criminal', 'tax', ...]` and, where the rule
rests on time-limited policy, `volatile: true`. The categories are defined once
in `content.js` alongside `AS_OF`, the date the legal content was last reviewed
— **update that date whenever you touch the law**, since it is what the game
shows players when it tells them the content has a shelf life.

The `fx` numbers are deliberately written by feel. `js/balance.js` damps them
per stat so they survive a whole route on a 0–100 bar, which means you can write
"this wrecks your compliance" without holding a spreadsheet in your head.

## Testing

```bash
npm run sim     # headless playthroughs + content validation, no deps needed
npm install     # only needed for the browser test
npm run e2e     # drives the real game (expects `npm run serve` running)
```

`npm run sim` validates the content — every scene bilingual, with at least two
choices and a right answer; every scene tagged with known risk categories; every
dex entry complete and its id unique across routes; every rare reachable from
exactly one scene; every referenced sprite present and every row the right width
— then plays each route under four strategies:

```
foreign — Founding as a Foreigner  (8 chapters, 62 points)
  best      grade S  score 100  pts 62/62   cash 154  compliance 100  reputation 100  energy  72
  cheapest  grade D  score   7  pts  6/62   cash   0  compliance   0  reputation   0  energy   0
  worst     grade D  score   1  pts  1/62   cash   0  compliance   0  reputation   0  energy   0
  random    grade B:3% C:42% D:55%  score 35  pts 26/62   cash  82  compliance  12  reputation  11  energy  45
  a perfect run releases 6/6 rares
  risk tags  admin:18  civil:12  criminal:6  status:4  tax:7   ·  3 scenes flagged as policy-volatile

solo — The One-Person Company  (6 chapters, 42 points)
  best      grade S  score 100  pts 42/42   cash 128  compliance 100  reputation 100  energy  69
  cheapest  grade D  score   4  pts  2/42   cash  15  compliance   0  reputation   0  energy  14
  worst     grade D  score   0  pts  0/42   cash   0  compliance   0  reputation   0  energy  19
  random    grade B:2% C:30% D:69%  score 31  pts 16/42   cash  66  compliance  11  reputation  13  energy  44
  a perfect run releases 4/4 rares
  risk tags  admin:5  civil:12  criminal:3  status:1  tax:8   ·  3 scenes flagged as policy-volatile
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
