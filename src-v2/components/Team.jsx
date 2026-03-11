import React, { useState } from 'react';
import { AGENTS } from '../../src/data/agents.js';

const ROLE_COLORS = {
  'team-leader':      { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  'social-reputation':{ bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  'content-strategist':{ bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },
  'lead-response':    { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  'reporting':        { bg: '#e0f2fe', border: '#bae6fd', text: '#0369a1' },
  'growth-ops':       { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239' },
};

export default function Team({ onChatWithLeader }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={styles.page}>

      <div style={styles.intro}>
        <p style={styles.introText}>
          The Okeanos Marketing AI Team is a compact 6-agent operating model built around
          <strong> trust, professionalism, affordability, and approval control</strong>. Every output is reviewed by your
          human team before any action is taken. No content is published, no email is sent,
          and no response is posted without explicit sign-off.
        </p>
      </div>

      <div style={styles.grid}>
        {AGENTS.map((agent) => {
          const isOpen  = expanded === agent.id;
          const palette = ROLE_COLORS[agent.id] || { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' };

          return (
            <div
              key={agent.id}
              className="card"
              style={{
                ...styles.card,
                borderTop: `3px solid ${agent.color}`,
              }}
            >
              {/* Card header */}
              <div style={styles.cardTop}>
                <div style={{ ...styles.avatar, background: agent.color }}>
                  {agent.avatar}
                </div>
                <div style={styles.agentMeta}>
                  <div style={styles.agentName}>{agent.name}</div>
                  <div style={{
                    ...styles.roleBadge,
                    background: palette.bg,
                    border: `1px solid ${palette.border}`,
                    color: palette.text,
                  }}>
                    {agent.role}
                  </div>
                </div>
                <div style={styles.statusPill}>
                  <span style={styles.statusDot} />
                  Active
                </div>
              </div>

              {/* Description */}
              <p style={styles.description}>{agent.description}</p>

              {/* Capabilities toggle */}
              <button
                style={styles.expandBtn}
                onClick={() => setExpanded(isOpen ? null : agent.id)}
              >
                {isOpen ? '▲ Hide capabilities' : '▼ Show capabilities'}
              </button>

              {isOpen && (
                <ul style={styles.capabilities}>
                  {agent.capabilities.map((cap) => (
                    <li key={cap} style={styles.capItem}>
                      <span style={{ ...styles.capBullet, color: agent.color }}>▸</span>
                      {cap}
                    </li>
                  ))}
                </ul>
              )}

              {/* Chat button for Team Leader */}
              {agent.id === 'team-leader' && (
                <button
                  className="btn btn-primary"
                  style={styles.chatBtn}
                  onClick={onChatWithLeader}
                >
                  Open Chat
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  intro: {
    background: 'var(--color-primary-muted)',
    border: '1px solid #bfdbfe',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
  },
  introText: {
    fontSize: 13,
    color: 'var(--color-primary)',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
  },
  card: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  agentMeta: { flex: 1, minWidth: 0 },
  agentName: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
    lineHeight: 1.3,
    marginBottom: 4,
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 99,
    letterSpacing: '0.01em',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    color: '#065f46',
    background: 'var(--color-green-muted)',
    padding: '2px 7px',
    borderRadius: 99,
    flexShrink: 0,
    marginTop: 2,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--color-green)',
    display: 'inline-block',
  },
  description: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  expandBtn: {
    fontSize: 11,
    color: 'var(--color-primary)',
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
  },
  capabilities: {
    marginTop: 8,
    paddingLeft: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    listStyle: 'none',
  },
  capItem: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  },
  capBullet: {
    fontSize: 10,
    marginTop: 1,
    flexShrink: 0,
  },
  chatBtn: {
    marginTop: 12,
    width: '100%',
    justifyContent: 'center',
    fontSize: 12,
    padding: '7px 12px',
  },
};
