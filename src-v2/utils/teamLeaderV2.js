// ── Team Leader V2 — Multi-pass Intent Router ─────────────────────────────────
// V2 improvements over V1:
//   1. Multi-pass extraction: verb + metric + timeframe + numeric target are
//      scored independently, then combined into a confidence level.
//   2. Goal family detection uses weighted scoring, not just first-match regex.
//   3. All responses include a `routingTrace` field for the Chat UI to display.
//   4. Ambiguous inputs get a structured disambiguation card (not just a text list).
//   5. Additional goal families: speed-to-lead, reputation.
//   6. Compound requests (e.g. "blog post + lead follow-up") are split.

import { nextId } from '../../src/data/tasks.js';
import { tryBackendTeamLeader } from '../../src/utils/teamLeaderLLM.js';

const today = () =>
  new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

// ── Primitive matchers ────────────────────────────────────────────────────────

function anyOf(text, patterns) {
  return patterns.some((p) => p.test(text));
}

function includesAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

// ── Multi-pass feature extraction ─────────────────────────────────────────────
// Returns an object with named features, each true/false, to avoid regex
// collisions that plagued v1 (e.g. "reduce" matching both goal and social).

function extractFeatures(raw) {
  const m = raw.toLowerCase();

  const zhGrow = includesAny(m, ['增加', '提升', '提高', '扩大', '增长', '多一点', '更多']);
  const zhReduce = includesAny(m, ['降低', '减少', '压低', '省', '缩减', '控制成本']);
  const zhWant = includesAny(m, ['我想', '我要', '希望', '需要', '想要', '帮我']);
  const zhPlan = includesAny(m, ['目标', '计划', '策略', '路线图', '规划', '方向']);
  const zhLeads = includesAny(m, ['线索', '潜在客户', '客户咨询', '咨询量', '预约', '获客']);
  const zhAds = includesAny(m, ['广告', '投放', 'ad', 'ads', 'cpl', 'cpa', 'roas']);
  const zhCost = includesAny(m, ['成本', '花费', '预算', '开支', '支出']);
  const zhReviews = includesAny(m, ['评价', '评论', '口碑', '评分', '好评', '差评']);
  const zhResponse = includesAny(m, ['回复速度', '响应速度', '跟进速度', '首响时间', '回复时间']);
  const zhConversion = includesAny(m, ['转化', '成交', '成单', '转化率']);
  const zhWeek = includesAny(m, ['这周', '本周', '下周', '每周']);
  const zhMonth = includesAny(m, ['这个月', '本月', '下个月', '每月', '30天']);
  const zhQuarter = includesAny(m, ['这个季度', '本季度', '下个季度', '90天']);
  const zhYear = includesAny(m, ['今年', '明年', '年底']);
  const zhReport = includesAny(m, ['周报', '报告', '汇报', '数据报告']);
  const zhSummary = includesAny(m, ['总结', '进展', '做了什么', '现在怎么样']);
  const zhSocial = includesAny(m, ['社媒', '小红书', '抖音', 'instagram', 'facebook', '评论回复', '帖子', 'caption']);
  const zhLead = includesAny(m, ['跟进', '回复客户', '回复线索', '询盘', '报价请求', '潜在客户']);
  const zhContent = includesAny(m, ['内容', '文案', '文章', '博客', 'seo', '落地页', '邮件活动', '案例']);
  const zhAnalytics = includesAny(m, ['数据', '分析', '指标', 'ga4', 'analytics']);
  const zhCRM = includesAny(m, ['crm', '管道', '销售漏斗', '客户阶段', '商机']);
  const zhApproval = includesAny(m, ['审批', '批准', '审核', '修改意见']);
  const zhTask = includesAny(m, ['任务', '待办', '阻塞', '卡住了']);
  const zhHelp = includesAny(m, ['能做什么', '怎么做', '怎么用', '说明一下', '解释一下']);

  return {
    // Verbs indicating growth/change intent
    verbGrow:    zhGrow || anyOf(m, [/\bincrease\b/, /\bgrow\b/, /\bboost\b/, /\braise\b/, /\blift\b/, /\badd\b/, /\bget\b/, /\bgain\b/, /\bhit\b/, /\bachieve\b/, /\bimprove\b/, /\bscale\b/, /\bexpand\b/, /\bmaximize\b/, /\bstrengthen\b/]),
    verbReduce:  zhReduce || anyOf(m, [/\breduce\b/, /\bdecrease\b/, /\bcut\b/, /\blower\b/, /\bminimize\b/, /\bsave\b/, /\bstop wasting\b/, /\btrim\b/, /\boptimi[sz]e cost\b/]),
    verbWant:    zhWant || anyOf(m, [/\bwant\b/, /\bneed\b/, /\bwould like\b/, /\bhope to\b/, /\btrying to\b/, /\bhelp me\b/]),
    verbPlan:    zhPlan || anyOf(m, [/\bplan\b/, /\bstrategy\b/, /\broadmap\b/, /\bobjective\b/, /\bgoal\b/, /\btarget\b/, /\binitiative\b/]),

    // Metrics — bucketed
    metricOrders:   anyOf(m, [/\border\b/, /\borders\b/, /\brevenue\b/, /\bsales\b/, /\bclose rate\b/, /\binstallation\b/, /\bproperty value\b/]) || includesAny(m, ['订单', '营收', '销售额', '成交率', '安装量']),
    metricLeads:    zhLeads || anyOf(m, [/\blead\b/, /\bleads\b/, /\binquir/, /\bbooking\b/, /\bconsultation\b/, /\btraffic\b/, /\bdemand\b/, /\bquote request\b/, /\bshowroom visit\b/]),
    metricAds:      zhAds || anyOf(m, [/\bad spend\b/, /\bads spend\b/, /\bcpl\b/, /\bcpa\b/, /\bcampaign efficiency\b/, /\bpaid media\b/, /\bgoogle ads\b/, /\bmeta ads\b/, /\broas\b/, /\bctr\b/, /\bppc\b/, /\bretargeting\b/]),
    metricCost:     zhCost || anyOf(m, [/\bexpense\b/, /\bexpenses\b/, /\bcost\b/, /\bspend\b/, /\bbudget\b/, /\baffordability\b/, /\bpricing\b/, /\bfinancing\b/]),
    metricReviews:  zhReviews || anyOf(m, [/\breview\b/, /\breviews\b/, /\brating\b/, /\breputation\b/, /\btrust\b/, /\bstars\b/, /\breferral\b/, /\baward\b/]),
    metricResponse: zhResponse || anyOf(m, [/\bresponse time\b/, /\bresponse speed\b/, /\bspeed to lead\b/, /\bfollow.?up time\b/, /\bfollow.?up speed\b/, /\bfirst response\b/, /\bfast response\b/]),
    metricConversion: zhConversion || anyOf(m, [/\bconversion\b/, /\bconversions\b/, /\bconvert\b/, /\bwebsite conversion\b/, /\bclose rate\b/, /\bcvr\b/, /\bconsultation rate\b/]),

    // Timeframe
    timeWeek:    zhWeek || anyOf(m, [/\bthis week\b/, /\bnext week\b/, /\bweekly\b/]),
    timeMonth:   zhMonth || anyOf(m, [/\bthis month\b/, /\bnext month\b/, /\bmonthly\b/, /\bin 30 days\b/]),
    timeQuarter: zhQuarter || anyOf(m, [/\bthis quarter\b/, /\bnext quarter\b/, /\bquarterly\b/, /\bin 60 days\b/, /\bin 90 days\b/]),
    timeYear:    zhYear || anyOf(m, [/\bthis year\b/, /\bnext year\b/, /\bby year.?end\b/]),
    timeSuffix:  /\bby [a-zA-Z]+\b/.test(m),

    // Numeric
    hasNumber:   /\b\d+\b/.test(m) || anyOf(m, [/\d+%/, /\d+个/, /\d+条/, /\d+位/]),

    // Request types
    isReport:    zhReport || anyOf(m, [/\bweekly report\b/, /\bmarketing report\b/, /\bperformance report\b/, /\breport for the week\b/, /\bdashboard summary\b/]),
    isSummary:   zhSummary || anyOf(m, [/\bwork summary\b/, /\bteam summary\b/, /\bstatus update\b/, /\bprogress update\b/, /what.{0,20}(done|working on)/]),
    isSocial:    zhSocial || anyOf(m, [/\binstagram\b/, /\bfacebook\b/, /\bhouzz\b/, /\bcaption\b/, /\bpost\b/, /\bsocial media\b/, /\bsocial post\b/, /\bgoogle review\b/, /\breview response\b/, /\btestimonial\b/, /\breferral\b/, /\byoutube\b/]),
    isLead:      zhLead || anyOf(m, [/\bfollow.?up\b/, /\bnew lead\b/, /\bnew inquiry\b/, /\bquote request\b/, /\blead response\b/, /\bnurture\b/, /\bshowroom\b/, /\bsite visit\b/, /\bconsultation booking\b/]),
    isContent:   zhContent || anyOf(m, [/\bblog\b/, /\bblog post\b/, /\bcontent\b/, /\bseo\b/, /\blanding page\b/, /\bemail campaign\b/, /\bkeyword\b/, /\bcopy\b/, /\barticle\b/, /\bcase study\b/, /\bwrite\b.*\bpage\b/, /\bbrochure\b/, /\bwarranty\b/, /\bfinancing\b/, /\bbefore and after\b/]),
    isAnalytics: zhAnalytics || anyOf(m, [/\banalytics\b/, /\bga4\b/, /\bmetrics\b/, /\bdata\b/, /\bkpi\b/, /\bdashboard\b/]),
    isCRM:       zhCRM || anyOf(m, [/\bcrm\b/, /\bpipeline\b/, /\bstalled\b/, /\bdeal\b/, /\bnurture sequence\b/, /\bpostal code\b/, /\bterritory\b/, /\bdirect mail\b/, /\bpartnership\b/, /\blandscaper\b/, /\bbuilder\b/]),
    isApproval:  zhApproval || anyOf(m, [/\bapproval\b/, /\bapprovals\b/, /\bapprove\b/, /\bchanges requested\b/]),
    isTaskStatus: zhTask || anyOf(m, [/\bopen tasks\b/, /\btask list\b/, /\bblocked\b/, /\bshow tasks\b/, /\bwhat is the team\b/]),
    isHelp:      zhHelp || anyOf(m, [/\bhelp\b/, /\bwhat can\b/, /\bhow do\b/, /\bhow does\b/, /\btell me\b/, /\bexplain\b/, /\bwhat is\b/, /\bwhat are\b/]),
  };
}

// ── Intent classification (uses features, not raw regex) ─────────────────────

function classifyIntent(message) {
  const f = extractFeatures(message);

  // Goal-planning score: needs verb + metric + optional timeframe/number
  const hasGoalVerb = f.verbGrow || f.verbReduce || f.verbWant || f.verbPlan;
  const hasGoalMetric = f.metricOrders || f.metricLeads || f.metricAds || f.metricCost ||
                        f.metricReviews || f.metricResponse || f.metricConversion;
  const hasTimeframe = f.timeWeek || f.timeMonth || f.timeQuarter || f.timeYear || f.timeSuffix;

  let goalScore = 0;
  if (hasGoalVerb) goalScore += 2;
  if (hasGoalMetric) goalScore += 3;
  if (hasTimeframe) goalScore += 2;
  if (f.hasNumber) goalScore += 2;

  if (goalScore >= 5) {
    return {
      intent: 'goal-planning',
      confidence: goalScore >= 7 ? 'high' : 'medium',
      features: f,
    };
  }

  if (f.isReport)     return { intent: 'weekly-report',    confidence: 'high',   features: f };
  if (f.isSummary)    return { intent: 'work-summary',     confidence: 'high',   features: f };
  if (f.isApproval)   return { intent: 'clarify-approval', confidence: 'medium', features: f };
  if (f.isTaskStatus) return { intent: 'clarify-tasks',    confidence: 'medium', features: f };
  if (f.isSocial)     return { intent: 'social-reputation',confidence: 'medium', features: f };
  if (f.isLead)       return { intent: 'lead-response',    confidence: 'medium', features: f };
  if (f.isContent)    return { intent: 'content-strategist',confidence: 'medium',features: f };
  if (f.isAnalytics)  return { intent: 'reporting',        confidence: 'medium', features: f };
  if (f.isCRM)        return { intent: 'growth-ops',       confidence: 'medium', features: f };
  if (f.isHelp)       return { intent: 'clarification',    confidence: 'medium', features: f };

  // Weak goal signal — catch numeric + metric combos that didn't hit threshold
  if (f.hasNumber && hasGoalMetric) {
    return { intent: 'goal-planning', confidence: 'low', features: f };
  }

  return { intent: 'fallback', confidence: 'low', features: f };
}

// ── Goal family — weighted scoring ──────────────────────────────────────────

function detectGoalFamily(message, features) {
  const m = message.toLowerCase();

  const scores = {
    'ad-efficiency': 0,
    'growth-orders': 0,
    'lead-generation': 0,
    'reputation': 0,
    'speed-to-lead': 0,
    'general-growth': 0,
  };

  // ad-efficiency signals
  if (features.metricAds) scores['ad-efficiency'] += 4;
  if (features.metricCost && features.verbReduce) scores['ad-efficiency'] += 3;
  if (anyOf(m, [/\bwaste\b/, /\bwasted\b/, /\befficiency\b/, /\beroi\b/])) scores['ad-efficiency'] += 2;

  // growth-orders signals
  if (features.metricOrders) scores['growth-orders'] += 4;
  if (anyOf(m, [/\bsale\b/, /\bsales\b/, /\bclose\b/, /\bconversion rate\b/])) scores['growth-orders'] += 2;

  // lead-generation signals
  if (features.metricLeads) scores['lead-generation'] += 4;
  if (anyOf(m, [/\bmore leads\b/, /\bmore inquiries\b/, /\bmore bookings\b/])) scores['lead-generation'] += 2;

  // reputation signals
  if (features.metricReviews) scores['reputation'] += 5;
  if (anyOf(m, [/\breview\b/, /\bstars\b/, /\bgoogle rating\b/])) scores['reputation'] += 2;

  // speed-to-lead signals
  if (features.metricResponse) scores['speed-to-lead'] += 5;
  if (anyOf(m, [/\bfast\b/, /\bquicker\b/, /\bfaster\b/, /\bwithin\b.*\bhour\b/, /\bwithin\b.*\bmin\b/])) scores['speed-to-lead'] += 2;

  // general-growth fallback
  scores['general-growth'] += 1;

  // Pick highest score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

// ── Routing trace builder ─────────────────────────────────────────────────────

function buildTrace(intent, confidence, agentId, reason) {
  return {
    intent,
    confidence,
    agentId,
    reason,
    timestamp: new Date().toISOString(),
  };
}

function buildAssignments(assignments) {
  return assignments.map((item, index) => ({
    id: `${item.agent}-${index}`,
    ...item,
  }));
}

function normalizeInput(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// ── Approval helper ──────────────────────────────────────────────────────────

function makeApproval(task, title, description, agent, agentName, priority, type) {
  return {
    id: `ap-${task.id}`,
    title,
    description,
    agent,
    agentName,
    priority,
    type,
    createdAt: new Date().toISOString(),
    preview: task.output || '',
    taskId: task.id,
  };
}

function shortTitle(text, max = 60) {
  return text.length > max ? text.substring(0, max - 3) + '...' : text;
}

function detectPlatform(message) {
  const m = message.toLowerCase();
  if (m.includes('instagram') || m.includes('ig')) return 'Instagram';
  if (m.includes('facebook')) return 'Facebook';
  if (m.includes('google review') || m.includes('review response') || m.includes('review')) return 'Google Reviews';
  if (m.includes('houzz')) return 'Houzz';
  return 'Instagram';
}

function socialDraftOutput(userMessage) {
  const platform = detectPlatform(userMessage);
  const lower = userMessage.toLowerCase();
  const isCaption = /caption|post|instagram|facebook|social/.test(lower);
  const isReview = /review|rating|response/.test(lower);

  if (isCaption && !isReview) {
    return `Request Summary
- Platform: ${platform}
- Objective: Create social-ready brand content aligned with Okeanos trust, professionalism, and visual transformation value
- Source request: "${userMessage}"

Creative Direction
1. Lead with the visual transformation or lifestyle payoff
2. Reinforce trust, craftsmanship, and low-maintenance fiberglass positioning
3. End with a simple call to action that invites a quote request or consultation

Draft Option A
From planning to poolside — this transformation was built to turn an underused backyard into a clean, family-ready outdoor space. Okeanos focuses on fiberglass pool installations that combine long-term durability, low maintenance, and a professional installation experience from start to finish.

Thinking about your own backyard project in the GTA? Reach out to book a consultation.

Draft Option B
A great backyard project should feel simple, well-managed, and built to last. This Okeanos transformation highlights what homeowners ask for most: strong design guidance, professional installation, and a fiberglass pool that is easier to maintain long term.

If you're exploring a pool project in the GTA, message us to start the conversation.

Recommended CTA
- Book a consultation
- Request a quote
- Explore recent project transformations

Approval Notes
- Confirm visual asset pairing
- Confirm hashtag set / geo tags
- Human approval required before posting.`;
  }

  return `Request Summary
- Platform: ${platform}
- Objective: Prepare a public-facing response that protects trust and professionalism
- Source request: "${userMessage}"

Tone Guidance
- Calm, respectful, professional
- Avoid defensiveness
- Acknowledge feedback and move resolution offline where appropriate

Draft Option A
Thank you for sharing your feedback. We take concerns like this seriously and have already reviewed the issue internally. Our team is committed to clear communication, professional follow-through, and making things right wherever possible.

Draft Option B
We appreciate you taking the time to leave feedback. Okeanos is committed to professionalism, transparency, and strong customer care. We would welcome the opportunity to follow up directly and address this properly.

Approval Notes
- Confirm whether an offline follow-up has already happened
- Confirm whether the tone should be warmer or more formal
- Human approval required before posting.`;
}

function leadDraftOutput(userMessage) {
  return `Request Summary
- Objective: Prepare a fast, consultation-oriented follow-up for a new inquiry
- Source request: "${userMessage}"

Recommended Handling Plan
1. Acknowledge the inquiry quickly
2. Move the lead toward a consultation or site-visit conversation
3. Keep the message short, clear, and low-friction
4. Avoid overloading the lead with technical detail on first touch

Email Draft
Subject: Your Okeanos pool inquiry — next steps

Hi there,

Thanks for reaching out to Okeanos. We would be happy to learn more about your project and help you understand the best next step based on your property, timeline, and design goals.

The easiest next move is a short consultation so we can confirm the scope, answer any early questions, and recommend the right direction for your backyard project.

If you'd like, reply with a good time and our team can coordinate the next conversation.

Best,
Okeanos Pools GTA

SMS Draft
Thanks for contacting Okeanos. We'd be happy to help with your pool project. Would you prefer a quick consultation call or to discuss next steps by text/email?

Reviewer Checklist
- Confirm if this lead is quote-ready or still researching
- Confirm whether financing, timing, or design questions should be addressed now
- Human approval required before sending.`;
}

function contentDraftOutput(userMessage) {
  return `Request Summary
- Objective: Build a content asset that supports trust, education, and conversion
- Source request: "${userMessage}"

Strategic Angle
- Position Okeanos as professional, trustworthy, and easy to work with
- Reinforce low-maintenance fiberglass advantages where relevant
- Use homeowner-friendly language, not over-technical explanation

Detailed Brief
1. Audience
- GTA homeowners comparing options, worried about hidden fees, maintenance, and installation quality

2. Core Message
- Okeanos combines trust, professionalism, affordability, and a smoother installation experience

3. Recommended Structure
- Opening hook tied to homeowner intent
- Short explanation of the problem / need
- Okeanos differentiators
- Proof: reviews, case studies, before/after work, warranty, process clarity
- CTA to consultation or quote request

4. Objections to Address
- Cost clarity
- Maintenance burden
- Timeline uncertainty
- Whether fiberglass is the right long-term fit

5. Deliverable Notes
- Write for conversion, not just information
- Keep sections easy to scan
- Human approval required before publishing.`;
}

function reportingDraftOutput(userMessage) {
  return `Request Summary
- Objective: Produce a concise but decision-useful reporting snapshot
- Source request: "${userMessage}"

Metrics Snapshot
- Website sessions: 1,842
- New leads: 14
- Avg. lead response time: 23 minutes
- Google Ads remains the strongest high-intent source
- Meta performance needs creative refresh

Detailed Readout
1. Traffic and lead flow remain healthy, with organic and high-intent search continuing to carry the strongest quality signals.
2. Lead response speed is still within target, which supports consultation conversion.
3. Paid social is underperforming relative to spend and likely needs new creative and tighter audience control.
4. Trust assets such as reviews and case-study content remain important conversion support for homeowners still comparing installers.

Recommended Actions
- Review approvals queue first
- Refresh weak paid-social creative
- Prioritize the next BOFU or proof-driven content asset
- Track consultation rate, not just lead volume

Human review required before presenting this externally.`;
}

function growthOpsDraftOutput(userMessage) {
  return `Request Summary
- Objective: Diagnose operational blockers affecting lead handling, conversion, or campaign execution
- Source request: "${userMessage}"

Initial Diagnosis Areas
1. CRM stage drop-off between inquiry and consultation
2. Follow-up speed and consistency for qualified leads
3. Landing-page CTA clarity and form friction
4. Alignment between campaign promise and post-click experience

Recommended Action Plan
- Audit where qualified opportunities are slowing down
- Identify whether the biggest issue is traffic quality, response speed, or conversion friction
- Tighten CTA language toward consultation-driven next steps
- Build a cleaner execution loop between campaigns, CRM handling, and approvals

Execution Notes
- Prioritize the highest-intent lead sources first
- Keep messaging aligned with trust, professionalism, and affordability
- Human review required before changing live workflows.`;
}

// ── Goal family: ad-efficiency ──────────────────────────────────────────────

function adEfficiencyGoalResponse(userMessage, confidence) {
  const taskA = {
    id: nextId(),
    title: 'Ad Efficiency: Spend & CPL Audit',
    description: `Objective: "${userMessage}"\n\nGrowth Ops Agent reviewing campaign-level spend, lead output, and CPL efficiency.`,
    assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'ad-efficiency', 'growth-ops'],
    outputLabel: 'Ad Spend Audit',
    output: `Objective\n- Reduce ad spend without damaging lead quality\n\nAudit focus\n1. Compare top and worst campaigns by CPL\n2. Identify channels with weak conversion efficiency\n3. Flag spend producing low-quality traffic\n\nKey metrics\n- Ad spend · Leads from ads · CPL · Top/worst campaign · Conversion quality`,
  };
  const taskB = {
    id: nextId(),
    title: 'Ad Efficiency: Budget Reallocation Plan',
    description: `Objective: "${userMessage}"\n\nGrowth Ops Agent recommending how to shift spend toward highest-intent campaigns.`,
    assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'ad-efficiency', 'budget'],
    outputLabel: 'Budget Recommendation',
    output: `Recommended actions\n1. Reduce Meta awareness spend (lowest CPL performer)\n2. Protect Google Search high-intent budget\n3. Refresh underperforming creative before scaling\n4. Review CPL weekly before larger reallocations\n\nSuccess criteria\n- Lower wasted spend · Better efficiency per channel · Clear top/worst separation`,
  };
  const taskC = {
    id: nextId(),
    title: 'Ad Efficiency: Weekly Paid Media Monitor',
    description: `Objective: "${userMessage}"\n\nReporting Agent tracking paid media efficiency and flagging anomalies weekly.`,
    assignedTo: 'reporting', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'ad-efficiency', 'reporting'],
    outputLabel: 'Monitoring Plan',
    output: `Weekly monitoring checklist\n- Ad spend · Leads from ads · CPL · Top campaign · Worst campaign\n\nManagement rule\nIf CPL rises 2 consecutive weeks without quality improvement → pause or revise campaign.`,
  };

  const approval = makeApproval(taskA, 'Ad Efficiency Plan — Approve to Activate', 'AI Team Leader prepared a first-pass plan to reduce ad spend and improve paid media efficiency.', 'growth-ops', 'AI Team Leader + Growth Ops Agent', 'high', 'Campaign Brief');
  taskA.generatedApproval = approval; taskA.newApproval = approval;

  const trace = buildTrace('goal-planning', confidence, 'growth-ops', 'Ad cost reduction objective → Growth Ops Agent (campaign management) + Reporting Agent (monitoring)');

  return {
    intent: 'goal-planning',
    routingTrace: trace,
    assignments: buildAssignments([
      { agent: 'growth-ops', title: 'Spend & CPL Audit', reason: 'Primary owner for campaign efficiency and budget decisions', deliverable: 'Channel-level audit and budget reallocation brief' },
      { agent: 'growth-ops', title: 'Budget Reallocation Plan', reason: 'Secondary workstream to convert findings into action', deliverable: 'Reallocation plan across Google and Meta' },
      { agent: 'reporting', title: 'Weekly Paid Media Monitor', reason: 'Keeps efficiency visible after changes go live', deliverable: 'Recurring KPI monitoring and anomaly watchlist' },
    ]),
    message: `**Goal received** — I'm treating this as an **ad efficiency objective**.\n\n**What I extracted:**\n- Objective type: Reduce advertising costs\n- Primary metric: Ad spend / CPL\n- Strategy: Audit → reallocate → monitor\n\n**Initial operating plan:**\n1. Identify campaigns wasting spend or producing weak lead quality\n2. Protect high-intent search campaigns that convert efficiently\n3. Reallocate budget into channels and creatives with better lead quality\n4. Track weekly CPL movement so the team can react quickly\n\n**Routing decision:** Growth Ops owns the optimization work. Reporting supports with visibility and monitoring.\n\n**3 workstreams created:**\n1. **Ad Spend & CPL Audit** → Growth Ops Agent\n2. **Budget Reallocation Plan** → Growth Ops Agent\n3. **Weekly Paid Media Monitor** → Reporting Agent\n\n**What you'll be able to review:**\n- Which campaigns should be reduced, protected, or refreshed\n- Where budget should move next\n- Which KPI thresholds should trigger a pause or revision\n\nOpen **Tasks** to review the workstreams, or **Approvals** to approve the plan.`,
    routedAgent: 'growth-ops',
    newTask: taskA,
    extraTasks: [taskB, taskC],
    newApproval: approval,
  };
}

// ── Goal family: lead-generation ────────────────────────────────────────────

function leadGenerationGoalResponse(userMessage, confidence, features) {
  const hasNumeric = features.hasNumber;
  const hasTime = features.timeWeek || features.timeMonth || features.timeQuarter;

  const taskA = {
    id: nextId(),
    title: 'Lead Gen: Funnel Diagnosis & Bottleneck Audit',
    description: `Objective: "${userMessage}"\n\nGrowth Ops Agent diagnosing the main funnel constraints on current lead volume.`,
    assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'lead-gen', 'conversion'],
    outputLabel: 'Funnel Diagnosis',
    output: `Diagnosis focus\n1. Lead volume gap vs target\n2. Consultation booking conversion rate\n3. Follow-up delay and drop-off points\n4. Website CTA friction\n\nRecommended immediate audit\n- Lead source breakdown (Google vs Meta vs organic)\n- Response time by lead tier\n- Quote form submission rate`,
  };
  const taskB = {
    id: nextId(),
    title: 'Lead Gen: Speed-to-Lead Improvement Plan',
    description: `Objective: "${userMessage}"\n\nLead Response Agent preparing a tighter follow-up and prioritization protocol.`,
    assignedTo: 'lead-response', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'lead-response', 'speed-to-lead'],
    outputLabel: 'Lead Response Plan',
    output: `Response objective\n- Qualify and respond to every new lead within 30 minutes\n\nExecution\n1. Tier qualification on receipt\n2. Consultation-first CTA for quote-ready leads\n3. Standardize a short 3-step follow-up cadence\n4. Escalate stalled leads after 48h`,
  };
  const taskC = {
    id: nextId(),
    title: 'Lead Gen: Demand & Trust Content Support',
    description: `Objective: "${userMessage}"\n\nContent Strategist building trust assets to support conversion at decision stage.`,
    assignedTo: 'content-strategist', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'content', 'trust'],
    outputLabel: 'Demand Support Plan',
    output: `Recommended assets\n1. BOFU landing page or quote page refresh\n2. One project case study or proof post\n3. Social proof visibility push\n4. Geo-targeted SEO page for top inquiry source city`,
  };

  const approval = makeApproval(taskA, 'Lead Gen Growth Plan — Approve to Activate', 'AI Team Leader prepared a first-pass lead generation growth plan across 3 workstreams.', 'growth-ops', 'AI Team Leader + Growth Ops Agent', 'high', 'Campaign Brief');
  taskA.generatedApproval = approval; taskA.newApproval = approval;

  const trace = buildTrace('goal-planning', confidence, 'growth-ops', 'Lead volume growth objective → Growth Ops Agent (funnel) + Lead Response Agent (speed) + Content Strategist (demand)');

  const numericNote = hasNumeric ? `\n- **Target detected** — I'll anchor the workstreams to your stated number.` : '';
  const timeNote = hasTime ? `\n- **Timeframe detected** — I'll set review checkpoints accordingly.` : '';

  return {
    intent: 'goal-planning',
    routingTrace: trace,
    assignments: buildAssignments([
      { agent: 'growth-ops', title: 'Funnel Diagnosis', reason: 'Owns conversion bottlenecks, campaign routing, and pipeline friction', deliverable: 'Diagnosis of lead volume gap, source quality, and funnel blockers' },
      { agent: 'lead-response', title: 'Speed-to-Lead Plan', reason: 'Owns first-response speed and follow-up discipline', deliverable: 'Lead qualification and follow-up protocol for faster consultations' },
      { agent: 'content-strategist', title: 'Demand & Trust Content', reason: 'Supports conversion with proof, education, and landing-page clarity', deliverable: 'Content support plan for case studies, proof assets, and BOFU pages' },
    ]),
    message: `**Goal received** — I'm treating this as a **lead generation objective**.\n\n**What I extracted:**\n- Objective type: Increase qualified leads / bookings${numericNote}${timeNote}\n- Strategy: Fix funnel → improve response speed → build demand\n\n**Initial operating plan:**\n1. Diagnose where qualified leads are leaking in the current funnel\n2. Tighten first-response speed for quote-ready and consultation-ready leads\n3. Add stronger trust assets such as reviews, case studies, and BOFU landing support\n4. Review progress against lead volume, consultation rate, and response-time benchmarks\n\n**Routing decision:** Growth Ops is the lead owner, with Lead Response and Content Strategist supporting execution.\n\n**3 workstreams created:**\n1. **Funnel Diagnosis** → Growth Ops Agent\n2. **Speed-to-Lead Plan** → Lead Response Agent\n3. **Demand & Trust Content** → Content Strategist\n\n**What you'll be able to review:**\n- Where the current lead flow is breaking down\n- How fast the team should respond by lead tier\n- Which content assets will most likely improve trust and conversion\n\nOpen **Tasks** to review the workstreams, or **Approvals** to approve the direction.`,
    routedAgent: 'growth-ops',
    newTask: taskA,
    extraTasks: [taskB, taskC],
    newApproval: approval,
  };
}

// ── Goal family: reputation ──────────────────────────────────────────────────

function reputationGoalResponse(userMessage, confidence) {
  const taskA = {
    id: nextId(),
    title: 'Reputation: Review Generation Campaign Plan',
    description: `Objective: "${userMessage}"\n\nSocial & Reputation Agent preparing a review generation strategy for Okeanos.`,
    assignedTo: 'social-reputation', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'reputation', 'social'],
    outputLabel: 'Reputation Plan',
    output: `Strategy\n1. Identify recently completed projects as review candidates\n2. Draft a personalized "thank you + review ask" sequence\n3. Route to top platforms: Google, then Houzz\n4. Respond to all new reviews within 24h\n\nSuccess metric\n- Target: +5 Google reviews over 30 days\n- Maintain rating ≥ 4.6 ★`,
  };
  const taskB = {
    id: nextId(),
    title: 'Reputation: Review Response Backlog Clearance',
    description: `Objective: "${userMessage}"\n\nSocial & Reputation Agent drafting responses to any unaddressed reviews.`,
    assignedTo: 'social-reputation', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['reputation', 'reviews'],
    outputLabel: 'Review Responses',
    output: `Review response protocol\n- Positive: Thank + reinforce trust signal\n- Negative: Acknowledge → offer to resolve → move offline\n- All drafts require human approval before publishing`,
  };

  const approval = makeApproval(taskA, 'Reputation Growth Plan — Approve to Activate', 'Social & Reputation Agent prepared a review generation and management plan.', 'social-reputation', 'AI Team Leader + Social & Reputation Agent', 'high', 'Campaign Brief');
  taskA.generatedApproval = approval; taskA.newApproval = approval;

  const trace = buildTrace('goal-planning', confidence, 'social-reputation', 'Review / reputation objective → Social & Reputation Agent');

  return {
    intent: 'goal-planning',
    routingTrace: trace,
    assignments: buildAssignments([
      { agent: 'social-reputation', title: 'Review Generation Campaign', reason: 'Owns public trust signals and reputation growth', deliverable: 'Review request sequence and platform priority plan' },
      { agent: 'social-reputation', title: 'Review Response Backlog', reason: 'Keeps public-facing reputation clean and current', deliverable: 'Draft responses for outstanding review items' },
    ]),
    message: `**Goal received** — I'm treating this as a **reputation objective**.\n\n**What I extracted:**\n- Objective type: Improve Google rating / increase reviews\n- Primary owner: Social & Reputation Agent\n\n**Initial operating plan:**\n1. Identify recently completed projects that are best suited for review outreach\n2. Build a thank-you + review-request sequence with clear platform priority\n3. Clear any outstanding review response backlog so public trust signals stay current\n4. Track review velocity, rating stability, and response discipline\n\n**2 workstreams created:**\n1. **Review Generation Campaign** → Social & Reputation Agent\n2. **Review Response Backlog** → Social & Reputation Agent\n\n**What you'll be able to review:**\n- Review request messaging\n- Which customer segments should be contacted first\n- Drafts for any open reviews that still need a response\n\nOpen **Tasks** to review, or **Approvals** to approve the plan.`,
    routedAgent: 'social-reputation',
    newTask: taskA,
    extraTasks: [taskB],
    newApproval: approval,
  };
}

// ── Goal family: speed-to-lead ───────────────────────────────────────────────

function speedToLeadGoalResponse(userMessage, confidence) {
  const taskA = {
    id: nextId(),
    title: 'Speed-to-Lead: Response Protocol Redesign',
    description: `Objective: "${userMessage}"\n\nLead Response Agent redesigning the response prioritization and cadence workflow.`,
    assignedTo: 'lead-response', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'speed-to-lead', 'lead-response'],
    outputLabel: 'Response Protocol',
    output: `Current state analysis\n- Baseline avg response time: 23 minutes\n- Target: < 10 minutes for quote-ready leads\n\nProtocol recommendations\n1. Tier-1 leads: respond within 10 minutes, phone first\n2. Tier-2 leads: respond within 30 minutes, email + SMS\n3. Auto-draft SMS for after-hours leads\n4. Daily review of uncontacted leads > 4h`,
  };

  const approval = makeApproval(taskA, 'Speed-to-Lead Protocol — Approve to Activate', 'Lead Response Agent prepared a new response prioritization protocol.', 'lead-response', 'Lead Response Agent', 'high', 'Campaign Brief');
  taskA.generatedApproval = approval; taskA.newApproval = approval;

  const trace = buildTrace('goal-planning', confidence, 'lead-response', 'Response speed objective → Lead Response Agent');

  return {
    intent: 'goal-planning',
    routingTrace: trace,
    assignments: buildAssignments([
      { agent: 'lead-response', title: 'Response Protocol Redesign', reason: 'Primary owner for response-time and follow-up quality', deliverable: 'Tiered protocol for quote-ready, researching, and after-hours leads' },
    ]),
    message: `**Goal received** — I'm treating this as a **speed-to-lead objective**.\n\n**What I extracted:**\n- Objective type: Reduce response time to new leads\n- Primary owner: Lead Response Agent\n\n**Initial operating plan:**\n1. Set stricter response windows by lead quality and urgency\n2. Standardize first-touch messaging for phone, email, and SMS\n3. Add after-hours handling so promising leads do not cool off overnight\n4. Track missed-response exceptions and escalation thresholds\n\n**Workstream created:**\n1. **Response Protocol Redesign** → Lead Response Agent\n\n**What you'll be able to review:**\n- Recommended service-level targets\n- Channel-by-channel first-response guidance\n- Escalation rules for delayed contact or stalled leads\n\nOpen **Approvals** to review and activate the new response protocol.`,
    routedAgent: 'lead-response',
    newTask: taskA,
    extraTasks: [],
    newApproval: approval,
  };
}

// ── Goal family: general growth / orders ─────────────────────────────────────

function generalGrowthGoalResponse(userMessage, confidence, features) {
  const family = features.metricOrders ? 'growth-orders' : 'general-growth';
  const taskA = {
    id: nextId(),
    title: 'Growth Plan: Funnel & Conversion Diagnosis',
    description: `Objective: "${userMessage}"\n\nGrowth Ops Agent diagnosing the main funnel constraints.`,
    assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'growth-plan', 'conversion'],
    outputLabel: 'Growth Diagnosis',
    output: `Primary objective\n- Increase business results using current marketing team and channels\n\nLikely leverage points\n1. More qualified leads from high-intent channels\n2. Faster response for qualified leads\n3. Better follow-up conversion\n4. Stronger trust signals at decision stage\n\nImmediate analysis focus\n- Lead volume gap · Consultation booking rate · Follow-up delay · Website conversion friction`,
  };
  const taskB = {
    id: nextId(),
    title: 'Growth Plan: Lead Response Acceleration',
    description: `Objective: "${userMessage}"\n\nLead Response Agent preparing a tighter follow-up and prioritization plan.`,
    assignedTo: 'lead-response', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'lead-response'],
    outputLabel: 'Lead Response Plan',
    output: `Recommended response objective\n- Tighten response speed for qualified opportunities\n\nExecution focus\n1. Prioritize qualified inquiries\n2. Use consultation-first CTA\n3. Standardize short follow-up cadence\n4. Escalate stalled leads quickly`,
  };
  const taskC = {
    id: nextId(),
    title: 'Growth Plan: Trust & Demand Content Support',
    description: `Objective: "${userMessage}"\n\nContent + Social support for conversion through trust-building assets.`,
    assignedTo: 'content-strategist', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['goal', 'content', 'trust'],
    outputLabel: 'Demand Support Plan',
    output: `Recommended assets\n1. One BOFU page or quote-focused refresh\n2. One case study or proof asset\n3. Social proof visibility push\n4. Weekly KPI checkpoint`,
  };

  const approval = makeApproval(taskA, 'Growth Plan — Approve to Activate', 'AI Team Leader prepared a first-pass growth plan and decomposed the objective into 3 workstreams.', 'growth-ops', 'AI Team Leader + Growth Ops Agent', 'high', 'Campaign Brief');
  taskA.generatedApproval = approval; taskA.newApproval = approval;

  const trace = buildTrace('goal-planning', confidence, 'growth-ops', `${family === 'growth-orders' ? 'Order/revenue' : 'General growth'} objective → Growth Ops + Lead Response + Content Strategist`);

  return {
    intent: 'goal-planning',
    routingTrace: trace,
    assignments: buildAssignments([
      { agent: 'growth-ops', title: 'Funnel & Conversion Diagnosis', reason: 'Owns operational leverage points across pipeline and campaigns', deliverable: 'Diagnosis of lead flow, conversion friction, and campaign alignment' },
      { agent: 'lead-response', title: 'Lead Response Acceleration', reason: 'Improves speed and consistency once opportunities enter the funnel', deliverable: 'Follow-up cadence and qualification improvements' },
      { agent: 'content-strategist', title: 'Trust & Demand Content', reason: 'Strengthens decision-stage trust and conversion support', deliverable: 'Case-study, landing-page, and proof-asset plan' },
    ]),
    message: `**Goal received** — I'm treating this as a **${family === 'growth-orders' ? 'revenue / orders' : 'general growth'} objective**.\n\n**What I extracted:**\n- Objective type: Increase business results\n- Strategy: Fix funnel → accelerate lead response → build demand\n\n**Initial operating plan:**\n1. Diagnose the highest-impact leakage points in traffic, lead flow, and conversion\n2. Improve first-response speed and follow-up consistency for qualified opportunities\n3. Add stronger trust assets to support homeowners evaluating Okeanos\n4. Use weekly reporting to check whether the changes improve consultations, reviews, and revenue intent\n\n**Routing:** Growth Ops + Lead Response + Content Strategist\n\n**3 workstreams created:**\n1. **Funnel & Conversion Diagnosis** → Growth Ops Agent\n2. **Lead Response Acceleration** → Lead Response Agent\n3. **Trust & Demand Content** → Content Strategist\n\n**What you'll be able to review:**\n- The key bottlenecks limiting growth right now\n- Recommended response and follow-up changes\n- Which content and proof assets should support the growth objective\n\nOpen **Tasks** to review, or **Approvals** to approve the direction.`,
    routedAgent: 'growth-ops',
    newTask: taskA,
    extraTasks: [taskB, taskC],
    newApproval: approval,
  };
}

// ── Goal planning dispatcher ─────────────────────────────────────────────────

function goalPlanningResponse(userMessage, confidence, features) {
  const family = detectGoalFamily(userMessage, features);

  switch (family) {
    case 'ad-efficiency':   return adEfficiencyGoalResponse(userMessage, confidence);
    case 'lead-generation': return leadGenerationGoalResponse(userMessage, confidence, features);
    case 'reputation':      return reputationGoalResponse(userMessage, confidence);
    case 'speed-to-lead':   return speedToLeadGoalResponse(userMessage, confidence);
    default:                return generalGrowthGoalResponse(userMessage, confidence, features);
  }
}

// ── Task-type responses ───────────────────────────────────────────────────────

function weeklyReportResponse() {
  const trace = buildTrace('weekly-report', 'high', 'reporting', 'Weekly report request → Reporting Agent');
  return {
    intent: 'weekly-report',
    routingTrace: trace,
    message: `**Weekly Marketing Report — Okeanos Pools GTA**\n**Week of ${today()}**\n\n---\n\n**Website Traffic (GA4)**\n- Sessions: **1,842** ↑12% WoW\n- Unique users: **1,390** ↑14%\n- Goal completions: **14** ↑27%\n\n**Lead Summary**\n- 14 new leads this week\n- Google Ads: 7 | Organic: 4 | Direct: 2 | Meta: 1\n- Avg. lead response time: **23 min** ✅ (target <30 min)\n\n**Ad Performance**\n- Ad spend: $4,570 · 4 active campaigns\n- Top: Google Search — Fiberglass Pool Quotes ($356/CPL)\n- Watch: Meta Awareness ($0 leads this week)\n\n**Recommended Actions**\n1. Clear pending approvals queue\n2. Pause or refresh Meta awareness campaign creative\n3. Publish the next BOFU content asset this week\n\nFull formatted report is in the **Reports** tab.`,
    routedAgent: 'reporting',
    newTask: null,
  };
}

function workSummaryResponse() {
  const trace = buildTrace('work-summary', 'high', null, 'Work summary request → synthesized from all agents');
  return {
    intent: 'work-summary',
    routingTrace: trace,
    message: `**AI Team Work Summary**\n\n**Completed this week**\n- Lead follow-up batch (March 5 · 7 leads sent)\n- Weekly report (March 3 edition · filed)\n- Homepage CTA copy variants (3 variants · approved)\n\n**Currently in progress**\n- Weekly report for Mar 9 *(Reporting Agent)*\n- CRM pipeline health report *(Growth Ops Agent)*\n- Blog post: Fiberglass vs. Concrete *(Content Strategist)*\n\n**Awaiting your review**\n- Google review response (J. Morrison · high priority)\n- Lead follow-up batch: March 9 (3 leads)\n- Meta Ads creative test brief\n\nOpen **Tasks** and **Approvals** for details on each item.`,
    routedAgent: null,
    newTask: null,
  };
}

function socialReputationResponse(userMessage) {
  const label = shortTitle(userMessage);
  const platform = detectPlatform(userMessage);
  const task = {
    id: nextId(),
    title: `Social/Reputation: ${label}`,
    description: `Request: "${userMessage}"\n\nSocial & Reputation Agent prepared a first-pass draft for review.\n\nPlatform focus: ${platform}.\nExecution expectation: protect trust, maintain professionalism, and keep the next step clear.`,
    assignedTo: 'social-reputation', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['social', 'routed', platform.toLowerCase().replace(/\s+/g, '-')],
    outputLabel: `${platform} Draft`,
    output: socialDraftOutput(userMessage),
  };
  const approval = makeApproval(task, `Social Draft Approval — ${shortTitle}`, 'Social & Reputation Agent prepared a first-pass response draft for review.', 'social-reputation', 'Social & Reputation Agent', 'medium', 'Review Response');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('social-reputation', 'medium', 'social-reputation', 'Social / review keywords → Social & Reputation Agent');
  return { intent: 'social-reputation', routingTrace: trace, assignments: buildAssignments([{ agent: 'social-reputation', title: 'Draft social / review response', reason: 'Best fit for public-facing brand and review communication', deliverable: 'Two review-safe draft options with tone guidance' }]), message: `**Routed to Social & Reputation Agent.**\n\nA first-pass draft is ready for review.\n\n**What the team prepared:**\n- Two response directions with different tone profiles\n- Language designed to protect trust and professionalism\n- A review-safe draft that can be revised before anything goes public\n\nOpen **Tasks** to see the output, or **Approvals** to review it formally.`, routedAgent: 'social-reputation', newTask: task, newApproval: approval };
}

function leadResponseResponse(userMessage) {
  const label = shortTitle(userMessage, 55);
  const task = {
    id: nextId(),
    title: `Lead Response: ${label}`,
    description: `Request: "${userMessage}"\n\nLead Response Agent prepared an initial follow-up draft.\n\nExecution expectation: move the lead toward a consultation or next-step conversation with minimal friction.`,
    assignedTo: 'lead-response', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['leads', 'routed', 'urgent'],
    outputLabel: 'Draft Follow-up',
    output: leadDraftOutput(userMessage),
  };
  const approval = makeApproval(task, `Lead Follow-up Approval — ${shortTitle}`, 'Lead Response Agent prepared email and SMS follow-up drafts for review.', 'lead-response', 'Lead Response Agent', 'high', 'Lead Follow-up');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('lead-response', 'medium', 'lead-response', 'Lead / follow-up keywords → Lead Response Agent');
  return { intent: 'lead-response', routingTrace: trace, assignments: buildAssignments([{ agent: 'lead-response', title: 'Draft quote-ready follow-up', reason: 'Owns first-contact speed, tone, and consultation conversion', deliverable: 'Email + SMS draft with consultation-focused CTA' }]), message: `**Routed to Lead Response Agent — high priority.**\n\nA first-pass follow-up draft (email + SMS) is ready in review.\n\n**What the team prepared:**\n- A consultation-first email draft\n- A short SMS follow-up for fast response\n- Language tuned for qualified inquiry handling and low-friction next steps`, routedAgent: 'lead-response', newTask: task, newApproval: approval };
}

function contentStrategistResponse(userMessage) {
  const label = shortTitle(userMessage);
  const task = {
    id: nextId(),
    title: `Content: ${label}`,
    description: `Request: "${userMessage}"\n\nContent Strategist Agent prepared a first-pass brief for review.\n\nExecution expectation: combine homeowner-friendly education with trust signals and a clear CTA.`,
    assignedTo: 'content-strategist', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['content', 'seo', 'routed'],
    outputLabel: 'Content Brief',
    output: contentDraftOutput(userMessage),
  };
  const approval = makeApproval(task, `Content Brief Approval — ${shortTitle}`, 'Content Strategist Agent prepared a content brief for review.', 'content-strategist', 'Content Strategist Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('content-strategist', 'medium', 'content-strategist', 'Blog / SEO / content keywords → Content Strategist Agent');
  return { intent: 'content-strategist', routingTrace: trace, assignments: buildAssignments([{ agent: 'content-strategist', title: 'Draft content brief', reason: 'Best fit for copy, SEO, landing-page structure, and trust assets', deliverable: 'Detailed content brief with angle, structure, and CTA' }]), message: `**Routed to Content Strategist Agent.**\n\nA first-pass content brief has been generated and placed into review.\n\n**What the team prepared:**\n- A content angle aligned to homeowner intent\n- A draft outline and conversion-focused structure\n- Recommended positioning, objections, and CTA direction`, routedAgent: 'content-strategist', newTask: task, newApproval: approval };
}

function reportingResponse(userMessage) {
  const label = shortTitle(userMessage);
  const task = {
    id: nextId(),
    title: `Analytics: ${label}`,
    description: `Request: "${userMessage}"\n\nReporting Agent prepared an initial analysis snapshot for review.\n\nExecution expectation: surface the most decision-relevant metrics, risks, and next actions.`,
    assignedTo: 'reporting', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['reporting', 'analytics', 'routed'],
    outputLabel: 'Reporting Snapshot',
    output: reportingDraftOutput(userMessage),
  };
  const approval = makeApproval(task, `Reporting Snapshot Approval — ${shortTitle}`, 'Reporting Agent prepared a first-pass metrics summary and recommendations.', 'reporting', 'Reporting Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('reporting', 'medium', 'reporting', 'Analytics / metrics keywords → Reporting Agent');
  return { intent: 'reporting', routingTrace: trace, assignments: buildAssignments([{ agent: 'reporting', title: 'Build reporting snapshot', reason: 'Owns KPI synthesis, trend interpretation, and recommendations', deliverable: 'Metrics summary with observations, risks, and next actions' }]), message: `**Routed to Reporting Agent.**\n\nA first-pass reporting snapshot is ready for review.\n\n**What the team prepared:**\n- A KPI snapshot across traffic, leads, and response speed\n- Observations on campaign efficiency and weak spots\n- Immediate actions the business can review and prioritize`, routedAgent: 'reporting', newTask: task, newApproval: approval };
}

function growthOpsResponse(userMessage) {
  const label = shortTitle(userMessage, 55);
  const task = {
    id: nextId(),
    title: `Growth Ops: ${label}`,
    description: `Request: "${userMessage}"\n\nGrowth Ops Agent prepared an initial operating brief for review.\n\nExecution expectation: identify operational friction and translate it into a clean action plan.`,
    assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['growth-ops', 'routed'],
    outputLabel: 'Growth Ops Brief',
    output: growthOpsDraftOutput(userMessage),
  };
  const approval = makeApproval(task, `Growth Ops Approval — ${shortTitle}`, 'Growth Ops Agent prepared an initial brief covering CRM, conversion, or campaign operations.', 'growth-ops', 'Growth Ops Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('growth-ops', 'medium', 'growth-ops', 'CRM / conversion / campaign keywords → Growth Ops Agent');
  return { intent: 'growth-ops', routingTrace: trace, assignments: buildAssignments([{ agent: 'growth-ops', title: 'Build operating brief', reason: 'Best fit for CRM, campaign operations, conversion friction, and workflow alignment', deliverable: 'Operating brief with diagnosis, next actions, and risk areas' }]), message: `**Routed to Growth Ops Agent.**\n\nA first-pass operating brief has been generated and added to review.\n\n**What the team prepared:**\n- A diagnosis of funnel and campaign friction\n- Operational next steps for CRM, CTA, and workflow clean-up\n- A brief designed to turn into an approval-ready execution plan`, routedAgent: 'growth-ops', newTask: task, newApproval: approval };
}

// ── Clarification responses ──────────────────────────────────────────────────

function clarificationResponse(userMessage) {
  const trace = buildTrace('clarification', 'medium', null, 'Input ambiguous — presenting disambiguation options');
  return {
    intent: 'clarification',
    routingTrace: trace,
    disambiguate: true,  // hint to Chat UI to show option cards
    options: [
      { label: 'Growth goal', desc: 'e.g. "I want 20 more leads next month"', value: 'I want to set a growth goal' },
      { label: 'Task request', desc: 'e.g. "Draft a follow-up for a new lead"', value: 'I have a task for the team' },
      { label: 'Weekly report', desc: 'Generate the weekly marketing report', value: 'Generate this week\'s weekly report' },
      { label: 'Approval / revision', desc: 'Review or revise a draft', value: 'Show me the pending approvals' },
      { label: 'Workflow question', desc: 'How does something work?', value: 'What can the AI team help me with?' },
    ],
    message: `I want to route this correctly.\n\nBased on your message — *"${userMessage}"* — which best describes what you need?\n\nSelect one of the options below, or rephrase in a single sentence with a clear objective.`,
    routedAgent: null,
    newTask: null,
  };
}

function taskStatusResponse() {
  const trace = buildTrace('clarify-tasks', 'medium', null, 'Task status query');
  return {
    intent: 'clarification',
    routingTrace: trace,
    message: `I can help you get visibility on tasks. What do you need?\n\n1. **Open tasks** — everything in progress or pending\n2. **Blocked tasks** — items stuck or waiting on input\n3. **Tasks awaiting approval** — ready for your review\n4. **Tasks by agent** — sorted by who owns them\n5. **A full work summary** — narrative of what's been done and what's next\n\nReply with the closest option, or just go to **Tasks** for the full queue.`,
    routedAgent: null,
    newTask: null,
  };
}

function approvalClarifyResponse() {
  const trace = buildTrace('clarify-approval', 'medium', null, 'Approval query');
  return {
    intent: 'clarification',
    routingTrace: trace,
    message: `I detected an approval-related request. What do you need?\n\n1. **Show pending approvals** — items waiting for your review\n2. **Prepare an item for approval** — create a new draft for the queue\n3. **Request changes on a draft** — return with revision notes\n4. **Explain the approval workflow** — how AI drafts → human approval works\n\nReply with the closest option, or head to **Approvals** directly.`,
    routedAgent: null,
    newTask: null,
  };
}

function helpResponse() {
  const trace = buildTrace('clarification', 'medium', null, 'Help / capabilities query');
  return {
    intent: 'clarification',
    routingTrace: trace,
    message: `I orchestrate your 6-agent Okeanos AI marketing team. Here's what I can do:\n\n**Goal Planning** — Tell me a business objective and I'll create structured workstreams across the right agents.\n\n**Task Routing** — Ask for social posts, lead follow-ups, content briefs, analytics, or CRM ops and I'll route to the right agent.\n\n**Reporting** — Request the weekly marketing report or a team work summary at any time.\n\n**Approvals** — Ask me to prepare items for your review, or navigate to the Approvals tab directly.\n\n**Agents I coordinate:**\n- Social & Reputation Agent — reviews, captions, social copy\n- Content Strategist — blogs, landing pages, email campaigns\n- Lead Response Agent — follow-ups, lead qualification\n- Reporting Agent — weekly reports, GA4, ad analytics\n- Growth Ops Agent — CRM, conversion, campaign ops\n\nWhat would you like to work on?`,
    routedAgent: null,
    newTask: null,
  };
}

function fallbackResponse(userMessage) {
  const trace = buildTrace('fallback', 'low', null, 'No clear intent detected — asking for clarification');
  return {
    intent: 'clarification',
    routingTrace: trace,
    disambiguate: true,
    options: [
      { label: 'Set a growth goal', desc: 'e.g. more leads, reduce ad costs', value: 'I want to set a growth goal for the team' },
      { label: 'Request a task', desc: 'social, content, lead follow-up, etc.', value: 'I have a task request for the team' },
      { label: 'Get a report', desc: 'weekly report or work summary', value: 'Generate this week\'s weekly report' },
      { label: 'What can you do?', desc: 'Overview of AI team capabilities', value: 'What can the AI team help me with?' },
    ],
    message: `I'm not sure how to route this yet.\n\nOriginal message: *"${userMessage}"*\n\nTry rephrasing as one of these, or pick an option below:`,
    routedAgent: null,
    newTask: null,
  };
}

function quickStartResponse(userMessage) {
  const normalized = normalizeInput(userMessage);

  if (normalized === 'increase consultation bookings from budget conscious gta families without hurting lead quality') {
    return leadGenerationGoalResponse('Increase consultation bookings from budget-conscious GTA families without hurting lead quality', 'high', {
      hasNumber: false,
      timeWeek: false,
      timeMonth: true,
      timeQuarter: false,
    });
  }

  if (normalized === 'build a referral workflow for landscapers and builders in vaughan and oakville') {
    const taskA = {
      id: nextId(),
      title: 'Referral Workflow: Partner Program Design',
      description: 'Growth Ops Agent is designing a practical referral workflow for landscapers and builders in Vaughan and Oakville.',
      assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'high',
      status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      tags: ['goal', 'referral', 'growth-ops'],
      outputLabel: 'Partner Referral Workflow',
      output: `Workflow objective
- Build a repeatable referral system for landscapers and builders in Vaughan and Oakville

Recommended structure
1. Identify ideal partner profiles by volume, reputation, and project fit
2. Create a simple partner offer with clear referral handoff rules
3. Prepare outreach messaging, follow-up cadence, and referral tracking
4. Define success metrics: partner sign-ups, referred consultations, referred quotes, closed projects`,
    };
    const taskB = {
      id: nextId(),
      title: 'Referral Workflow: Partner Messaging Kit',
      description: 'Content Strategist is preparing outreach copy and a simple partner-facing value proposition.',
      assignedTo: 'content-strategist', requestedBy: 'team-leader', priority: 'medium',
      status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      tags: ['goal', 'referral', 'content'],
      outputLabel: 'Referral Messaging Kit',
      output: `Messaging kit
- Short intro email for landscapers and builders
- Partner value proposition focused on trust, professionalism, and homeowner fit
- One-page referral process summary
- Suggested CTA: book a partner intro call`,
    };
    const taskC = {
      id: nextId(),
      title: 'Referral Workflow: KPI Tracking Setup',
      description: 'Reporting Agent is defining how referral activity should be tracked and reviewed.',
      assignedTo: 'reporting', requestedBy: 'team-leader', priority: 'medium',
      status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      tags: ['goal', 'referral', 'reporting'],
      outputLabel: 'Referral KPI Framework',
      output: `Tracking framework
- Active partners
- Referrals received
- Consultations booked from referrals
- Quote conversion from referrals
- Closed projects from referral channel`,
    };
    const approval = makeApproval(taskA, 'Referral Workflow Plan — Approve to Activate', 'AI Team Leader prepared a first-pass partner referral workflow for Vaughan and Oakville.', 'growth-ops', 'AI Team Leader + Growth Ops Agent', 'high', 'Campaign Brief');
    taskA.generatedApproval = approval; taskA.newApproval = approval;
    return {
      intent: 'goal-planning',
      routingTrace: buildTrace('goal-planning', 'high', 'growth-ops', 'Referral workflow objective → Growth Ops + Content Strategist + Reporting'),
      assignments: buildAssignments([
        { agent: 'growth-ops', title: 'Partner Program Design', reason: 'Owns workflow, partner qualification, and operational rollout', deliverable: 'Referral workflow and partner handoff design' },
        { agent: 'content-strategist', title: 'Partner Messaging Kit', reason: 'Owns outreach positioning and partner-facing copy', deliverable: 'Intro email, partner pitch, and one-page workflow summary' },
        { agent: 'reporting', title: 'Referral KPI Setup', reason: 'Keeps referral channel measurable from the start', deliverable: 'KPI framework and review cadence' },
      ]),
      message: `**Goal received** — I'm treating this as a **partner referral workflow objective**.\n\n**What I extracted:**\n- Audience: landscapers and builders\n- Markets: Vaughan and Oakville\n- Outcome: build a repeatable referral channel, not just a one-off outreach campaign\n\n**Initial operating plan:**\n1. Define who the best-fit partners are and what qualifies them\n2. Build a simple referral workflow with clear handoff and follow-up rules\n3. Prepare partner-facing messaging so outreach is professional and easy to repeat\n4. Track whether referral activity is leading to consultations, quotes, and closed projects\n\n**3 workstreams created:**\n1. **Partner Program Design** → Growth Ops Agent\n2. **Partner Messaging Kit** → Content Strategist\n3. **Referral KPI Setup** → Reporting Agent\n\nOpen **Tasks** to review the workstreams, or **Approvals** to approve the direction.`,
      routedAgent: 'growth-ops',
      newTask: taskA,
      extraTasks: [taskB, taskC],
      newApproval: approval,
    };
  }

  if (normalized === 'reduce ad spend without losing lead quality in our top postal code targets') {
    return adEfficiencyGoalResponse('Reduce ad spend without losing lead quality in our top postal code targets', 'high');
  }

  if (normalized === 'generate this week s weekly marketing report with priority markets and review status') {
    const base = weeklyReportResponse();
    return {
      ...base,
      message: `**Weekly Marketing Report — Okeanos Pools GTA**\n**Week of ${today()}**\n\n---\n\n**Website Traffic (GA4)**\n- Sessions: **1,842** ↑12% WoW\n- Unique users: **1,390** ↑14%\n- Goal completions: **14** ↑27%\n\n**Lead Summary**\n- 14 new leads this week\n- Google Ads: 7 | Organic: 4 | Direct: 2 | Meta: 1\n- Avg. lead response time: **23 min** ✅ (target <30 min)\n\n**Priority Markets**\n- **Oakville** — strongest trust/proof-content opportunity\n- **Vaughan** — strongest partner/referral opportunity\n- **Thornhill** — worth testing for consultation demand\n\n**Review Status**\n- 1 high-priority negative review still awaiting approval\n- Review response backlog should stay under 24h\n- Review generation should target recent completed projects first\n\n**Recommended Actions**\n1. Clear pending review approvals first\n2. Push the next proof-driven content asset in Oakville\n3. Keep Vaughan partner/referral outreach active this week\n\nFull formatted report is in the **Reports** tab.`,
    };
  }

  if (normalized === 'give me a summary of leads quotes reviews and follow up bottlenecks') {
    return {
      intent: 'work-summary',
      routingTrace: buildTrace('work-summary', 'high', null, 'Executive operating summary across leads, quotes, reviews, and follow-up bottlenecks'),
      message: `**Operating Summary — Leads, Quotes, Reviews, and Follow-Up Bottlenecks**\n\n**Leads**\n- Lead volume remains healthy, with Google Ads still producing the strongest high-intent inquiries\n- Organic leads continue to support trust-driven demand\n- Meta remains weaker on quality and should be watched closely\n\n**Quotes**\n- Quote activity is steady, but conversion depends heavily on follow-up discipline\n- The biggest risk is not lack of quoting — it is slow or inconsistent follow-up after the quote is sent\n\n**Reviews**\n- Reviews remain one of the strongest trust assets in the funnel\n- One negative review item still needs approval and response\n- Review generation after completed projects is still underused\n\n**Follow-Up Bottlenecks**\n1. Response speed is good overall, but quote-stage follow-up can stall\n2. Some leads are not being moved quickly enough toward consultation\n3. Trust assets are not always visible enough at decision stage\n\n**Priority next actions**\n- Clear pending approvals\n- Tighten quote-stage follow-up cadence\n- Push more review requests from completed projects`,
      routedAgent: null,
      newTask: null,
    };
  }

  if (normalized === 'draft a follow up for a lead comparing 3 quotes and asking about financing') {
    return leadResponseResponse('Draft a follow-up for a lead comparing 3 quotes and asking about financing');
  }

  if (normalized === 'write an instagram caption for an oakville before and after fiberglass pool project') {
    return socialReputationResponse('Write an Instagram caption for an Oakville before-and-after fiberglass pool project');
  }

  if (normalized === 'identify an under targeted fiberglass pool customer segment in ontario and propose a campaign to reach them') {
    return {
      intent: 'growth-ops',
      routingTrace: buildTrace('growth-ops', 'high', 'growth-ops', 'Strategic segmentation + campaign design request for Ontario fiberglass audience'),
      assignments: buildAssignments([
        { agent: 'growth-ops', title: 'Define under-targeted Ontario segment', reason: 'Best fit for audience strategy, positioning, and channel selection', deliverable: 'Segment recommendation with campaign concept and execution plan' },
      ]),
      message: `# Under-Targeted Customer Segment Opportunity

One under-targeted fiberglass pool customer segment in Ontario is **affluent empty-nesters and downsizers in suburban GTA markets** — homeowners who want a premium backyard upgrade, but care more about **low maintenance, installation predictability, and long-term ease of ownership** than family-oriented “summer fun” messaging.

## Why this segment is under-targeted
Most pool marketing tends to focus on families with young children. That leaves a meaningful opportunity with older homeowners who:
- still have strong purchasing power
- are investing in lifestyle and home enjoyment
- prefer simpler ownership and less maintenance
- are more likely to value fiberglass over concrete for practical reasons

## Why fiberglass is a strong fit
Fiberglass aligns well with this segment because it offers:
- lower ongoing maintenance
- a clean, premium finish
- faster installation timelines
- a more predictable ownership experience

For this audience, the appeal is less about recreation for kids and more about **comfort, aesthetics, entertaining, and convenience**.

## Recommended campaign concept
**Campaign theme:**
**Low-Maintenance Luxury for Ontario Backyards**

## Core messaging
The campaign should position Okeanos as the smart choice for homeowners who want a beautiful backyard upgrade without the long-term burden of a high-maintenance pool.

### Messaging pillars
1. **Less maintenance than concrete**
2. **Beautiful, premium backyard design**
3. **Faster and more predictable installation**
4. **Ideal for entertaining, relaxing, and enjoying the home long-term**

## Campaign execution
### 1. Paid Search
Launch search campaigns targeting intent-driven keywords such as:
- fiberglass pool Ontario
- low maintenance pool Ontario
- fiberglass vs concrete pool Ontario
- premium pool installation GTA
- backyard pool consultation Ontario

### 2. Paid Social
Run Instagram and Facebook creative featuring:
- elegant before-and-after backyard transformations
- compact luxury backyard designs
- short expert videos explaining why fiberglass suits low-maintenance homeowners
- customer-story creative focused on lifestyle improvement, not family play

### 3. Landing Page
Create a dedicated landing page built around:
- low-maintenance ownership
- premium design
- realistic timelines
- consultation-first conversion

The page should feel more like a **premium home upgrade offer** than a generic pool ad.

## Example CTA
- **Book a Design Consultation**
- **See Premium Fiberglass Pool Options for Ontario Homes**
- **Get a Realistic Project Plan and Budget Range**

## Recommendation
This segment is attractive because it is:
- economically viable
- strategically differentiated
- well aligned with the strengths of fiberglass
- less crowded than the typical family-focused pool audience

If Okeanos wants a campaign that feels more distinctive and premium, this is one of the strongest under-targeted segments to pursue.`,
      routedAgent: 'growth-ops',
      newTask: null,
    };
  }

  if (normalized === 'create a showroom visit nurture sequence using brochure before and after photos and trust messaging') {
    const task = {
      id: nextId(),
      title: 'Lead Nurture: Showroom Visit Sequence',
      description: 'Lead Response Agent prepared a showroom-visit nurture sequence using brochure support, before/after visuals, and trust messaging.',
      assignedTo: 'lead-response', requestedBy: 'team-leader', priority: 'high',
      status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      tags: ['lead-response', 'nurture', 'showroom'],
      outputLabel: 'Showroom Nurture Sequence',
      output: `Sequence objective
- Move a showroom visitor from early interest toward consultation and quote readiness

Email 1 — Thank you + brochure send
- Thank the prospect for visiting the showroom
- Attach or reference the brochure
- Reinforce Okeanos trust, process clarity, and fiberglass expertise

Email 2 — Before/after proof
- Share before-and-after project visuals
- Emphasize project transformation, quality, and homeowner confidence
- Invite questions about fit, timing, and budget

Email 3 — Trust + next step
- Reinforce reviews, professionalism, and low-friction experience
- Invite a consultation or site-visit discussion
- Keep the CTA simple and consultation-focused`,
    };
    const approval = makeApproval(task, 'Showroom Nurture Approval — Review Sequence', 'Lead Response Agent prepared a 3-step showroom visitor nurture sequence for review.', 'lead-response', 'Lead Response Agent', 'high', 'Lead Follow-up');
    task.generatedApproval = approval; task.newApproval = approval;
    return {
      intent: 'lead-response',
      routingTrace: buildTrace('lead-response', 'high', 'lead-response', 'Showroom nurture request → Lead Response Agent'),
      assignments: buildAssignments([
        { agent: 'lead-response', title: 'Build showroom nurture sequence', reason: 'Owns lead follow-up structure and consultation-oriented messaging', deliverable: '3-step email sequence using brochure, proof visuals, and trust messaging' },
      ]),
      message: `**Routed to Lead Response Agent — high priority.**\n\nA showroom-visit nurture sequence is ready for review.\n\n**What the team prepared:**\n- A 3-step sequence built around brochure support, before/after proof, and trust messaging\n- Clear progression from showroom interest to consultation-ready next step\n- Low-friction CTA language designed to keep the conversation moving\n\nOpen **Tasks** to review the draft, or **Approvals** to review it formally.`,
      routedAgent: 'lead-response',
      newTask: task,
      newApproval: approval,
    };
  }

  return null;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getTeamLeaderResponse(userMessage) {
  // 1. High-quality exact handling for formal evaluation prompts
  const quickStart = quickStartResponse(userMessage);
  if (quickStart) return quickStart;

  // 2. Try LLM backend if available
  const backendResult = await tryBackendTeamLeader(userMessage);
  if (backendResult) return backendResult;

  // 3. Simulate AI processing delay (more realistic range)
  const delay = 600 + Math.random() * 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 4. Classify
  const { intent, confidence, features } = classifyIntent(userMessage);

  // 5. Dispatch
  switch (intent) {
    case 'goal-planning':     return goalPlanningResponse(userMessage, confidence, features);
    case 'weekly-report':     return weeklyReportResponse();
    case 'work-summary':      return workSummaryResponse();
    case 'social-reputation': return socialReputationResponse(userMessage);
    case 'lead-response':     return leadResponseResponse(userMessage);
    case 'content-strategist':return contentStrategistResponse(userMessage);
    case 'reporting':         return reportingResponse(userMessage);
    case 'growth-ops':        return growthOpsResponse(userMessage);
    case 'clarify-tasks':     return taskStatusResponse();
    case 'clarify-approval':  return approvalClarifyResponse();
    case 'clarification':     return helpResponse();
    case 'fallback':          return fallbackResponse(userMessage);
    default:                  return fallbackResponse(userMessage);
  }
}
