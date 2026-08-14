/*
 * campaign-foreign.js — the 外国人来华创业 route.
 *
 * Eight chapters plus an annual-review boss, for someone arriving in China to
 * found a company. Each scene is a real decision, three plausible ways to
 * answer it, and the rule that actually governs the outcome; `law` cites the
 * instrument so a player can go and read the source.
 *
 * score: 2 = the right call, 1 = survivable but costly, 0 = how people get hurt.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CampaignForeign = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CHAPTERS = [
    /* ================================================================== 1 */
    {
      id: 'visa',
      monster: 'visa',
      name: { zh: '签证兽', en: 'VISAMON' },
      title: { zh: '落地', en: 'Landing' },
      subtitle: { zh: '签证身份与工作许可', en: 'Visa status & work permits' },
      dexNote: {
        zh: '看起来人畜无害，实则决定你能不能合法待在这里。惹怒它的人通常在机场才发现问题。',
        en: 'Looks harmless. Decides whether you may legally be here at all. Most people who anger it find out at the airport.'
      },
      intro: {
        zh: '你拖着行李落地了。手机里是一份商业计划书——而护照里那张签证，可能是旅游签、留学签，也可能是商务签。它决定了你接下来能做什么。',
        en: 'You land with a suitcase and a business plan. The visa in your passport might be a tourist visa, a student visa or a business visa — and which one it is decides what you may do next.'
      },
      scenes: [
        {
          prompt: {
            zh: '你还在犹豫来中国用什么签证。有人告诉你："必须先拿到工作签证，才能注册公司当股东。"',
            en: 'You are still deciding which visa to come in on. Someone tells you: "You need a work visa before you can register a company and be a shareholder."'
          },
          choices: [
            {
              text: { zh: '不对——投资和就业是两件事。做股东不看签证类型，但要在境内实际上班就要工作许可', en: 'Wrong — investing and working are two different things. Shareholding does not turn on your visa; actually working here does' },
              score: 2, fx: { cash: 0, comp: 14, rep: 4, energy: -2 },
              verdict: { zh: '正确。分清这两件事，能省下大量无用的焦虑和中介费。', en: 'Correct. Separating the two saves a great deal of pointless anxiety and agent fees.' }
            },
            {
              text: { zh: '对，先办 Z 字签证和工作许可，再去注册公司', en: 'Right — get the Z visa and work permit first, then register the company' },
              score: 1, fx: { cash: -6, comp: 2, rep: 0, energy: -8 },
              verdict: { zh: '顺序反了。工作许可要由已经存在的用人单位来申请。', en: 'Backwards. The work permit is applied for by an employer that already exists.' }
            },
            {
              text: { zh: '签证类型无所谓，注册完就能上班', en: 'The visa does not matter — once it is registered you can start working' },
              score: 0, fx: { cash: 2, comp: -20, rep: -8, energy: -2 },
              verdict: { zh: '前半句对，后半句会让你构成非法就业。', en: 'The first half is right. The second half is illegal employment.' }
            }
          ],
          tip: {
            zh: '外国自然人可以直接作为外商投资企业的股东，法律没有要求你持哪一类签证，甚至没有要求你人在中国——设立时提交经公证认证的护照身份证明即可。签证管的是"你能不能在中国做事"，不是"你能不能拥有股权"。但只要你在境内实际到岗、履职、领薪，无论你是不是老板，都需要工作许可和工作类居留许可。顺序通常是：先设立公司 → 公司作为用人单位为你申请《外国人工作许可通知》→ 你办 Z 字签证。',
            en: 'A foreign individual can be a shareholder of a foreign-invested enterprise directly. No particular visa class is required, and you need not even be in China — notarised and legalised passport identification is what the registration needs. A visa governs what you may *do* in China, not what you may *own*. But the moment you actually take up a post, carry duties and draw pay here — owner or not — you need a work permit and a work-type residence permit. The usual order is: incorporate first, then the company applies for your Work Permit Notice as your employer, then you get the Z visa.'
          },
          law: {
            zh: '《外商投资法》第2条；《市场主体登记管理条例》；《外国人在中国就业管理规定》第2条、第5条',
            en: 'Foreign Investment Law, art. 2; Regulations on Registration of Market Entities; Rules on the Administration of Employment of Foreigners in China, arts. 2 & 5'
          }
        },
        {
          prompt: {
            zh: '你是在华留学生，持 X1 签证和学习类居留许可。你和同学做的项目开始有收入了，你想在自己参与创办的公司里干活并领报酬。',
            en: 'You are an international student in China on an X1 visa with a study residence permit. The project you built with classmates is earning money, and you want to work at the company you co-founded and be paid for it.'
          },
          choices: [
            {
              text: { zh: '不行。留学生校外勤工助学或实习须经学校同意并在居留证件上加注；真要创业得另走留学生创业或工作许可路径', en: 'Not like that. Off-campus work or internships need the school\'s consent and an endorsement on your residence permit; actually founding a company needs the student-entrepreneur or work-permit route' },
              score: 2, fx: { cash: -4, comp: 16, rep: 6, energy: -8 },
              verdict: { zh: '正确。留学生违反勤工助学规定工作，法律上明确列为非法就业。', en: 'Correct. A student working outside those rules is expressly listed as illegal employment.' }
            },
            {
              text: { zh: '学生签证可以自由打工，只要不耽误学习', en: 'A student visa lets you work freely as long as your studies do not suffer' },
              score: 0, fx: { cash: 4, comp: -22, rep: -10, energy: -2 },
              verdict: { zh: '这是留学生最常见的误解，代价可能是学业和居留资格一起没了。', en: 'The most common misconception among students — and it can cost you both your place and your residence.' }
            },
            {
              text: { zh: '先不领报酬，只干活，等毕业再说', en: 'Work now, take no money, sort it out after graduation' },
              score: 1, fx: { cash: 0, comp: -6, rep: -2, energy: -6 },
              verdict: { zh: '不领钱不等于不算工作，认定看的是有没有实际从事劳动。', en: 'Not being paid does not mean not working. What counts is whether you actually performed the work.' }
            }
          ],
          tip: {
            zh: '留学生在校外勤工助学或实习的，应当经所在学校同意，并向出入境管理机构申请在居留证件上加注勤工助学或实习的地点和期限；超出加注范围或时限工作的，法律直接定性为非法就业。想真正创业，路径有两条：① 不少城市（如北京中关村、上海、粤港澳大湾区等）对符合条件的外国留学生开放加注"创业"的私人事务类居留许可，凭创业计划书和学校推荐申请；② 毕业后走正规工作许可——《外国人来华工作分类标准》对具有硕士及以上学位的优秀外国高校和中国高校毕业生，可以豁免通常要求的 2 年工作经历。各地政策差异很大，先问当地出入境管理部门。',
            en: 'A student doing off-campus paid work or an internship must have the school\'s consent and must apply to the exit-entry authority for an endorsement on the residence permit recording the place and period. Working beyond what the endorsement covers is classified as illegal employment outright. To actually found a company there are two routes: (1) a number of cities — Zhongguancun in Beijing, Shanghai and the Greater Bay Area among them — offer eligible international students a private-affairs residence permit endorsed for entrepreneurship, granted on a business plan and a recommendation from the school; (2) after graduating, take the ordinary work permit route — the classification standards waive the usual two years of experience for strong graduates holding a master\'s degree or above from a Chinese or overseas university. Local practice varies a great deal, so ask your local exit-entry bureau first.'
          },
          law: {
            zh: '《出境入境管理法》第42条、第43条第(三)项；《学校招收和培养国际学生管理办法》第30条；《外国人来华工作分类标准（试行）》',
            en: 'Exit and Entry Administration Law, arts. 42 & 43(3); Measures for the Administration of Enrolment and Education of International Students, art. 30; Classification Standards for Foreigners Working in China (Trial)'
          }
        },
        {
          prompt: {
            zh: '你这次是持 L 字（旅游）签证入境的——或者干脆是免签入境。你打算顺便见几个客户、看看办公室、把合同签了。',
            en: 'This time you came in on an L (tourist) visa — or visa-free. While you are here you plan to meet a few customers, view an office and sign the contract.'
          },
          choices: [
            {
              text: { zh: '商务活动应当持 M 字签证；用旅游或免签身份谈生意、签约属于与停留事由不符', en: 'Business calls for an M visa. Negotiating and signing while here as a tourist or visa-free does not match your stated purpose of stay' },
              score: 2, fx: { cash: -6, comp: 16, rep: 6, energy: -6 },
              verdict: { zh: '正确。免签方便的是入境，不是放宽了你能做的事。', en: 'Correct. Visa-free entry makes arriving easier; it does not widen what you may do once here.' }
            },
            {
              text: { zh: '只要不在中国领工资，持旅游签谈生意没问题', en: 'As long as no Chinese salary is involved, doing business on a tourist visa is fine' },
              score: 0, fx: { cash: 4, comp: -18, rep: -8, energy: -2 },
              verdict: { zh: '"有没有领工资"是就业的判断标准之一，不是停留事由的判断标准。', en: 'Whether you were paid goes to employment. It is not the test for whether your activity matched your purpose of stay.' }
            },
            {
              text: { zh: '先用 L 签进来，到了再在境内申请改成 M 签', en: 'Come in on the L visa and switch it to an M visa once you are here' },
              score: 1, fx: { cash: -4, comp: -4, rep: 0, energy: -8 },
              verdict: { zh: '境内一般只能延期，不能随意变更签证类别，别把行程压在这上面。', en: 'In-country you can generally extend, not freely change class. Do not build your itinerary on it.' }
            }
          ],
          tip: {
            zh: 'L 字签证发给入境旅游的人员，M 字签证发给入境进行商业贸易活动的人员。外国人在中国境内不得从事与停留居留事由不相符的活动，违反的可被处限期出境甚至罚款、拘留。近年中国对多国实行单方面免签和过境免签（如 240 小时过境免签），但免签解决的是"入境手续"，你入境后能做什么仍受停留事由约束——考察、参观通常没问题，正式洽谈、签约、参展应当持 M 字签证。签证类别在境内一般不予变更，需要换类别通常要出境重新申请。',
            en: 'The L visa is issued for tourism, the M visa for commercial and trade activities. A foreigner in China may not engage in activities inconsistent with their stated purpose of stay; breaching that can bring an order to leave within a time limit, and in some cases a fine or detention. China has extended unilateral visa-free entry to many countries in recent years, along with transit exemptions of up to 240 hours — but visa-free entry solves the paperwork of arriving, not the limits on what you may do once inside. Looking around and visiting are generally fine; formal negotiation, signing and exhibiting call for an M visa. Visa classes are generally not changed in-country; switching normally means leaving and applying again.'
          },
          law: {
            zh: '《出境入境管理法》第16条、第39条、第80条；《外国人入境出境管理条例》第6条',
            en: 'Exit and Entry Administration Law, arts. 16, 39 & 80; Regulations on the Administration of Entry and Exit of Foreigners, art. 6'
          }
        },
        {
          prompt: {
            zh: '公司注册好了。不管你现在持的是 M、L 还是 X 签证，你打算下周就到自己的公司正式上班、领工资。怎么办？',
            en: 'The company is registered. Whatever you hold right now — M, L or X — you plan to start working at it next week, on payroll. What do you do?'
          },
          choices: [
            {
              text: { zh: '先办《外国人工作许可通知》，出境换 Z 字签证再回来', en: 'Get the Work Permit Notice first, leave, come back on a Z visa' },
              score: 2, fx: { cash: -6, comp: 14, rep: 4, energy: -10 },
              verdict: { zh: '慢，但这是唯一干净的路径。', en: 'Slow, and the only clean route.' }
            },
            {
              text: { zh: '反正是自己的公司，先干着，签证到期再说', en: "It's my own company — just start working, sort the visa out later" },
              score: 0, fx: { cash: 4, comp: -22, rep: -10, energy: -4 },
              verdict: { zh: '这叫非法就业，罚款、拘留、遣返、限期不得入境都可能。', en: 'That is illegal employment: fines, detention, deportation, and a re-entry ban are all on the table.' }
            },
            {
              text: { zh: '不出境，直接在境内申请变更为工作类居留许可', en: 'Skip the trip out and apply to change status to a work residence permit from inside China' },
              score: 1, fx: { cash: -4, comp: 2, rep: 0, energy: -8 },
              verdict: { zh: '个别城市对高端人才确有境内变更政策，但不是通例，别默认自己可以。', en: 'A few cities do allow in-country conversion for high-end talent, but it is the exception. Never assume you qualify.' }
            }
          ],
          tip: {
            zh: '合法工作的标准链条是：用人单位在网上申请《外国人工作许可通知》→ 你在境外使领馆凭通知办 Z 字签证 → 入境后 30 日内换领《外国人工作许可证》和工作类居留许可。持 L（旅游）、M（商务）、X（学习）签证在华工作，都属于非法就业，公司和个人都要挨罚——个人可处 5000 至 20000 元罚款，情节严重的处拘留并可限期出境；用人单位按每非法聘用一人 1 万元、总额不超过 10 万元处罚。',
            en: 'The clean chain is: your employer files online for a Work Permit Notice → you take that notice to a PRC consulate abroad and get a Z visa → within 30 days of entry you swap it for the Work Permit card and a work-type residence permit. Working on an L (tourist), M (business) or X (study) visa is illegal employment in each case, and both you and the company are fined — the individual RMB 5,000 to 20,000, with detention and an order to leave in serious cases; the employer RMB 10,000 per person illegally engaged, capped at RMB 100,000.'
          },
          law: {
            zh: '《出境入境管理法》第41条、第80条；《外国人来华工作许可服务指南》',
            en: 'Exit and Entry Administration Law, arts. 41 & 80; Service Guide for Foreigners Working in China'
          }
        },
        {
          prompt: {
            zh: '办工作许可时，系统要给你评一个类别：A、B 还是 C。这个类别意味着什么？',
            en: 'Your work permit application gets graded A, B or C. What does the grade actually decide?'
          },
          choices: [
            {
              text: { zh: '只是统计口径，对办事没影响', en: 'Nothing much — just a statistical label' },
              score: 0, fx: { cash: 0, comp: -10, rep: -2, energy: -2 },
              verdict: { zh: '差别很大：A 类走绿色通道，C 类有配额和限制。', en: 'It matters a lot. A gets a fast lane; C is quota-controlled.' }
            },
            {
              text: { zh: 'A 类高端人才、B 类专业人才、C 类其他人员，待遇和难度不同', en: 'A = high-end talent, B = professionals, C = other — different speed, different odds' },
              score: 2, fx: { cash: 0, comp: 12, rep: 4, energy: -4 },
              verdict: { zh: '正确。学历、薪资、工作年限、年龄都会进评分表。', en: 'Right. Degree, salary, years of experience and age all feed the points table.' }
            },
            {
              text: { zh: '花钱可以买 A 类', en: 'You can pay to be graded A' },
              score: 0, fx: { cash: -12, comp: -18, rep: -12, energy: -4 },
              verdict: { zh: '中介这么承诺时，风险归你。材料造假是刑事问题。', en: 'When an agent promises this, the risk lands on you. Faked documents are a criminal matter.' }
            }
          ],
          tip: {
            zh: '外国人来华工作分 A（高端人才，鼓励，通常不设配额）、B（专业人才，按需）、C（其他，配额管理）三类，采用计分制：学历、税前薪资、汉语水平、工作年限、年龄、工作地点都算分。一般要求本科以上学历 + 2 年相关工作经验，符合特定条件的可豁免。',
            en: 'Foreign workers are graded A (high-end talent — encouraged, usually no quota), B (professionals — as needed) and C (others — quota-managed), on a points system: degree, pre-tax salary, Chinese ability, years of experience, age and work location all score. The baseline is normally a bachelor\'s degree plus two years of relevant experience, with carve-outs for specific profiles.'
          },
          law: {
            zh: '《外国人来华工作分类标准（试行）》',
            en: 'Classification Standards for Foreigners Working in China (Trial)'
          }
        },
        {
          prompt: {
            zh: '公司注册好了，你是法定代表人，但你大部分时间在海外遥控，一年来中国两三次。需要办工作许可吗？',
            en: 'The company is registered and you are its legal representative — but you run it from abroad and visit two or three times a year. Do you need a work permit?'
          },
          choices: [
            {
              text: { zh: '不需要，只要不在中国境内实际工作、不领境内薪酬', en: 'No — as long as you do not actually work in China or draw a PRC salary' },
              score: 2, fx: { cash: 6, comp: 10, rep: 2, energy: 0 },
              verdict: { zh: '对。但一旦你开始常驻办公，就必须补办。', en: 'Correct. The moment you start actually sitting in the office, you need one.' }
            },
            {
              text: { zh: '需要，法定代表人一律必须办', en: 'Yes — every legal representative must have one' },
              score: 1, fx: { cash: -4, comp: 2, rep: 0, energy: -4 },
              verdict: { zh: '过于保守。判断标准是"是否在境内就业"，不是头衔。', en: 'Over-cautious. The test is whether you are employed in China, not your job title.' }
            },
            {
              text: { zh: '不需要，我是老板，老板不算就业', en: 'No — I own it, and owners are not employees' },
              score: 0, fx: { cash: 2, comp: -16, rep: -6, energy: -2 },
              verdict: { zh: '身份不是豁免。在境内实际工作的外国人，包括老板，都要办。', en: 'Ownership is not an exemption. Any foreigner actually working in China — owner included — needs the permit.' }
            }
          ],
          tip: {
            zh: '判断依据是"是否在中国境内就业"，与职务无关。短期入境洽谈、签约、参加展会属于商务活动，M 签即可；一旦你实际到岗办公、承担岗位职责、由境内公司发薪，就属于就业，必须持有工作许可和工作类居留许可。90 天以内的短期工作另有短期工作许可路径。',
            en: 'The test is whether you are employed in China, not what your title is. Short visits to negotiate, sign and attend trade fairs are business activities — an M visa covers those. Once you actually sit at a desk, carry a role and get paid by the PRC entity, that is employment and you need the permit plus a work residence permit. Stints under 90 days have their own short-term work permit route.'
          },
          law: {
            zh: '《外国人在中国就业管理规定》；《关于外国人入境从事短期工作有关安排的通知》（人社部发〔2014〕78号）',
            en: 'Rules on the Administration of Employment of Foreigners in China; MOHRSS Circular No. 78 (2014) on short-term work'
          }
        }
      ]
    },

    /* ================================================================== 2 */
    {
      id: 'entity',
      monster: 'license',
      name: { zh: '执照龙', en: 'LICENSAUR' },
      title: { zh: '立业', en: 'Setting Up' },
      subtitle: { zh: '公司形式与市场准入', en: 'Entity types & market access' },
      dexNote: {
        zh: '守着营业执照的老龙。它认经营范围，不认你的商业计划书写得多漂亮。',
        en: 'An old dragon guarding the business licence. It reads your registered scope, not your pitch deck.'
      },
      intro: {
        zh: '签证搞定了。现在要决定：你到底要注册一个什么东西？',
        en: 'Visa sorted. Now: what exactly are you going to register?'
      },
      scenes: [
        {
          prompt: {
            zh: '你想在中国卖你自己的产品并开发票收款。朋友建议"先设个代表处，便宜又快"。',
            en: 'You want to sell your product in China and invoice customers. A friend says "just open a rep office, it is cheaper and faster".'
          },
          choices: [
            {
              text: { zh: '听劝，先设代表处，赚钱了再改', en: 'Take the advice — rep office now, upgrade once revenue comes' },
              score: 0, fx: { cash: 6, comp: -20, rep: -8, energy: -4 },
              verdict: { zh: '代表处不得从事营利性活动，也开不了增值税发票。', en: 'A rep office may not carry out profit-making activities, and it cannot issue VAT invoices.' }
            },
            {
              text: { zh: '注册外商独资企业（WFOE），能签约、开票、收款', en: 'Register a WFOE — it can contract, invoice and collect payment' },
              score: 2, fx: { cash: -14, comp: 16, rep: 6, energy: -10 },
              verdict: { zh: '要真做生意，这是标准答案。', en: 'If you actually want to trade, this is the standard answer.' }
            },
            {
              text: { zh: '找个中国朋友代持，用他的个体户开票', en: 'Have a Chinese friend hold it and invoice through their sole proprietorship' },
              score: 0, fx: { cash: 8, comp: -26, rep: -14, energy: -6 },
              verdict: { zh: '代持协议在股权确认上极不稳定，你可能什么都拿不回来。', en: 'Nominee arrangements are notoriously fragile. You may end up owning nothing.' }
            }
          ],
          tip: {
            zh: '常见形式：① WFOE 外商独资企业——可以经营、开票、雇人、汇出利润，是大多数创业者的选择；② 中外合资企业——需要中方股东，某些受限行业必须如此；③ 代表处——只能做联络、市场调研、展示，不得从事营利性活动，且按经费支出核定征税。个体工商户原则上不对一般外国人开放。',
            en: 'The usual options: (1) a WFOE — trades, invoices, hires, and can remit profits out; the default for most founders. (2) A joint venture — needs a Chinese shareholder, and is mandatory in certain restricted sectors. (3) A representative office — liaison, market research and display only, no profit-making activity, and taxed on a deemed basis from its expenses. Individual industrial and commercial households are generally not open to foreign nationals.'
          },
          law: {
            zh: '《外商投资法》；《外国企业常驻代表机构登记管理条例》第14条',
            en: 'Foreign Investment Law; Regulations on Registration of Resident Representative Offices of Foreign Enterprises, art. 14'
          }
        },
        {
          rare: 'neglist',
          prompt: {
            zh: '你的项目是"面向中国用户的在线教育 App"。注册前第一件该查的事是什么？',
            en: 'Your project is an online education app for Chinese users. What is the very first thing to check before registering?'
          },
          choices: [
            {
              text: { zh: '先想好公司名字和 Logo', en: 'Settle on the company name and logo' },
              score: 0, fx: { cash: -4, comp: -8, rep: 0, energy: -4 },
              verdict: { zh: '名字重要，但排在准入之后。', en: 'Names matter, but access comes first.' }
            },
            {
              text: { zh: '查《外商投资准入特别管理措施（负面清单）》', en: 'Check the Special Administrative Measures for Foreign Investment Access (the Negative List)' },
              score: 2, fx: { cash: -2, comp: 16, rep: 6, energy: -6 },
              verdict: { zh: '正确。清单外的领域享受国民待遇，清单内的可能禁止或必须合资。', en: 'Correct. Outside the list you get national treatment; inside it you may be barred or forced into a JV.' }
            },
            {
              text: { zh: '先租办公室，注册地址必须先有', en: 'Rent an office first — you need an address to register' },
              score: 1, fx: { cash: -12, comp: 0, rep: 0, energy: -8 },
              verdict: { zh: '地址确实要，但先花钱租下来再发现行业禁入，就亏了。', en: 'You do need an address — but signing a lease before checking access is an expensive way to find out.' }
            }
          ],
          tip: {
            zh: '中国对外商投资实行"准入前国民待遇 + 负面清单"管理。清单之外的行业，外资与内资同等对待；清单之内的，分为"限制类"（须合资、须控股比例、须审批）和"禁止类"（完全不得投资）。义务教育、新闻出版、互联网新闻信息服务等长期属于敏感领域。负面清单每年可能修订，一定要看最新版本。',
            en: 'China regulates inbound investment by "pre-establishment national treatment plus a negative list". Outside the list, foreign investors are treated the same as domestic ones. Inside it, entries are either restricted (JV required, equity caps, prior approval) or prohibited outright. Compulsory education, news publishing and internet news information services have long been sensitive. The list is revised most years — always read the current edition.'
          },
          law: {
            zh: '《外商投资法》第4条、第28条；《外商投资准入特别管理措施（负面清单）》（最新版）',
            en: 'Foreign Investment Law, arts. 4 & 28; Special Administrative Measures (Negative List) for Foreign Investment Access, current edition'
          }
        },
        {
          prompt: {
            zh: '注册资本填多少？中介说"认缴制，随便写，写 1000 万显得有实力"。',
            en: 'How much registered capital? Your agent says "it is a subscription system — put down RMB 10 million, it looks impressive".'
          },
          choices: [
            {
              text: { zh: '听中介的，写 1000 万，反正不用真掏', en: 'Follow the agent — write 10 million, nobody actually pays it in' },
              score: 0, fx: { cash: 0, comp: -20, rep: -6, energy: -4 },
              verdict: { zh: '2024 年新《公司法》后，五年内必须实缴到位。', en: 'Under the 2024 Company Law you must actually pay it up within five years.' }
            },
            {
              text: { zh: '按真实业务需要填，并确认能在五年内实缴', en: 'Set it to what the business genuinely needs, and can be paid up within five years' },
              score: 2, fx: { cash: -6, comp: 18, rep: 6, energy: -4 },
              verdict: { zh: '正确。注册资本是你对债权人的承诺，不是宣传语。', en: 'Correct. Registered capital is a promise to creditors, not a marketing line.' }
            },
            {
              text: { zh: '填 1 元，越少越安全', en: 'Put down RMB 1 — the less the safer' },
              score: 1, fx: { cash: 2, comp: -4, rep: -8, energy: -2 },
              verdict: { zh: '合法，但银行、客户、招投标、办签证时都可能被质疑。', en: 'Legal, but banks, customers, tenders and visa officers may all raise an eyebrow.' }
            }
          ],
          tip: {
            zh: '2024 年 7 月 1 日施行的新《公司法》规定：有限责任公司全体股东认缴的出资额，应当自公司成立之日起五年内缴足。认缴不等于不缴——公司不能清偿到期债务时，债权人可要求股东提前缴纳出资。虚高注册资本会变成真实的个人风险。另外注意某些行业（如劳务派遣、融资租赁）有最低注册资本要求。',
            en: 'The Company Law in force from 1 July 2024 requires the shareholders of a limited liability company to pay up their subscribed capital in full within five years of incorporation. "Subscribed" never meant "never paid": if the company cannot meet its debts, creditors can demand early payment from shareholders. An inflated figure converts straight into personal exposure. Note too that some sectors (labour dispatch, finance leasing) carry statutory minimums.'
          },
          law: {
            zh: '《公司法》（2023年修订，2024年7月1日施行）第47条、第54条',
            en: 'Company Law (2023 revision, effective 1 July 2024), arts. 47 & 54'
          }
        }
      ]
    },

    /* ================================================================== 3 */
    {
      id: 'chop',
      monster: 'chop',
      name: { zh: '印章怪', en: 'CHOPPER' },
      title: { zh: '印章', en: 'The Chop' },
      subtitle: { zh: '注册、治理与法定代表人', en: 'Registration, governance & the legal rep' },
      dexNote: {
        zh: '一枚红章。谁拿着它，谁就能以公司名义签字。丢了它比丢了公章柜的钥匙严重得多。',
        en: 'A red seal. Whoever holds it can bind the company. Losing it is far worse than losing the keys to the cabinet.'
      },
      intro: {
        zh: '营业执照下来了，18 位统一社会信用代码闪着光。随之而来的是一整套刻好的章。',
        en: 'The business licence arrives, eighteen-digit unified social credit code and all. With it comes a set of freshly carved chops.'
      },
      scenes: [
        {
          prompt: {
            zh: '公章刻好了。你的行政助理说"放我抽屉里吧，用起来方便"。',
            en: 'The company chop is ready. Your office assistant says "leave it in my drawer, it is easier that way".'
          },
          choices: [
            {
              text: { zh: '同意，反正用章都会先口头知会我', en: 'Fine — people always tell me before they use it' },
              score: 0, fx: { cash: 0, comp: -22, rep: -10, energy: -2 },
              verdict: { zh: '盖章的合同基本就对公司生效了，口头知会救不了你。', en: 'A chopped contract binds the company. A verbal heads-up will not save you.' }
            },
            {
              text: { zh: '建立用章登记制度，章由专人保管、用章须审批留痕', en: 'Set up a chop register: one custodian, written approval, a paper trail for every use' },
              score: 2, fx: { cash: -4, comp: 18, rep: 8, energy: -6 },
              verdict: { zh: '正确。这是外资企业最常见也最便宜的风险控制。', en: 'Correct. The cheapest and most common control a foreign-invested company can put in place.' }
            },
            {
              text: { zh: '我自己带在身上，谁也别想用', en: 'I keep it on me at all times — nobody else touches it' },
              score: 1, fx: { cash: 0, comp: 4, rep: -4, energy: -10 },
              verdict: { zh: '安全但会瘫痪业务，而且你出差时公司会停摆。', en: 'Safe, but it paralyses the business — and everything stops the week you travel.' }
            }
          ],
          tip: {
            zh: '在中国，公章的法律分量高于个人签字。通常要刻五枚：公章、财务专用章、法定代表人章、发票专用章、合同专用章。加盖公章的合同原则上对公司发生效力，即使盖章人越权，相对人善意的情况下公司仍可能被约束。"公章争夺战"是外资企业最常见的控制权纠纷。',
            en: 'In China the company chop carries more legal weight than a signature. You will normally carve five: the company chop, the finance chop, the legal representative chop, the invoice chop and the contract chop. A chopped contract binds the company as a rule, and even where the person who applied it exceeded their authority, a good-faith counterparty may still hold the company to it. Fights over physical custody of the chop are the single most common control dispute at foreign-invested companies.'
          },
          law: {
            zh: '《民法典》第490条、第504条；《全国法院民商事审判工作会议纪要》（九民纪要）关于盖章行为效力的意见',
            en: 'Civil Code, arts. 490 & 504; Supreme People\'s Court Minutes of the National Courts\' Civil and Commercial Trial Work Conference on the effect of chops'
          }
        },
        {
          rare: 'travelban',
          prompt: {
            zh: '你被登记为法定代表人。这意味着什么？',
            en: 'You are registered as the legal representative. What does that actually mean?'
          },
          choices: [
            {
              text: { zh: '只是个挂名，反正是有限责任公司', en: 'A nominal title — it is a limited liability company after all' },
              score: 0, fx: { cash: 0, comp: -18, rep: -8, energy: -2 },
              verdict: { zh: '公司有限责任，法定代表人个人不一定。', en: 'The company\'s liability is limited. The legal representative\'s is not always.' }
            },
            {
              text: { zh: '你能代表公司对外行为，同时承担相应的个人风险', en: 'You can bind the company — and you carry matching personal exposure' },
              score: 2, fx: { cash: 0, comp: 16, rep: 6, energy: -4 },
              verdict: { zh: '正确。这个位置权力和风险是绑定的。', en: 'Correct. In this seat, authority and exposure come as a pair.' }
            },
            {
              text: { zh: '随时可以辞掉，走个流程就行', en: 'You can quit any time — just file a change' },
              score: 1, fx: { cash: 0, comp: -6, rep: -2, energy: -4 },
              verdict: { zh: '变更需要公司配合，公司不配合时你会被卡住很久。', en: 'The filing needs the company\'s cooperation. If it will not cooperate, you can be stuck for a long time.' }
            }
          ],
          tip: {
            zh: '法定代表人是公司对外的法定"人格化身"，其职务行为直接归属于公司。风险面：公司欠税不缴，法定代表人可能被限制出境；公司成为失信被执行人，法定代表人可能被限制高消费（不得乘飞机、高铁一等座）；涉及虚开发票、走私等还可能承担刑事责任。外国人担任法定代表人前，务必确认自己对公司有实际控制力。',
            en: 'The legal representative is the company\'s statutory embodiment: acts done in that capacity are the company\'s acts. The exposure runs the other way too. If the company owes unpaid tax, the legal representative can be barred from leaving China. If the company is listed as a judgment defaulter, the legal representative can be barred from "high consumption" — no flights, no first-class rail. Where false invoicing or smuggling is involved, criminal liability is possible. Before a foreign national takes this seat, make sure you genuinely control the company.'
          },
          law: {
            zh: '《民法典》第61条；《税收征收管理法》第44条；最高人民法院《关于限制被执行人高消费及有关消费的若干规定》',
            en: 'Civil Code, art. 61; Tax Collection and Administration Law, art. 44; SPC Provisions on Restricting High Consumption by Judgment Debtors'
          }
        },
        {
          prompt: {
            zh: '你的执照上写着"技术咨询、软件开发"。一个客户想让你顺便帮他从海外进口一批设备。',
            en: 'Your licence says "technology consulting; software development". A client asks you to also import a batch of equipment for them.'
          },
          choices: [
            {
              text: { zh: '接了再说，反正开票时随便挑个项目', en: 'Take it — you can always pick some invoice category later' },
              score: 0, fx: { cash: 10, comp: -20, rep: -8, energy: -4 },
              verdict: { zh: '超经营范围开票是税务稽查的高频命中点。', en: 'Invoicing outside your scope is one of the most reliable ways to trigger a tax audit.' }
            },
            {
              text: { zh: '先办经营范围变更，涉及进出口还要办对外贸易经营者备案和海关注册', en: 'Amend the business scope first, and register as a foreign trade operator plus with Customs' },
              score: 2, fx: { cash: -8, comp: 16, rep: 6, energy: -10 },
              verdict: { zh: '正确。进出口是"资格"，不是"顺手做做"。', en: 'Correct. Import-export is a qualification, not a favour you do on the side.' }
            },
            {
              text: { zh: '委托一家有资质的外贸公司代理进口', en: 'Appoint a licensed trading company to handle the import as your agent' },
              score: 2, fx: { cash: -4, comp: 12, rep: 4, energy: -4 },
              verdict: { zh: '也对。小批量时这通常更划算。', en: 'Also correct — and usually cheaper for one-off volumes.' }
            }
          ],
          tip: {
            zh: '营业执照上的"经营范围"是你被允许从事的业务清单，也决定你能开什么类目的发票。超范围经营可能被市场监管部门处罚，超范围开票在金税系统里会被直接比对出来。涉及进出口需另行办理对外贸易经营者备案登记和海关报关单位注册；部分商品还需要许可证。',
            en: 'The business scope on your licence is the list of activities you are permitted to carry on, and it drives which invoice categories you may issue. Operating outside it can draw a penalty from the market regulator, and invoicing outside it is flagged automatically by the Golden Tax system. Import and export require separate foreign trade operator recordal and Customs registration, and some goods need licences on top.'
          },
          law: {
            zh: '《市场主体登记管理条例》；《对外贸易法》第9条；《海关报关单位备案管理规定》',
            en: 'Regulations on Registration of Market Entities; Foreign Trade Law, art. 9; Customs rules on registration of declaration entities'
          }
        }
      ]
    },

    /* ================================================================== 4 */
    {
      id: 'fx',
      monster: 'fx',
      name: { zh: '外汇鲸', en: 'FOREXWHALE' },
      title: { zh: '钱流', en: 'Money In, Money Out' },
      subtitle: { zh: '银行开户与跨境资金', en: 'Bank accounts & cross-border funds' },
      dexNote: {
        zh: '钱进来容易，出去要讲道理。它记得每一笔资金的来历和用途。',
        en: 'Money comes in easily. Getting it out requires an explanation. It remembers where every yuan came from and what it was for.'
      },
      intro: {
        zh: '公司有了，接下来要把海外的启动资金弄进来——并且有一天弄出去。',
        en: 'You have a company. Now to get your funding in — and, one day, out.'
      },
      scenes: [
        {
          prompt: {
            zh: '你想先把 50 万启动资金打进来。最快的办法是打到你自己的中国个人账户，再转给公司。',
            en: 'You want to bring in RMB 500,000 of seed money. The fastest route is into your own personal Chinese account, then transfer to the company.'
          },
          choices: [
            {
              text: { zh: '就这么办，反正钱最后进了公司', en: 'Do that — the money ends up in the company either way' },
              score: 0, fx: { cash: 4, comp: -22, rep: -8, energy: -4 },
              verdict: { zh: '这笔钱在账上会变成"其他应付款"，不是股本，将来分红和退出都麻烦。', en: 'On the books that becomes "other payables", not equity. Dividends and exit both get ugly.' }
            },
            {
              text: { zh: '开立资本金账户，办理外汇登记，以股东出资名义汇入', en: 'Open a capital account, complete the FX registration, and remit it in as shareholder capital' },
              score: 2, fx: { cash: -4, comp: 18, rep: 6, energy: -10 },
              verdict: { zh: '正确。出资路径干净，将来才汇得出去。', en: 'Correct. A clean path in is what makes a path out possible later.' }
            },
            {
              text: { zh: '走地下钱庄，手续费比银行便宜', en: 'Use an underground money changer — the spread beats the bank' },
              score: 0, fx: { cash: 8, comp: -30, rep: -20, energy: -6 },
              verdict: { zh: '非法买卖外汇，情节严重构成犯罪，账户还可能被冻结。', en: 'Illegal FX dealing. Serious cases are criminal, and your accounts can be frozen.' }
            }
          ],
          tip: {
            zh: '外商投资企业设立后需办理外汇登记（现由银行直接办理），并开立资本金账户接收股东出资。出资到账后办理验资/出资确认，资金按需结汇使用。用个人账户代收出资，会导致工商登记的实缴出资无法确认，未来减资、分红、股权转让、清算全部受阻。',
            en: 'A foreign-invested enterprise completes FX registration after incorporation (banks now handle this directly) and opens a capital account to receive shareholder contributions. Once the money lands, you confirm the contribution and convert it as needed. Routing capital through a personal account means the paid-in capital cannot be verified against the registration — which blocks capital reduction, dividends, share transfers and liquidation later on.'
          },
          law: {
            zh: '《外汇管理条例》第45条；《外商投资企业外汇管理办法》；汇发〔2019〕28号',
            en: 'Regulations on Foreign Exchange Administration, art. 45; FX rules for foreign-invested enterprises; SAFE Circular Huifa [2019] No. 28'
          }
        },
        {
          prompt: {
            zh: '资本金进来了，账上躺着 400 万暂时不用。财务建议拿去买理财产品或者借给一家合作方公司。',
            en: 'The capital has landed and RMB 4 million is sitting idle. Your finance person suggests buying wealth-management products or lending it to a partner company.'
          },
          choices: [
            {
              text: { zh: '买理财，钱不能闲着', en: 'Buy the wealth-management product — idle cash is wasted cash' },
              score: 0, fx: { cash: 6, comp: -18, rep: -6, energy: -2 },
              verdict: { zh: '资本金结汇所得不得用于证券投资，银行也会拦。', en: 'Converted capital cannot go into securities investment. The bank will stop it anyway.' }
            },
            {
              text: { zh: '借给合作方，收点利息', en: 'Lend it to the partner and earn some interest' },
              score: 0, fx: { cash: 6, comp: -20, rep: -8, energy: -2 },
              verdict: { zh: '不得向非关联企业发放贷款（经营范围允许的除外）。', en: 'Lending to non-affiliates is not permitted unless your business scope covers it.' }
            },
            {
              text: { zh: '按经营需要留在账上，仅用于真实自用支出', en: 'Leave it and spend it only on genuine operating needs' },
              score: 2, fx: { cash: -2, comp: 16, rep: 4, energy: 0 },
              verdict: { zh: '正确。资本金的用途受限，规矩一点省很多事。', en: 'Correct. Capital funds are use-restricted; playing it straight saves a lot of grief.' }
            }
          ],
          tip: {
            zh: '资本金及其结汇所得实行"实需原则"，通常不得：① 直接或间接用于超出经营范围的支出；② 直接或间接用于证券投资（另有规定除外）；③ 向非关联企业发放贷款（经营范围允许的除外）；④ 购买非自用房地产。银行在办理支付时会做真实性审核，凭合同、发票放款。',
            en: 'Capital funds and the RMB proceeds of converting them are governed by a genuine-need principle. As a rule they may not be: (1) used, directly or indirectly, for spending outside your business scope; (2) used, directly or indirectly, for securities investment (limited exceptions); (3) lent to non-affiliated companies unless your scope allows lending; or (4) used to buy real estate you will not occupy yourself. Banks check authenticity at payment and release funds against contracts and invoices.'
          },
          law: {
            zh: '汇发〔2016〕16号、汇发〔2019〕28号关于资本项目收入使用管理的规定',
            en: 'SAFE Circulars Huifa [2016] No. 16 and [2019] No. 28 on the use of capital account income'
          }
        },
        {
          prompt: {
            zh: '公司第一年就赚钱了，你想把利润分回海外母公司。',
            en: 'The company turns a profit in year one and you want to send it home to the parent.'
          },
          choices: [
            {
              text: { zh: '直接电汇，公司的钱想汇就汇', en: 'Just wire it — it is the company\'s money' },
              score: 0, fx: { cash: 0, comp: -20, rep: -6, energy: -4 },
              verdict: { zh: '银行不会放行。利润汇出要一整套材料。', en: 'The bank will not release it. Profit remittance needs a full document set.' }
            },
            {
              text: { zh: '先弥补以前年度亏损、提取法定公积金，完成税务备案后再汇', en: 'Cover prior-year losses, allocate to the statutory reserve, complete the tax filing, then remit' },
              score: 2, fx: { cash: -8, comp: 18, rep: 8, energy: -8 },
              verdict: { zh: '正确。分红是有前置条件的。', en: 'Correct. Dividends have prerequisites.' }
            },
            {
              text: { zh: '用"服务费"名义汇出，比分红省税', en: 'Send it out as a "service fee" — cheaper than a dividend' },
              score: 0, fx: { cash: 6, comp: -24, rep: -12, energy: -4 },
              verdict: { zh: '没有真实服务的付汇属于虚构交易，转让定价和反避税都盯着这里。', en: 'A payment with no real service behind it is a fabricated transaction — squarely in transfer-pricing and anti-avoidance territory.' }
            }
          ],
          tip: {
            zh: '利润汇出的前提：完成年度企业所得税汇算清缴、弥补以前年度亏损、按税后利润的 10% 提取法定公积金（累计达注册资本 50% 后可不再提取）、作出股东会分红决议。向境外股东支付股息，一般代扣代缴 10% 预提所得税；符合条件并适用税收协定的，可能降至 5%。单笔等值 5 万美元以上的对外支付还需办理税务备案。',
            en: 'Before profits can leave: file and settle the annual corporate income tax return, cover prior-year losses, allocate 10% of after-tax profit to the statutory surplus reserve (you may stop once it reaches 50% of registered capital), and pass a shareholders\' resolution to distribute. Dividends to an overseas shareholder normally bear 10% withholding tax, which a tax treaty may reduce to 5% where the conditions are met. Outbound payments of USD 50,000 or more also require a tax filing.'
          },
          law: {
            zh: '《公司法》第210条；《企业所得税法》第3条、第27条及实施条例第91条；国家税务总局、国家外汇管理局2013年第40号公告',
            en: 'Company Law, art. 210; Enterprise Income Tax Law, arts. 3 & 27 and Implementing Regulations, art. 91; SAT/SAFE Announcement No. 40 (2013)'
          }
        }
      ]
    },

    /* ================================================================== 5 */
    {
      id: 'tax',
      monster: 'fapiao',
      name: { zh: '发票精', en: 'FAPIAOLING' },
      title: { zh: '税务', en: 'Tax' },
      subtitle: { zh: '发票、申报与个税', en: 'Fapiao, filings & personal income tax' },
      dexNote: {
        zh: '没有它，你花的每一分钱在税务上都不算数。它在金税系统里有完整记忆。',
        en: 'Without it, every yuan you spent counts for nothing at tax time. It has perfect recall inside the Golden Tax system.'
      },
      intro: {
        zh: '第一个月结束，会计问你要发票。你翻了翻钱包，全是收据。',
        en: 'Month one closes and your accountant asks for the fapiao. You look in your wallet and find receipts.'
      },
      scenes: [
        {
          prompt: {
            zh: '团队聚餐花了 3000 元，餐厅只给了小票，没开发票。这笔钱能税前扣除吗？',
            en: 'A team dinner cost RMB 3,000. The restaurant gave you a till receipt, not a fapiao. Can you deduct it?'
          },
          choices: [
            {
              text: { zh: '能，有小票就是凭证', en: 'Yes — a receipt is proof of payment' },
              score: 0, fx: { cash: 0, comp: -14, rep: -4, energy: -2 },
              verdict: { zh: '小票不是合法有效凭证，汇算清缴时要调增。', en: 'A till receipt is not a valid deduction voucher; it gets added back at year-end.' }
            },
            {
              text: { zh: '不能，必须取得发票；而且业务招待费本身还有扣除限额', en: 'No — you need a fapiao, and entertainment expenses have their own cap anyway' },
              score: 2, fx: { cash: -2, comp: 16, rep: 4, energy: -2 },
              verdict: { zh: '正确。很多创业者第一年就是这么把利润"做"出来的。', en: 'Correct. This is exactly how first-year founders accidentally manufacture taxable profit.' }
            },
            {
              text: { zh: '找别的发票凑数顶上去', en: 'Find some other fapiao to plug the gap' },
              score: 0, fx: { cash: 2, comp: -28, rep: -16, energy: -4 },
              verdict: { zh: '取得与实际经营不符的发票属于违法，严重的是刑事问题。', en: 'Using invoices that do not match real transactions is unlawful — and in serious cases, criminal.' }
            }
          ],
          tip: {
            zh: '在中国，发票是税前扣除的核心凭证。没有发票的支出，企业所得税汇算清缴时通常不得扣除，等于用税后的钱在花。此外业务招待费只能按发生额的 60% 扣除，且不超过当年销售收入的 5‰——两个限额取低者。从第一天起就建立"付款必要发票"的习惯，比年底补救便宜得多。',
            en: 'In China the fapiao is the core deduction voucher. Spending without one is generally non-deductible at the annual corporate income tax settlement, which means you paid for it with after-tax money. Business entertainment is capped twice over: 60% of the amount incurred, and no more than 0.5% of that year\'s sales revenue — whichever is lower. Building a "no fapiao, no payment" habit from day one is far cheaper than fixing it in December.'
          },
          law: {
            zh: '《发票管理办法》第21条；《企业所得税法》第8条及实施条例第43条',
            en: 'Measures for the Administration of Invoices, art. 21; Enterprise Income Tax Law, art. 8 and Implementing Regulations, art. 43'
          }
        },
        {
          prompt: {
            zh: '公司刚成立还没收入，会计说"零申报就行"。可你这个月其实收了一笔 8 万元的预付款。',
            en: 'The company has no revenue yet and your accountant suggests a zero-return. But you did receive an RMB 80,000 prepayment this month.'
          },
          choices: [
            {
              text: { zh: '零申报，钱又没确认收入', en: 'File zero — it is not recognised revenue yet' },
              score: 0, fx: { cash: 2, comp: -20, rep: -6, energy: -2 },
              verdict: { zh: '增值税纳税义务的发生时间不等于会计收入确认时间。', en: 'The VAT trigger point is not the same as the accounting revenue point.' }
            },
            {
              text: { zh: '如实申报，按规定判断纳税义务发生时间', en: 'File honestly, applying the rules on when the tax obligation arises' },
              score: 2, fx: { cash: -4, comp: 18, rep: 6, energy: -4 },
              verdict: { zh: '正确。长期零申报本身就是风险预警指标。', en: 'Correct. Long runs of zero-returns are themselves a risk flag.' }
            },
            {
              text: { zh: '这个月不申报，等有收入了一起报', en: 'Skip this month and catch up once revenue starts' },
              score: 0, fx: { cash: 0, comp: -22, rep: -8, energy: -2 },
              verdict: { zh: '逾期不申报会产生罚款、滞纳金，还会影响纳税信用等级。', en: 'Late or missed filings bring fines, late-payment surcharges and a downgraded tax credit rating.' }
            }
          ],
          tip: {
            zh: '取得营业执照后必须办理税务登记并按期申报——即使没有业务，也要做零申报，不能不报。但"没开票"不等于"没有纳税义务"：收讫销售款项或取得索取销售款项凭据的当天，增值税纳税义务即可能发生；先开发票的，为开具发票的当天。长期零申报会被列入异常关注，影响纳税信用等级（A/B/M/C/D 级），进而影响发票额度、出口退税和融资。',
            en: 'Once you hold a business licence you must register for tax and file on time — with no activity you still file a zero-return; you never simply skip. But "no invoice issued" does not mean "no tax obligation". VAT can be triggered on the day you receive payment or obtain the right to demand it, and if you issue the invoice first, on the day of issue. A long string of zero-returns lands you on the watch list and drags down your tax credit rating (A/B/M/C/D), which in turn limits your invoice quota, export refunds and access to finance.'
          },
          law: {
            zh: '《税收征收管理法》第25条、第62条；《增值税暂行条例》第19条',
            en: 'Tax Collection and Administration Law, arts. 25 & 62; Interim Regulations on VAT, art. 19'
          }
        },
        {
          prompt: {
            zh: '你今年在中国住了 200 天。你在海外还有一套房子的租金收入。这笔收入要在中国交税吗？',
            en: 'You have spent 200 days in China this year. You also earn rent from a property back home. Is that taxable in China?'
          },
          choices: [
            {
              text: { zh: '不用，那是境外收入', en: 'No — that is foreign-source income' },
              score: 1, fx: { cash: 2, comp: -6, rep: -2, energy: -2 },
              verdict: { zh: '结论可能对，但理由不对——关键在"六年规则"。', en: 'You may land on the right answer for the wrong reason. The six-year rule is what matters.' }
            },
            {
              text: { zh: '住满 183 天已是税收居民，但六年内境外支付的境外所得可免', en: 'Past 183 days you are a tax resident, but foreign-sourced, foreign-paid income is exempt within the six-year window' },
              score: 2, fx: { cash: 0, comp: 18, rep: 6, energy: -4 },
              verdict: { zh: '正确。而且这个窗口可以通过单次离境超过 30 天来重置。', en: 'Correct — and the clock resets with a single trip out of China of more than 30 days.' }
            },
            {
              text: { zh: '要，居民就得申报全球收入，没有例外', en: 'Yes — residents declare worldwide income, no exceptions' },
              score: 1, fx: { cash: -6, comp: 2, rep: 0, energy: -2 },
              verdict: { zh: '方向对，但忽略了给外籍人士的六年过渡优惠。', en: 'Right direction, but it ignores the six-year concession for foreign nationals.' }
            }
          ],
          tip: {
            zh: '在一个纳税年度内在中国境内居住累计满 183 天的个人为税收居民。但对无住所个人有"六年规则"：在境内居住累计满 183 天的年度连续不满六年的，其来源于境外且由境外单位或个人支付的所得免予缴纳个人所得税；任一年度中有一次离境超过 30 天的，连续年限重新起算。工资薪金个税按 3%–45% 超额累进税率。',
            en: 'An individual who spends 183 days or more in China in a tax year is a tax resident. For individuals without a domicile in China there is a six-year rule: while your run of 183-day years is under six consecutive years, income sourced outside China and paid by an entity or person outside China is exempt from individual income tax. A single departure of more than 30 days in any year restarts the count. Employment income is taxed on a 3%–45% progressive scale.'
          },
          law: {
            zh: '《个人所得税法》第1条；《个人所得税法实施条例》第4条；财政部 税务总局2019年第34号公告',
            en: 'Individual Income Tax Law, art. 1; IIT Implementing Regulations, art. 4; MOF/SAT Announcement No. 34 (2019)'
          }
        }
      ]
    },

    /* ================================================================== 6 */
    {
      id: 'labor',
      monster: 'labor',
      name: { zh: '社保灵', en: 'LABORGUARD' },
      title: { zh: '用人', en: 'Hiring' },
      subtitle: { zh: '劳动合同与社会保险', en: 'Employment contracts & social insurance' },
      dexNote: {
        zh: '天平向劳动者倾斜。它不接受"我们创业公司比较灵活"这个说法。',
        en: 'The scales tilt towards the employee. It does not accept "but we are a startup, we are flexible".'
      },
      intro: {
        zh: '第一个员工今天上班了。你说"合同不急，先干着"。',
        en: 'Your first hire starts today. You tell them the contract can wait.'
      },
      scenes: [
        {
          rare: 'doublewage',
          prompt: {
            zh: '员工已经工作两个月了，书面劳动合同一直没签。会有什么后果？',
            en: 'Your employee has worked two months and still has no written contract. What happens?'
          },
          choices: [
            {
              text: { zh: '没什么，双方都同意就行', en: 'Nothing — you both agreed to it' },
              score: 0, fx: { cash: 0, comp: -24, rep: -10, energy: -2 },
              verdict: { zh: '员工同意不能免除公司的法定义务。', en: 'Employee consent does not waive the company\'s statutory duty.' }
            },
            {
              text: { zh: '从第二个月起要支付二倍工资，满一年视为无固定期限合同', en: 'From month two you owe double wages, and after a year it is deemed an open-ended contract' },
              score: 2, fx: { cash: -10, comp: 18, rep: 4, energy: -6 },
              verdict: { zh: '正确。这是劳动仲裁里最常见的败诉理由。', en: 'Correct. This is the single most common way employers lose at arbitration.' }
            },
            {
              text: { zh: '补一份合同，日期往前写', en: 'Sign one now and backdate it' },
              score: 0, fx: { cash: -2, comp: -20, rep: -12, energy: -4 },
              verdict: { zh: '倒签日期一旦被员工举证，公司信用和案子一起输。', en: 'If the employee can prove the backdating, you lose the case and your credibility together.' }
            }
          ],
          tip: {
            zh: '用人单位应当自用工之日起一个月内订立书面劳动合同。超过一个月不满一年未订立的，应当每月支付二倍工资（最多 11 个月）；满一年仍未订立的，视为已订立无固定期限劳动合同。这不是理论风险——是劳动仲裁的常规判法，且员工离职后一年内仍可申请仲裁。',
            en: 'You must enter into a written employment contract within one month of the employee starting. Between one month and one year without one, you owe double wages for each month (capped at 11 months). Past one year, an open-ended contract is deemed to exist. This is not a theoretical risk — it is routine at labour arbitration, and the employee can still bring a claim up to a year after leaving.'
          },
          law: {
            zh: '《劳动合同法》第10条、第14条、第82条；《劳动争议调解仲裁法》第27条',
            en: 'Labour Contract Law, arts. 10, 14 & 82; Labour Dispute Mediation and Arbitration Law, art. 27'
          }
        },
        {
          prompt: {
            zh: '你想给一位签了两年合同的工程师设 6 个月试用期，试用期工资按正式工资的一半发。',
            en: 'You want a six-month probation for an engineer on a two-year contract, at half their normal salary.'
          },
          choices: [
            {
              text: { zh: '可以，试用期长短和工资由双方协商', en: 'Fine — probation length and pay are for the parties to agree' },
              score: 0, fx: { cash: 4, comp: -22, rep: -10, energy: -2 },
              verdict: { zh: '试用期是法定强制条款，约不了。', en: 'Probation terms are mandatory law. You cannot contract around them.' }
            },
            {
              text: { zh: '两年合同最长只能试用 2 个月，工资不得低于约定工资的 80% 且不低于当地最低工资', en: 'A two-year contract allows two months maximum, at no less than 80% of the agreed wage and never below local minimum wage' },
              score: 2, fx: { cash: -6, comp: 18, rep: 6, energy: -4 },
              verdict: { zh: '正确。违法约定的试用期已履行的，还要按转正工资赔偿。', en: 'Correct. Where an unlawful probation has already been served, you owe compensation at the full rate.' }
            },
            {
              text: { zh: '先签 6 个月试用合同，通过了再签正式合同', en: 'Sign a six-month "probation contract" first, then a real one if they pass' },
              score: 0, fx: { cash: 2, comp: -20, rep: -8, energy: -4 },
              verdict: { zh: '只约定试用期的，该期限即为劳动合同期限，试用期不成立。', en: 'A contract that contains only a probation period is the contract term itself — there is no probation at all.' }
            }
          ],
          tip: {
            zh: '试用期上限：合同期限三个月以上不满一年的，不超过一个月；一年以上不满三年的，不超过二个月；三年以上固定期限和无固定期限的，不超过六个月。合同期限不满三个月的不得约定试用期。同一用人单位与同一劳动者只能约定一次试用期。试用期工资不得低于本单位相同岗位最低档工资或劳动合同约定工资的 80%，且不得低于当地最低工资标准。',
            en: 'Probation caps: a contract of three months to under one year allows one month; one to under three years allows two months; three years or more, and open-ended contracts, allow six months. A contract shorter than three months allows no probation at all. The same employer and employee may agree probation only once. Probation pay must be at least 80% of either the lowest wage for the same post at your company or the agreed contract wage, and never below the local minimum wage.'
          },
          law: {
            zh: '《劳动合同法》第19条、第20条、第83条',
            en: 'Labour Contract Law, arts. 19, 20 & 83'
          }
        },
        {
          prompt: {
            zh: '一位员工说："别给我交社保了，折成现金发给我，我签个自愿放弃声明。"',
            en: 'An employee says: "Skip my social insurance and pay me the cash instead — I will sign a waiver."'
          },
          choices: [
            {
              text: { zh: '双方自愿，签个声明就行', en: 'Both sides agree — get the waiver signed' },
              score: 0, fx: { cash: 6, comp: -26, rep: -12, energy: -2 },
              verdict: { zh: '自愿放弃声明无效，员工事后仍可要求补缴并主张解除+经济补偿。', en: 'The waiver is void. The employee can still demand back-payment, resign on that ground and claim severance.' }
            },
            {
              text: { zh: '依法参保，社保是强制性的', en: 'Enrol them — social insurance is mandatory' },
              score: 2, fx: { cash: -10, comp: 18, rep: 8, energy: -4 },
              verdict: { zh: '正确。外籍员工原则上同样要参保。', en: 'Correct — and foreign employees are, in principle, covered too.' }
            },
            {
              text: { zh: '按最低基数交，差额发现金', en: 'Contribute on the minimum base and pay the difference in cash' },
              score: 0, fx: { cash: 4, comp: -18, rep: -8, energy: -2 },
              verdict: { zh: '未按实际工资足额缴纳同样违法，社保稽核和税务并库后更容易发现。', en: 'Contributing on an understated base is equally unlawful — and much easier to spot now that collection sits with the tax authority.' }
            }
          ],
          tip: {
            zh: '社会保险是法定强制义务，"自愿放弃"协议因违反强制性规定而无效。用人单位未依法缴纳社保的，员工可依《劳动合同法》第38条解除合同并主张经济补偿。在中国境内就业的外国人原则上也应参加职工基本养老、医疗、工伤、失业和生育保险；与中国签订双边社保协定的国家（如德国、韩国、日本、加拿大等）的国民，可按协定申请免缴部分险种。',
            en: 'Social insurance is a mandatory statutory obligation, and a "voluntary waiver" is void for breaching mandatory law. Where the employer fails to contribute properly, the employee may terminate under art. 38 of the Labour Contract Law and claim severance. Foreign nationals employed in China are in principle covered for basic pension, medical, work injury, unemployment and maternity insurance; nationals of countries with a bilateral social security agreement with China (Germany, South Korea, Japan and Canada among them) can apply for exemption from some of these.'
          },
          law: {
            zh: '《社会保险法》第58条、第84条；《劳动合同法》第38条、第46条；《在中国境内就业的外国人参加社会保险暂行办法》',
            en: 'Social Insurance Law, arts. 58 & 84; Labour Contract Law, arts. 38 & 46; Interim Measures for Participation in Social Insurance by Foreigners Employed in China'
          }
        }
      ]
    },

    /* ================================================================== 7 */
    {
      id: 'ip',
      monster: 'tm',
      name: { zh: '商标鸟', en: 'MARKBIRD' },
      title: { zh: '护城河', en: 'The Moat' },
      subtitle: { zh: '商标、版权与专利', en: 'Trademarks, copyright & patents' },
      dexNote: {
        zh: '飞得极快，先到先得。很多人第一次见到它时，它已经停在别人肩上了。',
        en: 'Fast, and strictly first-come. Most people first meet it perched on somebody else\'s shoulder.'
      },
      intro: {
        zh: '产品要上线了。你打算等有点名气再去注册商标——"省点钱"。',
        en: 'Launch is close. You figure you will register the trademark once there is some traction — to save money.'
      },
      scenes: [
        {
          prompt: {
            zh: '你的品牌在海外已注册多年。在中国注册商标的时机是？',
            en: 'Your brand has been registered abroad for years. When should you file in China?'
          },
          choices: [
            {
              text: { zh: '进入中国市场之前就注册，包括中文名和常见变体', en: 'Before you enter the market — including the Chinese name and the obvious variants' },
              score: 2, fx: { cash: -8, comp: 18, rep: 8, energy: -6 },
              verdict: { zh: '正确。中国是申请在先，不是使用在先。', en: 'Correct. China is first-to-file, not first-to-use.' }
            },
            {
              text: { zh: '等有销量了再注册，先验证市场', en: 'Wait for sales — validate the market first' },
              score: 0, fx: { cash: 6, comp: -20, rep: -10, energy: -4 },
              verdict: { zh: '等你有销量时，抢注的人早就注册好了。', en: 'By the time you have sales, the squatter has already filed.' }
            },
            {
              text: { zh: '海外注册在中国自动有效', en: 'The overseas registration covers China automatically' },
              score: 0, fx: { cash: 0, comp: -22, rep: -8, energy: -2 },
              verdict: { zh: '商标是地域性权利，境外注册在中国不产生效力。', en: 'Trademark rights are territorial. A foreign registration has no effect in China.' }
            }
          ],
          tip: {
            zh: '中国商标实行申请在先原则：同一天申请的，使用在先的优先；否则谁先申请谁得。建议在进入市场前完成注册，并同时保护：英文名、中文名（音译和意译都要）、拼音、Logo 图形。商品和服务分 45 个类别，只在注册的类别中受保护，因此需要在核心类别之外做防御性注册。可通过马德里体系指定中国，也可直接向国家知识产权局申请。',
            en: 'China applies first-to-file: where two applications are filed the same day, prior use decides; otherwise the earlier filing wins. File before you enter the market, and protect the whole set — the English name, the Chinese name (both a phonetic and a meaning-based version), the pinyin, and the logo. Goods and services fall into 45 classes and protection extends only to the classes you registered, so defensive filings around your core classes are normal practice. You can designate China through the Madrid System or file directly with CNIPA.'
          },
          law: {
            zh: '《商标法》第4条、第31条、第56条',
            en: 'Trademark Law, arts. 4, 31 & 56'
          }
        },
        {
          rare: 'squatter',
          prompt: {
            zh: '坏消息：有人在你要用的类别上抢注了你的品牌，现在开价 30 万要卖给你。',
            en: 'Bad news: someone has registered your brand in the class you need and is offering to sell it back for RMB 300,000.'
          },
          choices: [
            {
              text: { zh: '直接买下来，快刀斩乱麻', en: 'Just buy it and move on' },
              score: 1, fx: { cash: -25, comp: 4, rep: -2, energy: -6 },
              verdict: { zh: '有时是最快的，但等于给抢注行为定价。', en: 'Sometimes the fastest route — and it puts a price on squatting.' }
            },
            {
              text: { zh: '评估是否属于恶意抢注，提异议或无效宣告，同时准备备用品牌', en: 'Assess whether it is bad-faith squatting, file opposition or invalidation, and line up a fallback brand' },
              score: 2, fx: { cash: -12, comp: 16, rep: 8, energy: -12 },
              verdict: { zh: '正确。近年对恶意注册的打击力度明显加强。', en: 'Correct. Enforcement against bad-faith filings has tightened considerably.' }
            },
            {
              text: { zh: '不理会，照常使用自己的品牌', en: 'Ignore it and keep using your own brand' },
              score: 0, fx: { cash: 4, comp: -24, rep: -14, energy: -4 },
              verdict: { zh: '你会成为侵权被告，还可能被海关扣货、被电商平台下架。', en: 'You become the infringement defendant — with goods detained at Customs and listings pulled from marketplaces.' }
            }
          ],
          tip: {
            zh: '救济路径：① 商标初步审定公告后 3 个月内提出异议；② 已注册的，向商标评审部门申请无效宣告；③ 注册满三年未实际使用的，可申请撤销（撤三）。《商标法》第4条明确"不以使用为目的的恶意商标注册申请，应当予以驳回"，第32条禁止以不正当手段抢先注册他人已经使用并有一定影响的商标。保留你在先使用的全部证据——广告、合同、销售记录、媒体报道。',
            en: 'Your routes: (1) oppose within three months of preliminary publication; (2) if already registered, apply to invalidate; (3) if registered for three years without genuine use, apply to cancel for non-use. Article 4 of the Trademark Law requires bad-faith applications filed without intent to use to be rejected, and article 32 prohibits pre-emptively registering, by improper means, a mark another party has already used and made known. Keep every scrap of prior-use evidence — advertising, contracts, sales records, press coverage.'
          },
          law: {
            zh: '《商标法》第4条、第32条、第33条、第45条、第49条',
            en: 'Trademark Law, arts. 4, 32, 33, 45 & 49'
          }
        },
        {
          prompt: {
            zh: '你的核心是一套自研软件和一个硬件外观设计。怎么保护？',
            en: 'Your core assets are in-house software and a distinctive hardware design. How do you protect them?'
          },
          choices: [
            {
              text: { zh: '软件著作权登记 + 外观设计专利，必要时对算法申请发明专利', en: 'Software copyright registration plus a design patent, and an invention patent for the algorithm if warranted' },
              score: 2, fx: { cash: -10, comp: 16, rep: 8, energy: -8 },
              verdict: { zh: '正确。不同资产要用不同工具。', en: 'Correct. Different assets need different instruments.' }
            },
            {
              text: { zh: '全部申请发明专利，最有力', en: 'File invention patents for everything — strongest protection' },
              score: 1, fx: { cash: -18, comp: 2, rep: 0, energy: -12 },
              verdict: { zh: '慢、贵，而且外观设计走发明路线申请不下来。', en: 'Slow, expensive — and a pure appearance design will not get through as an invention.' }
            },
            {
              text: { zh: '都不申请，靠保密和迭代速度', en: 'File nothing — rely on secrecy and shipping fast' },
              score: 0, fx: { cash: 6, comp: -16, rep: -8, energy: -2 },
              verdict: { zh: '商业秘密可以是策略，但外观一旦公开就不再是秘密。', en: 'Trade secrecy is a valid strategy, but an appearance stops being secret the day you ship.' }
            }
          ],
          tip: {
            zh: '著作权自作品完成时自动产生，但登记（中国版权保护中心）能在维权时大幅降低举证成本，软件著作权登记通常一两个月即可下证。专利分三种：发明（技术方案，审查最严，保护期 20 年）、实用新型（产品形状构造，10 年）、外观设计（产品外观，15 年）。注意：申请专利意味着公开技术方案，如果核心是难以反向工程的工艺，商业秘密可能更合适。',
            en: 'Copyright arises automatically on creation, but registration (with the Copyright Protection Centre of China) sharply reduces the evidential burden when you enforce; software copyright certificates usually issue within a month or two. Patents come in three kinds: invention (technical solutions, strictest examination, 20-year term), utility model (product shape and structure, 10 years) and design (appearance, 15 years). Remember that patenting means publishing your solution — where the crown jewels are a process that is hard to reverse-engineer, trade secrecy may serve you better.'
          },
          law: {
            zh: '《著作权法》第2条；《计算机软件保护条例》；《专利法》第2条、第42条；《反不正当竞争法》第9条',
            en: 'Copyright Law, art. 2; Regulations on Computer Software Protection; Patent Law, arts. 2 & 42; Anti-Unfair Competition Law, art. 9'
          }
        }
      ]
    },

    /* ================================================================== 8 */
    {
      id: 'data',
      monster: 'data',
      name: { zh: '数据蛛', en: 'DATASPIDER' },
      title: { zh: '数据', en: 'Data' },
      subtitle: { zh: '网络与个人信息合规', en: 'Cybersecurity & personal information' },
      dexNote: {
        zh: '网织得很细。它关心的不是你收了多少数据，而是数据往哪儿去了。',
        en: 'A fine web. It cares less about how much data you collect than about where it goes.'
      },
      intro: {
        zh: '产品上线了，用户在涨。服务器在新加坡，数据全在那儿。',
        en: 'You have shipped and users are climbing. Your servers are in Singapore, and so is all the data.'
      },
      scenes: [
        {
          prompt: {
            zh: '你的网站要面向中国用户开放，域名解析到境内服务器。第一件事？',
            en: 'Your site will serve Chinese users from servers inside China. First thing to do?'
          },
          choices: [
            {
              text: { zh: '办 ICP 备案；如果是经营性网站还要办 ICP 许可证', en: 'File for ICP recordal — and get an ICP licence if the site is commercial' },
              score: 2, fx: { cash: -6, comp: 18, rep: 6, energy: -8 },
              verdict: { zh: '正确。没备案的境内服务器会被直接关停。', en: 'Correct. An unfiled site on a domestic server simply gets shut off.' }
            },
            {
              text: { zh: '先上线，有流量了再备案', en: 'Launch first, file once there is traffic' },
              score: 0, fx: { cash: 4, comp: -20, rep: -8, energy: -4 },
              verdict: { zh: '接入服务商有连带责任，他们会先替你关掉。', en: 'Your hosting provider carries joint liability. They will pull the plug before you do.' }
            },
            {
              text: { zh: '服务器放境外就不用备案了', en: 'Keep the servers offshore and skip the whole thing' },
              score: 1, fx: { cash: 2, comp: -4, rep: -2, energy: -2 },
              verdict: { zh: '备案确实针对境内服务器，但数据出境和个人信息保护义务照样跑不掉。', en: 'Recordal does target domestic servers — but cross-border transfer and personal information duties still apply.' }
            }
          ],
          tip: {
            zh: '使用中国境内服务器提供互联网信息服务的，必须办理 ICP 备案（非经营性）；从事经营性互联网信息服务（如在线收费、广告、平台撮合）还需取得 ICP 经营许可证（增值电信业务经营许可证）。注意：增值电信业务对外资持股比例有限制，这是很多外资互联网项目采用合资或其他安排的原因。涉及游戏、直播、新闻、出版的还有各自的专项资质。',
            en: 'Anyone providing internet information services from servers inside China must complete ICP recordal (for non-commercial sites). Commercial internet information services — paid access, advertising, platform matchmaking — additionally require an ICP licence (a value-added telecoms business permit). Note that foreign ownership in value-added telecoms is capped, which is precisely why so many foreign internet projects sit in joint ventures or other structures. Games, live streaming, news and publishing each carry further specific qualifications.'
          },
          law: {
            zh: '《互联网信息服务管理办法》第4条、第7条；《电信条例》；《外商投资电信企业管理规定》',
            en: 'Measures for the Administration of Internet Information Services, arts. 4 & 7; Telecommunications Regulations; Provisions on Foreign-Invested Telecoms Enterprises'
          }
        },
        {
          rare: 'crossborder',
          prompt: {
            zh: '你的 App 收集中国用户的手机号和位置，数据同步到新加坡的服务器分析。',
            en: 'Your app collects Chinese users\' phone numbers and location, and syncs it to Singapore for analysis.'
          },
          choices: [
            {
              text: { zh: '内部系统，属于公司自己的数据，随便传', en: 'Internal systems — it is our own data, we can move it freely' },
              score: 0, fx: { cash: 4, comp: -26, rep: -14, energy: -4 },
              verdict: { zh: '个人信息不因为存在你服务器上就变成你的。', en: 'Personal information does not become yours just because it sits on your server.' }
            },
            {
              text: { zh: '取得单独同意，做个人信息保护影响评估，走标准合同或安全评估路径', en: 'Get separate consent, run a PIPIA, and use the standard contract or security assessment route' },
              score: 2, fx: { cash: -10, comp: 20, rep: 8, energy: -12 },
              verdict: { zh: '正确。出境是有法定通道的，不能默认。', en: 'Correct. There are prescribed channels out. You cannot just default to shipping it.' }
            },
            {
              text: { zh: '在隐私政策里写一句"可能传输至境外"就够了', en: 'A line in the privacy policy saying data "may be transferred abroad" is enough' },
              score: 0, fx: { cash: 0, comp: -18, rep: -8, energy: -2 },
              verdict: { zh: '出境需要"单独同意"，不是隐私政策里的一句话。', en: '"Separate consent" is required — not a clause buried in a policy.' }
            }
          ],
          tip: {
            zh: '向境外提供个人信息，需具备三种法定条件之一：通过国家网信部门组织的安全评估、经专业机构认证、或按标准合同与境外接收方订立合同并备案。同时应当向个人告知境外接收方名称、联系方式、处理目的和方式、个人信息种类，并取得"单独同意"，事前开展个人信息保护影响评估并留存记录三年。2024 年《促进和规范数据跨境流动规定》放宽了部分门槛（如小规模出境的豁免），实操务必按最新规定核对数量阈值。',
            en: 'To send personal information abroad you need one of three statutory bases: a CAC security assessment, certification by an accredited body, or a filed standard contract with the overseas recipient. You must also tell the individual the recipient\'s name and contact details, the purpose and method of processing and the categories involved, and obtain their separate consent — plus run a personal information protection impact assessment beforehand and keep the record for three years. The 2024 Provisions on Promoting and Regulating Cross-Border Data Flows relaxed several thresholds, including exemptions for low-volume transfers, so check the current volume triggers before you rely on anything.'
          },
          law: {
            zh: '《个人信息保护法》第38条、第39条、第55条、第56条；《促进和规范数据跨境流动规定》（2024）',
            en: 'Personal Information Protection Law, arts. 38, 39, 55 & 56; Provisions on Promoting and Regulating Cross-Border Data Flows (2024)'
          }
        },
        {
          prompt: {
            zh: '为了做增长，市场团队买了一批"精准客户名单"，包含姓名和手机号。',
            en: 'For growth, your marketing team buys a list of "high-intent leads" with names and phone numbers.'
          },
          choices: [
            {
              text: { zh: '拒绝使用，来源不合法的个人信息不能碰', en: 'Refuse it — personal information from an unlawful source is untouchable' },
              score: 2, fx: { cash: -6, comp: 18, rep: 8, energy: -4 },
              verdict: { zh: '正确。侵犯公民个人信息是刑事罪名，不只是罚款。', en: 'Correct. Infringing citizens\' personal information is a criminal offence, not merely a fine.' }
            },
            {
              text: { zh: '用，但只发一次短信，量不大', en: 'Use it — one SMS blast, small volume' },
              score: 0, fx: { cash: 6, comp: -28, rep: -18, energy: -4 },
              verdict: { zh: '五十条即可入罪的情形是存在的，"量不大"不是抗辩。', en: 'Fifty records can be enough to cross a criminal threshold. "Small volume" is not a defence.' }
            },
            {
              text: { zh: '让供应商出个"数据合法来源承诺书"就用', en: 'Get the vendor to sign a "lawful source" undertaking, then use it' },
              score: 0, fx: { cash: 2, comp: -20, rep: -10, energy: -2 },
              verdict: { zh: '承诺书不能替代实际的合法性基础，责任还在你身上。', en: 'An undertaking is not a lawful basis. The liability stays with you.' }
            }
          ],
          tip: {
            zh: '处理个人信息必须有合法性基础（同意、订立履行合同所必需、法定义务、公共卫生/紧急情况、已公开信息合理范围内等），"买来的名单"通常一个都不占。《刑法》第253条之一规定了侵犯公民个人信息罪，非法获取、出售或提供公民个人信息情节严重的可处三年以下有期徒刑，特别严重的三年以上七年以下——司法解释对不同类型信息设定了 50 条、500 条、5000 条等入罪数量标准。',
            en: 'Processing personal information requires a lawful basis — consent, necessity for a contract, a legal obligation, public health or emergency, or reasonable use of already-public information. A purchased list generally satisfies none of them. Article 253a of the Criminal Law creates the offence of infringing citizens\' personal information: unlawfully obtaining, selling or supplying it carries up to three years where the circumstances are serious, and three to seven years where they are especially serious. Judicial interpretations set the criminal thresholds as low as 50, 500 or 5,000 records depending on the sensitivity of the data.'
          },
          law: {
            zh: '《个人信息保护法》第13条、第66条；《刑法》第253条之一；两高《关于办理侵犯公民个人信息刑事案件适用法律若干问题的解释》',
            en: 'Personal Information Protection Law, arts. 13 & 66; Criminal Law, art. 253a; SPC/SPP Interpretation on Criminal Cases of Infringing Citizens\' Personal Information'
          }
        }
      ]
    }
  ];

  /* ===================================================================== */
  var BOSS = {
    id: 'boss',
    monster: 'audit',
    name: { zh: '稽查熊', en: 'AUDITBEAR' },
    title: { zh: '年终大考', en: 'The Annual Review' },
    subtitle: { zh: '一年的选择，今天结账', en: "A year of choices, settled today" },
    dexNote: {
      zh: '一年只出现一次，但它把你这一年做的每件事都记在本子上了。',
      en: 'Shows up once a year, carrying a notebook with everything you did in it.'
    },
    intro: {
      zh: '十二月。一封《税务事项通知书》躺在你的信箱里。稽查熊来了。',
      en: 'December. A tax matters notice is sitting in your inbox. The audit bear has arrived.'
    },
    scenes: [
      {
        rare: 'falsebill',
        prompt: {
          zh: '一个"朋友"提出：他给你开 200 万咨询费发票，你付款后返还 190 万现金，双方都能少交税。',
          en: 'A "friend" proposes: he invoices you RMB 2 million in consulting fees, you pay, he returns 1.9 million in cash, and you both pay less tax.'
        },
        choices: [
          {
            text: { zh: '拒绝并保留证据', en: 'Refuse, and keep the evidence' },
            score: 2, fx: { cash: -2, comp: 20, rep: 10, energy: -2 },
            verdict: { zh: '正确。这是虚开增值税专用发票，是刑事犯罪。', en: 'Correct. That is false issuance of special VAT invoices — a criminal offence.' }
          },
          {
            text: { zh: '金额小一点就没事，先开 50 万试试', en: 'Do a smaller one — try 500,000 first' },
            score: 0, fx: { cash: 10, comp: -40, rep: -25, energy: -10 },
            verdict: { zh: '性质不因金额改变，金税系统的进销项比对会直接暴露。', en: 'The nature does not change with the amount, and input-output matching in the Golden Tax system surfaces it immediately.' }
          },
          {
            text: { zh: '答应，但让对方承诺出事他负责', en: 'Agree, but make him promise to take the blame' },
            score: 0, fx: { cash: 8, comp: -40, rep: -25, energy: -10 },
            verdict: { zh: '刑事责任不能靠私下约定转移。受票方同样构罪。', en: 'Criminal liability cannot be contracted away. The recipient of the invoice commits the offence too.' }
          }
        ],
        tip: {
          zh: '虚开增值税专用发票罪是重罪：《刑法》第205条规定，虚开增值税专用发票或者虚开用于骗取出口退税、抵扣税款的其他发票的，处三年以下有期徒刑或者拘役，并处罚金；数额巨大或者有其他特别严重情节的，处十年以上有期徒刑或者无期徒刑。开票方、受票方、介绍人都可能被追究。所谓"有真实业务对应"是唯一的分界线。',
          en: 'False issuance of special VAT invoices is a serious crime. Article 205 of the Criminal Law provides up to three years for falsely issuing special VAT invoices or other invoices used to fraudulently claim export refunds or credits; where the amount is huge or the circumstances especially serious, ten years to life. The issuer, the recipient and the intermediary can all be prosecuted. Whether a genuine transaction sits behind the invoice is the only line that matters.'
        },
        law: { zh: '《刑法》第205条；《发票管理办法》第21条', en: 'Criminal Law, art. 205; Measures for the Administration of Invoices, art. 21' }
      },
      {
        prompt: {
          zh: '稽查人员要求提供近三年的账簿、凭证和银行流水。你的会计说"有些原始凭证找不到了"。',
            en: 'The inspectors ask for three years of books, vouchers and bank records. Your accountant says some original vouchers cannot be found.'
        },
        choices: [
          {
            text: { zh: '如实说明情况，尽力补齐并配合检查', en: 'Explain honestly, reconstruct what you can, and cooperate' },
            score: 2, fx: { cash: -6, comp: 16, rep: 8, energy: -10 },
            verdict: { zh: '正确。配合的态度会实质影响处罚裁量。', en: 'Correct. Cooperation genuinely moves the needle on how penalties are set.' }
          },
          {
            text: { zh: '拖延，说系统坏了需要时间', en: 'Stall — say the system is down and you need time' },
            score: 0, fx: { cash: 0, comp: -22, rep: -12, energy: -8 },
            verdict: { zh: '拒绝或阻挠检查本身就是可处罚的行为。', en: 'Refusing or obstructing an inspection is itself a punishable act.' }
          },
          {
            text: { zh: '临时补做一套账', en: 'Quickly produce a fresh set of books' },
            score: 0, fx: { cash: -4, comp: -38, rep: -22, energy: -12 },
            verdict: { zh: '伪造、变造账簿凭证是独立的违法行为，情节严重构成犯罪。', en: 'Forging or altering books and vouchers is a separate violation, and a crime where serious.' }
          }
        ],
        tip: {
          zh: '账簿凭证依法应至少保存 10 年。纳税人有配合税务检查的义务，拒绝或阻挠检查可处罚款；伪造、变造、隐匿、擅自销毁账簿凭证，或在账簿上多列支出、不列少列收入，属于偷税，追缴税款、滞纳金并处 50%–5 倍罚款，构成犯罪的追究刑事责任。滞纳金按日万分之五计算，一年约 18.25%。',
          en: 'Books and vouchers must be kept for at least ten years. Taxpayers are obliged to cooperate with inspections, and refusing or obstructing one attracts a fine. Forging, altering, concealing or destroying books and vouchers — or overstating expenses and understating income — is tax evasion: back tax plus late-payment surcharge and a penalty of 50% to five times the tax, with criminal liability where the threshold is met. The surcharge runs at 0.05% per day, roughly 18.25% a year.'
        },
        law: { zh: '《税收征收管理法》第24条、第63条、第70条；《刑法》第201条', en: 'Tax Collection and Administration Law, arts. 24, 63 & 70; Criminal Law, art. 201' }
      },
      {
        prompt: {
          zh: '同时，一位被辞退的员工申请了劳动仲裁。你当时的理由是"公司业务调整，不需要这个岗位了"，直接通知他次日别来了。',
          en: 'Meanwhile a dismissed employee files for labour arbitration. Your reason was "business restructuring, the role is gone", told to them the day before their last day.'
        },
        choices: [
          {
            text: { zh: '这属于客观情况重大变化，应提前 30 日通知或额外支付一个月工资，并支付经济补偿（N+1）', en: 'That is a material change in objective circumstances: 30 days\' notice or one month\'s pay in lieu, plus severance (N+1)' },
            score: 2, fx: { cash: -14, comp: 18, rep: 6, energy: -8 },
            verdict: { zh: '正确，而且还须先经过与劳动者协商变更合同的程序。', en: 'Correct — and you must first attempt to renegotiate the contract with the employee.' }
          },
          {
            text: { zh: '公司有经营自主权，不需要补偿', en: 'The company decides its own headcount — no compensation owed' },
            score: 0, fx: { cash: 4, comp: -26, rep: -14, energy: -8 },
            verdict: { zh: '违法解除要支付二倍经济补偿金（2N），或应员工要求继续履行合同。', en: 'Unlawful termination costs twice the severance (2N), or reinstatement if the employee asks for it.' }
          },
          {
            text: { zh: '让他自己写辞职信，就没有补偿问题了', en: 'Have them write a resignation letter — problem solved' },
            score: 0, fx: { cash: 2, comp: -28, rep: -18, energy: -8 },
            verdict: { zh: '被迫辞职一旦被认定，赔偿照付，还会额外失分。', en: 'If the resignation is found to be forced, you pay anyway — and you look far worse doing it.' }
          }
        ],
        tip: {
          zh: '经济补偿按劳动者在本单位工作年限，每满一年支付一个月工资（六个月以上不满一年按一年算，不满六个月支付半个月）。依《劳动合同法》第40条解除的（不能胜任、医疗期满、客观情况重大变化），需提前 30 日书面通知或额外支付一个月工资，即 N+1。违法解除的，依第87条按经济补偿标准的二倍支付赔偿金（2N），或依第48条由劳动者要求继续履行合同。举证责任在用人单位。',
          en: 'Severance is one month\'s pay per full year of service (six months to a year counts as one year; under six months is half a month). Terminations under art. 40 of the Labour Contract Law — incompetence, expiry of a medical period, or a material change in objective circumstances — need 30 days\' written notice or an extra month\'s pay, hence N+1. An unlawful termination costs double the severance standard under art. 87 (2N), or reinstatement at the employee\'s election under art. 48. The burden of proof sits with the employer.'
        },
        law: { zh: '《劳动合同法》第40条、第46条、第47条、第48条、第87条', en: 'Labour Contract Law, arts. 40, 46, 47, 48 & 87' }
      },
      {
        prompt: {
          zh: '最后一题：熬过这一年后，你决定关掉公司回国。最省事的做法是？',
          en: 'Last question: having survived the year, you decide to wind up and go home. The easy way is?'
        },
        choices: [
          {
            text: { zh: '走清算和注销流程：先税务清税注销，再工商注销', en: 'Liquidate and deregister properly: tax clearance first, then the company registry' },
            score: 2, fx: { cash: -12, comp: 20, rep: 10, energy: -12 },
            verdict: { zh: '正确。麻烦，但这是唯一能真正脱身的方式。', en: 'Correct. Tedious, and the only way you actually get out.' }
          },
          {
            text: { zh: '不管了，直接回国，公司放着自生自灭', en: 'Just leave. Let the company fade away.' },
            score: 0, fx: { cash: 6, comp: -35, rep: -25, energy: -6 },
            verdict: { zh: '执照会被吊销，法定代表人和股东进入异常名录，三年内不得再任职，欠税还可能被限制出境。', en: 'The licence gets revoked, the legal rep and shareholders land on the abnormal list and are barred from holding office for three years, and unpaid tax can block your exit from the country.' }
          },
          {
            text: { zh: '把公司低价转让给一个陌生人', en: 'Sell the company cheap to a stranger' },
            score: 0, fx: { cash: 4, comp: -24, rep: -18, energy: -6 },
            verdict: { zh: '转让前的债务、税务责任不会随之转移，你仍可能被追。', en: 'Pre-transfer debts and tax liabilities do not travel with the shares. You can still be pursued.' }
          }
        ],
        tip: {
          zh: '注销顺序：股东会决议解散 → 成立清算组并备案 → 通知已知债权人并公告 → 清理财产、清缴税款和社保、清偿债务 → 税务注销（取得清税证明）→ 市场监管注销 → 银行、海关、外汇等注销。未办注销就"人走了"的，营业执照会被吊销，法定代表人三年内不得担任其他企业的董监高，公司列入严重违法失信名单。符合条件的可走简易注销，公示 20 日无异议即可，但有未结清债权债务的不适用。',
          en: 'The sequence: a shareholders\' resolution to dissolve, then form and file a liquidation committee, notify known creditors and publish notice, realise assets and settle taxes, social insurance and debts, obtain tax clearance and deregister with the tax authority, deregister with the market regulator, and finally close out bank, customs and FX registrations. Walking away instead gets the licence revoked, bars the legal representative from serving as a director, supervisor or senior officer of any company for three years, and puts the company on the serious-violation blacklist. A simplified deregistration exists — 20 days of public notice with no objection — but not where debts or claims remain unsettled.'
        },
        law: { zh: '《公司法》第229条、第232条、第241条；《市场主体登记管理条例》第31条、第33条', en: 'Company Law, arts. 229, 232 & 241; Regulations on Registration of Market Entities, arts. 31 & 33' }
      }
    ]
  };

  /* ===================================================================== *
   * Dex metadata.
   *
   * Name and flavour for the chapter creatures already live on the chapters
   * themselves, so only the collector-facing fields are here — kept in one
   * map so the whole roster can be read at a glance.
   *
   * `weak` is the useful one: it is the practical countermeasure, which turns
   * a completed dex into a checklist of everything that actually protects you.
   * ===================================================================== */
  var DEX_META = {
    visa: {
      type: { zh: '出入境', en: 'IMMIGRATION' }, danger: 4, rarity: 1,
      weak: {
        zh: '先由公司申请《外国人工作许可通知》，境外办 Z 签，入境 30 日内换领工作许可证和居留许可',
        en: 'Company files the Work Permit Notice, Z visa abroad, swap for the permit card and residence permit within 30 days of entry'
      }
    },
    entity: {
      type: { zh: '市场准入', en: 'MARKET ACCESS' }, danger: 3, rarity: 1,
      weak: {
        zh: '注册前核对最新版负面清单，选对主体形式，注册资本按真实需要填并确保五年内实缴',
        en: 'Check the current negative list before registering, pick the right vehicle, and set capital you can actually pay up within five years'
      }
    },
    chop: {
      type: { zh: '公司治理', en: 'GOVERNANCE' }, danger: 4, rarity: 1,
      weak: {
        zh: '用章登记制度：专人保管、用印审批、全程留痕；经营范围与开票项目保持一致',
        en: 'A chop register: one custodian, written approval, a full paper trail — and keep your invoicing inside your registered scope'
      }
    },
    fx: {
      type: { zh: '跨境资金', en: 'CROSS-BORDER FUNDS' }, danger: 3, rarity: 1,
      weak: {
        zh: '出资走资本金账户，资金只用于真实自用支出；分红前先弥补亏损、提公积金、办税务备案',
        en: 'Contribute through the capital account and spend only on genuine operating needs; before dividends, cover losses, fund the reserve and file with the tax authority'
      }
    },
    tax: {
      type: { zh: '税务', en: 'TAX' }, danger: 5, rarity: 1,
      weak: {
        zh: '付款必要发票，按期申报不做长期零申报，个税身份按 183 天和六年规则自己算清楚',
        en: 'No fapiao, no payment; file on time and never sit on zero-returns; work out your own residence position from the 183-day and six-year rules'
      }
    },
    labor: {
      type: { zh: '劳动', en: 'LABOUR' }, danger: 4, rarity: 1,
      weak: {
        zh: '用工一个月内签书面合同，试用期按法定上限约定，社保足额依法缴纳',
        en: 'Written contract within one month, probation inside the statutory caps, social insurance paid in full on the real base'
      }
    },
    ip: {
      type: { zh: '知识产权', en: 'IP' }, danger: 3, rarity: 1,
      weak: {
        zh: '进入市场前注册，中英文名和图形一并申请，核心类别之外做防御注册',
        en: 'Register before you enter, file the Chinese name, the English name and the logo together, and add defensive classes around your core'
      }
    },
    data: {
      type: { zh: '网络合规', en: 'CYBER' }, danger: 4, rarity: 1,
      weak: {
        zh: 'ICP 备案到位；处理个人信息要有合法性基础，出境走单独同意 + 影响评估 + 法定通道',
        en: 'ICP recordal in place; a lawful basis for every processing activity, and for transfers abroad: separate consent, an impact assessment and a statutory channel'
      }
    },
    boss: {
      type: { zh: '综合稽查', en: 'AUDIT' }, danger: 5, rarity: 2,
      weak: {
        zh: '账实相符，账簿凭证保存十年，配合检查如实说明；一年的干净记录就是最好的防御',
        en: 'Books that match reality, kept ten years, and honest cooperation — a clean year is the whole defence'
      }
    },
    exit: {
      type: { zh: '退出', en: 'EXIT' }, danger: 4, rarity: 2,
      weak: {
        zh: '按顺序走：股东会决议 → 清算组备案 → 通知并公告债权人 → 清税注销 → 工商注销 → 银行海关外汇注销',
        en: 'In order: shareholders\' resolution, file the liquidation committee, notify and publish to creditors, tax clearance, registry deregistration, then bank, customs and FX'
      }
    }
  };

  /* Rare encounters. Each is released by getting one specific question right,
     which rewards precision rather than an aggregate chapter score. The `rare`
     key on that scene points here. */
  var RARES = [
    {
      id: 'doublewage', monster: 'doublewage',
      name: { zh: '双倍工资鬼', en: 'DOUBLEWAGE' },
      type: { zh: '劳动', en: 'LABOUR' }, danger: 4, rarity: 2,
      from: { zh: '第六章 · 用人', en: 'Ch.6 · Hiring' },
      note: {
        zh: '诞生于用工满一个月的那一天。你没签书面合同，它就开始按月计数，最多数到十一。',
        en: 'Born the day an employee passes one month without a written contract. It starts counting months, and it can count to eleven.'
      },
      weak: {
        zh: '自用工之日起一个月内订立书面劳动合同',
        en: 'A written contract within one month of the first day of work'
      }
    },
    {
      id: 'squatter', monster: 'squatter',
      name: { zh: '抢注鸦', en: 'SQUATTERCROW' },
      type: { zh: '知识产权', en: 'IP' }, danger: 4, rarity: 2,
      from: { zh: '第七章 · 护城河', en: 'Ch.7 · The Moat' },
      note: {
        zh: '飞得比你快。你还在验证市场的时候，它已经在商标局排上队了。',
        en: 'Faster than you are. While you were still validating the market, it was already queuing at the trademark office.'
      },
      weak: {
        zh: '进入市场前完成注册，并保留全部在先使用证据',
        en: 'Register before you enter the market, and keep every scrap of prior-use evidence'
      }
    },
    {
      id: 'falsebill', monster: 'falsebill',
      name: { zh: '虚开鬼', en: 'FALSEBILL' },
      type: { zh: '刑事', en: 'CRIMINAL' }, danger: 5, rarity: 3,
      from: { zh: '年终大考', en: 'The Annual Review' },
      note: {
        zh: '总是伪装成朋友出现，开口就是替你省钱。它给的每一分钱，《刑法》第205条都已经标好了价格。',
        en: 'It always turns up as a friend, opening with how much it can save you. Article 205 of the Criminal Law has already priced every yuan it offers.'
      },
      weak: {
        zh: '只接受有真实业务对应的发票，其余一律拒绝并保留证据',
        en: 'Accept only invoices with a real transaction behind them; refuse the rest and keep the evidence'
      }
    },
    {
      id: 'travelban', monster: 'travelban',
      name: { zh: '限高锁', en: 'TRAVELBAN' },
      type: { zh: '强制执行', en: 'ENFORCEMENT' }, danger: 5, rarity: 3,
      from: { zh: '第三章 · 印章', en: 'Ch.3 · The Chop' },
      note: {
        zh: '挂在法定代表人身上，不锁公司只锁人：机票、高铁一等座，欠税未清时还有离境。',
        en: 'It clamps onto the legal representative, not the company. Flights, first-class rail — and, with tax outstanding, the way out of the country.'
      },
      weak: {
        zh: '出任法定代表人前确认你对公司有实际控制力；欠税、欠债及时了结',
        en: 'Make sure you genuinely control the company before taking the seat, and clear tax and debts as they fall due'
      }
    },
    {
      id: 'neglist', monster: 'neglist',
      name: { zh: '负面清单蛇', en: 'NEGLIST' },
      type: { zh: '市场准入', en: 'MARKET ACCESS' }, danger: 3, rarity: 2,
      from: { zh: '第二章 · 立业', en: 'Ch.2 · Setting Up' },
      note: {
        zh: '盘在你想进的那个行业门口。清单之外它看都不看你，清单之内它一寸不让。',
        en: 'Coiled at the door of the sector you want. Outside the list it will not even look at you; inside it, it does not move an inch.'
      },
      weak: {
        zh: '注册前核对最新版负面清单，必要时调整业务模式或引入中方股东',
        en: 'Check the current negative list before registering, and be ready to reshape the business or bring in a Chinese shareholder'
      }
    },
    {
      id: 'crossborder', monster: 'crossborder',
      name: { zh: '出境门', en: 'CROSSGATE' },
      type: { zh: '网络合规', en: 'CYBER' }, danger: 4, rarity: 3,
      from: { zh: '第八章 · 数据', en: 'Ch.8 · Data' },
      note: {
        zh: '个人信息要出境，只能从它这里过。它认三把钥匙：安全评估、专业认证、标准合同。',
        en: 'Personal information leaves China through this gate and no other. It accepts three keys: a security assessment, certification, or a filed standard contract.'
      },
      weak: {
        zh: '单独同意 + 个人信息保护影响评估 + 三条法定通道之一',
        en: 'Separate consent, a protection impact assessment, and one of the three statutory channels'
      }
    }
  ];

  /* The completion reward, and the punchline of the whole game. */
  var SECRET = {
    id: 'lawyer', monster: 'lawyer',
    name: { zh: '律师', en: 'THE LAWYER' },
    type: { zh: '传说', en: 'LEGENDARY' }, danger: 0, rarity: 3,
    from: { zh: '集齐前 16 只后出现', en: 'Appears once you hold all 16' },
    note: {
      zh: '传说中的存在。大多数人是在收到《税务事项通知书》那天第一次见到它的——而它本来在第一天就可以出现，收费还便宜得多。',
      en: 'A legendary encounter. Most people first meet it the day the tax notice arrives — though it could have shown up on day one, for a great deal less money.'
    },
    weak: {
      zh: '没有弱点。这是全书唯一站在你这边的。',
      en: 'No weakness. This is the only one in the book that is on your side.'
    }
  };

  /* Bonus dex entry, awarded when you reach the ending. */
  var BONUS_DEX = {
    id: 'exit',
    monster: 'exitghost',
    name: { zh: '注销鬼', en: 'DEREGHOST' },
    title: { zh: '退出', en: 'The Exit' },
    dexNote: {
      zh: '进来花了三周，出去花了九个月。没人在创业时想起它，每个人在结束时都遇到它。',
      en: 'Three weeks to get in, nine months to get out. Nobody thinks about it at the start. Everybody meets it at the end.'
    }
  };

  /* Ranked worst to best; first match from the top of the list wins. */
  var ENDINGS = [
    {
      min: 88, grade: 'S', sprite: 'icoStar',
      title: { zh: '合规大师', en: 'Compliance Master' },
      body: {
        zh: '你不只是活下来了，你活得很干净。签证、税务、劳动、数据，四条线都没有断。这样的外资企业主在中国其实不多——你大概率能把公司开过第三年，而大部分人倒在第二年的汇算清缴上。',
        en: 'You did not merely survive, you survived clean. Visa, tax, labour and data — four threads, none of them frayed. There are not many foreign founders in China like this. You will probably make it past year three, which is more than can be said for the ones who fold during their second annual tax settlement.'
      }
    },
    {
      min: 72, grade: 'A',
      title: { zh: '稳健创业者', en: 'Steady Founder' },
      body: {
        zh: '底子很正，判断力在线。踩了几个小坑，但都不致命。建议：把你答错的那几关重看一遍，那通常就是未来找你麻烦的方向。再配一个靠谱的本地会计，你会省下大量时间。',
        en: 'Solid instincts and sound judgement. You stepped in a few small holes, none of them fatal. Go back over the questions you got wrong — those are usually the exact directions trouble arrives from later. Pair yourself with a good local accountant and you will buy back a great deal of time.'
      }
    },
    {
      min: 55, grade: 'B',
      title: { zh: '摸着石头过河', en: 'Feeling for Stones' },
      body: {
        zh: '你能开起来，但走得磕磕绊绊。你的问题不是不努力，而是把"大家都这么干"当成了规则。在中国，很多"大家都这么干"的做法在被查到之前一直有效，被查到之后一次性清算。建议在花大钱之前先做一次合规体检。',
        en: 'You can get a company running, but it will be a bumpy ride. Your problem is not effort — it is treating "everyone does it this way" as if it were the rule. In China a great many of those practices work perfectly until the day they are examined, and then they settle up all at once. Get a compliance health check before you spend serious money.'
      }
    },
    {
      min: 35, grade: 'C',
      title: { zh: '高危选手', en: 'High Risk' },
      body: {
        zh: '坦白说，现在开公司对你不是机会，是风险敞口。你在签证、发票和劳动合同上的几个选择，任何一个真实发生都足以让你在第一年结束前出局。好消息是：这些坑全部可以用一次律师咨询和一个像样的会计避开，成本远低于你以为的。',
        en: 'Honestly, starting a company right now would be less an opportunity than an exposure. Several of your choices — on the visa, on invoices, on employment contracts — would each be enough on their own to end things before year one closes. The good news is that all of them can be avoided with one lawyer consultation and a competent accountant, for far less than you would guess.'
      }
    },
    {
      min: 0, grade: 'D',
      title: { zh: '已被限制高消费', en: 'Barred from High Consumption' },
      body: {
        zh: '游戏结束。你的公司被吊销执照，你作为法定代表人进了失信名单，机票买不了，高铁一等座坐不了，欠税未清前离境也受限。这个结局在现实里并不罕见，而且它几乎总是从一句"先干着，以后再补手续"开始的。回去把八个章节重玩一遍吧——这次读完每一条法律小贴士。',
        en: 'Game over. The licence is revoked, you are on the defaulter list as legal representative, you cannot book a flight or a first-class rail seat, and with tax outstanding you may not be able to leave the country either. This ending is not rare in real life, and it almost always begins with the same sentence: "let us just start, we will sort the paperwork out later." Play the eight chapters again — and read every legal tip this time.'
      }
    }
  ];

  return {
    id: 'foreign',
    title: { zh: '外国人来华创业', en: 'Founding as a Foreigner' },
    subtitle: { zh: '签证 · 执照 · 税务 · 数据', en: 'Visas, licences, tax and data' },
    blurb: {
      zh: '你刚落地中国，手里是一份商业计划书和一张不知道能不能用来上班的签证。八章，从签证走到数据合规。',
      en: 'You have just landed in China with a business plan and a visa you are not sure lets you work. Eight chapters, from the border to data compliance.'
    },
    icon: 'visa',
    chapters: CHAPTERS,
    boss: BOSS,
    bonusDex: BONUS_DEX,
    dexMeta: DEX_META,
    rares: RARES,
    secret: SECRET,
    endings: ENDINGS
  };
});
