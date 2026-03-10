import { readStore, writeStore, touchActivity } from './store.mjs'
import { callTeamLeaderLLM, llmAvailable } from './llm.mjs'

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
