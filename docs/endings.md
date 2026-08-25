# 结局总表 · All endings

《测测你适不适合在中国做企业主》共 **10 个结局**，两条路线各 5 个，共用同一套分数档位。

> 由 `tools/dump-endings.js` 从 `js/campaign-*.js` 生成。改完结局文案后重新运行 `npm run endings` —
> 不要直接编辑本文件，它会被覆盖。

最终分 = 答题正确率 × 0.75 + 合规 × 0.15 + 声誉 × 0.10

---

## 外国人来华创业 · Founding as a Foreigner

满分 62 分 · 8 章 + BOSS

### S 级 — 合规大师

**Compliance Master** · 触发条件：最终分 ≥ 88

你不只是活下来了，你活得很干净。签证、税务、劳动、数据，四条线都没有断。这样的外资企业主在中国其实不多——你大概率能把公司开过第三年，而大部分人倒在第二年的汇算清缴上。

> You did not merely survive, you survived clean. Visa, tax, labour and data — four threads, none of them frayed. There are not many foreign founders in China like this. You will probably make it past year three, which is more than can be said for the ones who fold during their second annual tax settlement.

### A 级 — 稳健创业者

**Steady Founder** · 触发条件：最终分 ≥ 72

底子很正，判断力在线。踩了几个小坑，但都不致命。建议：把你答错的那几关重看一遍，那通常就是未来找你麻烦的方向。再配一个靠谱的本地会计，你会省下大量时间。

> Solid instincts and sound judgement. You stepped in a few small holes, none of them fatal. Go back over the questions you got wrong — those are usually the exact directions trouble arrives from later. Pair yourself with a good local accountant and you will buy back a great deal of time.

### B 级 — 摸着石头过河

**Feeling for Stones** · 触发条件：最终分 ≥ 55

你能开起来，但走得磕磕绊绊。你的问题不是不努力，而是把"大家都这么干"当成了规则。在中国，很多"大家都这么干"的做法在被查到之前一直有效，被查到之后一次性清算。建议在花大钱之前先做一次合规体检。

> You can get a company running, but it will be a bumpy ride. Your problem is not effort — it is treating "everyone does it this way" as if it were the rule. In China a great many of those practices work perfectly until the day they are examined, and then they settle up all at once. Get a compliance health check before you spend serious money.

### C 级 — 高危选手

**High Risk** · 触发条件：最终分 ≥ 35

坦白说，现在开公司对你不是机会，是风险敞口。你在签证、发票和劳动合同上的几个选择，任何一个真实发生都足以让你在第一年结束前出局。好消息是：这些坑全部可以用一次律师咨询和一个像样的会计避开，成本远低于你以为的。

> Honestly, starting a company right now would be less an opportunity than an exposure. Several of your choices — on the visa, on invoices, on employment contracts — would each be enough on their own to end things before year one closes. The good news is that all of them can be avoided with one lawyer consultation and a competent accountant, for far less than you would guess.

### D 级 — 已被限制高消费

**Barred from High Consumption** · 触发条件：最终分 ≥ 0

游戏结束。你的公司被吊销执照，你作为法定代表人进了失信名单，机票买不了，高铁一等座坐不了，欠税未清前离境也受限。这个结局在现实里并不罕见，而且它几乎总是从一句"先干着，以后再补手续"开始的。回去把八个章节重玩一遍吧——这次读完每一条法律小贴士。

> Game over. The licence is revoked, you are on the defaulter list as legal representative, you cannot book a flight or a first-class rail seat, and with tax outstanding you may not be able to leave the country either. This ending is not rare in real life, and it almost always begins with the same sentence: "let us just start, we will sort the paperwork out later." Play the eight chapters again — and read every legal tip this time.

#### 各档实际落点

模拟 600 次 / 每个正确率档位。

| 正确率 | 平均分 | 结局分布 |
|---:|---:|---|
| 0% | 10 | D 100% |
| 10% | 16 | D 100% |
| 20% | 23 | C 3% · D 97% |
| 30% | 31 | B 2% · C 24% · D 74% |
| 40% | 41 | A 1% · B 12% · C 53% · D 35% |
| 50% | 54 | A 8% · B 40% · C 46% · D 6% |
| 60% | 66 | S 1% · A 34% · B 49% · C 15% |
| 70% | 77 | S 8% · A 69% · B 22% · C 2% |
| 80% | 86 | S 47% · A 51% · B 2% |
| 90% | 93 | S 88% · A 12% |
| 100% | 100 | S 100% |

---

## 一人公司 · The One-Person Company

满分 42 分 · 6 章 + BOSS

### S 级 — 干净的一人公司

**A Clean One-Person Company** · 触发条件：最终分 ≥ 88

你把公司和自己分得清清楚楚：钱走对公账户，账做得完整，拿钱走工资和分红，代码的来路说得清，AI 产品该备的案都备了。真到了穿透兽找上门那天，你能拿出证据——这就是有限责任真正生效的样子。一个人做公司不难，难的是一个人做得像个公司。

> You kept the company and yourself genuinely apart: money through the corporate account, books kept properly, cash taken as salary and dividends, a clear provenance for your code, and every filing your AI product needed. On the day something reaches through the company for you, you have the evidence — which is what limited liability actually looks like when it works. Running a company alone is not the hard part. Running it like a company is.

### A 级 — 稳的个体开发者

**A Steady Solo Developer** · 触发条件：最终分 ≥ 72

大方向都对，细节上有几处松。回头看看你答错的那几题——通常就是明年会来找你的那几件事。最值得先补的两件：把股东往来款清干净，把开源许可扫描接进发布流程。这两件加起来花不了一周。

> The big calls are right; a few details are loose. Look back at the questions you missed — they are usually the exact things that come looking for you next year. Two worth fixing first: clear out the shareholder balance, and put an open-source licence scan into your release pipeline. Together they are under a week of work.

### B 级 — 能跑，但墙上有裂缝

**Running, With Cracks in the Wall** · 触发条件：最终分 ≥ 55

产品在跑，钱也在进，但你和公司之间那道墙上有几条明显的裂缝：个人账户收过公司的钱，账上挂着说不清的股东往来，或者代码的来路你自己也没底。这些在顺利的时候完全看不出来，只在出事那一天同时显形。趁现在还没出事，去把账理一遍。

> The product runs and the money comes in, but there are visible cracks in the wall between you and the company: business money that landed in a personal account, a shareholder balance nobody can explain, or code whose provenance you are not sure of. None of this shows while things go well. All of it shows at once on the day they do not. Go and clean up the books while nothing has happened yet.

### C 级 — 这层壳形同虚设

**The Shell Is Not Doing Anything** · 触发条件：最终分 ≥ 35

你注册了公司，但从法律上看，它和你还是同一个人：钱混着走，账没有，凭证也没有。一旦有债权人主张连带责任，举证责任在你，而你什么都拿不出来。你现在的处境，和当初直接做个体户几乎没有区别——只是多交了一份注册费。好消息是这全都可以补，而且越早越便宜。

> You registered a company, but in the eyes of the law it is still you: money mixed, no books, no vouchers. The moment a creditor claims joint liability the burden falls on you, and you have nothing to produce. Your position is barely different from having stayed an individual household — you just paid a registration fee for it. The good news is that all of it is fixable, and the sooner the cheaper.

### D 级 — 判决：由你个人承担

**Judgment: Payable by You Personally** · 触发条件：最终分 ≥ 0

游戏结束。法院认定公司财产与你个人财产无法区分，你对公司债务承担连带责任；那笔挂了两年的股东借款被视同分红补税加罚；前东家那边还在等你回复。你注册公司时以为买到了一道防火墙，实际上从来没有把它砌起来。回去重玩一遍吧——尤其是第二章。

> Game over. The court found the company's property indistinguishable from your own and held you jointly liable for its debts; the shareholder loan that sat there for two years was taxed as a dividend with penalties on top; and your former employer is still waiting for a reply. You thought registering a company bought you a firewall. You never actually built one. Play it again — chapter two in particular.

#### 各档实际落点

模拟 600 次 / 每个正确率档位。

| 正确率 | 平均分 | 结局分布 |
|---:|---:|---|
| 0% | 4 | D 100% |
| 10% | 12 | D 100% |
| 20% | 19 | C 3% · D 97% |
| 30% | 28 | B 2% · C 20% · D 79% |
| 40% | 38 | A 1% · B 8% · C 46% · D 45% |
| 50% | 50 | A 5% · B 33% · C 48% · D 14% |
| 60% | 62 | S 1% · A 26% · B 46% · C 25% · D 2% |
| 70% | 73 | S 7% · A 53% · B 35% · C 5% |
| 80% | 83 | S 34% · A 54% · B 11% · C 1% |
| 90% | 92 | S 80% · A 20% |
| 100% | 100 | S 100% |
