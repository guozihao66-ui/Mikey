import { readStore, writeStore, touchActivity } from './store.mjs'
import { callTeamLeaderLLM, llmAvailable } from './llm.mjs'

function getSpecialResponse(message) {
  const m = message.toLowerCase()

  if ((/cost per lead|cpl/.test(m) && /25%|twenty-five percent/.test(m)) || (/reduce/.test(m) && /cost per lead|cpl/.test(m))) {
    return {
      intent: 'reporting',
      reply: `**Key takeaway:** the clearest path to a 25% CPL reduction is not broad cost-cutting. It is a combination of **reducing low-intent paid social waste, protecting high-intent search, and improving landing-page conversion before scaling spend**.

## 1) Target
Using the current prototype CPL of **$38.20**, a 25% reduction implies a target of roughly **$28.65 per lead**.

## 2) Biggest opportunities
### A. Cut low-efficiency spend first
The weakest candidate in the current mix is **Meta Awareness — Spring Visual Teaser**.
- It appears better suited to reach than direct-response lead generation
- If the goal is lower CPL, this is the first budget line I would reduce or repurpose

### B. Protect the highest-intent search campaigns
The most efficient leads are still most likely coming from **Google Search campaigns tied to quote and installation intent**.
- Terms around fiberglass pool quotes, installation, pricing, and consultation intent should be protected
- Budget should move away from broad awareness and toward bottom-funnel demand capture

### C. Improve conversion rate before adding more traffic
If the traffic is decent but the page is leaking intent, CPL stays elevated.
Key fixes:
- Match ad promise to landing-page headline
- Simplify the consultation form
- Move Ontario trust signals, financing language, and project timeline clarity above the fold

### D. Tighten audience quality
Not every lead is equally valuable.
- Exclude low-intent placements and broad audiences that generate cheap but weak inquiries
- Prioritize GTA homeowners with stronger renovation or premium-home signals

### E. Refresh creative instead of forcing spend
Before increasing budget, refresh the creative mix:
- before/after project proof
- stronger consultation CTA
- clearer value framing around low maintenance, speed, and quality

## 3) Recommended action plan
### Next 30 days
1. **Trim underperforming awareness spend**
2. **Reallocate budget into high-intent Google Search campaigns**
3. **Test two landing-page variants focused on consultation conversion**
4. **Review results using both CPL and lead quality**

## 4) KPI guardrails
I would not optimize to CPL alone. I would track:
- CPL
- qualified lead rate
- consultation booking rate
- quote-ready lead volume

## 5) Recommendation
If Okeanos needs a fast path to a 25% CPL reduction, the highest-probability moves are:
1. reduce weak Meta awareness spend
2. concentrate budget in quote-intent search campaigns
3. improve landing-page conversion before scaling traffic further

That combination is much more credible than simply cutting spend across the board.`,
    }
  }

  if ((/ppc/.test(m) || /google ads|meta ads|paid search|paid media/.test(m)) && /benchmark|benchmarks/.test(m)) {
    return {
      intent: 'reporting',
      reply: `**Bottom line:** based on the current prototype campaign mix, the **Google Search campaigns are the most likely outperformers**, while the **Meta awareness campaign is the clearest likely underperformer** against pool-industry direct-response benchmarks.

## 1) Benchmark lens
For a high-ticket, seasonal home-service category like fiberglass pools, the usual benchmark pattern is:
- **high-intent search** drives the strongest lead quality
- **local non-brand search** performs better than broad paid social on conversion efficiency
- **awareness campaigns** can support demand creation, but usually look weak on last-click CPL and consultation intent

So I would evaluate Okeanos less like an ecommerce account and more like a premium home-improvement lead-gen account.

## 2) Likely outperformers
### Google Search — Fiberglass Pool Quotes
This is the strongest candidate to outperform.
Why:
- it captures explicit quote intent
- it is closest to the decision stage
- it is the most likely to generate consultation-ready traffic

### Google Search — Pool Installation GTA
This is likely the second-strongest performer.
Why:
- strong local intent
- relevant to buyers already comparing options
- usually more efficient than social if keyword quality is managed well

## 3) Likely middle performer
### Meta Lead Form — Backyard Renovation
I would classify this as **mixed / watch closely**.
- it may help with volume
- but lead quality is usually less predictable than search
- it should be validated on booked consultations, not just form fills

## 4) Likely underperformer
### Meta Awareness — Spring Visual Teaser
This is the most likely underperformer against direct-response benchmarks.
Why:
- awareness campaigns are rarely the most efficient source of qualified leads in this category
- it is better suited to reach and assisted influence than to bottom-funnel conversion
- if budget has to move, this is the first place I would review

## 5) Recommendation
If I were presenting this to leadership, I would summarize it this way:
- **Likely outperforming:** Fiberglass Pool Quotes, Pool Installation GTA
- **Needs quality validation:** Backyard Renovation lead form campaign
- **Most likely below benchmark:** Spring Visual Teaser awareness campaign

The key message is that Okeanos should continue to treat **search as the core demand-capture engine** and use **paid social more selectively for support, remarketing, and creative testing**.`,
    }
  }

  if ((/under-targeted|underserved/.test(m) && /segment/.test(m) && /ontario/.test(m)) || (/fiberglass pool customer segment/.test(m) && /ontario/.test(m)) || (/identify/.test(m) && /campaign to reach/.test(m) && /ontario/.test(m) && /fiberglass/.test(m))) {
    return {
      intent: 'growth-ops',
      reply: `# Under-Targeted Customer Segment Opportunity

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
    }
  }

  if ((/social media strategy/.test(m) || /instagram|tiktok/.test(m)) && /trend|trends|workflow/.test(m)) {
    return {
      intent: 'social-reputation',
      reply: `The most useful Instagram / TikTok trends for a pool company are the ones that combine **visual proof, practical education, and a clear conversion path**. For Okeanos, I would focus on trends that make the company look credible, local, and easy to trust.

## Trends Okeanos could leverage
### 1. Before-and-after transformation reels
These work well because the value is obvious in the first two seconds.
Best use:
- dramatic backyard transformation
- overlay with timeline, budget context, or homeowner goal

### 2. Process transparency content
Short clips showing excavation, shell install, finishing, or reveal moments perform well because they reduce uncertainty.
Best use:
- "what the install process actually looks like"
- "what happens in week 1 / week 2"

### 3. Educational expert clips
Short talking-head videos perform well when they answer real buyer questions.
Best use:
- fiberglass vs concrete
- what affects pool cost
- what Ontario homeowners should expect before starting

### 4. Local proof and neighborhood relevance
Content tied to places like Oakville, Burlington, Vaughan, or Mississauga makes the brand feel real and nearby.
Best use:
- project spotlights
- local homeowner use cases
- location-specific captions and hooks

### 5. Story-led social proof
Instead of generic testimonials, use short story formats:
- what the homeowner wanted
- what problem they had
- what changed after the project

## Recommended weekly content workflow
### Monday — Strategy and sourcing
- choose the week’s 3 themes
- define one primary CTA
- collect project footage, photos, and customer proof

### Tuesday — Production day
- film 2 short expert clips
- edit 1 transformation reel
- prepare 1 story Q&A or poll sequence

### Wednesday — Publish proof content
Post a transformation or reveal reel.
**CTA:** book a consultation or request planning guidance

### Thursday — Publish education content
Post a practical answer to a high-intent buyer question.
**CTA:** visit consultation page or send a DM

### Friday — Publish trust/process content
Post craftsmanship, install progress, or customer story content.
**CTA:** ask about project timing or next available install window

### Daily stories
Use stories for:
- progress updates
- FAQs
- polls
- quick myth-busting
- DM prompts

## Best content mix
- **40% visual proof**
- **30% education**
- **20% process / behind the scenes**
- **10% direct CTA content**

## Recommendation
The goal should not be "go viral." The goal should be to build a repeatable content engine that turns attention into consultation intent. The strongest version of this strategy is one where every week includes:
- one proof asset
- one education asset
- one trust-building asset
- one clear next step toward a consultation.`,
    }
  }

  if ((/executive report/.test(m) || /monthly executive marketing report/.test(m)) && /monthly|month/.test(m)) {
    return {
      intent: 'reporting',
      reply: `# Monthly Executive Marketing Report

## Executive Summary
This month, Okeanos maintained healthy lead flow, with **Google Search continuing to act as the strongest demand-capture channel**. Paid social contributed useful reach and creative testing value, but appears less efficient as a direct-response acquisition engine. Lead response speed remained within target, while the largest near-term opportunity is improving paid efficiency through budget reallocation and conversion-focused landing-page improvements.

## Channel Performance
### Google Search
Google Search remains the strongest-performing channel from an intent perspective.
- highest likelihood of qualified consultation traffic
- strongest fit for quote and installation demand
- should remain the priority channel for protected or expanded spend

### Paid Social
Paid social remains useful, but should be treated selectively.
- strongest role: awareness, remarketing, and creative testing
- weaker role: primary source of efficient bottom-funnel leads
- key risk: spend drifting into low-intent traffic or low-quality form volume

### Organic / Content
Organic and educational content continue to play a trust-building role.
- supports comparison-stage buyers
- improves brand credibility
- can reduce long-term dependence on paid acquisition if BOFU content expands

### Lead Response / Conversion
Lead response speed remains operationally healthy.
- current response performance is within target
- larger opportunity is improving consultation-booked rate and lead quality conversion

## Leadership Takeaways
1. **Search is still the most dependable direct-response channel**
2. **Paid social is more valuable as a supporting channel than as the core efficiency engine**
3. **Conversion improvements can unlock better performance without relying only on more traffic**

## Top Three Actions for Next Month
1. **Reallocate more budget toward the highest-intent Google Search campaigns**
2. **Refresh paid social creative and tighten audience targeting before further spend expansion**
3. **Improve the consultation landing-page experience with stronger proof, clearer messaging, and fewer conversion friction points**

## Recommended KPI Focus for Next Month
- total leads
- qualified leads
- cost per lead
- consultation booking rate
- average response time
- channel-level conversion efficiency

## Final Assessment
The business is in a solid position, but the next step is not simply generating more activity. It is improving **efficiency and conversion quality**, especially across paid media and consultation-focused landing experiences.`,
    }
  }

  return null
}

function detectIntent(message) {
  const m = message.toLowerCase()
  if (/weekly report|weekly marketing report|report for the week/.test(m)) return 'weekly-report'
  if (/work summary|status update|progress update|what has the team been working on/.test(m)) return 'work-summary'
  if (/pending approvals|what needs approval|approval/.test(m)) return 'approvals'
  if (/open tasks|task list|what is the team working on|blocked/.test(m)) return 'tasks'
  if (/google review|review response|instagram|facebook|reputation|caption|social/.test(m)) return 'social-reputation'
  if (/lead|follow-up|follow up|quote request|new inquiry|new lead/.test(m)) return 'lead-response'
  if (/crm|pipeline|conversion|campaign|website|cta/.test(m)) return 'growth-ops'
  return 'general'
}

function createTask(store, assignedTo, title, description, priority = 'medium', tags = [], extra = {}) {
  const task = {
    id: store.nextTaskId++,
    title,
    description,
    assignedTo,
    requestedBy: 'whatsapp-team-leader',
    priority,
    status: extra.output ? 'in-review' : 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags,
    ...extra,
  }
  store.tasks.unshift(task)
  return task
}

function createApproval(store, base, taskId) {
  const approval = {
    id: `ap-${taskId}`,
    title: base.title,
    description: base.description,
    agent: base.agent,
    agentName: base.agentName,
    priority: base.priority || 'medium',
    type: base.type || 'Campaign Brief',
    createdAt: new Date().toISOString(),
    preview: base.preview || '',
    taskId,
  }
  store.approvals.unshift(approval)
  return approval
}

function createReport(store, type, title, generatedBy, content) {
  const report = {
    id: `generated-${store.nextReportId++}`,
    type,
    title,
    generatedAt: new Date().toISOString(),
    generatedBy,
    status: 'draft',
    content,
  }
  store.reports.unshift(report)
  return report
}

async function tryLLMPath(store, message, channel) {
  if (!llmAvailable()) return null

  const parsed = await callTeamLeaderLLM(message)
  const intent = parsed.intent || 'general'
  const reply = parsed.message || 'No response returned.'
  const tasks = []
  let firstTask = null
  let createdApproval = null

  for (const plan of parsed.taskPlan || []) {
    const task = createTask(
      store,
      plan.assignedTo || 'growth-ops',
      plan.title || 'Generated Task',
      plan.description || `Requested from ${channel}: ${message}`,
      plan.priority || 'medium',
      ['llm', intent],
      {
        outputLabel: plan.outputLabel || 'Draft Output',
        output: plan.output || '',
      },
    )
    if (!firstTask) firstTask = task
    tasks.push(task)
  }

  if (parsed.approval && firstTask) {
    createdApproval = createApproval(store, {
      ...parsed.approval,
      preview: parsed.approval.preview || firstTask.output || '',
    }, firstTask.id)
    firstTask.generatedApproval = createdApproval
    firstTask.newApproval = createdApproval
  }

  touchActivity(store, {
    channel,
    message,
    intent,
    createdTaskId: firstTask?.id ?? null,
    createdReportId: null,
    mode: 'llm',
  })
  writeStore(store)

  return {
    intent,
    reply,
    createdTask: firstTask,
    extraTasks: tasks.slice(1),
    createdApproval,
    mode: 'llm',
  }
}

export async function handleTeamLeaderMessage(message, channel = 'whatsapp') {
  const store = readStore()

  const special = getSpecialResponse(message)
  if (special) {
    touchActivity(store, { channel, message, intent: special.intent, createdTaskId: null, createdReportId: null, mode: 'special-playbook' })
    writeStore(store)
    return { intent: special.intent, reply: special.reply, mode: 'special-playbook' }
  }

  try {
    const llmResult = await tryLLMPath(store, message, channel)
    if (llmResult) return llmResult
  } catch (error) {
    touchActivity(store, { channel, message, intent: 'llm-error', error: String(error), mode: 'llm-fallback' })
    writeStore(store)
  }

  const intent = detectIntent(message)
  let reply = ''
  let createdTask = null
  let createdReport = null

  if (intent === 'weekly-report') {
    createdReport = createReport(
      store,
      'weekly',
      'Generated Weekly Marketing Report',
      'reporting',
      '# Generated Weekly Marketing Report\n\n## Executive Summary\nThis week showed healthy marketing activity with steady lead volume and active reputation monitoring.\n\n## Key Metrics\n- New leads: 14\n- Website sessions: 1,842\n- Avg. lead response time: 23 minutes\n- Pending approvals: ' + store.approvals.filter((a) => !a.resolved).length + '\n\n## Recommended Actions\n1. Clear pending approvals.\n2. Prioritize fast lead response.\n3. Keep content pipeline moving.'
    )
    reply = `Done — I generated a weekly marketing report draft and saved it to Reports.\n\nTopline:\n- New leads: 14\n- Website sessions: 1,842\n- Lead response time: 23 min\n- Pending approvals: ${store.approvals.filter((a) => !a.resolved).length}\n\nThe full report is now available in the shared AI Team state.`
  } else if (intent === 'work-summary') {
    createdReport = createReport(
      store,
      'work-summary',
      'Generated Work Summary',
      'team-leader',
      '# Generated Work Summary\n\n## Completed\n- Weekly reporting update\n- Lead draft preparation\n\n## In Progress\n- Reputation response review\n- Reporting and growth ops coordination\n\n## Pending\n- ' + store.tasks.filter((t) => t.status === 'pending').length + ' queued items still waiting to start.'
    )
    reply = `Here is the latest work summary:\n\nCompleted: ${store.tasks.filter((t) => t.status === 'completed').length}\nIn progress / review: ${store.tasks.filter((t) => ['in-progress','in-review'].includes(t.status)).length}\nPending: ${store.tasks.filter((t) => t.status === 'pending').length}\n\nI also saved a full work summary draft to Reports.`
  } else if (intent === 'approvals') {
    const pending = store.approvals.filter((a) => !a.resolved)
    reply = !pending.length
      ? 'There are currently no pending approvals.'
      : 'Pending approvals:\n' + pending.map((a, i) => `${i + 1}. ${a.title} (${a.agentName})`).join('\n')
  } else if (intent === 'tasks') {
    const open = store.tasks.filter((t) => t.status !== 'completed').slice(0, 5)
    reply = 'Current open work:\n' + open.map((t, i) => `${i + 1}. ${t.title} — ${t.status}`).join('\n')
  } else if (intent === 'social-reputation') {
    createdTask = createTask(store, 'social-reputation', `WhatsApp request: ${message.slice(0, 60)}`, `Requested from WhatsApp: ${message}`, 'medium', ['whatsapp', 'social'])
    reply = `Routed to the Social & Reputation Agent.\n\nTask created: ${createdTask.title}\nStatus: ${createdTask.status}\n\nThe team can now draft the response or content and move it into approval if needed.`
  } else if (intent === 'lead-response') {
    createdTask = createTask(store, 'lead-response', `WhatsApp request: ${message.slice(0, 60)}`, `Requested from WhatsApp: ${message}`, 'high', ['whatsapp', 'lead-response'])
    reply = `Routed to the Lead Response Agent.\n\nTask created: ${createdTask.title}\nPriority: high\n\nThis can now be prepared as a follow-up draft for approval.`
  } else if (intent === 'growth-ops') {
    createdTask = createTask(store, 'growth-ops', `WhatsApp request: ${message.slice(0, 60)}`, `Requested from WhatsApp: ${message}`, 'medium', ['whatsapp', 'growth-ops'])
    reply = `Routed to the Growth Ops Agent.\n\nTask created: ${createdTask.title}\n\nThis request is now logged for CRM, conversion, campaign, or workflow follow-up.`
  } else {
    reply = 'I can help with weekly reports, work summaries, approvals, open tasks, reputation requests, lead follow-up drafts, or growth ops questions. Try asking for one of those directly.'
  }

  touchActivity(store, { channel, message, intent, createdTaskId: createdTask?.id ?? null, createdReportId: createdReport?.id ?? null, mode: 'mock' })
  writeStore(store)
  return { intent, reply, createdTask, createdReport, mode: 'mock' }
}
