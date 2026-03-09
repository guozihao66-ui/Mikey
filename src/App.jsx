import { useMemo, useState } from 'react'
import { AGENTS } from './data/agents'
import { INITIAL_TASKS } from './data/tasks'
import { SAMPLE_REPORTS } from './data/reports'
import { getTeamLeaderResponse } from './utils/teamLeaderAI'

const quickPrompts = [
  'Generate this week\'s weekly marketing report',
  'Give me a work summary for the team',
  'Create a response plan for a negative Google review',
  'Draft a fast follow-up for a new website lead',
]

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content:
      'Welcome to the Okeanos Marketing AI Team Platform. I am the AI Team Leader. I can clarify requests, route tasks, generate weekly marketing reports, and prepare work summaries for the internal marketing team. Nothing is executed without human approval.',
  },
]

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function statusClass(status) {
  if (status === 'completed' || status === 'approved') return 'badge-green'
  if (status === 'in-progress' || status === 'in-review') return 'badge-blue'
  if (status === 'pending' || status === 'draft') return 'badge-amber'
  return 'badge-gray'
}

function App() {
  const [activeView, setActiveView] = useState('overview')
  const [messages, setMessages] = useState(initialMessages)
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [reports, setReports] = useState(SAMPLE_REPORTS)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState(SAMPLE_REPORTS[0].id)

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? reports[0],
    [reports, selectedReportId],
  )

  const taskCounts = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      active: tasks.filter((t) => ['in-progress', 'in-review'].includes(t.status)).length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }
  }, [tasks])

  const routeTaskFromResponse = (response) => {
    if (!response.newTask) return
    setTasks((prev) => [response.newTask, ...prev])
  }

  const maybeCreateReport = (response, userText) => {
    if (response.intent !== 'weekly-report' && response.intent !== 'work-summary') return

    const newReport = {
      id: `generated-${Date.now()}`,
      type: response.intent === 'weekly-report' ? 'weekly' : 'work-summary',
      title:
        response.intent === 'weekly-report'
          ? 'Generated Weekly Marketing Report'
          : 'Generated Work Summary',
      generatedAt: new Date().toISOString(),
      generatedBy: 'team-leader',
      status: 'draft',
      content: `# ${response.intent === 'weekly-report' ? 'Generated Weekly Marketing Report' : 'Generated Work Summary'}\n\n**Request:** ${userText}\n\n${response.message}`,
    }

    setReports((prev) => [newReport, ...prev])
    setSelectedReportId(newReport.id)
  }

  const handleSend = async (forcedText) => {
    const text = (forcedText ?? input).trim()
    if (!text || isThinking) return

    const userMessage = { id: Date.now(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      const response = await getTeamLeaderResponse(text)
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.message,
      }

      setMessages((prev) => [...prev, assistantMessage])
      routeTaskFromResponse(response)
      maybeCreateReport(response, text)

      if (response.intent === 'weekly-report' || response.intent === 'work-summary') {
        setActiveView('reports')
      } else if (response.newTask) {
        setActiveView('tasks')
      }
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="layout app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">OP</div>
          <div>
            <h1>Okeanos Platform</h1>
            <p>Marketing AI Team</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            ['overview', 'Overview'],
            ['leader', 'AI Team Leader'],
            ['tasks', 'Tasks'],
            ['reports', 'Reports'],
            ['agents', 'Agents'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`nav-link ${activeView === key ? 'active' : ''}`}
              onClick={() => setActiveView(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-card card">
          <h3>Operating Model</h3>
          <p>AI drafts. Humans approve. No customer-facing action is published or sent without review.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar card">
          <div>
            <h2>Engineer-led growth operations</h2>
            <p>
              Focus: stronger reputation, faster lead response, better weekly visibility, and more
              website leads.
            </p>
          </div>
          <div className="topbar-badges">
            <span className="badge badge-blue">Internal team prototype</span>
            <span className="badge badge-green">English only</span>
          </div>
        </header>

        <div className="page-content">
          {activeView === 'overview' && (
            <section className="overview-grid fade-in">
              <div className="hero card">
                <div>
                  <p className="eyebrow">Okeanos positioning</p>
                  <h3>Engineer credibility. High quality. Practical value.</h3>
                  <p className="hero-copy">
                    This prototype helps the internal marketing team coordinate reputation, content,
                    lead response, and reporting through a single AI Team Leader interface.
                  </p>
                </div>
                <div className="hero-actions">
                  <button className="btn btn-primary" onClick={() => setActiveView('leader')}>
                    Open Team Leader
                  </button>
                  <button className="btn btn-ghost" onClick={() => setActiveView('reports')}>
                    View Reports
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                <StatCard label="Total tasks" value={taskCounts.total} detail="Across all agents" />
                <StatCard label="Pending approval" value={taskCounts.pending} detail="Needs human review" />
                <StatCard label="Active work" value={taskCounts.active} detail="In progress or in review" />
                <StatCard label="Completed" value={taskCounts.completed} detail="Closed this cycle" />
              </div>

              <div className="card section-card">
                <div className="section-header">
                  <h3>Priority quick actions</h3>
                  <span className="badge badge-amber">High leverage</span>
                </div>
                <div className="quick-prompt-grid">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} className="quick-prompt" onClick={() => handleSend(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card section-card">
                <div className="section-header">
                  <h3>Recent team activity</h3>
                  <span className="badge badge-gray">Live prototype feed</span>
                </div>
                <div className="activity-list">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="activity-item">
                      <div>
                        <strong>{task.title}</strong>
                        <p>{task.description.slice(0, 120)}...</p>
                      </div>
                      <div className="activity-meta">
                        <span className={`badge ${statusClass(task.status)}`}>{task.status}</span>
                        <small>{formatDate(task.updatedAt)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeView === 'leader' && (
            <section className="leader-grid fade-in">
              <div className="card chat-card">
                <div className="section-header">
                  <div>
                    <h3>AI Team Leader</h3>
                    <p>Clarify requests, generate summaries, and route work to specialist agents.</p>
                  </div>
                  <span className="badge badge-blue">Approval-first workflow</span>
                </div>

                <div className="message-list">
                  {messages.map((message) => (
                    <div key={message.id} className={`message-row ${message.role}`}>
                      <div className="message-bubble">
                        <span className="message-role">
                          {message.role === 'assistant' ? 'AI Team Leader' : 'You'}
                        </span>
                        <div className="message-text">{message.content}</div>
                      </div>
                    </div>
                  ))}

                  {isThinking && (
                    <div className="message-row assistant">
                      <div className="message-bubble">
                        <span className="message-role">AI Team Leader</span>
                        <div className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="quick-prompt-grid compact">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} className="quick-prompt" onClick={() => handleSend(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="chat-input-row">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the Team Leader to generate a weekly report, summarize work, route a social task, or prepare a lead-response draft..."
                    rows={3}
                  />
                  <button className="btn btn-primary" onClick={() => handleSend()} disabled={isThinking}>
                    Send request
                  </button>
                </div>
              </div>

              <div className="card side-panel">
                <div className="section-header">
                  <h3>Routing logic</h3>
                  <span className="badge badge-gray">Mocked locally</span>
                </div>
                <ul className="bullet-list">
                  <li>Weekly marketing reports → Reporting view + draft report output</li>
                  <li>Work summaries → Reporting view + summary output</li>
                  <li>Social / review requests → routed to Social & Reputation Agent</li>
                  <li>Lead / quote follow-up requests → routed to Lead Response Agent</li>
                  <li>General clarification → Team Leader keeps conversation in chat</li>
                </ul>
              </div>
            </section>
          )}

          {activeView === 'tasks' && (
            <section className="fade-in">
              <div className="card section-card">
                <div className="section-header">
                  <h3>Task queue</h3>
                  <span className="badge badge-blue">{tasks.length} tasks</span>
                </div>
                <div className="task-list">
                  {tasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <div className="task-card-top">
                        <div>
                          <h4>{task.title}</h4>
                          <p>{task.description}</p>
                        </div>
                        <div className="task-meta-stack">
                          <span className={`badge ${statusClass(task.status)}`}>{task.status}</span>
                          <span className={`badge ${task.priority === 'high' ? 'badge-red' : task.priority === 'medium' ? 'badge-amber' : 'badge-gray'}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="task-card-bottom">
                        <span>Assigned to: {AGENTS.find((agent) => agent.id === task.assignedTo)?.name}</span>
                        <span>Updated: {formatDate(task.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeView === 'reports' && (
            <section className="reports-grid fade-in">
              <div className="card report-list-card">
                <div className="section-header">
                  <h3>Reports</h3>
                  <span className="badge badge-blue">{reports.length} available</span>
                </div>
                <div className="report-list">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      className={`report-list-item ${selectedReportId === report.id ? 'selected' : ''}`}
                      onClick={() => setSelectedReportId(report.id)}
                    >
                      <div>
                        <strong>{report.title}</strong>
                        <p>{report.type}</p>
                      </div>
                      <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card report-viewer">
                {selectedReport && (
                  <>
                    <div className="section-header">
                      <div>
                        <h3>{selectedReport.title}</h3>
                        <p>Generated {formatDate(selectedReport.generatedAt)}</p>
                      </div>
                      <span className={`badge ${statusClass(selectedReport.status)}`}>{selectedReport.status}</span>
                    </div>
                    <pre>{selectedReport.content}</pre>
                  </>
                )}
              </div>
            </section>
          )}

          {activeView === 'agents' && (
            <section className="agents-grid fade-in">
              {AGENTS.map((agent) => (
                <div key={agent.id} className="card agent-card">
                  <div className="agent-header-row">
                    <div className="agent-avatar" style={{ backgroundColor: agent.color }}>
                      {agent.avatar}
                    </div>
                    <div>
                      <h3>{agent.name}</h3>
                      <p>{agent.role}</p>
                    </div>
                    <span className="badge badge-green">{agent.status}</span>
                  </div>
                  <p className="agent-description">{agent.description}</p>
                  <div className="capability-list">
                    {agent.capabilities.map((capability) => (
                      <span key={capability} className="badge badge-gray">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, detail }) {
  return (
    <div className="card stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}

export default App
