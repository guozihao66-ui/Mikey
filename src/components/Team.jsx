import React, { useState } from 'react';
import { AGENTS } from '../data/agents.js';

export default function Team({ onChatWithLeader }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          The Okeanos Marketing AI Team operates on a <strong>draft → review → approve</strong> model.
          Every output is reviewed by your human team before any action is taken. No content is published,
          no email is sent, and no response is posted without your explicit sign-off.
        </p>
      </div>

      <div style={styles.grid}>
        {AGENTS.map((agent) => {
          const isOpen = expanded === agent.id;
          return (
            <div
              key={agent.id}
              className="card"
              style={{ ...styles.card, borderTop: `3px solid ${agent.color}` }}
            >
              <div style={styles.cardTop}>
                <div style={{ ...styles.avatar, background: agent.color }}>
                  {agent.avatar}
                </div>
                <div style={styles.agentMeta}>
                  <div style={styles.agentName}>{agent.name}</div>
                  <div style={styles.agentRole}>{agent.role}</div>
                </div>
                <div style={styles.statusPill}>
                  <span style={styles.statusDot} />
                  Active
                </div>
              </div>

              <p style={styles.description}>{agent.description}</p>

              <button
                style={styles.expandBtn}
                onClick={() => setExpanded(isOpen ? null : agent.id)}
              >
                {isOpen ? 'Hide capabilities ▲' : 'Show capabilities ▼'}
              </button>

              {isOpen && (
                <ul style={styles.capabilities}>
                  {agent.capabilities.map((cap) => (
                    <li key={cap} style={styles.capItem}>
                      <span style={{ color: agent.color, marginRight: 6 }}>▸</span>
                      {cap}
                    </li>
                  ))}
                </ul>
              )}

              {agent.id === 'team-leader' && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
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
    borderRadius: 'var(--radius-lg)',
    padding: '14px 18px',
  },
  introText: {
    fontSize: 13,
    color: 'var(--color-primary)',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  card: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 9,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  agentMeta: { flex: 1 },
  agentName: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text)',
    lineHeight: 1.3,
  },
  agentRole: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: '#065f46',
    background: 'var(--color-green-muted)',
    padding: '2px 8px',
    borderRadius: 99,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--color-green)',
    display: 'inline-block',
  },
  description: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  expandBtn: {
    fontSize: 12,
    color: 'var(--color-primary)',
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
    marginBottom: 0,
  },
  capabilities: {
    marginTop: 10,
    paddingLeft: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    listStyle: 'none',
  },
  capItem: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'flex-start',
  },
};
