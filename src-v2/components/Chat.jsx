// ── V2 Chat — improved UX ──────────────────────────────────────────────────
// Key upgrades over V1:
//   - Named agent thinking state ("Growth Ops Agent is analyzing…")
//   - Routing trace badge on AI messages
//   - Structured disambiguation cards (options to click, not just a text list)
//   - Action buttons on messages (View Task, Go to Approvals)
//   - Demo scenario cards for quick starting points
//   - Wider message bubbles with better typography

import React, { useState, useRef, useEffect } from 'react';
import { getTeamLeaderResponse } from '../utils/teamLeaderV2.js';
import { AGENTS } from '../../src/data/agents.js';

const LEADER = AGENTS.find((a) => a.id === 'team-leader');
const CHAT_KEY = 'okeanos-v2-chat-history';

// ── Agent used for "thinking" display ─────────────────────────────────────

const ROUTING_AGENT_LABELS = {
  'goal-planning':     { id: 'growth-ops',        label: 'Analyzing goal structure…' },
  'weekly-report':     { id: 'reporting',          label: 'Pulling weekly data…' },
  'work-summary':      { id: 'team-leader',        label: 'Synthesizing team activity…' },
  'social-reputation': { id: 'social-reputation', label: 'Preparing social draft…' },
  'lead-response':     { id: 'lead-response',      label: 'Drafting follow-up…' },
  'content-strategist':{ id: 'content-strategist', label: 'Building content brief…' },
  'reporting':         { id: 'reporting',          label: 'Compiling analytics…' },
  'growth-ops':        { id: 'growth-ops',         label: 'Diagnosing growth ops…' },
};

const INITIAL_MESSAGE = {
  id: 1,
  role: 'assistant',
  intent: null,
  routingTrace: null,
  text: `Hi — I'm the **AI Team Leader** for Okeanos Marketing.\n\nI coordinate 6 specialist agents and can:\n- **Interpret a business goal** and break it into workstreams\n- **Route task requests** to the right agent instantly\n- **Generate reports** and work summaries on demand\n- **Surface items** for your review and approval\n\nAll outputs require your approval before anything is sent or published.`,
};

const DEMO_SCENARIOS = [
  {
    category: 'Goals',
    icon: '◎',
    label: 'I want 20 more leads next month',
    color: '#0f4c81',
  },
  {
    category: 'Goals',
    icon: '◎',
    label: 'Reduce our ad spend without losing leads',
    color: '#0f4c81',
  },
  {
    category: 'Reports',
    icon: '⊞',
    label: 'Generate this week\'s weekly report',
    color: '#0ea5e9',
  },
  {
    category: 'Reports',
    icon: '⊞',
    label: 'Give me a work summary',
    color: '#0ea5e9',
  },
  {
    category: 'Tasks',
    icon: '◻',
    label: 'Draft a follow-up for a new lead who requested a quote',
    color: '#d97706',
  },
  {
    category: 'Tasks',
    icon: '◻',
    label: 'Write an Instagram caption for a pool transformation post',
    color: '#7c3aed',
  },
];

const INTENT_META = {
  'goal-planning':     { label: 'Growth Objective',   color: '#b91c1c', bg: '#fff1f2' },
  'weekly-report':     { label: 'Weekly Report',      color: '#0369a1', bg: '#e0f2fe' },
  'work-summary':      { label: 'Work Summary',       color: '#6d28d9', bg: '#f5f3ff' },
  'social-reputation': { label: '→ Social Agent',     color: '#7c3aed', bg: '#f5f3ff' },
  'lead-response':     { label: '→ Lead Agent',       color: '#b45309', bg: '#fffbeb' },
  'content-strategist':{ label: '→ Content Agent',    color: '#047857', bg: '#ecfdf5' },
  'reporting':         { label: '→ Reporting Agent',  color: '#0369a1', bg: '#e0f2fe' },
  'growth-ops':        { label: '→ Growth Ops Agent', color: '#991b1b', bg: '#fff1f2' },
  'clarification':     { label: 'Clarification',      color: '#475569', bg: '#f1f5f9' },
};

function loadHistory() {
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    if (!raw) return [INITIAL_MESSAGE];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [INITIAL_MESSAGE];
  } catch { return [INITIAL_MESSAGE]; }
}

// ── Markdown renderer (same as v1 but with better spacing) ──────────────────

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={md.hr} />); i++; continue;
    }
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) { elements.push(<h1 key={i} style={md.h1}>{inl(h1[1])}</h1>); i++; continue; }
    if (h2) { elements.push(<h2 key={i} style={md.h2}>{inl(h2[1])}</h2>); i++; continue; }
    if (h3) { elements.push(<h3 key={i} style={md.h3}>{inl(h3[1])}</h3>); i++; continue; }

    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={i} style={md.li}>{inl(lines[i].replace(/^[-*] /, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={md.ul}>{items}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i} style={md.li}>{inl(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} style={md.ol}>{items}</ol>);
      continue;
    }

    if (line.trim() === '') { elements.push(<div key={i} style={{ height: 5 }} />); i++; continue; }
    elements.push(<p key={i} style={md.p}>{inl(line)}</p>);
    i++;
  }
  return elements;
}

function inl(text) {
  const parts = [];
  let rem = text, k = 0;
  while (rem.length) {
    const b = rem.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (b) { if (b[1]) parts.push(b[1]); parts.push(<strong key={k++}>{inl(b[2])}</strong>); rem = b[3]; continue; }
    const it = rem.match(/^(.*?)\*(.+?)\*(.*)/s);
    if (it) { if (it[1]) parts.push(it[1]); parts.push(<em key={k++}>{it[2]}</em>); rem = it[3]; continue; }
    const co = rem.match(/^(.*?)`(.+?)`(.*)/s);
    if (co) { if (co[1]) parts.push(co[1]); parts.push(<code key={k++} style={md.code}>{co[2]}</code>); rem = co[3]; continue; }
    parts.push(rem); break;
  }
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function Chat({ onTaskCreated, onNav }) {
  const [messages, setMessages] = useState(() => loadHistory());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState('Processing…');
  const [thinkingAgentColor, setThinkingAgentColor] = useState(LEADER.color);
  const [showScenarios, setShowScenarios] = useState(messages.length <= 1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    try { window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  function clearChat() {
    const reset = [INITIAL_MESSAGE];
    setMessages(reset);
    setShowScenarios(true);
    try { window.localStorage.setItem(CHAT_KEY, JSON.stringify(reset)); } catch {}
  }

  async function send(text) {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setShowScenarios(false);
    setLoading(true);

    // Show a quick pre-route thinking label then update when we know the agent
    setThinkingLabel('Team Leader is routing…');
    setThinkingAgentColor(LEADER.color);

    try {
      const res = await getTeamLeaderResponse(text.trim());

      // Update the thinking display to the routed agent mid-way (cosmetic)
      if (res.routedAgent) {
        const agent = AGENTS.find((a) => a.id === res.routedAgent);
        if (agent) {
          setThinkingLabel(`${agent.name} is working…`);
          setThinkingAgentColor(agent.color);
        }
      }

      // Small extra pause so the "agent working" label is visible
      await new Promise((r) => setTimeout(r, 350));

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: res.message,
        intent: res.intent,
        routingTrace: res.routingTrace || null,
        routedAgent: res.routedAgent || null,
        newTask: res.newTask || null,
        hasApproval: !!(res.newApproval),
        extraTaskCount: res.extraTasks?.length || 0,
        disambiguate: res.disambiguate || false,
        options: res.options || [],
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (res.newTask || res.newApproval || res.extraTasks?.length) {
        onTaskCreated({ task: res.newTask, approval: res.newApproval, extraTasks: res.extraTasks || [] });
      }
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'An error occurred. Please try again.',
        intent: null,
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <div style={s.layout}>
      {/* ── Main chat column ─────────────────────────── */}
      <div style={s.chatCol}>
        <div style={s.chatHeader}>
          <div style={s.chatHeaderInner}>
            <div style={{ ...s.leaderDot, background: LEADER.color }}>TL</div>
            <div>
              <div style={s.chatTitle}>AI Team Leader</div>
              <div style={s.chatSub}>Routes to: Social · Lead · Content · Reporting · Growth Ops</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>New conversation</button>
        </div>

        <div style={s.chatWindow}>

          {/* Demo scenario cards — shown on first open */}
          {showScenarios && (
            <div style={s.scenarioSection} className="fade-in">
              <div style={s.scenarioLabel}>Quick starts</div>
              <div style={s.scenarioGrid}>
                {DEMO_SCENARIOS.map((sc) => (
                  <button
                    key={sc.label}
                    style={s.scenarioCard}
                    onClick={() => send(sc.label)}
                    disabled={loading}
                  >
                    <span style={{ ...s.scenarioCat, color: sc.color }}>{sc.icon} {sc.category}</span>
                    <span style={s.scenarioText}>{sc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onSend={send}
              onNav={onNav}
              loading={loading}
            />
          ))}

          {/* Typing / thinking indicator */}
          {loading && (
            <div className="fade-in" style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
              <div style={{ ...s.avatar, background: thinkingAgentColor }}>
                {thinkingAgentColor === LEADER.color ? 'TL' : '…'}
              </div>
              <div style={{ ...s.bubble, ...s.bubbleAI }}>
                <div style={s.thinkingRow}>
                  <div className="typing-dots"><span /><span /><span /></div>
                  <span style={s.thinkingLabel}>{thinkingLabel}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div style={s.inputArea}>
          <textarea
            ref={inputRef}
            style={s.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Message the AI Team Leader…"
            rows={2}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            style={s.sendBtn}
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>

      {/* ── Sidebar ──────────────────────────────────── */}
      <div style={s.sideCol}>
        <div className="card" style={s.sideCard}>
          <div style={s.sideTitle}>Agent Routing</div>
          {[
            { kw: 'goal / growth objective', agent: 'Growth Ops + team', color: '#0f4c81' },
            { kw: 'lead / follow-up', agent: 'Lead Response Agent', color: '#d97706' },
            { kw: 'social / review / caption', agent: 'Social & Rep. Agent', color: '#7c3aed' },
            { kw: 'blog / SEO / copy', agent: 'Content Strategist', color: '#059669' },
            { kw: 'analytics / report / GA4', agent: 'Reporting Agent', color: '#0ea5e9' },
            { kw: 'CRM / pipeline / campaign', agent: 'Growth Ops Agent', color: '#b91c1c' },
          ].map((r) => (
            <div key={r.kw} style={s.routeRow}>
              <code style={s.routeKw}>{r.kw}</code>
              <span style={{ ...s.routeAgent, color: r.color }}>→ {r.agent}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ ...s.sideCard, marginTop: 12 }}>
          <div style={s.sideTitle}>How it works</div>
          <div style={s.howItWorks}>
            <div style={s.howStep}><span style={s.howNum}>1</span><span>You type an objective or request</span></div>
            <div style={s.howStep}><span style={s.howNum}>2</span><span>Team Leader parses intent + routes to agent</span></div>
            <div style={s.howStep}><span style={s.howNum}>3</span><span>Agent produces a draft output</span></div>
            <div style={s.howStep}><span style={s.howNum}>4</span><span>You review and approve before anything ships</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Message bubble sub-component ─────────────────────────────────────────────

function MessageBubble({ msg, onSend, onNav, loading }) {
  const isUser = msg.role === 'user';
  const intentMeta = msg.intent ? INTENT_META[msg.intent] : null;
  const routedAgent = msg.routedAgent ? AGENTS.find((a) => a.id === msg.routedAgent) : null;

  return (
    <div className="fade-in" style={{ ...s.msgRow, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={{ ...s.avatar, background: LEADER.color }}>TL</div>
      )}
      <div style={{ ...s.bubble, ...(isUser ? s.bubbleUser : s.bubbleAI) }}>

        {/* Intent label */}
        {intentMeta && !isUser && (
          <div style={{ ...s.intentBadge, color: intentMeta.color, background: intentMeta.bg }}>
            {intentMeta.label}
          </div>
        )}

        {/* Message content */}
        {isUser
          ? <p style={s.userText}>{msg.text}</p>
          : <div style={s.mdContent}>{renderMarkdown(msg.text)}</div>
        }

        {/* Disambiguation option cards */}
        {msg.disambiguate && msg.options?.length > 0 && (
          <div style={s.optionGrid}>
            {msg.options.map((opt) => (
              <button
                key={opt.value}
                style={s.optionCard}
                onClick={() => onSend(opt.value)}
                disabled={loading}
              >
                <span style={s.optionLabel}>{opt.label}</span>
                <span style={s.optionDesc}>{opt.desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* Routing trace */}
        {msg.routingTrace && !isUser && (
          <div style={s.traceRow}>
            <span style={s.traceDot}>▸</span>
            <span style={s.traceText}>
              Routed to <strong>{routedAgent ? routedAgent.name : 'AI Team Leader'}</strong>
              {' · '}{msg.routingTrace.confidence} confidence
            </span>
          </div>
        )}

        {/* Action chips */}
        {msg.newTask && !isUser && (
          <div style={s.actionRow}>
            <button style={s.actionChip} className="btn btn-sm" onClick={() => onNav('tasks')}>
              View Task →
            </button>
            {msg.hasApproval && (
              <button style={{ ...s.actionChip, ...s.actionChipAmber }} className="btn btn-sm" onClick={() => onNav('approvals')}>
                Review in Approvals →
              </button>
            )}
          </div>
        )}

        {/* Extra task count chip */}
        {msg.extraTaskCount > 0 && !isUser && (
          <div style={s.extraTaskChip}>
            +{msg.extraTaskCount} linked workstream{msg.extraTaskCount > 1 ? 's' : ''} created
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  layout: { display: 'flex', gap: 14, height: '100%', alignItems: 'flex-start' },
  chatCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: 0,
    height: 'calc(100vh - var(--header-height) - 48px)',
  },
  chatHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
  },
  chatHeaderInner: { display: 'flex', alignItems: 'center', gap: 10 },
  leaderDot: {
    width: 32, height: 32, borderRadius: 8, color: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  chatTitle: { fontSize: 13, fontWeight: 700, color: 'var(--color-text)' },
  chatSub: { fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 },

  chatWindow: {
    flex: 1, overflowY: 'auto', padding: '18px 16px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },

  scenarioSection: { marginBottom: 6 },
  scenarioLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 10 },
  scenarioGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  scenarioCard: {
    display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', textAlign: 'left',
    background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
    borderRadius: 10, cursor: 'pointer', transition: 'all 0.13s',
  },
  scenarioCat: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  scenarioText: { fontSize: 12, color: 'var(--color-text)', lineHeight: 1.4 },

  msgRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  avatar: {
    width: 28, height: 28, borderRadius: 7, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
  },
  bubble: { maxWidth: '76%', borderRadius: 10, padding: '10px 13px', lineHeight: 1.6 },
  bubbleAI: {
    background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
    borderTopLeftRadius: 3,
  },
  bubbleUser: {
    background: 'var(--color-primary)', color: '#fff', borderTopRightRadius: 3,
  },

  intentBadge: {
    display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.06em', borderRadius: 99, padding: '2px 8px', marginBottom: 7,
  },
  mdContent: { fontSize: 13, color: 'var(--color-text)' },
  userText: { fontSize: 13, color: '#fff', margin: 0 },

  optionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 },
  optionCard: {
    display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 10px', textAlign: 'left',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 8, cursor: 'pointer', transition: 'all 0.12s',
  },
  optionLabel: { fontSize: 12, fontWeight: 600, color: 'var(--color-text)' },
  optionDesc: { fontSize: 11, color: 'var(--color-text-muted)' },

  traceRow: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
    paddingTop: 7, borderTop: '1px dashed var(--color-border)',
  },
  traceDot: { fontSize: 10, color: 'var(--color-text-muted)' },
  traceText: { fontSize: 11, color: 'var(--color-text-muted)' },

  actionRow: { display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' },
  actionChip: {
    background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
    border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 600, borderRadius: 6,
    padding: '4px 10px', cursor: 'pointer',
  },
  actionChipAmber: {
    background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a',
  },
  extraTaskChip: {
    marginTop: 6, background: 'var(--color-green-muted)', color: '#065f46',
    fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 8px',
    border: '1px solid #a7f3d0', display: 'inline-block',
  },

  thinkingRow: { display: 'flex', alignItems: 'center', gap: 8 },
  thinkingLabel: { fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' },

  inputArea: {
    display: 'flex', gap: 8, padding: '10px 14px',
    borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)',
  },
  textarea: {
    flex: 1, resize: 'none', border: '1px solid var(--color-border)', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, color: 'var(--color-text)',
    background: 'var(--color-surface)', outline: 'none', lineHeight: 1.5,
  },
  sendBtn: { alignSelf: 'flex-end', padding: '8px 16px', borderRadius: 8, flexShrink: 0 },

  sideCol: { width: 234, flexShrink: 0 },
  sideCard: { padding: '13px 14px' },
  sideTitle: {
    fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
  },
  routeRow: { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 },
  routeKw: {
    fontSize: 11, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
    borderRadius: 4, padding: '1px 5px', color: 'var(--color-text)', fontFamily: 'var(--font-mono)',
  },
  routeAgent: { fontSize: 11, fontWeight: 600, paddingLeft: 4 },

  howItWorks: { display: 'flex', flexDirection: 'column', gap: 8 },
  howStep: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 },
  howNum: {
    width: 18, height: 18, borderRadius: '50%', background: 'var(--color-primary)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
  },
};

const md = {
  h1: { fontSize: 15, fontWeight: 700, marginBottom: 5, marginTop: 8, color: 'var(--color-text)' },
  h2: { fontSize: 14, fontWeight: 700, marginBottom: 4, marginTop: 10, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: 3 },
  h3: { fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8, color: 'var(--color-text)' },
  p: { fontSize: 13, marginBottom: 3, lineHeight: 1.6 },
  ul: { paddingLeft: 16, marginBottom: 4 },
  ol: { paddingLeft: 18, marginBottom: 4 },
  li: { fontSize: 13, marginBottom: 2, lineHeight: 1.6 },
  hr: { border: 'none', borderTop: '1px solid var(--color-border)', margin: '7px 0' },
  code: { background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: 3, padding: '1px 4px', fontSize: 12, fontFamily: 'var(--font-mono)' },
};
