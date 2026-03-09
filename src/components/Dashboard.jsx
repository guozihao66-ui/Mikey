import React from 'react';
import { AGENTS } from '../data/agents.js';
import { INITIAL_TASKS } from '../data/tasks.js';

const METRICS = [
  { label: 'New Leads (Week)', value: '14', change: '+27%', up: true, sub: 'vs last week' },
  { label: 'Website Sessions', value: '1,842', change: '+12%', up: true, sub: 'GA4 · this week' },
  { label: 'Avg. Response Time', value: '23 min', change: '✅ On target', up: true, sub: 'Target < 30 min' },
  { label: 'Google Rating', value: '4.7 ★', change: '47 reviews', up: true, sub: '2 new this week' },
  { label: 'Google Ads CPC', value: '$4.82', change: '-26%', up: true, sub: 'vs last week' },
  { label: 'Tasks Active', value: '4', change: '2 need approval', up: null, sub: 'In progress / review' },
];

const statusMeta = {
  completed:   { label: 'Completed', cls: 'badge-green' },
  'in-progress': { label: 'In Progress', cls: 'badge-blue' },
  'in-review': { label: 'In Review', cls: 'badge-amber' },
  pending:     { label: 'Pending', cls: 'badge-gray' },
};

const agentColors = Object.fromEntries(AGENTS.map((a) => [a.id, a.color]));
const agentNames  = Object.fromEntries(AGENTS.map((a) => [a.id, a.name]));

export default function Dashboard({ onNav }) {
  const recentTasks = [...INITIAL_TASKS].slice(0, 4);

  return (
    <div style={styles.page}>
      {/* Metrics strip */}
      <div style={styles.metricsGrid}>
        {METRICS.map((m) => (
          <div key={m.label} className="card" style={styles.metricCard}>
            <div style={styles.metricLabel}>{m.label}</div>
            <div style={styles.metricValue}>{m.value}</div>
            <div style={{ ...styles.metricChange, color: m.up === false ? 'var(--color-red)' : m.up ? 'var(--color-green)' : 'var(--color-text-muted)' }}>
              {m.change}
            </div>
            <div style={styles.metricSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.columns}>
        {/* Left: activity feed */}
        <div style={styles.col}>
          <div className="card" style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Recent Activity</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('tasks')}>View all</button>
            </div>
            <div>
              {recentTasks.map((t) => {
                const sm = statusMeta[t.status] || statusMeta.pending;
                const color = agentColors[t.assignedTo] || '#64748b';
                return (
                  <div key={t.id} style={styles.activityRow}>
                    <div style={{ ...styles.agentDot, background: color }} />
                    <div style={styles.activityBody}>
                      <div style={styles.activityTitle}>{t.title}</div>
                      <div style={styles.activityMeta}>
                        {agentNames[t.assignedTo]} ·{' '}
                        <span style={{ ...styles.priorityDot, color: t.priority === 'high' ? 'var(--color-red)' : t.priority === 'medium' ? 'var(--color-amber)' : 'var(--color-text-muted)' }}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${sm.cls}`}>{sm.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: agent status + quick actions */}
        <div style={styles.col}>
          <div className="card" style={{ ...styles.panel, marginBottom: 16 }}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Agent Status</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('team')}>View team</button>
            </div>
            <div>
              {AGENTS.map((a) => (
                <div key={a.id} style={styles.agentRow}>
                  <div style={{ ...styles.agentAvatar, background: a.color }}>{a.avatar}</div>
                  <div style={styles.agentInfo}>
                    <div style={styles.agentName}>{a.name}</div>
                    <div style={styles.agentRole}>{a.role}</div>
                  </div>
                  <div style={styles.onlinePill}>
                    <span style={styles.onlineDot} />
                    Online
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Quick Actions</h2>
            </div>
            <div style={styles.quickActions}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onNav('chat')}>
                Chat with Team Leader
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onNav('reports')}>
                View Reports
              </button>
            </div>
            <div style={styles.actionHint}>
              All AI outputs require human approval before action.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
  },
  metricCard: {
    padding: '16px 18px',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: 1,
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    alignItems: 'start',
  },
  col: { display: 'flex', flexDirection: 'column', gap: 16 },
  panel: { padding: '16px 18px' },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  activityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 0',
    borderBottom: '1px solid var(--color-border)',
  },
  agentDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  activityBody: { flex: 1, minWidth: 0 },
  activityTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activityMeta: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    marginTop: 1,
  },
  priorityDot: { fontWeight: 600, textTransform: 'capitalize' },
  agentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid var(--color-border)',
  },
  agentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 6,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 13, fontWeight: 500, color: 'var(--color-text)' },
  agentRole: { fontSize: 11, color: 'var(--color-text-muted)' },
  onlinePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: '#065f46',
    background: 'var(--color-green-muted)',
    padding: '2px 8px',
    borderRadius: 99,
    fontWeight: 600,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--color-green)',
    display: 'inline-block',
  },
  quickActions: {
    display: 'flex',
    gap: 8,
    marginBottom: 10,
  },
  actionHint: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    padding: '2px 0',
  },
};
