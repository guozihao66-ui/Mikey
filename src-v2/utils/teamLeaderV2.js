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
    message: `**Goal received** — I'm treating this as an **ad efficiency objective**.\n\n**What I extracted:**\n- Objective type: Reduce advertising costs\n- Primary metric: Ad spend / CPL\n- Strategy: Audit → reallocate → monitor\n\n**Routing:** Growth Ops Agent (spend analysis) + Reporting Agent (weekly monitoring)\n\n**3 workstreams created:**\n1. **Ad Spend & CPL Audit** → Growth Ops Agent\n2. **Budget Reallocation Plan** → Growth Ops Agent\n3. **Weekly Paid Media Monitor** → Reporting Agent\n\nOpen **Tasks** to review the workstreams, or **Approvals** to approve the plan.`,
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
    message: `**Goal received** — I'm treating this as a **lead generation objective**.\n\n**What I extracted:**\n- Objective type: Increase qualified leads / bookings${numericNote}${timeNote}\n- Strategy: Fix funnel → improve response speed → build demand\n\n**Routing:** Growth Ops + Lead Response + Content Strategist\n\n**3 workstreams created:**\n1. **Funnel Diagnosis** → Growth Ops Agent\n2. **Speed-to-Lead Plan** → Lead Response Agent\n3. **Demand & Trust Content** → Content Strategist\n\nOpen **Tasks** to review the workstreams, or **Approvals** to approve the direction.`,
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
    message: `**Goal received** — I'm treating this as a **reputation objective**.\n\n**What I extracted:**\n- Objective type: Improve Google rating / increase reviews\n- Primary owner: Social & Reputation Agent\n\n**2 workstreams created:**\n1. **Review Generation Campaign** → Social & Reputation Agent\n2. **Review Response Backlog** → Social & Reputation Agent\n\nOpen **Tasks** to review, or **Approvals** to approve the plan.`,
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
    message: `**Goal received** — I'm treating this as a **speed-to-lead objective**.\n\n**What I extracted:**\n- Objective type: Reduce response time to new leads\n- Primary owner: Lead Response Agent\n\n**Workstream created:**\n1. **Response Protocol Redesign** → Lead Response Agent\n\nOpen **Approvals** to review and activate the new response protocol.`,
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
    message: `**Goal received** — I'm treating this as a **${family === 'growth-orders' ? 'revenue / orders' : 'general growth'} objective**.\n\n**What I extracted:**\n- Objective type: Increase business results\n- Strategy: Fix funnel → accelerate lead response → build demand\n\n**Routing:** Growth Ops + Lead Response + Content Strategist\n\n**3 workstreams created:**\n1. **Funnel & Conversion Diagnosis** → Growth Ops Agent\n2. **Lead Response Acceleration** → Lead Response Agent\n3. **Trust & Demand Content** → Content Strategist\n\nOpen **Tasks** to review, or **Approvals** to approve the direction.`,
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
  const shortTitle = userMessage.length > 60 ? userMessage.substring(0, 57) + '...' : userMessage;
  const task = {
    id: nextId(),
    title: `Social/Reputation: ${shortTitle}`,
    description: `Request: "${userMessage}"\n\nSocial & Reputation Agent prepared a first-pass draft for review.`,
    assignedTo: 'social-reputation', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['social', 'routed'],
    outputLabel: 'Draft Output',
    output: `Recommended platform: Google / Instagram / Facebook (confirm as needed)\n\nDraft Option A\n"Thank you for the feedback. We take this seriously and have already reviewed the issue internally."\n\nDraft Option B\n"We appreciate the feedback and understand the concern. Okeanos is committed to clear communication and professional follow-through."\n\nHuman approval required before posting.`,
  };
  const approval = makeApproval(task, `Social Draft Approval — ${shortTitle}`, 'Social & Reputation Agent prepared a first-pass response draft for review.', 'social-reputation', 'Social & Reputation Agent', 'medium', 'Review Response');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('social-reputation', 'medium', 'social-reputation', 'Social / review keywords → Social & Reputation Agent');
  return { intent: 'social-reputation', routingTrace: trace, message: `**Routed to Social & Reputation Agent.**\n\nA first-pass draft is ready for review.\n\nOpen **Tasks** to see the output, or **Approvals** to review it formally.`, routedAgent: 'social-reputation', newTask: task, newApproval: approval };
}

function leadResponseResponse(userMessage) {
  const shortTitle = userMessage.substring(0, 55) + (userMessage.length > 55 ? '...' : '');
  const task = {
    id: nextId(),
    title: `Lead Response: ${shortTitle}`,
    description: `Request: "${userMessage}"\n\nLead Response Agent prepared an initial follow-up draft.`,
    assignedTo: 'lead-response', requestedBy: 'team-leader', priority: 'high',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['leads', 'routed', 'urgent'],
    outputLabel: 'Draft Follow-up',
    output: `Subject Option A: Your Okeanos pool quote — next steps\nSubject Option B: Thanks for reaching out about your pool project\n\nEmail Draft\nHi there,\n\nThank you for reaching out to Okeanos. The next best step is a short consultation so we can confirm timeline, layout, and project goals.\n\nBest,\nOkeanos Pools GTA\n\nSMS Draft\nThanks for reaching out to Okeanos — would you prefer a quick call or site visit discussion?\n\nHuman approval required before sending.`,
  };
  const approval = makeApproval(task, `Lead Follow-up Approval — ${shortTitle}`, 'Lead Response Agent prepared email and SMS follow-up drafts for review.', 'lead-response', 'Lead Response Agent', 'high', 'Lead Follow-up');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('lead-response', 'medium', 'lead-response', 'Lead / follow-up keywords → Lead Response Agent');
  return { intent: 'lead-response', routingTrace: trace, message: `**Routed to Lead Response Agent — high priority.**\n\nA first-pass follow-up draft (email + SMS) is ready in review.`, routedAgent: 'lead-response', newTask: task, newApproval: approval };
}

function contentStrategistResponse(userMessage) {
  const shortTitle = userMessage.substring(0, 60) + (userMessage.length > 60 ? '...' : '');
  const task = {
    id: nextId(),
    title: `Content: ${shortTitle}`,
    description: `Request: "${userMessage}"\n\nContent Strategist Agent prepared a first-pass brief for review.`,
    assignedTo: 'content-strategist', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['content', 'seo', 'routed'],
    outputLabel: 'Content Brief',
    output: `Recommended primary angle\n- Engineer-led pool expertise for Ontario homeowners\n\nProposed outline\n1. Homeowner problem / goal\n2. Why fiberglass works in Ontario\n3. Okeanos differentiators\n4. Common objections and answers\n5. Clear CTA to consultation\n\nHuman approval required before publishing.`,
  };
  const approval = makeApproval(task, `Content Brief Approval — ${shortTitle}`, 'Content Strategist Agent prepared a content brief for review.', 'content-strategist', 'Content Strategist Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('content-strategist', 'medium', 'content-strategist', 'Blog / SEO / content keywords → Content Strategist Agent');
  return { intent: 'content-strategist', routingTrace: trace, message: `**Routed to Content Strategist Agent.**\n\nA first-pass content brief has been generated and placed into review.`, routedAgent: 'content-strategist', newTask: task, newApproval: approval };
}

function reportingResponse(userMessage) {
  const shortTitle = userMessage.substring(0, 60) + (userMessage.length > 60 ? '...' : '');
  const task = {
    id: nextId(),
    title: `Analytics: ${shortTitle}`,
    description: `Request: "${userMessage}"\n\nReporting Agent prepared an initial analysis snapshot for review.`,
    assignedTo: 'reporting', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['reporting', 'analytics', 'routed'],
    outputLabel: 'Reporting Snapshot',
    output: `Metrics snapshot\n- Website sessions: 1,842 · New leads: 14 · Avg. lead response time: 23 minutes\n\nTop observations\n- Organic traffic is trending up\n- Meta performance needs refresh\n- Lead response remains within target\n\nRecommended actions\n1. Clear approvals queue\n2. Refresh paid creative\n3. Publish the next high-intent content asset`,
  };
  const approval = makeApproval(task, `Reporting Snapshot Approval — ${shortTitle}`, 'Reporting Agent prepared a first-pass metrics summary and recommendations.', 'reporting', 'Reporting Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('reporting', 'medium', 'reporting', 'Analytics / metrics keywords → Reporting Agent');
  return { intent: 'reporting', routingTrace: trace, message: `**Routed to Reporting Agent.**\n\nA first-pass reporting snapshot is ready for review.`, routedAgent: 'reporting', newTask: task, newApproval: approval };
}

function growthOpsResponse(userMessage) {
  const shortTitle = userMessage.substring(0, 55) + (userMessage.length > 55 ? '...' : '');
  const task = {
    id: nextId(),
    title: `Growth Ops: ${shortTitle}`,
    description: `Request: "${userMessage}"\n\nGrowth Ops Agent prepared an initial operating brief for review.`,
    assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'medium',
    status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: ['growth-ops', 'routed'],
    outputLabel: 'Growth Ops Brief',
    output: `Initial diagnosis\n- Review CRM stage drop-off between inquiry and consultation\n- Check response-time gaps for qualified leads\n- Review landing page CTA clarity and form friction\n\nRecommended next actions\n1. Re-engage stalled leads\n2. Simplify the primary consultation CTA\n3. Align campaign messaging with landing page promise\n\nHuman review required before changing live workflows.`,
  };
  const approval = makeApproval(task, `Growth Ops Approval — ${shortTitle}`, 'Growth Ops Agent prepared an initial brief covering CRM, conversion, or campaign operations.', 'growth-ops', 'Growth Ops Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approval; task.newApproval = approval;
  const trace = buildTrace('growth-ops', 'medium', 'growth-ops', 'CRM / conversion / campaign keywords → Growth Ops Agent');
  return { intent: 'growth-ops', routingTrace: trace, message: `**Routed to Growth Ops Agent.**\n\nA first-pass operating brief has been generated and added to review.`, routedAgent: 'growth-ops', newTask: task, newApproval: approval };
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

// ── Public API ───────────────────────────────────────────────────────────────

export async function getTeamLeaderResponse(userMessage) {
  // 1. Try LLM backend if available
  const backendResult = await tryBackendTeamLeader(userMessage);
  if (backendResult) return backendResult;

  // 2. Simulate AI processing delay (more realistic range)
  const delay = 600 + Math.random() * 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 3. Classify
  const { intent, confidence, features } = classifyIntent(userMessage);

  // 4. Dispatch
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
