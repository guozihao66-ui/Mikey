// ── Team Leader AI Simulation Layer ──────────────────────────────────────────
// Detects intent from user messages and returns realistic, context-aware
// responses. All responses are mocked — no real AI calls.

import { nextId } from '../data/tasks.js';

const today = () => {
  const d = new Date();
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ── Intent detection ──────────────────────────────────────────────────────────
function detectIntent(message) {
  const m = message.toLowerCase();

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

  const task = {
    id: nextId(),
    title: `Social/Reputation: ${taskTitle}`,
    description: `Request from Team Leader: "${userMessage}"\n\nThe Social & Reputation Agent will draft content for your review. No content will be published without your approval.`,
    assignedTo: 'social-reputation',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['social', 'routed'],
  };

  return {
    intent: 'social-reputation',
    message: `Routing this to the **Social & Reputation Agent** now.

**Task created:** Social/Reputation — "${taskTitle}"

The agent will:
- Analyze the request against Okeanos brand voice (credible, warm, Ontario-local)
- Draft content options for your review
- Flag any reputation risks before recommending action

**Reminder:** No post, caption, or review response goes live without your approval. The draft will appear in the **Tasks** panel and any approval-required items will surface in **Approvals**.

Is there a specific platform or tone you'd like the agent to prioritize?`,
    routedAgent: 'social-reputation',
    newTask: task,
  };
}

function leadResponseResponse(userMessage) {
  const task = {
    id: nextId(),
    title: `Lead Response: ${userMessage.substring(0, 55)}${userMessage.length > 55 ? '...' : ''}`,
    description: `Request from Team Leader: "${userMessage}"\n\nThe Lead Response Agent will prepare follow-up drafts. All messages require your approval before sending.`,
    assignedTo: 'lead-response',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['leads', 'routed', 'urgent'],
  };

  return {
    intent: 'lead-response',
    message: `Routing to the **Lead Response Agent** — high priority.

**Task created:** Lead Response — "${userMessage.substring(0, 60)}"

The agent will:
- Prepare a personalized follow-up draft (email + SMS option)
- Qualify the lead based on available info
- Keep response time under our 30-minute target

**Draft format you'll receive:**
- Subject line options (A/B)
- Email body (personalized, ~150 words)
- SMS follow-up (under 160 chars)
- Suggested next step / CTA

The draft will appear in the **Tasks** panel and in **Approvals** once ready. Want me to flag this as urgent so it gets prioritized ahead of the queue?`,
    routedAgent: 'lead-response',
    newTask: task,
  };
}

function contentStrategistResponse(userMessage) {
  const task = {
    id: nextId(),
    title: `Content: ${userMessage.substring(0, 60)}${userMessage.length > 60 ? '...' : ''}`,
    description: `Request from Team Leader: "${userMessage}"\n\nContent Strategist Agent will draft a content plan or copy for your review.`,
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['content', 'seo', 'routed'],
  };

  return {
    intent: 'content-strategist',
    message: `Routing to the **Content Strategist Agent**.

**Task created:** Content — "${userMessage.substring(0, 60)}"

The agent will:
- Identify the primary keyword target and search intent
- Outline structure (headers, word count, CTA placement)
- Draft copy aligned with Okeanos brand voice: knowledgeable, trustworthy, Ontario-local
- Suggest internal links to product and gallery pages

**Note on SEO:** All content is written to rank for Ontario fiberglass pool searches. The agent avoids keyword stuffing and focuses on genuine homeowner value.

Draft brief and outline will appear in **Tasks** for your review. Nothing gets published without sign-off.`,
    routedAgent: 'content-strategist',
    newTask: task,
  };
}

function reportingResponse(userMessage) {
  const task = {
    id: nextId(),
    title: `Analytics: ${userMessage.substring(0, 60)}${userMessage.length > 60 ? '...' : ''}`,
    description: `Request from Team Leader: "${userMessage}"\n\nReporting Agent will compile the requested metrics and analysis.`,
    assignedTo: 'reporting',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['reporting', 'analytics', 'routed'],
  };

  return {
    intent: 'reporting',
    message: `Routing to the **Reporting Agent**.

**Task created:** Analytics — "${userMessage.substring(0, 60)}"

The agent will pull from:
- **GA4** — traffic, sessions, goal completions
- **Google Ads** — impressions, clicks, CPC, conversions
- **Meta Ads** — reach, CPL, ROAS
- **CRM data** — lead counts, source attribution

**Output format:** Clean table + narrative summary with recommended actions. Formatted for easy sharing with your team or clients.

The report will be added to the **Reports** tab once compiled. Do you need a specific date range, or should I default to the most recent full week?`,
    routedAgent: 'reporting',
    newTask: task,
  };
}

function growthOpsResponse(userMessage) {
  const task = {
    id: nextId(),
    title: `Growth Ops: ${userMessage.substring(0, 55)}${userMessage.length > 55 ? '...' : ''}`,
    description: `Request from Team Leader: "${userMessage}"\n\nGrowth Ops Agent will handle this request — covering CRM, conversion, campaign ops, or workflow coordination.`,
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['growth-ops', 'routed'],
  };

  return {
    intent: 'growth-ops',
    message: `Routing to the **Growth Ops Agent**.

**Task created:** Growth Ops — "${userMessage.substring(0, 60)}"

Growth Ops handles the operational layer connecting marketing to pipeline:
- **CRM & Nurture** — pipeline health, stalled-deal alerts, drip sequences
- **Website Conversion** — CTA briefs, form optimization, landing page CRO
- **Campaign Operations** — Google/Meta ad coordination, creative briefs
- **Workflow & Approvals** — routing outputs through the right review steps

The agent will assess the request and prepare a brief or draft for your review. You'll see the output in **Tasks** and, if approval is needed, it will surface in **Approvals**.

Any specific deadline or context to attach to this task?`,
    routedAgent: 'growth-ops',
    newTask: task,
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
  const intent = detectIntent(userMessage);

  // Simulate network / AI processing latency
  const delay = 900 + Math.random() * 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  switch (intent) {
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
