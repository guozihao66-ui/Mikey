// ── Team Leader AI Simulation Layer ──────────────────────────────────────────
// Intent Router v2 + goal family handlers.
// Still workflow-first and prototype-friendly when no backend LLM is available.

import { nextId } from '../data/tasks.js';
import { tryBackendTeamLeader } from './teamLeaderLLM.js';

const today = () => {
  const d = new Date();
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

function hasAny(text, patterns) {
  return patterns.some((p) => p.test(text));
}

function getSpecialResponse(message) {
  const m = message.toLowerCase();

  if ((/cost per lead|cpl/.test(m) && /25%|twenty-five percent/.test(m)) || (/reduce/.test(m) && /cost per lead|cpl/.test(m))) {
    return {
      intent: 'reporting',
      message: `**Key takeaway:** the clearest path to a 25% CPL reduction is not broad cost-cutting. It is a combination of **reducing low-intent paid social waste, protecting high-intent search, and improving landing-page conversion before scaling spend**.

## 1) Target
Using the current prototype CPL of **$38.20**, a 25% reduction implies a target of roughly **$28.65 per lead**.

## 2) Biggest opportunities
### A. Cut low-efficiency spend first
The weakest candidate in the current mix is **Meta Awareness — Spring Visual Teaser**.
- it appears better suited to reach than direct-response lead generation
- if the goal is lower CPL, this is the first budget line I would reduce or repurpose

### B. Protect the highest-intent search campaigns
The most efficient leads are still most likely coming from **Google Search campaigns tied to quote and installation intent**.

### C. Improve conversion rate before adding more traffic
- match ad promise to landing-page headline
- simplify the consultation form
- move Ontario trust signals and project clarity above the fold

### D. Tighten audience quality
- exclude lower-intent placements and broad audiences
- prioritize stronger homeowner-intent signals

### E. Refresh creative instead of forcing spend
Use stronger before/after proof, consultation CTAs, and clearer value framing.

## 3) Recommended action plan
1. trim underperforming awareness spend
2. reallocate budget into high-intent Google Search campaigns
3. test two landing-page variants focused on consultation conversion
4. review both CPL and lead quality

## 4) KPI guardrails
Track:
- CPL
- qualified lead rate
- consultation booking rate
- quote-ready lead volume

## 5) Recommendation
The most credible route to a 25% CPL reduction is:
1. reduce weak Meta awareness spend
2. concentrate budget in quote-intent search campaigns
3. improve landing-page conversion before scaling traffic further`,
      routedAgent: 'reporting',
      newTask: null,
    };
  }

  if ((/ppc/.test(m) || /google ads|meta ads|paid search|paid media/.test(m)) && /benchmark|benchmarks/.test(m)) {
    return {
      intent: 'reporting',
      message: `**Bottom line:** based on the current prototype campaign mix, the **Google Search campaigns are the most likely outperformers**, while the **Meta awareness campaign is the clearest likely underperformer** against pool-industry direct-response benchmarks.

## 1) Benchmark lens
For a high-ticket, seasonal home-service category like fiberglass pools, the usual benchmark pattern is:
- high-intent search drives the strongest lead quality
- local non-brand search performs better than broad paid social on efficiency
- awareness campaigns support demand creation but usually look weak on last-click CPL

## 2) Likely outperformers
### Google Search — Fiberglass Pool Quotes
- strongest candidate to outperform
- closest to decision-stage intent
- most likely to generate consultation-ready traffic

### Google Search — Pool Installation GTA
- likely second-strongest performer
- strong local intent
- usually more efficient than social if keyword quality is managed well

## 3) Likely middle performer
### Meta Lead Form — Backyard Renovation
- may help with volume
- but lead quality should be validated on booked consultations, not just form fills

## 4) Likely underperformer
### Meta Awareness — Spring Visual Teaser
- most likely weak on direct-response efficiency
- better suited to reach than bottom-funnel conversion
- first place to review if budget has to move

## 5) Recommendation
Leadership summary:
- likely outperforming: Fiberglass Pool Quotes, Pool Installation GTA
- needs quality validation: Backyard Renovation lead form campaign
- most likely below benchmark: Spring Visual Teaser awareness campaign`,
      routedAgent: 'reporting',
      newTask: null,
    };
  }

  if ((/under-targeted|underserved/.test(m) && /segment/.test(m) && /ontario/.test(m)) || (/fiberglass pool customer segment/.test(m) && /ontario/.test(m)) || (/identify/.test(m) && /campaign to reach/.test(m) && /ontario/.test(m) && /fiberglass/.test(m))) {
    return {
      intent: 'growth-ops',
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

  if ((/social media strategy/.test(m) || /instagram|tiktok/.test(m)) && /trend|trends|workflow/.test(m)) {
    return {
      intent: 'social-reputation',
      message: `The most useful Instagram / TikTok trends for a pool company are the ones that combine **visual proof, practical education, and a clear conversion path**.

## Trends Okeanos could leverage
1. before-and-after transformation reels
2. process transparency content
3. educational expert clips
4. local proof tied to GTA / Ontario projects
5. story-led social proof instead of generic testimonials

## Recommended weekly workflow
### Monday — Strategy and sourcing
- choose 3 themes
- define 1 primary CTA
- collect footage, photos, and customer proof

### Tuesday — Production
- film 2 short expert clips
- edit 1 transformation reel
- prepare 1 story Q&A or poll sequence

### Wednesday — Publish proof content
Post a transformation or reveal reel with a consultation CTA.

### Thursday — Publish education content
Answer a real buyer question and direct viewers to DM or consultation.

### Friday — Publish trust/process content
Show craftsmanship, install progress, or customer story content.

### Daily stories
Use stories for progress updates, polls, FAQs, myth-busting, and DM prompts.

## Best content mix
- 40% visual proof
- 30% education
- 20% process / behind the scenes
- 10% direct CTA content

## Recommendation
The goal should not be to go viral. It should be to build a repeatable content engine that turns attention into consultation intent.`,
      routedAgent: 'social-reputation',
      newTask: null,
    };
  }

  if ((/executive report/.test(m) || /monthly executive marketing report/.test(m)) && /monthly|month/.test(m)) {
    return {
      intent: 'reporting',
      message: `# Monthly Executive Marketing Report

## Executive Summary
This month, Okeanos maintained healthy lead flow, with **Google Search continuing to act as the strongest demand-capture channel**. Paid social contributed reach and creative testing value, but appears less efficient as a direct-response acquisition engine. Lead response speed remained within target, while the clearest near-term opportunity is improving paid efficiency through budget reallocation and conversion-focused landing-page improvements.

## Channel Performance
### Google Search
- strongest intent channel
- best fit for quote and installation demand
- should remain the priority for protected or expanded spend

### Paid Social
- useful for awareness, remarketing, and creative testing
- less reliable as the main direct-response engine

### Organic / Content
- supports trust and education
- can reduce long-term paid dependency if BOFU content expands

### Lead Response / Conversion
- response speed remains within target
- biggest opportunity is improving consultation-booked rate

## Leadership Takeaways
1. Search is still the most dependable direct-response channel
2. Paid social is more valuable as a support channel than as the core efficiency engine
3. Conversion improvements can unlock better performance without relying only on more traffic

## Top Three Actions for Next Month
1. Reallocate more budget toward the highest-intent Google Search campaigns
2. Refresh paid social creative and tighten audience targeting
3. Improve the consultation landing-page experience with stronger proof and clearer messaging

## Recommended KPI Focus
- total leads
- qualified leads
- cost per lead
- consultation booking rate
- average response time
- channel-level conversion efficiency`,
      routedAgent: 'reporting',
      newTask: null,
    };
  }

  return null;
}

function classifyIntent(message) {
  const m = message.toLowerCase();

  const signals = {
    goalVerb: hasAny(m, [
      /\bgoal\b/, /\btarget\b/, /\bobjective\b/, /\bplan\b/, /\bstrategy\b/, /\broadmap\b/,
      /\bincrease\b/, /\bgrow\b/, /\bimprove\b/, /\bboost\b/, /\breduce\b/, /\bdecrease\b/,
      /\bhit\b/, /\bachieve\b/, /\bget\b/, /\bgain\b/, /\badd\b/, /\braise\b/, /\blift\b/,
      /\bwant\b/, /\bneed\b/, /\bminimize\b/, /\blower\b/, /\bcut\b/
    ]),
    goalMetric: hasAny(m, [
      /\border\b/, /\borders\b/, /\bcustomer\b/, /\bcustomers\b/, /\bbooking\b/, /\bbookings\b/,
      /\bconsultation\b/, /\bconsultations\b/, /\blead\b/, /\bleads\b/, /\brevenue\b/, /\bsales\b/,
      /\bconversion\b/, /\bconversions\b/, /\bclose rate\b/, /\bresponse time\b/, /\bpipeline\b/,
      /\btraffic\b/, /\breviews\b/, /\brating\b/, /\broi\b/, /\bad spend\b/, /\bspend\b/,
      /\bexpense\b/, /\bexpenses\b/, /\bcost\b/, /\bcpl\b/, /\bcpa\b/, /\bcampaign efficiency\b/
    ]),
    goalTime: hasAny(m, [
      /\bnext week\b/, /\bnext month\b/, /\bthis month\b/, /\bthis quarter\b/, /\bnext quarter\b/,
      /\bin 30 days\b/, /\bin 60 days\b/, /\bthis year\b/, /\bnext year\b/, /\bby [a-z]+\b/
    ]),
    numericTarget: /\b\d+\b/.test(m),

    report: hasAny(m, [
      /\bweekly report\b/, /\bweekly marketing report\b/, /\breport for the week\b/, /\bmarketing report\b/, /\bperformance report\b/
    ]),
    summary: hasAny(m, [
      /\bwork summary\b/, /\bteam summary\b/, /\bstatus update\b/, /\bprogress update\b/, /what.{0,20}(done|working on)/
    ]),
    approval: hasAny(m, [
      /\bapproval\b/, /\bapprovals\b/, /\bapprove\b/, /\breject\b/, /\brequest changes\b/, /\brevise\b/, /\brevision\b/
    ]),
    taskStatus: hasAny(m, [
      /\bopen tasks\b/, /\btask list\b/, /\bblocked\b/, /\bwhat is the team working on\b/, /\bshow tasks\b/
    ]),
    social: hasAny(m, [
      /\bsocial\b/, /\binstagram\b/, /\bfacebook\b/, /\bgoogle review\b/, /\breputation\b/, /\breview response\b/, /\bhouzz\b/, /\bcaption\b/
    ]),
    lead: hasAny(m, [
      /\blead\b/, /\bleads\b/, /\binquiry\b/, /\binquiries\b/, /\bfollow.?up\b/, /\bquote request\b/, /\bnew contact\b/
    ]),
    content: hasAny(m, [
      /\bblog\b/, /\bcontent\b/, /\bseo\b/, /\blanding page\b/, /\bemail campaign\b/, /\bkeyword\b/, /\bcopy\b/, /\barticle\b/, /\bcase study\b/
    ]),
    reporting: hasAny(m, [
      /\banalytics\b/, /\bmetrics\b/, /\bdata\b/, /\bga4\b/, /\bgoogle ads\b/, /\bmeta ads\b/, /\bspend\b/, /\broi\b/, /\bperformance\b/
    ]),
    growthOps: hasAny(m, [
      /\bcrm\b/, /\bnurture\b/, /\bpipeline\b/, /\bconversion\b/, /\bwebsite\b/, /\bcta\b/, /\bcampaign\b/, /\bads\b/, /\bstalled\b/, /\bdeal\b/, /\bworkflow\b/
    ]),
    help: hasAny(m, [
      /\bhelp\b/, /\bwhat can\b/, /\bhow do\b/, /\bhow does\b/, /\btell me\b/, /\bexplain\b/, /\bclarif\b/, /\bunsure\b/, /\bnot sure\b/, /\bwhat is\b/, /\bwhat are\b/
    ]),
  };

  if ((signals.goalVerb && signals.goalMetric) || (signals.numericTarget && signals.goalMetric && signals.goalTime) || (signals.goalVerb && signals.goalTime && signals.goalMetric)) {
    return { intent: 'goal-planning', confidence: 'high' };
  }
  if (signals.report) return { intent: 'weekly-report', confidence: 'high' };
  if (signals.summary) return { intent: 'work-summary', confidence: 'high' };
  if (signals.approval) return { intent: 'clarification-approval', confidence: 'medium' };
  if (signals.taskStatus) return { intent: 'clarification-task-status', confidence: 'medium' };
  if (signals.social) return { intent: 'social-reputation', confidence: 'medium' };
  if (signals.lead) return { intent: 'lead-response', confidence: 'medium' };
  if (signals.content) return { intent: 'content-strategist', confidence: 'medium' };
  if (signals.reporting) return { intent: 'reporting', confidence: 'medium' };
  if (signals.growthOps) return { intent: 'growth-ops', confidence: 'medium' };
  if (signals.help) return { intent: 'clarification', confidence: 'medium' };

  return { intent: 'smart-fallback', confidence: 'low' };
}

function detectGoalFamily(message) {
  const m = message.toLowerCase();
  if (hasAny(m, [/\bad spend\b/, /\bexpenses?\b/, /\bcost\b/, /\bcpl\b/, /\bcpa\b/, /\bcampaign efficiency\b/, /\bminimize\b.*\bads?\b/, /\breduce\b.*\bads?\b/, /\blower\b.*\bspend\b/])) {
    return 'ad-efficiency';
  }
  if (hasAny(m, [/\border\b/, /\borders\b/, /\brevenue\b/, /\bsales\b/, /\bclose rate\b/])) {
    return 'growth-orders';
  }
  if (hasAny(m, [/\blead\b/, /\bleads\b/, /\btraffic\b/, /\binquiries\b/, /\bbookings\b/, /\bconsultations\b/])) {
    return 'lead-generation';
  }
  if (hasAny(m, [/\breviews\b/, /\brating\b/, /\breputation\b/, /\btrust\b/])) {
    return 'reputation';
  }
  if (hasAny(m, [/\bresponse time\b/, /\bfollow.?up\b/, /\bspeed\b/])) {
    return 'speed-to-lead';
  }
  return 'general-growth';
}

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

function adEfficiencyGoalResponse(userMessage) {
  const taskA = {
    id: nextId(),
    title: 'Ad Efficiency Workstream: Spend Audit',
    description: `Derived from business objective: "${userMessage}"\n\nGrowth Ops Agent will review campaign-level spend, lead output, and wasted budget.`,
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'ad-efficiency', 'growth-ops'],
    outputLabel: 'Ad Spend Audit',
    output: `Objective\n- Reduce ad spend without damaging lead quality unnecessarily\n\nAudit focus\n1. Compare top and worst campaigns\n2. Identify channels with weak CPL / CPA efficiency\n3. Flag spend that is producing low-quality or zero-conversion traffic\n\nPrimary review metrics\n- Ad spend\n- Leads from ads\n- CPL\n- Top / worst campaign\n- Conversion quality`,
  };

  const taskB = {
    id: nextId(),
    title: 'Ad Efficiency Workstream: Budget Reallocation Plan',
    description: `Derived from business objective: "${userMessage}"\n\nGrowth Ops Agent will recommend how to shift spend toward the highest-intent campaigns.`,
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'ad-efficiency', 'budget'],
    outputLabel: 'Budget Recommendation',
    output: `Recommended actions\n1. Reduce spend on the worst-performing Meta awareness campaign\n2. Protect or increase budget on high-intent Google search campaigns\n3. Refresh creative before scaling weaker channels\n4. Review CPL weekly before making larger reallocations\n\nSuccess criteria\n- Lower wasted spend\n- Better efficiency by channel\n- Clearer top / worst campaign separation`,
  };

  const taskC = {
    id: nextId(),
    title: 'Ad Efficiency Workstream: Weekly Paid Media Monitoring',
    description: `Derived from business objective: "${userMessage}"\n\nReporting Agent will track paid media efficiency and flag anomalies weekly.`,
    assignedTo: 'reporting',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'ad-efficiency', 'reporting'],
    outputLabel: 'Monitoring Plan',
    output: `Recommended weekly monitoring\n- Ad spend\n- Leads from ads\n- CPL\n- Top campaign\n- Worst campaign\n- AI recommendation update\n\nManagement rule\nIf CPL rises for two consecutive reviews without quality improvement, pause or revise the campaign.`,
  };

  const approvalItem = makeApproval(
    taskA,
    'Ad Efficiency Plan Approval',
    'AI Team Leader prepared a first-pass plan to reduce ad spend and improve paid media efficiency.',
    'growth-ops',
    'AI Team Leader + Growth Ops Agent',
    'high',
    'Campaign Brief'
  );

  taskA.generatedApproval = approvalItem;
  taskA.newApproval = approvalItem;

  return {
    intent: 'goal-planning',
    message: `Understood — I am treating this as an **ad efficiency goal**, not a generic growth ops request.\n\n**Objective received:** ${userMessage}\n\n### Recommended interpretation\nThe goal is to reduce advertising spend while protecting lead quality and avoiding wasted budget.\n\n### Focus metrics\n- Ad spend\n- Leads from ads\n- CPL\n- Top / worst campaign\n- Conversion quality\n\n### Proposed actions\n1. Audit current campaign spend and efficiency\n2. Reallocate budget toward higher-intent campaigns\n3. Reduce or refresh underperforming campaigns\n4. Add weekly paid media monitoring\n\n### What I did next\nI created **3 linked ad-efficiency workstreams** so the team can act on this objective in a structured way.\n\nOpen **Tasks** to review the workstreams and **Approvals** to approve the initial ad-efficiency plan.`,
    routedAgent: 'team-leader',
    newTask: taskA,
    extraTasks: [taskB, taskC],
    newApproval: approvalItem,
  };
}

function generalGrowthGoalResponse(userMessage) {
  const taskA = {
    id: nextId(),
    title: 'Growth Plan Workstream: Funnel & Conversion Diagnosis',
    description: `Derived from business objective: "${userMessage}"\n\nGrowth Ops Agent will diagnose the main funnel constraints preventing Okeanos from reaching the target.`,
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'growth-plan', 'conversion'],
    outputLabel: 'Growth Diagnosis',
    output: `Primary business objective\n- Increase business results using the current marketing team and channels\n\nLikely leverage points\n1. More qualified leads from high-intent channels\n2. Faster response for qualified leads\n3. Better follow-up conversion\n4. Stronger trust signals at the decision stage\n\nImmediate analysis focus\n- Lead volume gap\n- Consultation booking rate\n- Follow-up delay\n- Website conversion friction`,
  };

  const taskB = {
    id: nextId(),
    title: 'Growth Plan Workstream: Lead Response Acceleration',
    description: `Derived from business objective: "${userMessage}"\n\nLead Response Agent will prepare a tighter follow-up and prioritization plan.`,
    assignedTo: 'lead-response',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'lead-response', 'speed-to-lead'],
    outputLabel: 'Lead Response Plan',
    output: `Recommended response objective\n- Tighten response speed for qualified opportunities\n\nExecution focus\n1. Prioritize qualified inquiries first\n2. Use consultation-first CTA\n3. Standardize a short follow-up cadence\n4. Escalate stalled leads quickly`,
  };

  const taskC = {
    id: nextId(),
    title: 'Growth Plan Workstream: Trust & Demand Support',
    description: `Derived from business objective: "${userMessage}"\n\nContent Strategist and Social & Reputation functions should support conversion with trust-building assets and proof.`,
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'content', 'trust'],
    outputLabel: 'Demand Support Plan',
    output: `Recommended support assets\n1. One BOFU landing page or quote-focused page refresh\n2. One case study or proof asset\n3. Social proof visibility push\n4. Weekly KPI checkpoint`,
  };

  const approvalItem = makeApproval(
    taskA,
    'Growth Plan Approval — Strategic Objective',
    'AI Team Leader prepared a first-pass growth plan and decomposed the objective into executable workstreams.',
    'growth-ops',
    'AI Team Leader + Growth Ops Agent',
    'high',
    'Campaign Brief'
  );

  taskA.generatedApproval = approvalItem;
  taskA.newApproval = approvalItem;

  return {
    intent: 'goal-planning',
    message: `Understood — I am treating this as a **growth objective**, not a simple drafting request.\n\n**Objective received:** ${userMessage}\n\n### Recommended interpretation\nThis goal should be handled through three coordinated levers:\n1. **Funnel & conversion diagnosis**\n2. **Lead response acceleration**\n3. **Trust and demand support**\n\n### KPI focus\n- Qualified leads\n- Consultation bookings\n- Average response time\n- Quote-to-close rate\n\n### What I did next\nI created **3 linked workstream tasks** so the AI team can act on this objective instead of giving you a random draft.\n\nOpen **Tasks** to review the workstreams and **Approvals** to approve the initial growth plan direction.`,
    routedAgent: 'team-leader',
    newTask: taskA,
    extraTasks: [taskB, taskC],
    newApproval: approvalItem,
  };
}

function goalPlanningResponse(userMessage) {
  const family = detectGoalFamily(userMessage);
  if (family === 'ad-efficiency') return adEfficiencyGoalResponse(userMessage);
  return generalGrowthGoalResponse(userMessage);
}

function weeklyReportResponse() {
  return {
    intent: 'weekly-report',
    message: `Got it — generating this week's marketing report now.\n\n**Summary of Week (${today()}):**\n\n---\n\n**Weekly Marketing Report — Okeanos Pools GTA**\n\n**Website Traffic (GA4)**\n- Sessions: **1,842** ↑12% WoW\n- Unique users: **1,390** ↑14%\n- Goal completions (leads): **14** ↑27%\n\n**Lead Summary**\n- 14 new leads this week\n- Google Ads: 7 | Organic: 4 | Direct: 2 | Meta: 1\n- Avg. lead response time: **23 min** ✅ (target <30 min)\n\n**Recommended Actions:**\n1. Clear priority approvals\n2. Refresh paid creative\n3. Publish the next BOFU asset\n\nThe full formatted report is available in the **Reports** tab.`,
    routedAgent: null,
    newTask: null,
  };
}

function workSummaryResponse() {
  return {
    intent: 'work-summary',
    message: `Here's a summary of what the AI team has been working on:\n\n---\n\n**Completed This Week**\n- Weekly report drafting\n- Lead follow-up preparation\n- Conversion-focused copy support\n\n**In Progress**\n- Reporting updates\n- Growth ops reviews\n- Content pipeline work\n\n**Pending Attention**\n- Items waiting for approval\n- Queue prioritization\n- Goal-linked workstreams\n\nCheck the **Tasks** and **Approvals** tabs to review active items in detail.`,
    routedAgent: null,
    newTask: null,
  };
}

function socialReputationResponse(userMessage) {
  const taskTitle = userMessage.length > 60 ? userMessage.substring(0, 57) + '...' : userMessage;
  const draftOutput = `Recommended platform: Google / Instagram / Facebook (confirm as needed)\n\nDraft Option A\n"Thank you for the feedback. We take this seriously and have already reviewed the issue internally."\n\nDraft Option B\n"We appreciate the feedback and understand the concern. Okeanos is committed to clear communication and professional follow-through."\n\nHuman approval required before posting.`;
  const task = {
    id: nextId(), title: `Social/Reputation: ${taskTitle}`, description: `Request from Team Leader: "${userMessage}"\n\nThe Social & Reputation Agent prepared a first-pass draft for review.`, assignedTo: 'social-reputation', requestedBy: 'team-leader', priority: 'medium', status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['social', 'routed'], output: draftOutput, outputLabel: 'Draft Output',
  };
  const approvalItem = makeApproval(task, `Social Draft Approval — ${taskTitle}`, 'Social & Reputation Agent prepared a first-pass response draft for review.', 'social-reputation', 'Social & Reputation Agent', 'medium', 'Review Response');
  task.generatedApproval = approvalItem; task.newApproval = approvalItem;
  return { intent: 'social-reputation', message: `Routed to the **Social & Reputation Agent** and a first draft is ready for review.\n\nOpen **Tasks** to see the output or **Approvals** to review it formally.`, routedAgent: 'social-reputation', newTask: task, newApproval: approvalItem };
}

function leadResponseResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 55)}${userMessage.length > 55 ? '...' : ''}`;
  const draftOutput = `Subject Option A: Your Okeanos pool quote — next steps\nSubject Option B: Thanks for reaching out about your pool project\n\nEmail Draft\nHi there,\n\nThank you for reaching out to Okeanos. The next best step is a short consultation so we can confirm timeline, layout, and project goals.\n\nBest,\nOkeanos Pools GTA\n\nSMS Draft\nThanks for reaching out to Okeanos — would you prefer a quick call or site visit discussion?\n\nHuman approval required before sending.`;
  const task = {
    id: nextId(), title: `Lead Response: ${shortTitle}`, description: `Request from Team Leader: "${userMessage}"\n\nThe Lead Response Agent prepared an initial follow-up draft.`, assignedTo: 'lead-response', requestedBy: 'team-leader', priority: 'high', status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['leads', 'routed', 'urgent'], output: draftOutput, outputLabel: 'Draft Follow-up',
  };
  const approvalItem = makeApproval(task, `Lead Follow-up Approval — ${shortTitle}`, 'Lead Response Agent prepared email and SMS follow-up drafts for review.', 'lead-response', 'Lead Response Agent', 'high', 'Lead Follow-up');
  task.generatedApproval = approvalItem; task.newApproval = approvalItem;
  return { intent: 'lead-response', message: `Routed to the **Lead Response Agent** — high priority.\n\nA first-pass draft is ready and has been moved to **In Review**.`, routedAgent: 'lead-response', newTask: task, newApproval: approvalItem };
}

function contentStrategistResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 60)}${userMessage.length > 60 ? '...' : ''}`;
  const draftOutput = `Recommended primary angle\n- Engineer-led pool expertise for Ontario homeowners\n\nProposed outline\n1. Homeowner problem / goal\n2. Why fiberglass works in Ontario\n3. Okeanos differentiators\n4. Common objections and answers\n5. Clear CTA to consultation\n\nHuman approval required before publishing.`;
  const task = {
    id: nextId(), title: `Content: ${shortTitle}`, description: `Request from Team Leader: "${userMessage}"\n\nContent Strategist Agent prepared a first-pass brief for review.`, assignedTo: 'content-strategist', requestedBy: 'team-leader', priority: 'medium', status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['content', 'seo', 'routed'], output: draftOutput, outputLabel: 'Content Brief',
  };
  const approvalItem = makeApproval(task, `Content Brief Approval — ${shortTitle}`, 'Content Strategist Agent prepared a content brief for review.', 'content-strategist', 'Content Strategist Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approvalItem; task.newApproval = approvalItem;
  return { intent: 'content-strategist', message: `Routed to the **Content Strategist Agent**.\n\nA first-pass content brief has been generated and placed into review.`, routedAgent: 'content-strategist', newTask: task, newApproval: approvalItem };
}

function reportingResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 60)}${userMessage.length > 60 ? '...' : ''}`;
  const draftOutput = `Metrics snapshot\n- Website sessions: 1,842\n- New leads: 14\n- Avg. lead response time: 23 minutes\n\nTop observations\n- Organic traffic is trending up\n- Meta performance needs refresh\n- Lead response remains within target\n\nRecommended actions\n1. Clear approvals queue\n2. Refresh paid creative\n3. Publish the next high-intent content asset`;
  const task = {
    id: nextId(), title: `Analytics: ${shortTitle}`, description: `Request from Team Leader: "${userMessage}"\n\nReporting Agent prepared an initial analysis snapshot for review.`, assignedTo: 'reporting', requestedBy: 'team-leader', priority: 'medium', status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['reporting', 'analytics', 'routed'], output: draftOutput, outputLabel: 'Reporting Snapshot',
  };
  const approvalItem = makeApproval(task, `Reporting Snapshot Approval — ${shortTitle}`, 'Reporting Agent prepared a first-pass metrics summary and recommendations.', 'reporting', 'Reporting Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approvalItem; task.newApproval = approvalItem;
  return { intent: 'reporting', message: `Routed to the **Reporting Agent**.\n\nA first-pass reporting snapshot is ready for review.`, routedAgent: 'reporting', newTask: task, newApproval: approvalItem };
}

function growthOpsResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 55)}${userMessage.length > 55 ? '...' : ''}`;
  const draftOutput = `Initial diagnosis\n- Review CRM stage drop-off between inquiry and consultation\n- Check response-time gaps for qualified leads\n- Review landing page CTA clarity and form friction\n\nRecommended next actions\n1. Re-engage stalled leads\n2. Simplify the primary consultation CTA\n3. Align campaign messaging with landing page promise\n\nHuman review required before changing live workflows.`;
  const task = {
    id: nextId(), title: `Growth Ops: ${shortTitle}`, description: `Request from Team Leader: "${userMessage}"\n\nGrowth Ops Agent prepared an initial operating brief for review.`, assignedTo: 'growth-ops', requestedBy: 'team-leader', priority: 'medium', status: 'in-review', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['growth-ops', 'routed'], output: draftOutput, outputLabel: 'Growth Ops Brief',
  };
  const approvalItem = makeApproval(task, `Growth Ops Approval — ${shortTitle}`, 'Growth Ops Agent prepared an initial brief covering CRM, conversion, or campaign operations.', 'growth-ops', 'Growth Ops Agent', 'medium', 'Campaign Brief');
  task.generatedApproval = approvalItem; task.newApproval = approvalItem;
  return { intent: 'growth-ops', message: `Routed to the **Growth Ops Agent**.\n\nA first-pass operating brief has been generated and added to review.`, routedAgent: 'growth-ops', newTask: task, newApproval: approvalItem };
}

function clarificationResponse(userMessage) {
  return {
    intent: 'clarification',
    message: `I can help with five main request types. Based on your message — *"${userMessage}"* — do you want me to treat this as one of the following?\n\n1. **A growth goal**\n2. **A task request**\n3. **A report request**\n4. **An approval / revision request**\n5. **A workflow question**\n\nReply with the closest option or rephrase your request in one sentence.`,
    routedAgent: null,
    newTask: null,
  };
}

function taskStatusClarifier() {
  return {
    intent: 'clarification',
    message: `I can help with task visibility. Do you want one of these?\n\n1. **Open tasks**\n2. **Blocked tasks**\n3. **Tasks awaiting approval**\n4. **Tasks by agent**\n5. **A full work summary**\n\nReply with the closest option and I will route it correctly.`,
    routedAgent: null,
    newTask: null,
  };
}

function approvalClarifier() {
  return {
    intent: 'clarification',
    message: `I detected this as an approval or revision-related request. Do you want me to:\n\n1. **Show pending approvals**\n2. **Prepare an item for approval**\n3. **Request changes on a draft**\n4. **Explain the approval workflow**\n\nReply with the closest option and I will handle it in that mode.`,
    routedAgent: null,
    newTask: null,
  };
}

function smartFallbackResponse(userMessage) {
  return {
    intent: 'clarification',
    message: `I am not fully confident about the request type yet. To route this correctly, should I treat your message as:\n\n1. **A growth goal**\n2. **A task request**\n3. **A report request**\n4. **An approval / revision request**\n5. **A workflow question**\n\nOriginal message: *"${userMessage}"*\n\nReply with the closest option, or rewrite it in one sentence using one clear objective.`,
    routedAgent: null,
    newTask: null,
  };
}

function generalResponse(userMessage) {
  const m = userMessage.toLowerCase();
  const maybeGoal = (/\b(want|need|get|gain|add|increase|grow|improve|boost|reduce|minimize|cut|lower|hit|achieve)\b/.test(m) && /\b(order|orders|customer|customers|booking|bookings|consultation|consultations|lead|leads|revenue|sales|conversion|pipeline|traffic|reviews|rating|roi|ad spend|spend|expenses?|cost|cpl|cpa)\b/.test(m));
  if (maybeGoal) return goalPlanningResponse(userMessage);
  return smartFallbackResponse(userMessage);
}

export async function getTeamLeaderResponse(userMessage) {
  const backendResult = await tryBackendTeamLeader(userMessage);
  if (backendResult) return backendResult;

  const special = getSpecialResponse(userMessage);
  if (special) {
    const delay = 500 + Math.random() * 300;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return special;
  }

  const lower = userMessage.toLowerCase();
  const hardGoalFallback = /\b\d+\b/.test(lower) && /\b(next week|next month|this month|this quarter|next quarter|in 30 days|in 60 days)\b/.test(lower) && /\b(order|orders|customer|customers|booking|bookings|consultation|consultations|lead|leads|revenue|sales|conversion|pipeline|ad spend|spend|expenses?|cost|cpl|cpa)\b/.test(lower);
  const classified = hardGoalFallback ? { intent: 'goal-planning', confidence: 'high' } : classifyIntent(userMessage);

  const delay = 700 + Math.random() * 600;
  await new Promise((resolve) => setTimeout(resolve, delay));

  switch (classified.intent) {
    case 'goal-planning':
      return goalPlanningResponse(userMessage);
    case 'weekly-report':
      return weeklyReportResponse();
    case 'work-summary':
      return workSummaryResponse();
    case 'social-reputation':
      return socialReputationResponse(userMessage);
    case 'lead-response':
      return leadResponseResponse(userMessage);
    case 'content-strategist':
      return contentStrategistResponse(userMessage);
    case 'reporting':
      return reportingResponse(userMessage);
    case 'growth-ops':
      return growthOpsResponse(userMessage);
    case 'clarification-task-status':
      return taskStatusClarifier();
    case 'clarification-approval':
      return approvalClarifier();
    case 'clarification':
      return clarificationResponse(userMessage);
    case 'smart-fallback':
      return smartFallbackResponse(userMessage);
    default:
      return generalResponse(userMessage);
  }
}
