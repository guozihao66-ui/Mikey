// ── Team Leader AI Simulation Layer ──────────────────────────────────────────
// Detects intent from user messages and returns realistic, context-aware
// responses. All responses are mocked — no real AI calls.

import { nextId } from '../data/tasks.js';
import { tryBackendTeamLeader } from './teamLeaderLLM.js';

const today = () => {
  const d = new Date();
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ── Intent detection ──────────────────────────────────────────────────────────
function detectIntent(message) {
  const m = message.toLowerCase();

  const goalVerb = /\b(goal|target|objective|plan|strategy|roadmap|growth plan|increase|grow|improve|boost|reduce|decrease|hit|achieve|get|gain|add|raise|lift|want|need)\b/.test(m);
  const goalMetric = /\b(order|orders|customer|customers|booking|bookings|booked consultations|consultation|consultations|lead|leads|revenue|sales|conversion|conversions|close rate|response time|pipeline|traffic|reviews|rating|roi)\b/.test(m);
  const goalTime = /\b(next week|next month|this month|this quarter|next quarter|in 30 days|in 60 days|this year|next year|by [a-z]+)\b/.test(m);
  const numericTarget = /\b\d+\b/.test(m);

  if ((goalVerb && goalMetric) || (numericTarget && goalMetric && goalTime) || (goalVerb && goalTime && goalMetric)) {
    return 'goal-planning';
  }

  if (/\b(weekly report|weekly marketing report|this week.{0,20}report|report for the week)\b/.test(m)) {
    return 'weekly-report';
  }
  if (/\b(work summary|team summary|what.{0,20}(done|working on)|status update|progress update)\b/.test(m)) {
    return 'work-summary';
  }
  if (/\b(social|instagram|facebook|google review|reputation|review response|houzz|post caption|caption)\b/.test(m)) {
    return 'social-reputation';
  }
  if (/\b(lead|leads|inquiry|inquiries|follow.?up|follow up|quote request|response time|new contact)\b/.test(m)) {
    return 'lead-response';
  }
  if (/\b(blog|content|seo|landing page|email campaign|keyword|copy|article|write|case study)\b/.test(m)) {
    return 'content-strategist';
  }
  if (/\b(report|analytics|metrics|data|ga4|google ads|meta ads|spend|roi|performance)\b/.test(m)) {
    return 'reporting';
  }
  if (/\b(crm|nurture|pipeline|conversion|website|cta|campaign|ads|stalled|deal|workflow|approvals|approval)\b/.test(m)) {
    return 'growth-ops';
  }
  if (/\b(help|what can|how do|how does|tell me|explain|clarif|unsure|not sure|what is|what are)\b/.test(m)) {
    return 'clarification';
  }

  return 'general';
}

// ── Response generators ───────────────────────────────────────────────────────

function goalPlanningResponse(userMessage) {
  const taskA = {
    id: nextId(),
    title: 'Growth Plan Workstream: Funnel & Conversion Diagnosis',
    description: `Derived from business objective: "${userMessage}"\n\nGrowth Ops Agent will diagnose the main funnel constraints preventing Okeanos from reaching the target.` ,
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'growth-plan', 'conversion'],
    outputLabel: 'Growth Diagnosis',
    output: `Primary business objective\n- Increase orders next month using the current marketing team and channels\n\nLikely leverage points\n1. More qualified leads from high-intent channels\n2. Faster response for quote-ready leads\n3. Better follow-up conversion from inquiry to consultation\n4. Stronger trust signals at the decision stage\n\nImmediate analysis focus\n- Lead volume gap\n- Consultation booking rate\n- Follow-up delay\n- Website conversion friction`,
  };

  const taskB = {
    id: nextId(),
    title: 'Growth Plan Workstream: Lead Response Acceleration',
    description: `Derived from business objective: "${userMessage}"\n\nLead Response Agent will prepare a tighter follow-up and prioritization plan for quote-ready inquiries.`,
    assignedTo: 'lead-response',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['goal', 'lead-response', 'speed-to-lead'],
    outputLabel: 'Lead Response Plan',
    output: `Recommended response objective\n- Keep quote-ready response time below 15 minutes during business hours\n\nExecution focus\n1. Prioritize quote-ready inquiries first\n2. Use consultation-first CTA\n3. Standardize 24-hour follow-up cadence\n4. Escalate stalled leads after 48 hours\n\nSuccess metric\n- Improve inquiry-to-consultation conversion next month`,
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
    output: `Recommended support assets\n1. One BOFU landing page or quote-focused page refresh\n2. One case study or project proof asset\n3. Review-response and social proof visibility push\n4. Weekly KPI checkpoint to track progress toward the order goal\n\nRecommended KPI watchlist\n- New qualified leads\n- Consultation bookings\n- Quote-to-close rate\n- Pending approvals blocking execution`,
  };

  const approvalItem = {
    id: `ap-goal-${taskA.id}`,
    title: 'Growth Plan Approval — Monthly Order Target',
    description: 'AI Team Leader prepared a first-pass growth plan and decomposed the objective into executable workstreams.',
    agent: 'growth-ops',
    agentName: 'AI Team Leader + Growth Ops Agent',
    priority: 'high',
    type: 'Campaign Brief',
    createdAt: new Date().toISOString(),
    preview: `Proposed objective handling\n- Treat this as a business growth target, not a copywriting request\n\nRecommended workstreams\n1. Funnel & conversion diagnosis\n2. Lead response acceleration\n3. Trust and demand support\n\nSuggested KPI focus\n- Qualified leads\n- Consultation bookings\n- Response time\n- Close rate`,
    taskId: taskA.id,
  };

  taskA.generatedApproval = approvalItem;
  taskA.newApproval = approvalItem;

  return {
    intent: 'goal-planning',
    message: `Understood — I am treating this as a **growth objective**, not a simple drafting request.\n\n**Objective received:** ${userMessage}\n\n### Recommended interpretation
This goal should be handled through three coordinated levers:\n1. **Funnel & conversion diagnosis**\n2. **Lead response acceleration**\n3. **Trust and demand support**\n\n### Proposed plan
- Review current lead-to-order bottlenecks\n- Tighten response speed for quote-ready leads\n- Strengthen bottom-of-funnel trust assets and social proof\n- Track progress weekly using a KPI checkpoint\n\n### KPI focus
- Qualified leads\n- Consultation bookings\n- Average response time\n- Quote-to-close rate\n\n### What I did next
I created **3 linked workstream tasks** so the AI team can act on this objective instead of giving you a random draft.\n\nOpen **Tasks** to review the workstreams, and **Approvals** to approve the initial growth plan direction.`,
    routedAgent: 'team-leader',
    newTask: taskA,
    extraTasks: [taskB, taskC],
    newApproval: approvalItem,
  };
}

function weeklyReportResponse() {
  return {
    intent: 'weekly-report',
    message: `Got it — generating this week's marketing report now.

**Summary of Week (${today()}):**

---

**Weekly Marketing Report — Okeanos Pools GTA**

**Website Traffic (GA4)**
- Sessions: **1,842** ↑12% WoW
- Unique users: **1,390** ↑14%
- Goal completions (leads): **14** ↑27%

**Lead Summary**
- 14 new leads this week
- Google Ads: 7 | Organic: 4 | Direct: 2 | Meta: 1
- Avg. lead response time: **23 min** ✅ (target <30 min)

**Google Ads**
- 287 clicks | CTR 2.33% | CPC $4.82
- Cost/conversion: **$197** ↓26% WoW — bid strategy working

**Meta Ads**
- Reach 8,450 | 1 lead | CPL $38.20
- ⚠ Underperforming — creative test brief in Approvals queue

**Social & Reputation**
- Google rating: 4.7★ (47 reviews)
- 2 new 5-star reviews this week
- ⚠ 1-star review from J. Morrison — response options in Approvals

---

**Recommended Actions:**
1. Approve Google review response for J. Morrison (Approvals)
2. Approve Meta creative test brief (Approvals)
3. Publish fiberglass vs. concrete blog post by Mar 14

The full formatted report is available in the **Reports** tab. All actions require your approval before execution.`,
    routedAgent: null,
    newTask: null,
  };
}

function workSummaryResponse() {
  return {
    intent: 'work-summary',
    message: `Here's a summary of what the AI team has been working on:

---

**Completed This Week**
- **Weekly Report (Mar 3)** — Approved and filed. Flagged Meta underperformance.
- **Lead Follow-ups (Mar 5 batch)** — 7 personalized drafts delivered. Human team approved and sent.
- **Homepage CTA Variants** — 3 A/B test options drafted and handed off to dev.

**In Progress**
- **Blog post: Fiberglass vs. Concrete** — Content Strategist has first draft underway. On track for Mar 14.
- **CRM Pipeline Health Report** — Growth Ops compiling stalled deals and re-engagement drafts.
- **Weekly Report (Mar 9)** — Reporting Agent compiling now.

**Queued**
- Instagram caption series (5 posts)
- Scarborough geo landing page
- Google Ads spring creative refresh

---

**3 items waiting on your approval:**
1. Google review response for J. Morrison
2. Lead follow-up emails — March 9 batch
3. Meta Ads creative test brief

Check the **Approvals** tab to review and act on these. Want me to route any pending item to a specific agent?`,
    routedAgent: null,
    newTask: null,
  };
}

function socialReputationResponse(userMessage) {
  const taskTitle = userMessage.length > 60
    ? userMessage.substring(0, 57) + '...'
    : userMessage;

  const draftOutput = `Recommended platform: Google / Instagram / Facebook (confirm as needed)\n\nDraft Option A\n"Thank you for the feedback. We take this seriously and have already reviewed the issue internally. Our team has followed up directly to make sure the next step is clear and professionally handled."\n\nDraft Option B\n"We appreciate the feedback and understand the concern. Okeanos is committed to clear communication, quality delivery, and professional follow-through. We have already reached out directly to resolve this."\n\nSuggested internal note\n- Use Option A if the goal is de-escalation\n- Use Option B if the goal is stronger brand reassurance\n- Human approval required before posting`;

  const task = {
    id: nextId(),
    title: `Social/Reputation: ${taskTitle}`,
    description: `Request from Team Leader: "${userMessage}"\n\nThe Social & Reputation Agent has prepared an initial draft output for review. No content will be published without your approval.`,
    assignedTo: 'social-reputation',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['social', 'routed'],
    output: draftOutput,
    outputLabel: 'Draft Output',
  };

  const approvalItem = {
    id: `ap-${task.id}`,
    title: `Social Draft Approval — ${taskTitle}`,
    description: 'Social & Reputation Agent prepared a first-pass response draft for review.',
    agent: 'social-reputation',
    agentName: 'Social & Reputation Agent',
    priority: 'medium',
    type: 'Review Response',
    createdAt: new Date().toISOString(),
    preview: draftOutput,
    taskId: task.id,
  };

  task.generatedApproval = approvalItem;
  task.newApproval = approvalItem;

  return {
    intent: 'social-reputation',
    message: `Routed to the **Social & Reputation Agent** and a first draft is already ready for review.\n\n**Task created:** Social/Reputation — "${taskTitle}"\n\nWhat happened next:\n- A draft output was generated automatically\n- The task moved directly into **In Review**\n- An approval item was created for your sign-off\n\nOpen **Tasks** to see the full draft output, or go to **Approvals** to review it formally.`,
    routedAgent: 'social-reputation',
    newTask: task,
    newApproval: approvalItem,
  };
}

function leadResponseResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 55)}${userMessage.length > 55 ? '...' : ''}`;
  const draftOutput = `Subject Option A: Your Okeanos pool quote — next steps\nSubject Option B: Thanks for reaching out about your pool project\n\nEmail Draft\nHi there,\n\nThank you for reaching out to Okeanos. We would be happy to help you explore the right fiberglass pool option for your property and timeline. Based on your inquiry, the next best step is a short consultation so we can confirm layout, access, and project goals.\n\nIf it works for you, we can arrange a call or site visit and walk you through the process, timing, and next steps.\n\nBest,\nOkeanos Pools GTA\n\nSMS Draft\nThanks for reaching out to Okeanos — we received your inquiry and can help with the next step. Would you prefer a quick call or site visit discussion?\n\nRecommended CTA\n- Book consultation within 24 hours\n- Human approval required before sending`;

  const task = {
    id: nextId(),
    title: `Lead Response: ${shortTitle}`,
    description: `Request from Team Leader: "${userMessage}"\n\nThe Lead Response Agent has prepared an initial follow-up draft. All messages require your approval before sending.`,
    assignedTo: 'lead-response',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['leads', 'routed', 'urgent'],
    output: draftOutput,
    outputLabel: 'Draft Follow-up',
  };

  const approvalItem = {
    id: `ap-${task.id}`,
    title: `Lead Follow-up Approval — ${shortTitle}`,
    description: 'Lead Response Agent prepared email and SMS follow-up drafts for review.',
    agent: 'lead-response',
    agentName: 'Lead Response Agent',
    priority: 'high',
    type: 'Lead Follow-up',
    createdAt: new Date().toISOString(),
    preview: draftOutput,
    taskId: task.id,
  };

  task.generatedApproval = approvalItem;
  task.newApproval = approvalItem;

  return {
    intent: 'lead-response',
    message: `Routed to the **Lead Response Agent** — high priority.\n\n**Task created:** Lead Response — "${userMessage.substring(0, 60)}"\n\nA first-pass output is already ready:\n- subject line options\n- email draft\n- SMS draft\n- recommended CTA\n\nThe task is now in **In Review** and a matching approval item has been created. Open **Tasks** to read the draft or **Approvals** to review it formally.`,
    routedAgent: 'lead-response',
    newTask: task,
    newApproval: approvalItem,
  };
}

function contentStrategistResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 60)}${userMessage.length > 60 ? '...' : ''}`;
  const draftOutput = `Recommended primary angle\n- Engineer-led pool expertise for Ontario homeowners\n\nProposed outline\n1. Homeowner problem / goal\n2. Why fiberglass works in Ontario\n3. Okeanos differentiators\n4. Common objections and answers\n5. Clear CTA to consultation\n\nSuggested CTA\nBook a consultation to review your yard, timeline, and project goals.\n\nNotes\n- Keep tone practical, credible, and professional\n- Use Ontario-local trust framing\n- Human approval required before publishing`;

  const task = {
    id: nextId(),
    title: `Content: ${shortTitle}`,
    description: `Request from Team Leader: "${userMessage}"\n\nContent Strategist Agent has prepared a first-pass brief/output for your review.`,
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['content', 'seo', 'routed'],
    output: draftOutput,
    outputLabel: 'Content Brief',
  };

  const approvalItem = {
    id: `ap-${task.id}`,
    title: `Content Brief Approval — ${shortTitle}`,
    description: 'Content Strategist Agent prepared a content brief and draft direction for review.',
    agent: 'content-strategist',
    agentName: 'Content Strategist Agent',
    priority: 'medium',
    type: 'Campaign Brief',
    createdAt: new Date().toISOString(),
    preview: draftOutput,
    taskId: task.id,
  };

  task.generatedApproval = approvalItem;
  task.newApproval = approvalItem;

  return {
    intent: 'content-strategist',
    message: `Routed to the **Content Strategist Agent**.\n\n**Task created:** Content — "${userMessage.substring(0, 60)}"\n\nA first-pass content brief has already been generated and placed into review. Open **Tasks** to see the output or **Approvals** to approve the direction before the team develops the full asset.`,
    routedAgent: 'content-strategist',
    newTask: task,
    newApproval: approvalItem,
  };
}

function reportingResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 60)}${userMessage.length > 60 ? '...' : ''}`;
  const draftOutput = `Metrics snapshot\n- Website sessions: 1,842\n- New leads: 14\n- Avg. lead response time: 23 minutes\n- Google rating: 4.7★\n\nTop observations\n- Organic traffic is trending up week over week\n- Meta performance needs creative refresh\n- Lead response remains within target\n\nRecommended actions\n1. Clear approvals queue\n2. Refresh paid creative\n3. Publish the next high-intent content asset`;

  const task = {
    id: nextId(),
    title: `Analytics: ${shortTitle}`,
    description: `Request from Team Leader: "${userMessage}"\n\nReporting Agent prepared an initial analysis snapshot for review.`,
    assignedTo: 'reporting',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['reporting', 'analytics', 'routed'],
    output: draftOutput,
    outputLabel: 'Reporting Snapshot',
  };

  const approvalItem = {
    id: `ap-${task.id}`,
    title: `Reporting Snapshot Approval — ${shortTitle}`,
    description: 'Reporting Agent prepared a first-pass metrics summary and recommendations.',
    agent: 'reporting',
    agentName: 'Reporting Agent',
    priority: 'medium',
    type: 'Campaign Brief',
    createdAt: new Date().toISOString(),
    preview: draftOutput,
    taskId: task.id,
  };

  task.generatedApproval = approvalItem;
  task.newApproval = approvalItem;

  return {
    intent: 'reporting',
    message: `Routed to the **Reporting Agent**.\n\n**Task created:** Analytics — "${userMessage.substring(0, 60)}"\n\nA first-pass reporting snapshot is already ready for review. The task has been moved to **In Review**, and an approval item has been created so you can confirm the direction before sharing it more broadly.`,
    routedAgent: 'reporting',
    newTask: task,
    newApproval: approvalItem,
  };
}

function growthOpsResponse(userMessage) {
  const shortTitle = `${userMessage.substring(0, 55)}${userMessage.length > 55 ? '...' : ''}`;
  const draftOutput = `Initial diagnosis\n- Review CRM stage drop-off between inquiry and consultation\n- Check response-time gaps for quote-ready leads\n- Review landing page CTA clarity and form friction\n\nRecommended next actions\n1. Re-engage stalled leads older than 14 days\n2. Simplify the primary consultation CTA\n3. Align campaign messaging with landing page promise\n\nApproval checkpoint\nHuman review required before changing live campaign or CRM workflows.`;

  const task = {
    id: nextId(),
    title: `Growth Ops: ${shortTitle}`,
    description: `Request from Team Leader: "${userMessage}"\n\nGrowth Ops Agent prepared an initial operating brief for review.`,
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['growth-ops', 'routed'],
    output: draftOutput,
    outputLabel: 'Growth Ops Brief',
  };

  const approvalItem = {
    id: `ap-${task.id}`,
    title: `Growth Ops Approval — ${shortTitle}`,
    description: 'Growth Ops Agent prepared an initial brief covering CRM, conversion, or campaign operations.',
    agent: 'growth-ops',
    agentName: 'Growth Ops Agent',
    priority: 'medium',
    type: 'Campaign Brief',
    createdAt: new Date().toISOString(),
    preview: draftOutput,
    taskId: task.id,
  };

  task.generatedApproval = approvalItem;
  task.newApproval = approvalItem;

  return {
    intent: 'growth-ops',
    message: `Routed to the **Growth Ops Agent**.\n\n**Task created:** Growth Ops — "${userMessage.substring(0, 60)}"\n\nA first-pass operating brief has been generated already. The item is now in **In Review**, and a corresponding approval item has been added so you can validate the direction before execution.`,
    routedAgent: 'growth-ops',
    newTask: task,
    newApproval: approvalItem,
  };
}

function clarificationResponse(userMessage) {
  return {
    intent: 'clarification',
    message: `Happy to help clarify. Let me make sure I understand what you're looking for.

Based on your message: *"${userMessage}"*

Here are a few ways I can assist:

1. **Route a task** — Assign this to the right specialist agent with a clear brief.
2. **Generate a draft** — If you need copy, a report, or a work summary, I can produce a draft now.
3. **Explain a process** — Walk you through how the AI team handles a specific workflow.

**To get the best result, try telling me:**
- What you need produced (e.g., a blog post, a review response, a lead follow-up)
- Any specifics (platform, audience, deadline, tone)
- Whether this is urgent

Or try one of these quick prompts:
- *"Generate this week's weekly report"*
- *"Route a social media task for Instagram captions"*
- *"Draft a follow-up for a new lead who submitted a quote request"*
- *"Give me a work summary"*
- *"Check the CRM pipeline status"*

What would you like to do?`,
    routedAgent: null,
    newTask: null,
  };
}

function generalResponse(userMessage) {
  const m = userMessage.toLowerCase();
  const maybeGoal = (/\b(want|need|get|gain|add|increase|grow|improve|boost|reduce|hit|achieve)\b/.test(m) && /\b(order|orders|customer|customers|booking|bookings|consultation|consultations|lead|leads|revenue|sales|conversion|pipeline|traffic|reviews|rating|roi)\b/.test(m));
  if (maybeGoal) {
    return goalPlanningResponse(userMessage);
  }

  const responses = [
    `Understood. I'll add this to the queue and assign it to the appropriate agent.

Based on your request, this looks like it fits under one of these areas:
- **Content** → Content Strategist Agent
- **Social / Reputation** → Social & Reputation Agent
- **Leads** → Lead Response Agent
- **Analytics** → Reporting Agent
- **CRM / Campaigns / Conversion** → Growth Ops Agent

The Okeanos team works on an **AI drafts, humans approve** model — nothing goes out without your sign-off. Want me to route this to a specific agent, or should I decide based on the brief?`,

    `Got it. A few quick questions to make sure I route this correctly:

1. **Which channel?** (website, Google, Instagram, Facebook, email, CRM, other)
2. **What's the deadline?** (today, this week, flexible)
3. **Who's the audience?** (new homeowners, existing customers, local community)

Once I have that context, I can give this a proper brief and route it to the right agent. The task will appear in **Tasks** as pending in the meantime.`,

    `Noted. I'll treat this as a general marketing request and log it in the team queue.

Here's what the AI team can do with this:
- **Content Strategist** → copy, blog, landing pages, email, case studies
- **Social & Reputation** → social captions, review management, brand monitoring
- **Lead Response** → follow-up sequences, inquiry handling
- **Reporting** → performance analysis, campaign ROI
- **Growth Ops** → CRM nurture, conversion optimization, campaign coordination

Want me to route this now, or refine the brief first?`,
  ];

  return {
    intent: 'general',
    message: responses[Math.floor(Math.random() * responses.length)],
    routedAgent: null,
    newTask: null,
  };
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Simulate a Team Leader AI response.
 * Returns a promise to allow the calling component to show a loading state.
 * @param {string} userMessage
 * @returns {Promise<{intent, message, routedAgent, newTask}>}
 */
export async function getTeamLeaderResponse(userMessage) {
  const backendResult = await tryBackendTeamLeader(userMessage);
  if (backendResult) return backendResult;

  const lower = userMessage.toLowerCase();
  const hardGoalFallback = /\b\d+\b/.test(lower) && /\b(next week|next month|this month|this quarter|next quarter|in 30 days|in 60 days)\b/.test(lower) && /\b(order|orders|customer|customers|booking|bookings|consultation|consultations|lead|leads|revenue|sales|conversion|pipeline)\b/.test(lower);
  const intent = hardGoalFallback ? 'goal-planning' : detectIntent(userMessage);

  // Simulate network / AI processing latency
  const delay = 900 + Math.random() * 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  switch (intent) {
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
    case 'clarification':
      return clarificationResponse(userMessage);
    default:
      return generalResponse(userMessage);
  }
}
