import React from 'react';
import { AGENTS } from '../data/agents.js';

const METRICS = [
  {
    label: 'New Leads',
    value: '14',
    change: '+27%',
    changeUp: true,
    sub: 'This week · vs last week',
    icon: '◎',
  },
  {
    label: 'Website Sessions',
    value: '1,842',
    change: '+12%',
    changeUp: true,
    sub: 'GA4 · this week',
    icon: '◐',
  },
  {
    label: 'Lead Response Time',
    value: '23 min',
    change: 'On target',
    changeUp: true,
    sub: 'Target < 30 min',
    icon: '◷',
  },
  {
    label: 'Google Rating',
    value: '4.7 ★',
    change: '2 new reviews',
    changeUp: true,
    sub: '47 total reviews',
    icon: '◆',
  },
  {
    label: 'Ad Spend',
    value: '$4,570',
    change: '4 active campaigns',
    changeUp: null,
    sub: 'Google + Meta · this month',
    icon: '◌',
  },
  {
    label: 'Active Tasks',
    value: '6',
    change: '3 need approval',
    changeUp: null,
    sub: 'In queue / review',
    icon: '◈',
  },
];

const statusMeta = {
  completed:    { label: 'Completed',   cls: 'badge-green' },
  'in-progress':{ label: 'In Progress', cls: 'badge-blue'  },
  'in-review':  { label: 'In Review',   cls: 'badge-amber' },
  pending:      { label: 'Pending',     cls: 'badge-gray'  },
};

const agentColors = Object.fromEntries(AGENTS.map((a) => [a.id, a.color]));
const agentNames  = Object.fromEntries(AGENTS.map((a) => [a.id, a.name]));

// Task counts per agent for status summary
function getAgentTaskCount(tasks, agentId) {
  return tasks.filter((t) => t.assignedTo === agentId).length;
}

const AD_OVERVIEW = {
  spend: '$4,570',
  activeCampaigns: 4,
  leadsFromAds: 11,
  cpl: '$38.20',
  topCampaign: 'Google Search — Fiberglass Pool Quotes',
  worstCampaign: 'Meta Awareness — Spring Visual Teaser',
  recommendation: 'Reallocate part of Meta awareness spend toward high-intent Google search and refresh underperforming creative this week.',
  campaigns: [
    { name: 'Google Search — Fiberglass Pool Quotes', platform: 'Google Ads', spend: '$2,140', leads: 6, cpl: '$356.67', status: 'Top performer' },
    { name: 'Google Search — Pool Installation GTA', platform: 'Google Ads', spend: '$1,120', leads: 3, cpl: '$373.33', status: 'Stable' },
    { name: 'Meta Lead Form — Backyard Renovation', platform: 'Meta Ads', spend: '$860', leads: 2, cpl: '$430.00', status: 'Watch' },
    { name: 'Meta Awareness — Spring Visual Teaser', platform: 'Meta Ads', spend: '$450', leads: 0, cpl: '—', status: 'Worst performer' },
  ],
};

export default function Dashboard({ onNav, approvalCount, tasks = [], approvals = [] }) {
  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  const metrics = [
    { ...METRICS[0], value: String(tasks.filter((t) => t.tags?.includes('leads') || t.assignedTo === 'lead-response').length || 14) },
    METRICS[1],
    METRICS[2],
    METRICS[3],
    { ...METRICS[4], value: AD_OVERVIEW.spend, change: `${AD_OVERVIEW.activeCampaigns} active campaigns` },
    { ...METRICS[5], value: String(tasks.filter((t) => t.status !== 'completed').length), change: `${approvals.filter((a) => !a.resolved).length} need approval` },
  ];

  return (
    <div style={styles.page}>

      {/* Approval alert banner */}
      {approvalCount > 0 && (
        <div style={styles.alertBanner}>
          <span style={styles.alertIcon}>⚠</span>
          <span style={styles.alertText}>
            <strong>{approvalCount} item{approvalCount > 1 ? 's' : ''} awaiting your approval</strong>
            {' '}— review response drafts and campaign briefs are ready.
          </span>
          <button
            className="btn btn-sm"
            style={styles.alertBtn}
            onClick={() => onNav('approvals')}
          >
            Review now
          </button>
        </div>
      )}

      {/* KPI metrics strip */}
      <div style={styles.metricsGrid}>
        {metrics.map((m) => (
          <div key={m.label} className="card" style={styles.metricCard}>
            <div style={styles.metricTop}>
              <div style={styles.metricLabel}>{m.label}</div>
              <div style={styles.metricIconWrap}>{m.icon}</div>
            </div>
            <div style={styles.metricValue}>{m.value}</div>
            <div style={{
              ...styles.metricChange,
              color: m.changeUp === false
                ? 'var(--color-red)'
                : m.changeUp
                ? 'var(--color-green)'
                : 'var(--color-amber)',
            }}>
              {m.changeUp === true && '↑ '}{m.changeUp === false && '↓ '}{m.change}
            </div>
            <div style={styles.metricSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.adPanelWrap}>
        <div className="card" style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Advertising Performance</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('reports')}>View reports</button>
          </div>

          <div style={styles.adSummaryGrid}>
            <div style={styles.adSummaryCard}>
              <div style={styles.adLabel}>Ad Spend</div>
              <div style={styles.adValue}>{AD_OVERVIEW.spend}</div>
            </div>
            <div style={styles.adSummaryCard}>
              <div style={styles.adLabel}>Active Campaigns</div>
              <div style={styles.adValue}>{AD_OVERVIEW.activeCampaigns}</div>
            </div>
            <div style={styles.adSummaryCard}>
              <div style={styles.adLabel}>Leads from Ads</div>
              <div style={styles.adValue}>{AD_OVERVIEW.leadsFromAds}</div>
            </div>
            <div style={styles.adSummaryCard}>
              <div style={styles.adLabel}>CPL</div>
              <div style={styles.adValue}>{AD_OVERVIEW.cpl}</div>
            </div>
          </div>

          <div style={styles.adBreakdownGrid}>
            <div style={styles.adInfoBox}>
              <div style={styles.detailMiniLabel}>Top Campaign</div>
              <div style={styles.adInfoTitle}>{AD_OVERVIEW.topCampaign}</div>
            </div>
            <div style={styles.adInfoBox}>
              <div style={styles.detailMiniLabel}>Worst Campaign</div>
              <div style={styles.adInfoTitle}>{AD_OVERVIEW.worstCampaign}</div>
            </div>
          </div>

          <div style={styles.aiRecBox}>
            <div style={styles.detailMiniLabel}>AI Recommendation</div>
            <div style={styles.aiRecText}>{AD_OVERVIEW.recommendation}</div>
          </div>

          <div style={styles.campaignTableWrap}>
            <table style={styles.campaignTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Campaign</th>
                  <th style={styles.th}>Platform</th>
                  <th style={styles.th}>Spend</th>
                  <th style={styles.th}>Leads</th>
                  <th style={styles.th}>CPL</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {AD_OVERVIEW.campaigns.map((c) => (
                  <tr key={c.name}>
                    <td style={styles.td}>{c.name}</td>
                    <td style={styles.td}>{c.platform}</td>
                    <td style={styles.td}>{c.spend}</td>
                    <td style={styles.td}>{c.leads}</td>
                    <td style={styles.td}>{c.cpl}</td>
                    <td style={styles.td}>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={styles.columns}>

        {/* Left: recent activity */}
        <div style={styles.col}>
          <div className="card" style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Recent Activity</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('tasks')}>View all</button>
            </div>
            <div>
              {recentTasks.map((t) => {
                const sm    = statusMeta[t.status] || statusMeta.pending;
                const color = agentColors[t.assignedTo] || '#64748b';
                return (
                  <div key={t.id} style={styles.activityRow}>
                    <div style={{ ...styles.agentDot, background: color }} />
                    <div style={styles.activityBody}>
                      <div style={styles.activityTitle}>{t.title}</div>
                      <div style={styles.activityMeta}>
                        {agentNames[t.assignedTo] || t.assignedTo}
                        {' · '}
                        <span style={{
                          fontWeight: 600,
                          color: t.priority === 'high'
                            ? 'var(--color-red)'
                            : t.priority === 'medium'
                            ? 'var(--color-amber)'
                            : 'var(--color-text-muted)',
                        }}>
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

        {/* Right: team status + quick actions */}
        <div style={styles.col}>
          <div className="card" style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Team Status</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('team')}>View team</button>
            </div>
            <div>
              {AGENTS.map((a) => {
                const taskCount = getAgentTaskCount(tasks, a.id);
                return (
                  <div key={a.id} style={styles.agentRow}>
                    <div style={{ ...styles.agentAvatar, background: a.color }}>{a.avatar}</div>
                    <div style={styles.agentInfo}>
                      <div style={styles.agentName}>{a.name}</div>
                      <div style={styles.agentRole}>{a.role}</div>
                    </div>
                    <div style={styles.agentRight}>
                      <div style={styles.onlinePill}>
                        <span style={styles.onlineDot} />
                        Active
                      </div>
                      {taskCount > 0 && (
                        <div style={styles.taskCount}>{taskCount} task{taskCount > 1 ? 's' : ''}</div>
                      )}
                    </div>
                  </div>
                );
              })}
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
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onNav('approvals')}>
                Approvals {approvalCount > 0 && `(${approvalCount})`}
              </button>
            </div>
            <div style={styles.actionHint}>
              AI drafts → you approve → team executes.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 18 },
  adPanelWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  adSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    marginBottom: 12,
  },
  adSummaryCard: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '12px 14px',
  },
  adLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  adValue: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  adBreakdownGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 12,
  },
  adInfoBox: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '12px 14px',
  },
  adInfoTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
    lineHeight: 1.5,
  },
  detailMiniLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-muted)',
    marginBottom: 6,
  },
  aiRecBox: {
    background: '#eef6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 12,
  },
  aiRecText: {
    fontSize: 13,
    color: 'var(--color-text)',
    lineHeight: 1.6,
  },
  campaignTableWrap: {
    overflowX: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
  },
  campaignTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    textAlign: 'left',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text)',
    fontWeight: 600,
    padding: '10px 12px',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },

  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
  },
  alertIcon: { fontSize: 14, color: '#d97706', flexShrink: 0 },
  alertText:  { flex: 1, fontSize: 13, color: '#92400e' },
  alertBtn: {
    background: '#d97706',
    color: '#fff',
    border: 'none',
    flexShrink: 0,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  metricCard: { padding: '14px 16px' },
  metricTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricIconWrap: {
    fontSize: 14,
    color: 'var(--color-border-strong)',
  },
  metricValue: {
    fontSize: 22,
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
    gap: 14,
    alignItems: 'start',
  },
  col: { display: 'flex', flexDirection: 'column', gap: 14 },
  panel: { padding: '14px 16px' },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  panelTitle: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)' },

  activityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
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
    fontSize: 12,
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

  agentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid var(--color-border)',
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
  },
  agentInfo: { flex: 1, minWidth: 0 },
  agentName: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  agentRole: { fontSize: 10, color: 'var(--color-text-muted)' },
  agentRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  onlinePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    color: '#065f46',
    background: 'var(--color-green-muted)',
    padding: '2px 7px',
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
  taskCount: {
    fontSize: 10,
    color: 'var(--color-text-muted)',
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
  },
};
