// ============================================================
// CA FINAL PLANNER - DATA LAYER
// All static data: subjects, chapters, resources, quotes, tips
// ============================================================

const CA_DATA = {

  // ── SUBJECTS ──────────────────────────────────────────────
  subjects: {
    fr: {
      id: 'fr', name: 'Financial Reporting', shortName: 'FR',
      paper: 'Paper 1', group: 1, color: '#6366f1', colorLight: '#a5b4fc',
      bgGradient: 'linear-gradient(135deg, #4338ca, #6366f1)',
      recommendedHours: 190, icon: '📘', emoji: '📊',
      chapters: [
        { id: 1,  name: 'Conceptual Framework & Ind AS 1',          cat: 'A', hrs: 12, desc: 'Framework, qualitative characteristics, financial statements presentation' },
        { id: 2,  name: 'Ind AS 7 – Statement of Cash Flows',        cat: 'A', hrs: 8,  desc: 'Direct/indirect method, investing & financing activities' },
        { id: 3,  name: 'Ind AS 8, 10 – Policies & Events',          cat: 'A', hrs: 7,  desc: 'Accounting policy changes, corrections of errors, post-reporting events' },
        { id: 4,  name: 'Ind AS 113 – Fair Value Measurement',       cat: 'A', hrs: 10, desc: 'Fair value hierarchy, valuation techniques, disclosures' },
        { id: 5,  name: 'Ind AS 2, 16, 38 – Assets Standards',      cat: 'A', hrs: 14, desc: 'Inventories, PPE, intangibles — recognition and measurement' },
        { id: 6,  name: 'Ind AS 36 – Impairment of Assets',          cat: 'A', hrs: 10, desc: 'CGU, recoverable amount, impairment testing' },
        { id: 7,  name: 'Ind AS 41 – Agriculture',                   cat: 'C', hrs: 5,  desc: 'Biological assets, fair value less cost to sell' },
        { id: 8,  name: 'Ind AS 19 – Employee Benefits',             cat: 'A', hrs: 12, desc: 'Short-term benefits, defined benefit plans, actuarial gains/losses' },
        { id: 9,  name: 'Ind AS 37 – Provisions & Contingencies',    cat: 'A', hrs: 8,  desc: 'Recognition criteria, measurement, disclosure requirements' },
        { id: 10, name: 'Ind AS 12 – Income Taxes',                  cat: 'A', hrs: 12, desc: 'Current and deferred tax, temporary differences, recognition' },
        { id: 11, name: 'Ind AS 20 – Government Grants',             cat: 'B', hrs: 6,  desc: 'Recognition, presentation options, disclosure' },
        { id: 12, name: 'Ind AS 115 – Revenue from Contracts',       cat: 'A', hrs: 15, desc: '5-step model, performance obligations, variable consideration, contract costs' },
        { id: 13, name: 'Ind AS 32, 109, 107 – Financial Instruments', cat: 'A', hrs: 18, desc: 'Classification, measurement, ECL, hedge accounting, disclosures' },
        { id: 14, name: 'Ind AS 23 – Borrowing Costs',               cat: 'B', hrs: 6,  desc: 'Qualifying assets, capitalization rate, eligible borrowing costs' },
        { id: 15, name: 'Ind AS 33, 34, 102, 108 – Other Standards', cat: 'B', hrs: 12, desc: 'EPS, Interim Reporting, Share-based Payment, Segments' },
        { id: 16, name: 'Ind AS 116 – Leases',                       cat: 'A', hrs: 12, desc: 'Lessee accounting (ROU asset, lease liability), lessor accounting' },
        { id: 17, name: 'Consolidated Financial Statements',         cat: 'A', hrs: 25, desc: 'Subsidiaries, NCI, step acquisitions, intra-group eliminations' },
        { id: 18, name: 'Business Combinations (Ind AS 103)',         cat: 'A', hrs: 20, desc: 'Acquisition method, goodwill/bargain purchase, contingent consideration' },
        { id: 19, name: 'Associates & Joint Ventures (Ind AS 28)',    cat: 'A', hrs: 10, desc: 'Equity method, significant influence, joint arrangements' },
        { id: 20, name: 'Ethics & Technology in Accounting',         cat: 'C', hrs: 6,  desc: 'Technology trends in accounting, AI, blockchain, ethical dimensions' },
      ],
      tips: ['Focus 40% time on Consolidation + Business Combinations', 'Ind AS 115, 116, 19 carry heavy marks every attempt', 'Group standards thematically: Assets / Liabilities / Revenue / Consolidation', 'Compare Ind AS vs old AS in a table — examiners love this', 'Draw T-accounts for every numerical — never skip workings'],
      articleTip: 'Your audit/finance work at firm directly maps here! When you prepare financial statements or reconcile Ind AS, you are revising FR.',
      ytChannels: [
        { name: 'Parveen Sharma Sir', url: 'https://www.youtube.com/@ParveenSharmaEducation', desc: 'In-depth Ind AS with real-world examples' },
        { name: 'Sarthak Jain Sir', url: 'https://www.youtube.com/@c.a.sarthakjain', desc: 'Exam-oriented approach, concise explanations' },
        { name: 'Aakash Kandoi Sir', url: 'https://www.youtube.com/@AakashKandoi', desc: 'Comprehensive coverage with amendment updates' },
        { name: 'Ajay Agarwal Sir', url: 'https://www.youtube.com/@AjayAgarwalCA', desc: 'Fast track and revision lectures for FR' },
      ]
    },

    afm: {
      id: 'afm', name: 'Advanced Financial Management', shortName: 'AFM',
      paper: 'Paper 2', group: 1, color: '#8b5cf6', colorLight: '#c4b5fd',
      bgGradient: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
      recommendedHours: 165, icon: '📗', emoji: '💹',
      chapters: [
        { id: 1,  name: 'Financial Policy & Corporate Strategy',     cat: 'B', hrs: 10, desc: 'Financial objectives, agency theory, dividend policy, corporate governance' },
        { id: 2,  name: 'Risk Management – Identification & Types',  cat: 'A', hrs: 12, desc: 'Market, credit, liquidity, operational risk; VaR; risk measurement tools' },
        { id: 3,  name: 'Advanced Capital Budgeting',               cat: 'A', hrs: 18, desc: 'APV, real options, capital rationing, scenario & sensitivity analysis' },
        { id: 4,  name: 'Security Analysis & Valuation',            cat: 'A', hrs: 15, desc: 'DCF, P/E, EV/EBITDA, bond valuation, yield concepts' },
        { id: 5,  name: 'Portfolio Management',                     cat: 'A', hrs: 12, desc: 'Markowitz, CML, SML, CAPM, beta, Sharpe/Treynor/Jensen measures' },
        { id: 6,  name: 'Securitization & Mutual Funds',            cat: 'B', hrs: 10, desc: 'ABS, MBS, CDO, types of mutual funds, NAV, SIP analysis' },
        { id: 7,  name: 'Derivatives – Futures & Forwards',         cat: 'A', hrs: 15, desc: 'Pricing, hedging strategies, basis risk, commodity futures' },
        { id: 8,  name: 'Derivatives – Options & Strategies',       cat: 'A', hrs: 15, desc: 'Options pricing (BS model), Greeks, spreads, straddle/strangle' },
        { id: 9,  name: 'Swaps (IRS & Currency)',                   cat: 'A', hrs: 10, desc: 'Interest rate & currency swap pricing, comparative advantage' },
        { id: 10, name: 'Forex Exposure & Risk Management',         cat: 'A', hrs: 18, desc: 'Transaction/translation/economic exposure, hedging with forwards, options' },
        { id: 11, name: 'International Financial Management',       cat: 'B', hrs: 12, desc: 'IRP, PPP, Fisher effect, international capital budgeting' },
        { id: 12, name: 'Interest Rate Risk Management',            cat: 'B', hrs: 10, desc: 'Duration, convexity, immunization, FRAs, interest rate futures' },
        { id: 13, name: 'Business Valuation',                       cat: 'A', hrs: 15, desc: 'DCF (FCFF/FCFE), DDM, relative valuation, EVA, MVA' },
        { id: 14, name: 'Mergers, Acquisitions & Restructuring',    cat: 'A', hrs: 12, desc: 'Valuation, synergies, post-merger EPS, LBO, reverse merger' },
        { id: 15, name: 'Startup Finance & Venture Capital',        cat: 'C', hrs: 6,  desc: 'Angel/VC stages, term sheets, dilution, exit options' },
      ],
      tips: ['Create a master formula sheet — AFM has 100+ formulas', 'Derivatives + Forex together = 30–40% of exam. Prioritize these.', 'Study CAPM, Options (Black-Scholes), and Swaps as priority blocks', 'Practice numericals daily — speed and accuracy are both tested', 'Revision technique: Formula first → one example → past question'],
      articleTip: 'If your firm handles treasury operations, forex transactions, or investment decisions, observe and relate to AFM. Forex hedging and portfolio management come alive in practice!',
      ytChannels: [
        { name: 'Aaditya Jain Sir', url: 'https://www.aadityajain.com/', desc: "India's leading AFM faculty — crystal clear concepts" },
        { name: 'Sanjay Saraf Sir', url: 'https://www.youtube.com/@SanjaySarafEducationalInstitute', desc: 'Comprehensive strategy with exam-focused problem solving' },
        { name: 'Ajay Agarwal Sir', url: 'https://www.youtube.com/@AjayAgarwalCA', desc: 'Free revision marathons and quick concept videos' },
        { name: 'Ashish Kalra Sir', url: 'https://www.igpinstitute.org/', desc: 'Building conceptual foundations from the ground up' },
      ]
    },

    audit: {
      id: 'audit', name: 'Advanced Auditing & Professional Ethics', shortName: 'Audit',
      paper: 'Paper 3', group: 1, color: '#06b6d4', colorLight: '#67e8f9',
      bgGradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
      recommendedHours: 135, icon: '📙', emoji: '🔍',
      chapters: [
        { id: 1,  name: 'Quality Control (SQC 1, SA 220)',                  cat: 'A', hrs: 8,  desc: 'EQCR, engagement team quality, firm-level controls' },
        { id: 2,  name: 'General Auditing Principles (SA 200–299)',          cat: 'A', hrs: 10, desc: 'Reasonable assurance, professional skepticism, audit evidence' },
        { id: 3,  name: 'Audit Planning & Strategy (SA 300–315)',            cat: 'A', hrs: 12, desc: 'Understanding entity, risk assessment procedures, WCGW' },
        { id: 4,  name: 'Materiality & Risk Responses (SA 320, 330, 450)',   cat: 'A', hrs: 12, desc: 'Setting materiality, responses to assessed risks, controls testing' },
        { id: 5,  name: 'Audit Evidence (SA 500–580)',                       cat: 'A', hrs: 12, desc: 'Confirmations, analytical procedures, sampling, written representations' },
        { id: 6,  name: 'Audit Completion (SA 560, 570, 580)',               cat: 'A', hrs: 8,  desc: 'Subsequent events, going concern evaluation, management reps' },
        { id: 7,  name: 'Audit Reporting (SA 700–720)',                      cat: 'A', hrs: 10, desc: 'Unmodified/modified opinions, KAM, emphasis of matter, CARO 2020' },
        { id: 8,  name: 'Specialized Areas (SA 800–810)',                    cat: 'B', hrs: 8,  desc: 'Special purpose frameworks, review engagements, agreed-upon procedures' },
        { id: 9,  name: 'Digital Auditing & IT Audit',                       cat: 'B', hrs: 8,  desc: 'CAAT, data analytics, cybersecurity, ERP audit considerations' },
        { id: 10, name: 'Group Audits (SA 600)',                             cat: 'B', hrs: 8,  desc: 'Group auditor responsibilities, component auditor instructions' },
        { id: 11, name: 'Audit of Banks & NBFCs',                           cat: 'A', hrs: 12, desc: 'RBI guidelines, LFAR, branch audit, NPA provisioning, Form 3CD' },
        { id: 12, name: 'PSU & Government Audit',                           cat: 'C', hrs: 6,  desc: 'CAG audit, performance audit, propriety audit, compliance reports' },
        { id: 13, name: 'Internal Audit, Due Diligence & Forensics',        cat: 'B', hrs: 10, desc: 'IIA standards, fraud investigation, forensic evidence, DD reports' },
        { id: 14, name: 'ESG & Sustainability Assurance',                    cat: 'C', hrs: 5,  desc: 'BRSR, GRI standards, limited assurance on sustainability info' },
        { id: 15, name: 'Professional Ethics & Auditor Liability',           cat: 'A', hrs: 15, desc: 'Code of Ethics, IESBA, independence threats & safeguards, legal liability' },
      ],
      tips: ['Group SAs by series (200s, 300s, 500s, 700s) and revise as clusters', 'Professional Ethics always comes in exam — never skip', 'Practice LOC format: Law → Observation → Conclusion for every answer', 'Read suggested answers from ICAI for proper presentation style', 'Pankaj Garg\'s revision charts are gold for SAs memorization'],
      articleTip: 'YOUR ARTICLESHIP IS YOUR AUDIT REVISION! Every audit you do at firm maps to specific SAs. Document your observations — they become your best examples in answers.',
      ytChannels: [
        { name: 'Pankaj Garg Sir', url: 'https://www.altclasses.in/', desc: 'Best Audit faculty — chart-based SA revision, exam-oriented' },
        { name: 'Shubham Keswani Sir', url: 'https://www.youtube.com/@ShubhamKeswani', desc: 'Detailed SA-wise lectures with practical examples' },
        { name: 'Surbhi Bansal Ma\'am', url: 'https://www.surbhibansal.com/', desc: 'Concise theory notes, exam-oriented approach' },
        { name: 'Hemant Somani Sir', url: 'https://www.youtube.com/@HemantSomani', desc: 'Excellent revision videos and mnemonics for SAs' },
      ]
    },

    dt: {
      id: 'dt', name: 'Direct Tax Laws & International Taxation', shortName: 'DT',
      paper: 'Paper 4', group: 2, color: '#f59e0b', colorLight: '#fde68a',
      bgGradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      recommendedHours: 190, icon: '📕', emoji: '🏛️',
      chapters: [
        { id: 1,  name: 'Basic Concepts & Residential Status',          cat: 'A', hrs: 8,  desc: 'Scope of total income, PY, AY, residential status, deemed income' },
        { id: 2,  name: 'Income from Salaries',                         cat: 'B', hrs: 8,  desc: 'Allowances, perquisites valuation, retirement benefits, deductions' },
        { id: 3,  name: 'Income from House Property',                   cat: 'B', hrs: 6,  desc: 'Annual value, self-occupied vs let-out, deemed rent, deductions' },
        { id: 4,  name: 'PGBP – Profits from Business/Profession',     cat: 'A', hrs: 20, desc: 'S. 28–44, allowable/disallowable expenses, specific allowances, special provisions' },
        { id: 5,  name: 'ICDS – Income Computation Standards',         cat: 'A', hrs: 8,  desc: 'All 10 ICDS, deviations from GAAP, practical application scenarios' },
        { id: 6,  name: 'Capital Gains',                                cat: 'A', hrs: 18, desc: 'Short-term/long-term, cost of acquisition, exemptions u/s 54-54F, slump sale' },
        { id: 7,  name: 'Income from Other Sources',                    cat: 'B', hrs: 6,  desc: 'Dividend, interest, gifts, winnings, deemed dividends' },
        { id: 8,  name: 'Clubbing, Set-off & Carry Forward',           cat: 'B', hrs: 8,  desc: 'Clubbing provisions, inter/intra-head set-off, carry forward restrictions' },
        { id: 9,  name: 'Deductions u/s 80C to 80U',                   cat: 'A', hrs: 10, desc: 'Key deductions, combined limits, conditions, new tax regime impact' },
        { id: 10, name: 'MAT (Section 115JB) & AMT',                   cat: 'A', hrs: 10, desc: 'Book profit calculation, MAT adjustments, MAT credit, foreign companies' },
        { id: 11, name: 'Assessment of Special Entities',              cat: 'B', hrs: 12, desc: 'AOP/BOI, HUF, partnership firms, trusts, political parties, co-operative societies' },
        { id: 12, name: 'TDS & TCS',                                   cat: 'A', hrs: 12, desc: 'Section-wise TDS rates, time limits, certificates, payments to NR' },
        { id: 13, name: 'Tax Planning, GAAR & POEM',                   cat: 'A', hrs: 10, desc: 'Permissible vs impermissible arrangements, GAAR provisions, POEM rules' },
        { id: 14, name: 'Assessment Procedures & Appeals',             cat: 'B', hrs: 10, desc: 'Return filing, scrutiny/assessment types, CIT(A), ITAT, High Court, Supreme Court' },
        { id: 15, name: 'Non-Resident Taxation (Sec 115)',             cat: 'A', hrs: 15, desc: 'NRI/RNOR taxation, royalty, FTS, business connection, DAPE, POEM' },
        { id: 16, name: 'Transfer Pricing',                            cat: 'A', hrs: 18, desc: 'ALP computation methods, documentation, safe harbor rules, APAs, MAP' },
        { id: 17, name: 'BEPS, Tax Treaties & Model Conventions',      cat: 'A', hrs: 15, desc: 'BEPS action plans, OECD/UN models, MLI, tax treaty interpretation, LoB' },
        { id: 18, name: 'Advance Ruling & Equalization Levy',          cat: 'C', hrs: 5,  desc: 'AAR/AAAR, binding nature, equalization levy applicability and rates' },
      ],
      tips: ['Bhanwar Borana method: PGBP + ICDS + MAT as one linked block', 'Capital Gains + Exemptions (54 series) = high-value chapter group', 'Int\'l Tax = 20–25 marks every attempt — Transfer Pricing + BEPS are must-do', 'Finance Act amendments are CRITICAL — always use updated notes', 'Write full computation workings — presentation counts for 3–4 marks per question'],
      articleTip: 'Every income tax return, TDS filing, or tax audit at your firm is direct DT revision. Connect each filing to the section in your textbook — it locks in the memory!',
      ytChannels: [
        { name: 'Bhanwar Borana Sir', url: 'https://bhanwarborana.com/', desc: 'India\'s best DT faculty — linkage method, compact revision, amendment videos' },
        { name: 'Vijay Sarda Sir', url: 'https://www.youtube.com/@CAVijaySarda', desc: 'Systematic DT approach with comprehensive coverage' },
        { name: 'Aarish Khan Sir', url: 'https://www.youtube.com/@CAAarishKhan', desc: 'International taxation specialist — TP and BEPS expert' },
        { name: 'Atul Agarwal Sir', url: 'https://www.youtube.com/@AjayAgarwalCA', desc: 'Fast track DT revision notes and videos' },
      ]
    },

    idt: {
      id: 'idt', name: 'Indirect Tax Laws', shortName: 'IDT',
      paper: 'Paper 5', group: 2, color: '#10b981', colorLight: '#6ee7b7',
      bgGradient: 'linear-gradient(135deg, #059669, #10b981)',
      recommendedHours: 160, icon: '📔', emoji: '💼',
      chapters: [
        { id: 1,  name: 'GST – Constitutional Background & Levy',   cat: 'A', hrs: 8,  desc: '101st amendment, dual GST, levy and collection, taxable event' },
        { id: 2,  name: 'Supply – Definition, Composite & Mixed',   cat: 'A', hrs: 12, desc: 'Scope of supply, deemed supply, composite/mixed supply rules' },
        { id: 3,  name: 'Exemptions from GST',                      cat: 'A', hrs: 8,  desc: 'Exempt supplies, negative list, zero-rated vs exempt distinction' },
        { id: 4,  name: 'Place of Supply (IGST Act)',               cat: 'A', hrs: 12, desc: 'POS for goods/services, B2B vs B2C, cross-border services' },
        { id: 5,  name: 'Time of Supply',                           cat: 'A', hrs: 6,  desc: 'TOS for goods and services, continuous supply, reverse charge' },
        { id: 6,  name: 'Value of Supply',                          cat: 'A', hrs: 8,  desc: 'Transaction value, inclusions/exclusions, related party, discounts' },
        { id: 7,  name: 'Input Tax Credit',                         cat: 'A', hrs: 20, desc: 'Eligibility, blocked credits (Sec 17(5)), reversal, ITC on capital goods, GSTR-2B reconciliation' },
        { id: 8,  name: 'Registration under GST',                   cat: 'B', hrs: 8,  desc: 'Threshold limits, compulsory registration, ISD, casual/non-resident taxable persons' },
        { id: 9,  name: 'Tax Invoice, Accounts & E-way Bill',       cat: 'B', hrs: 7,  desc: 'Invoice requirements, e-invoicing, debit/credit notes, E-way bill rules' },
        { id: 10, name: 'Payment of Tax & Returns',                 cat: 'A', hrs: 10, desc: 'GSTR-1, GSTR-3B, annual return, ITC reconciliation, interest & late fees' },
        { id: 11, name: 'Refunds under GST',                        cat: 'A', hrs: 10, desc: 'Exports/zero-rated, inverted duty, time limits, procedure, interest' },
        { id: 12, name: 'Assessment, Audit & Inspection',           cat: 'B', hrs: 8,  desc: 'Self-assessment, scrutiny, best judgment, GST audit, search & seizure' },
        { id: 13, name: 'Demands, Recovery & Offences',             cat: 'B', hrs: 8,  desc: 'SCN, adjudication, penalties, prosecution, compounding, anti-profiteering' },
        { id: 14, name: 'Appeals & Advance Ruling',                 cat: 'C', hrs: 5,  desc: 'Appellate authority, AAAR, AAR binding nature and procedure' },
        { id: 15, name: 'Customs – Levy, Classification & Valuation', cat: 'A', hrs: 18, desc: 'Customs Act, BCD, SWS, HS classification, customs valuation rules' },
        { id: 16, name: 'Import/Export Procedures & Warehousing',   cat: 'B', hrs: 10, desc: 'Bill of entry, shipping bill, warehousing bond, SEZ, EOU provisions' },
        { id: 17, name: 'Customs Refunds & Duty Drawback',          cat: 'B', hrs: 6,  desc: 'Duty drawback rates, brand rate fixation, baggage rules, small importers' },
        { id: 18, name: 'Foreign Trade Policy (FTP)',               cat: 'C', hrs: 8,  desc: 'SEIS, EPCG, advance authorization, EOU, status holders under FTP' },
      ],
      tips: ['IDT = GST (75%) + Customs (20%) + FTP (5%) — weight your time accordingly', 'ITC (Chapter 7) is the most complex and highest-scoring — master this first', 'Amendments/circulars/notifications are CRITICAL in IDT — use updated notes only', 'Vishal Bhattad method: POS + TOS + VOS together as one interconnected block', 'Write answers referencing specific sections (e.g., "As per S.16 of CGST Act")'],
      articleTip: 'GST return filing, ITC reconciliation, and refund applications at your firm IS your IDT revision. Every client you file GSTR-3B for is another chapter practiced!',
      ytChannels: [
        { name: 'Riddhi Baghmar Ma\'am', url: 'https://www.riddhibaghmar.com/', desc: 'Highly popular IDT classes — conceptual summary videos, revision marathons, and memory strategies.' },
        { name: 'Vishal Bhattad Sir (VSmart Academy)', url: 'https://vsmartacademy.com/', desc: 'VSmart IDT classes — comprehensive GST & Customs with famous visual memory charts.' },
        { name: 'Tharun Raj Sir (Tharun\'s Brainery)', url: 'https://tharunsbrainery.com/', desc: 'Concept-driven, highly comprehensive IDT and GST problem-solving bootcamps.' },
        { name: 'Yashvant Mangal Sir', url: 'https://www.yashvantmangal.com/', desc: 'Clear conceptual explanations, visual guides, and quick revision techniques.' }
      ]
    },

    ibs: {
      id: 'ibs', name: 'Integrated Business Solutions', shortName: 'IBS',
      paper: 'Paper 6', group: 2, color: '#f43f5e', colorLight: '#fda4af',
      bgGradient: 'linear-gradient(135deg, #be123c, #f43f5e)',
      recommendedHours: 150, icon: '📓', emoji: '🎯',
      chapters: [
        { id: 1, name: 'Business Strategy & Strategic Management',  cat: 'A', hrs: 25, desc: 'SWOT, PESTEL, Porter\'s 5 forces, BCG matrix, Ansoff matrix, Blue Ocean' },
        { id: 2, name: 'Financial Analysis & Decision Making',     cat: 'A', hrs: 30, desc: 'Ratio analysis, EVA, cash flow analysis, working capital, financial restructuring' },
        { id: 3, name: 'Risk Management & Internal Controls',      cat: 'A', hrs: 25, desc: 'ERM framework, COSO, risk identification, internal audit, control environment' },
        { id: 4, name: 'Information Technology & Systems Audit',   cat: 'A', hrs: 25, desc: 'IT governance, COBIT, IS audit procedures, ERP audit, cybersecurity framework' },
        { id: 5, name: 'Ethics, Governance & Sustainability',      cat: 'A', hrs: 25, desc: 'Corporate governance codes, CSR, ESG reporting, whistleblowing, BRSR' },
        { id: 6, name: 'Case Study Integration & Practice',        cat: 'A', hrs: 30, desc: 'Multidisciplinary case studies — apply all subjects together, time management' },
      ],
      tips: ['IBS is an OPEN-BOOK exam — focus on application, not memorization', 'Practice 2–3 full case studies per week in Phase 2', 'Structure every answer: Background → Issue → Analysis → Recommendation', 'Time management: 3.5 hours for a complex case — practice timed writing', 'Your articleship exposure IS your IBS preparation — use real examples'],
      articleTip: 'IBS literally IS your articleship experience presented academically. Your firm\'s risk, audit, finance, and governance work all appear in IBS case studies!',
      ytChannels: [
        { name: '1FIN by IndigoLearn', url: 'https://www.1fin.in/', desc: 'Pioneer in IBS — multidisciplinary case study preparation, strategy guides, and books.' },
        { name: 'Sanjay Saraf Sir (SSEI)', url: 'https://www.ssei.co.in/', desc: 'SSEI classes — integrated case studies bridging corporate finance, risk management, and governance.' },
        { name: 'CA Final IBS Strategy (AIR1 CA)', url: 'https://www.air1ca.com/', desc: 'Strategy marathons and past case study evaluations for IBS.' }
      ]
    }
  },

  // ── OFFICIAL ICAI RESOURCES ────────────────────────────────
  freeResources: [
    { name: 'ICAI BoS Knowledge Portal', url: 'https://www.icai.org/post/board-of-studies-portal', desc: 'Official BoS Portal for CA Final Study Materials, RTPs, MTPs, and Suggested Answers.', icon: '🏛️', category: 'icai' },
    { name: 'ICAI Digital Learning Hub (DLH)', url: 'https://learning.icai.org/', desc: 'Free online e-learning modules, official webinars, and study lectures for CA Final.', icon: '🎯', category: 'icai' },
    { name: 'ICAI Board of Studies YouTube', url: 'https://www.youtube.com/@ICAIOrgbos', desc: 'Official ICAI YouTube channel hosting regular live and recorded subject coaching classes.', icon: '🎥', category: 'icai' },
    { name: 'ICAI CDS Portal', url: 'https://icai-cds.org/', desc: 'Central Distribution System to order physical copies of the latest study materials and revision kits.', icon: '📦', category: 'icai' }
  ],

  // ── MOTIVATIONAL QUOTES ────────────────────────────────────
  quotes: [
    { text: "Take a break. Your competitor is currently finishing the chapter you just skipped.", author: "Reality Check" },
    { text: "Sleep is for those who are fine with giving an extra attempt.", author: "Sarcastic Senior" },
    { text: "Oh, you're tired? Please, tell that to the syllabus that doesn't care.", author: "The Syllabus" },
    { text: "Keep scrolling Instagram. I'm sure the auditor will ask about reels in your interview.", author: "Future You" },
    { text: "Another coffee break? Might as well register for the next attempt while you're at it.", author: "Tough Love Mentor" },
    { text: "Yes, Sundays are for relaxing... if you already have the 'CA' prefix. Do you?", author: "The Mirror" },
    { text: "Procrastination is just you donating your precious time to the ICAI exam fees fund.", author: "Finance Minister" },
    { text: "Sure, go hang out with friends. They'll celebrate their promotions while you study for finals again.", author: "Harsh Truth" },
    { text: "Your phone won't clear the exam for you. Put it down.", author: "Common Sense" },
    { text: "You can either suffer the pain of discipline or the pain of regret. Choose your pain.", author: "Jim Rohn (but angrier)" },
    { text: "Every time you say 'I'll do it tomorrow', someone else's AIR rank goes up.", author: "Rank Holder" },
    { text: "A 5-minute break turning into a 2-hour movie is why the pass percentage is 10%.", author: "Statistics" },
    { text: "Crying over the syllabus won't reduce it. Only studying will. Grab the book.", author: "Logical Mind" },
    { text: "You wanted to be a CA, right? Then stop acting like a high schooler and put in the hours.", author: "Your Conscience" },
    { text: "The CA prefix looks great on a nameplate. Right now, your nameplate says 'Still Trying'.", author: "Motivation Check" },
  ],

  // ── ARTICLESHIP SCHEME INFO ────────────────────────────────
  articleSchemes: {
    new: {
      id: 'new', label: 'New Scheme (2023+)', duration: 2,
      fullLabel: 'New Scheme – 2 Years Integrated Practical Training (IPT)',
      description: 'Under the 2023 ICAI scheme, you complete 2 years of integrated practical training after clearing both groups of CA Intermediate + ICITSS. Self-Paced Online Modules (SPOM) must also be completed.',
      eligibility: 'Can appear for CA Final after completing 2 years of training + 6 months (i.e., 2.5 years total from article start).',
      leaves: '12 days per year',
      color: '#6366f1',
      perks: ['Shorter duration — 2 years vs 3 years', 'More focused and structured training', 'Early entry into CA Final exam', 'SPOM completion gives additional knowledge'],
      challenges: ['Less time means more intense preparation', 'Office + study balance is harder in 2 years', 'SPOM modules add workload', 'Fewer leaves (12 days/year)'],
      studyAdvice: 'With only 2 years, start CA Final prep by month 4. Aim for 2-3 hrs weekdays and 6-8 hrs weekends. Pre-exam leave should ideally be 30-40 days.'
    },
    old: {
      id: 'old', label: 'Old Scheme (Before 2023)', duration: 3,
      fullLabel: 'Old Scheme – 3 Years Traditional Articleship',
      description: 'Under the old ICAI scheme, you complete 3 years of articleship. You can appear for CA Final in the last 6 months of your articleship period.',
      eligibility: 'Can appear for CA Final in the last 6 months (i.e., after 2.5 years of articleship completion).',
      leaves: 'Approx. 35 days over 3 years',
      color: '#f59e0b',
      perks: ['More time to prepare', 'More practical exposure across 3 years', 'Better work-study balance', 'More leaves available'],
      challenges: ['Longer wait before appearing for final', 'Risk of becoming complacent', 'Study momentum may dip over 3 years', 'Old syllabus may have some different areas'],
      studyAdvice: 'With 3 years, you can start serious CA Final prep from month 8-10. Maintain 2 hrs/weekday consistency. Use the extended timeline to build conceptual depth.'
    }
  },

  // ── EXAM ATTEMPTS ──────────────────────────────────────────
  examAttempts: [
    { id: 'nov2026', label: 'November 2026', date: '2026-11-01', month: 'Nov', year: 2026 },
    { id: 'may2027', label: 'May 2027',      date: '2027-05-01', month: 'May', year: 2027 },
    { id: 'nov2027', label: 'November 2027', date: '2027-11-01', month: 'Nov', year: 2027 },
    { id: 'may2028', label: 'May 2028',      date: '2028-05-01', month: 'May', year: 2028 },
    { id: 'nov2028', label: 'November 2028', date: '2028-11-01', month: 'Nov', year: 2028 },
    { id: 'may2029', label: 'May 2029',      date: '2029-05-01', month: 'May', year: 2029 },
    { id: 'nov2029', label: 'November 2029', date: '2029-11-01', month: 'Nov', year: 2029 },
    { id: 'may2030', label: 'May 2030',      date: '2030-05-01', month: 'May', year: 2030 },
    { id: 'nov2030', label: 'November 2030', date: '2030-11-01', month: 'Nov', year: 2030 },
  ],

  // ── STUDY PHASES ───────────────────────────────────────────
  phases: {
    1: { name: 'Phase 1: Conceptual Clarity', icon: '🧠', color: '#6366f1', ratio: '70% concepts · 30% practice',
         desc: 'Build deep understanding. Cover ALL chapters including C-category. Make your own notes.', 
         tasks: ['Read ICAI Study Material chapter by chapter', 'Watch faculty lectures for complex topics', 'Create personal summary notes', 'Solve basic examples and illustrations'] },
    2: { name: 'Phase 2: Rigorous Practice',  icon: '⚡', color: '#f59e0b', ratio: '30% concepts · 70% practice',
         desc: 'Apply your knowledge under timed conditions. Identify and fix weak areas.',
         tasks: ['Solve RTPs and MTPs for each subject', 'Attempt past 5 years question papers', '3-hour mock test sessions at exam timing', 'Revisit weak chapters from notes'] },
    3: { name: 'Phase 3: Exam Ready',         icon: '🚀', color: '#10b981', ratio: '10% concepts · 90% revision',
         desc: 'Speed revision using summary notes. Full mock tests. Focus on presentation excellence.',
         tasks: ['Rapid revision using your summary notes', 'Full 3-hour mock papers daily', 'Answer writing and presentation practice', 'Formula/provision/SA sheets only'] }
  },

  // ── STUDY TECHNIQUES ───────────────────────────────────────
  techniques: [
    { name: 'Pomodoro Technique',   icon: '🍅', desc: '25 min focused study + 5 min break. After 4 cycles, take a 30-min break. Perfect for articles students.' },
    { name: 'Active Recall',        icon: '🔄', desc: 'Close your book and recall what you just studied. Test yourself. Far more effective than passive reading.' },
    { name: 'Feynman Technique',    icon: '✏️', desc: 'Explain the concept in simple words as if teaching a 10-year-old. Gaps in your explanation = gaps in understanding.' },
    { name: 'Spaced Repetition',    icon: '📅', desc: 'Review at increasing intervals: Day 1 → Day 3 → Day 7 → Day 30. Beat the forgetting curve.' },
    { name: 'Mind Mapping',         icon: '🗺️', desc: 'Create visual connections between concepts. Excellent for theory subjects like Audit and IBS.' },
    { name: 'Exam Simulation',      icon: '⏱️', desc: 'Solve past papers under exact exam conditions (2:00 PM start, 3 hours). Build stamina and time awareness.' },
  ],

  // ── ARTICLESHIP DAILY SCHEDULE TEMPLATES ──────────────────
  articleSchedules: {
    weekday: {
      slots: [
        { time: '05:00–07:00', label: 'Morning Power Session', type: 'study', icon: '🌅', desc: 'Best time for difficult subjects — fresh mind, high retention. Use for FR/DT/AFM numericals.' },
        { time: '07:00–09:00', label: 'Morning Routine + Commute', type: 'break', icon: '🚇', desc: 'Listen to audio notes, revision podcasts, or flashcard review during commute.' },
        { time: '09:00–18:00', label: 'Office / Articleship', type: 'office', icon: '🏢', desc: 'Focus on your work. Relate office tasks to your subjects — it\'s indirect revision!' },
        { time: '18:00–19:30', label: 'Commute + Decompression', type: 'break', icon: '🌆', desc: 'Light reading, audio notes during commute. Rest when you reach home.' },
        { time: '20:00–22:00', label: 'Evening Study Session', type: 'study', icon: '🌙', desc: 'Theory revision, short practice problems. Do NOT start heavy numericals here.' },
        { time: '22:00–05:00', label: 'Sleep (Priority!)', type: 'sleep', icon: '😴', desc: 'Never compromise on sleep. 7 hours minimum. A rested brain retains 40% better.' },
      ]
    },
    weekend: {
      slots: [
        { time: '05:00–09:00', label: 'Weekend Power Block 1', type: 'study', icon: '🔥', desc: 'Heavy numerical practice — FR consolidation, AFM derivatives, DT computations.' },
        { time: '09:00–10:00', label: 'Breakfast + Break', type: 'break', icon: '☕', desc: 'Proper meal, light movement, relax.' },
        { time: '10:00–13:00', label: 'Weekend Power Block 2', type: 'study', icon: '⚡', desc: 'Theory + practical mixed. Cover new chapters or attempt mock tests.' },
        { time: '13:00–14:30', label: 'Lunch + Rest', type: 'break', icon: '🍛', desc: 'Mandatory rest. Power nap if needed.' },
        { time: '14:30–17:30', label: 'Mock Test / Past Paper', type: 'study', icon: '📝', desc: 'Attempt a 3-hour mock paper under exam conditions (2 PM–5 PM timing).' },
        { time: '17:30–18:30', label: 'Review + Analysis', type: 'study', icon: '🔍', desc: 'Analyze your mock test. Note mistakes. Update revision notes.' },
        { time: '18:30–20:00', label: 'Leisure + Family Time', type: 'break', icon: '🏡', desc: 'You deserve this. Recharge for next week.' },
        { time: '20:00–22:00', label: 'Light Revision', type: 'study', icon: '📖', desc: 'Summary notes review. Plan next week\'s schedule.' },
      ]
    }
  }
};
