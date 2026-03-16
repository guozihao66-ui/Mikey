import { readStore, writeStore, touchActivity } from './store.mjs'
import { callTeamLeaderLLM, llmAvailable } from './llm.mjs'

function getSpecialResponse(message) {
  const m = message.toLowerCase()

  if ((/cost per lead|cpl/.test(m) && /25%|twenty-five percent/.test(m)) || (/reduce/.test(m) && /cost per lead|cpl/.test(m))) {
    return {
      intent: 'reporting',
      reply: `Here is a practical plan to reduce **cost per lead by 25%** for Okeanos without pretending we can cut spend blindly.

## Working target
If current CPL is **$38.20**, a 25% reduction means a target of **~$28.65**.

## Where the opportunity likely is
1. **Pause or cap waste first**
   - Meta Awareness \u2014 Spring Visual Teaser is currently the weakest use of budget
   - Any ad set with spend but no consultation intent should be reduced first
2. **Shift more budget toward high-intent search**
   - Protect campaigns around fiberglass pool quotes, installation, pricing, and consultation intent
   - Separate research traffic from quote-ready traffic so high-intent terms are not diluted
3. **Tighten conversion quality on landing pages**
   - Match ad promise to page headline
   - Shorten the main form to the minimum fields needed for a consultation
   - Put financing / timeline / Ontario trust signals above the fold
4. **Improve qualification before scale**
   - Exclude weak audiences and broad placements that generate clicks but low buying intent
   - Prioritize GTA homeowners, higher-income renovation audiences, and consultation-oriented CTAs
5. **Refresh creative instead of endlessly increasing spend**
   - New before/after proof assets
   - Stronger offer framing: design consult, project timeline clarity, financing guidance

## Recommended 30-day action plan
- **Week 1:** Cut clear waste, especially zero-lead or low-intent paid social spend
- **Week 2:** Reallocate budget into top Google Search campaigns and tighten keyword grouping
- **Week 3:** Test 2 new landing page variants focused on quote request and consultation booking
- **Week 4:** Review CPL by campaign, qualified lead rate, and consultation-booked rate before scaling

## KPI guardrails
Do not judge CPL alone. Track:
- CPL
- Qualified lead rate
- Consultation booking rate
- Quote-ready lead volume

## Likely highest-leverage moves
1. Reduce weak Meta awareness spend
2. Increase budget share on high-intent Google Search
3. Improve landing page conversion rate before scaling traffic

If you want, I can also turn this into a **1-page executive recommendation** or a **tasked workstream plan by agent**.`,
    }
  }

  if ((/ppc/.test(m) || /google ads|meta ads|paid search|paid media/.test(m)) && /benchmark|benchmarks/.test(m)) {
    return {
      intent: 'reporting',
      reply: `Here is a benchmark-style read on **Okeanos PPC performance** for the pool category.

## Likely benchmark lens for pool / high-ticket home services
For fiberglass pool campaigns in Ontario, strong PPC usually means:
- Search campaigns outperform paid social on lead quality
- Branded + high-intent non-brand search produce the best consultation intent
- Awareness/social campaigns support demand but often look weaker on last-click CPL

## Okeanos campaigns most likely outperforming
### 1. Google Search \u2014 Fiberglass Pool Quotes
**Most likely outperformer** because it captures explicit quote intent.
- Best fit for bottom-funnel traffic
- Strongest candidate for qualified consultations
- Should be the benchmark winner unless landing page quality is weak

### 2. Google Search \u2014 Pool Installation GTA
**Likely solid / above average** if search terms are tightly managed.
- Good local intent
- Worth protecting if lead quality is acceptable
- May trail quote-focused campaigns but still outperform social on efficiency

## Campaigns most likely under benchmark
### 3. Meta Lead Form \u2014 Backyard Renovation
**Probably mixed.**
- May generate cheaper form fills in some markets
- Lead quality is usually less consistent than high-intent search
- Better as a nurture / retargeting assist than the core efficiency engine

### 4. Meta Awareness \u2014 Spring Visual Teaser
**Likely underperforming** on direct-response benchmarks.
- Awareness helps reach, not necessarily qualified leads
- Weak candidate if judged on CPL or consultation intent
- First place to trim if the goal is efficiency

## Recommended conclusion
If we compare against typical pool-industry paid media behavior, the **likely outperformers are the two Google Search campaigns**, especially **Fiberglass Pool Quotes**. The **likely underperformer is the Meta Awareness campaign**, with Meta lead forms sitting in the middle but needing lead-quality validation.

## What I would report to leadership
- **Outperforming:** High-intent Google Search
- **Stable but watch:** Local install search
- **Needs stronger proof of quality:** Meta lead forms
- **Most likely below benchmark:** Meta awareness creative

If you want, I can convert this into a **benchmark table** with columns for campaign, funnel stage, likely benchmark position, and recommended action.`,
    }
  }

  if ((/under-targeted|underserved/.test(m) && /segment/.test(m) && /ontario/.test(m)) || (/fiberglass pool customer segment/.test(m) && /ontario/.test(m))) {
    return {
      intent: 'growth-ops',
      reply: `A strong **under-targeted fiberglass pool segment in Ontario** is:

## Segment
**Affluent downsizers / empty-nesters in suburban GTA neighborhoods** who want a low-maintenance backyard upgrade without the complexity of concrete.

## Why this segment is attractive
- Fiberglass aligns well with **lower maintenance** and faster install expectations
- They often have disposable income but do not respond to family-oriented pool messaging
- Many pool brands over-focus on young families, leaving this segment relatively under-addressed

## Core insight
This segment buys **simplicity, reliability, and property enjoyment** \u2014 not just "summer fun for kids."

## Campaign angle
**"The low-maintenance luxury backyard"**

### Messaging themes
- Faster path from decision to enjoyment
- Easier upkeep than concrete
- Clean, engineered look that suits premium homes
- Ideal for entertaining, wellness, and long-term home enjoyment

## Suggested campaign structure
### Channel mix
- Google Search for high-intent terms around fiberglass pool cost, installation, and maintenance
- Meta / Instagram for visual proof and lifestyle positioning
- Remarketing to visitors who engaged with financing, gallery, or consultation pages

### Creative ideas
1. Before/after transformation of a smaller premium backyard
2. "Why Ontario homeowners are choosing fiberglass over concrete"
3. Short video: maintenance simplicity, smooth finish, faster install path

## CTA
- **Book a design consultation**
- **See fiberglass pool options for Ontario homes**
- **Get a realistic project plan and budget range**

## Campaign workflow
1. Build one landing page tailored to low-maintenance premium buyers
2. Launch 2-3 paid search ad groups around maintenance + installation + Ontario intent
3. Support with short-form visual proof on Instagram / Meta
4. Retarget page visitors with consultation-first creative

If you want, I can turn this into a **full campaign brief** with audience, messaging, ad copy, landing page sections, and KPI targets.`,
    }
  }

  if ((/social media strategy/.test(m) || /instagram|tiktok/.test(m)) && /trend|trends|workflow/.test(m)) {
    return {
      intent: 'social-reputation',
      reply: `Here is a practical **Instagram / TikTok lead-gen strategy** for a pool company like Okeanos.

## Trends worth leveraging now
1. **Before / after transformation content**
   - Fast visual payoff
   - Strong hook in the first 2 seconds
2. **Process transparency**
   - Site prep, install stages, reveal moments, mistakes to avoid
   - Builds trust and engineering credibility
3. **Owner education clips**
   - Fiberglass vs concrete
   - What installation really costs
   - What to expect in Ontario climates
4. **Local proof**
   - Oakville, Burlington, Vaughan, Mississauga project storytelling
   - Place-based credibility improves lead intent
5. **Short talking-head expert commentary**
   - Founder / project lead explains one practical insight in 20-30 seconds

## Best lead-generation content mix
- **40% proof:** transformations, testimonials, finished projects
- **30% education:** cost, maintenance, timing, comparison content
- **20% process:** behind the scenes, install phases, craftsmanship
- **10% CTA content:** consultation invites, seasonal planning reminders, limited install-window prompts

## Weekly content workflow
### Monday \u2014 Planning
- Pick 3 content themes for the week
- Choose 1 offer / CTA to repeat across posts
- Pull project photos, clips, and any client proof

### Tuesday \u2014 Production
- Film 2 short expert clips
- Edit 1 before/after reel
- Prepare 1 story sequence with poll or Q&A sticker

### Wednesday \u2014 Publish proof post
- Reel: transformation or reveal
- CTA: book a consultation / request project pricing guidance

### Thursday \u2014 Publish education post
- Topic like fiberglass vs concrete, budgeting, or install timing
- CTA: download guide or book consult

### Friday \u2014 Publish trust/process post
- Behind-the-scenes craftsmanship, install progress, or client quote
- CTA: reply with project timing or send a DM for planning help

### Daily stories
- Progress shots
- FAQ box
- Polls: budget, timing, design preferences
- DM prompt: "Want a realistic pool plan for your yard?"

## To keep it from looking generic
Each post should include at least one of these:
- Ontario context
- Real project proof
- Specific homeowner problem
- Clear next step toward consultation

If you want, I can turn this into a **weekly content calendar with 7 post ideas, hooks, captions, and CTAs**.`,
    }
  }

  if ((/executive report/.test(m) || /monthly executive marketing report/.test(m)) && /monthly|month/.test(m)) {
    return {
      intent: 'reporting',
      reply: `Below is a clean **monthly executive marketing report** structure that sounds leadership-ready rather than robotic.

# Monthly Executive Marketing Report
## Executive Summary
This month, Okeanos maintained solid lead flow with search-driven demand continuing to outperform awareness-focused paid social. Lead response speed remained within target, while the clearest efficiency opportunity remains reallocating budget away from weaker awareness spend and toward higher-intent campaigns and conversion improvements.

## Channel Performance Summary
### Google Search
- Strongest source of high-intent traffic
- Best candidate for qualified consultation volume
- Priority channel for protected or expanded budget

### Meta / Paid Social
- Useful for reach, remarketing, and creative testing
- Less reliable for direct-response efficiency
- Requires tighter creative and audience discipline

### Organic / Content
- Supports trust, education, and comparison-stage buyers
- Biggest role is improving conversion and lowering dependence on paid media over time

### Lead Response / Conversion
- Response speed remains within target
- Opportunity is improving consultation-booked rate and lead qualification consistency

## Key Leadership Takeaways
1. Search remains the most dependable demand-capture channel
2. Some paid social spend is likely better used as support, not the core acquisition engine
3. Landing page and conversion improvements can unlock better efficiency without relying only on more traffic

## Top Three Actions for Next Month
1. **Reallocate budget toward the highest-intent search campaigns**
2. **Refresh paid social creative and narrow targeting before further spend expansion**
3. **Improve consultation landing page conversion rate with stronger proof, simpler forms, and clearer CTAs**

## Suggested KPI Section
Track next month:
- Total leads
- Qualified leads
- CPL
- Consultation booking rate
- Average response time
- Channel-level conversion efficiency

If you want, I can turn this into a **fully formatted monthly report template with numbers filled in from the current prototype data**.`,
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
