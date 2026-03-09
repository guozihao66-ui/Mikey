import React, { useState, useRef, useEffect } from 'react';
import { getTeamLeaderResponse } from '../utils/teamLeaderAI.js';
import { AGENTS } from '../data/agents.js';

const LEADER = AGENTS.find((a) => a.id === 'team-leader');

const SUGGESTIONS = [
  'Generate this week\'s weekly report',
  'Give me a work summary',
  'Draft a follow-up for a new lead who requested a pool quote',
  'Route a task for Instagram captions for our spring pool photos',
  'What can the AI team help me with?',
];

function renderMarkdown(text) {
  // Simple inline markdown → React elements
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={mdStyles.hr} />);
      i++;
      continue;
    }

    // Heading
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) { elements.push(<h1 key={i} style={mdStyles.h1}>{parseInline(h1[1])}</h1>); i++; continue; }
    if (h2) { elements.push(<h2 key={i} style={mdStyles.h2}>{parseInline(h2[1])}</h2>); i++; continue; }
    if (h3) { elements.push(<h3 key={i} style={mdStyles.h3}>{parseInline(h3[1])}</h3>); i++; continue; }

    // Unordered list block
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={i} style={mdStyles.li}>{parseInline(lines[i].replace(/^[-*] /, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={mdStyles.ul}>{items}</ul>);
      continue;
    }

    // Ordered list block
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i} style={mdStyles.li}>{parseInline(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} style={mdStyles.ol}>{items}</ol>);
      continue;
    }

    // Table
    if (line.includes('|') && lines[i + 1] && /^\|[-| ]+\|$/.test(lines[i + 1].trim())) {
      const rows = [];
      const headerCells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      rows.push(
        <tr key={`tr-h-${i}`}>
          {headerCells.map((c, ci) => <th key={ci} style={mdStyles.th}>{parseInline(c.trim())}</th>)}
        </tr>
      );
      i += 2; // skip header and separator
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        rows.push(
          <tr key={`tr-${i}`}>
            {cells.map((c, ci) => <td key={ci} style={mdStyles.td}>{parseInline(c.trim())}</td>)}
          </tr>
        );
        i++;
      }
      elements.push(
        <div key={`tbl-${i}`} style={mdStyles.tableWrap}>
          <table style={mdStyles.table}><tbody>{rows}</tbody></table>
        </div>
      );
      continue;
    }

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(<p key={i} style={mdStyles.p}>{parseInline(line)}</p>);
    i++;
  }

  return elements;
}

function parseInline(text) {
  // Handle bold+italic, bold, italic, inline code
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length) {
    // Bold **text**
    const bold = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (bold) {
      if (bold[1]) parts.push(bold[1]);
      parts.push(<strong key={key++}>{parseInline(bold[2])}</strong>);
      remaining = bold[3];
      continue;
    }
    // Italic *text*
    const italic = remaining.match(/^(.*?)\*(.+?)\*(.*)/s);
    if (italic) {
      if (italic[1]) parts.push(italic[1]);
      parts.push(<em key={key++}>{italic[2]}</em>);
      remaining = italic[3];
      continue;
    }
    // Code `text`
    const code = remaining.match(/^(.*?)`(.+?)`(.*)/s);
    if (code) {
      if (code[1]) parts.push(code[1]);
      parts.push(<code key={key++} style={mdStyles.code}>{code[2]}</code>);
      remaining = code[3];
      continue;
    }
    parts.push(remaining);
    break;
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

const INTENT_LABELS = {
  'weekly-report':     { label: 'Weekly Report', color: '#0ea5e9' },
  'work-summary':      { label: 'Work Summary', color: '#7c3aed' },
  'social-reputation': { label: '→ Social Agent', color: '#7c3aed' },
  'lead-response':     { label: '→ Lead Agent', color: '#d97706' },
  'content-strategist':{ label: '→ Content Agent', color: '#059669' },
  'reporting':         { label: '→ Reporting Agent', color: '#0ea5e9' },
  'clarification':     { label: 'Clarification', color: '#64748b' },
  'general':           { label: 'General', color: '#64748b' },
};

export default function Chat({ onTaskCreated }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      intent: null,
      text: `Hi — I'm the AI Team Leader for Okeanos Marketing. I coordinate your five-agent AI team and can answer questions, route tasks, or generate reports on demand.

**Try asking me:**
- "Generate this week's weekly report"
- "Give me a work summary"
- "Draft a follow-up for a new lead"
- "Route an Instagram caption task"
- "What can you help me with?"

All output requires your approval before any action is taken.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text) {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), intent: null };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await getTeamLeaderResponse(text.trim());
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: res.message,
        intent: res.intent,
        routedAgent: res.routedAgent,
        newTask: res.newTask,
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (res.newTask) onTaskCreated(res.newTask);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: 'An error occurred. Please try again.', intent: null },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div style={styles.layout}>
      {/* Left: chat */}
      <div style={styles.chatCol}>
        <div style={styles.chatWindow}>
          {messages.map((msg) => (
            <div key={msg.id} className="fade-in" style={{ ...styles.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ ...styles.msgAvatar, background: LEADER.color }}>{LEADER.avatar}</div>
              )}
              <div style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI) }}>
                {msg.intent && INTENT_LABELS[msg.intent] && (
                  <div style={{ ...styles.intentTag, color: INTENT_LABELS[msg.intent].color }}>
                    {INTENT_LABELS[msg.intent].label}
                  </div>
                )}
                {msg.role === 'assistant' ? (
                  <div style={styles.mdContent}>{renderMarkdown(msg.text)}</div>
                ) : (
                  <p style={styles.userText}>{msg.text}</p>
                )}
                {msg.newTask && (
                  <div style={styles.taskChip}>
                    Task created → {msg.newTask.title.substring(0, 48)}{msg.newTask.title.length > 48 ? '…' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="fade-in" style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
              <div style={{ ...styles.msgAvatar, background: LEADER.color }}>{LEADER.avatar}</div>
              <div style={{ ...styles.bubble, ...styles.bubbleAI }}>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={styles.inputArea}>
          <textarea
            ref={inputRef}
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Message the AI Team Leader…"
            rows={2}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            style={styles.sendBtn}
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>

      {/* Right: suggestions */}
      <div style={styles.sideCol}>
        <div className="card" style={styles.sidePanel}>
          <h3 style={styles.sidePanelTitle}>Quick Prompts</h3>
          <div style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                style={styles.suggestionBtn}
                onClick={() => send(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ ...styles.sidePanel, marginTop: 14 }}>
          <h3 style={styles.sidePanelTitle}>Routing Guide</h3>
          <div style={styles.routeList}>
            {[
              { kw: 'weekly report', agent: 'Reporting Agent', color: '#0ea5e9' },
              { kw: 'social / Instagram', agent: 'Social & Rep. Agent', color: '#7c3aed' },
              { kw: 'lead / follow-up', agent: 'Lead Response Agent', color: '#d97706' },
              { kw: 'blog / SEO / copy', agent: 'Content Strategist', color: '#059669' },
              { kw: 'analytics / GA4', agent: 'Reporting Agent', color: '#0ea5e9' },
            ].map((r) => (
              <div key={r.kw} style={styles.routeRow}>
                <code style={styles.routeKw}>{r.kw}</code>
                <span style={{ ...styles.routeArrow, color: r.color }}>→ {r.agent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    gap: 16,
    height: '100%',
    alignItems: 'flex-start',
  },
  chatCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    minHeight: 0,
    height: 'calc(100vh - var(--header-height) - 48px)',
  },
  chatWindow: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 7,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 2,
  },
  bubble: {
    maxWidth: '72%',
    borderRadius: 10,
    padding: '10px 14px',
    lineHeight: 1.6,
  },
  bubbleAI: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderTopLeftRadius: 3,
  },
  bubbleUser: {
    background: 'var(--color-primary)',
    color: '#fff',
    borderTopRightRadius: 3,
  },
  intentTag: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
    opacity: 0.8,
  },
  mdContent: {
    fontSize: 13,
    color: 'var(--color-text)',
  },
  userText: {
    fontSize: 13,
    color: '#fff',
  },
  taskChip: {
    marginTop: 8,
    background: 'var(--color-green-muted)',
    color: '#065f46',
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 6,
    padding: '4px 8px',
    border: '1px solid #a7f3d0',
  },
  inputArea: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: 'var(--color-text)',
    background: 'var(--color-surface)',
    outline: 'none',
    lineHeight: 1.5,
  },
  sendBtn: {
    alignSelf: 'flex-end',
    padding: '9px 18px',
    borderRadius: 8,
    flexShrink: 0,
  },
  sideCol: {
    width: 240,
    flexShrink: 0,
  },
  sidePanel: {
    padding: '14px 16px',
  },
  sidePanelTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 10,
  },
  suggestions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  suggestionBtn: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 7,
    padding: '7px 10px',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.12s',
  },
  routeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  routeRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  routeKw: {
    fontSize: 11,
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    padding: '1px 5px',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
  },
  routeArrow: {
    fontSize: 11,
    fontWeight: 600,
    paddingLeft: 4,
  },
};

const mdStyles = {
  h1: { fontSize: 15, fontWeight: 700, marginBottom: 6, marginTop: 8, color: 'var(--color-text)' },
  h2: { fontSize: 14, fontWeight: 700, marginBottom: 4, marginTop: 10, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: 4 },
  h3: { fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8, color: 'var(--color-text)' },
  p: { fontSize: 13, marginBottom: 4, lineHeight: 1.6 },
  ul: { paddingLeft: 16, marginBottom: 4 },
  ol: { paddingLeft: 18, marginBottom: 4 },
  li: { fontSize: 13, marginBottom: 2, lineHeight: 1.6 },
  hr: { border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' },
  code: { background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: 3, padding: '1px 4px', fontSize: 12, fontFamily: 'var(--font-mono)' },
  tableWrap: { overflowX: 'auto', marginBottom: 6 },
  table: { borderCollapse: 'collapse', fontSize: 12, width: '100%' },
  th: { background: 'var(--color-surface-2)', borderBottom: '2px solid var(--color-border)', padding: '4px 10px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' },
  td: { borderBottom: '1px solid var(--color-border)', padding: '4px 10px', whiteSpace: 'nowrap' },
};
