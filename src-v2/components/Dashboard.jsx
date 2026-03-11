// ── V2 Dashboard — Command Center feel ────────────────────────────────────────
// Key upgrades:
//   - Hero banner with clear product positioning statement
//   - "AI drafts, humans approve" model explicitly shown
//   - Better metric card design with trend arrows
//   - Agent status row with live task counts
//   - Next action recommendation card

import React from 'react';
import { AGENTS } from '../../src/data/agents.js';

const agentColors = Object.fromEntries(AGENTS.map((a) => [a.id, a.color]));
const agentNames  = Object.fromEntries(AGENTS.map((a) => [a.id, a.name]));

const METRICS = [
  { label: 'New Leads', value: '14', change: '+27%', up: true,  sub: 'This week · vs last week',    icon: '◎' },
  { label: 'Sessions',  value: '1,842', change: '+12%', up: true, sub: 'GA4 · this week',            icon: '◐' },
  { label: 'Response',  value: '23 min', change: 'On target', up: true, sub: 'Target < 30 min',      icon: '◷' },
  { label: 'Rating',    value: '4.7 ★', change: '2 new reviews', up: true, sub: '47 total reviews', icon: '◆' },
  { label: 'Ad Spend',  value: '$4,570', change: '4 campaigns', up: null, sub: 'Google + Meta · month', icon: '◌' },
  { label: 'Active Tasks', value: '—',  change: '—', up: null, sub: 'In queue / review',            icon: '◈' },
];

const AD_OVERVIEW = {
  spend: '$4,570',
  activeCampaigns: 4,
  leadsFromAds: 11,
  cpl: '$38.20',
  topCampaign: 'Google Search — Fiberglass Pool Quotes',
  worstCampaign: 'Meta Awareness — Spring Visual Teaser',
  recommendation: 'Reallocate part of Meta awareness spend toward high-intent Google search. Refresh Meta creative before next cycle.',
  campaigns: [
    { name: 'Google Search — Fiberglass Pool Quotes', platform: 'Google Ads', spend: '$2,140', leads: 6, cpl: '$356.67', status: 'Top performer' },
    { name: 'Google Search — Pool Installation GTA',  platform: 'Google Ads', spend: '$1,120', leads: 3, cpl: '$373.33', status: 'Stable' },
    { name: 'Meta Lead Form — Backyard Renovation',   platform: 'Meta Ads',   spend: '$860',   leads: 2, cpl: '$430.00', status: 'Watch' },
    { name: 'Meta Awareness — Spring Visual Teaser',  platform: 'Meta Ads',   spend: '$450',   leads: 0, cpl: '—',       status: 'Worst performer' },
  ],
};

const statusMeta = {
  completed:    { label: 'Completed',   cls: 'badge-green' },
  'in-progress':{ label: 'In Progress', cls: 'badge-blue'  },
  'in-review':  { label: 'In Review',   cls: 'badge-amber' },
  pending:      { label: 'Pending',     cls: 'badge-gray'  },
};

export default function Dashboard({ onNav, approvalCount, tasks = [], approvals = [] }) {
  const recentTasks   = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  const activeTasks   = tasks.filter((t) => t.status !== 'completed').length;
  const pendingApprov = approvals.filter((a) => !a.resolved).length;

  const metrics = [
    METRICS[0],
    METRICS[1],
    METRICS[2],
    METRICS[3],
    { ...METRICS[4], value: AD_OVERVIEW.spend, change: `${AD_OVERVIEW.activeCampaigns} campaigns` },
    { ...METRICS[5], value: String(activeTasks), change: `${pendingApprov} need approval` },
  ];

  return (
    <div style={s.page}>

      {/* ── Approval alert banner ──────────────── */}
      {approvalCount > 0 && (
        <div style={s.alertBanner}>
          <span style={s.alertIcon}>⚠</span>
          <span style={s.alertText}>
            <strong>{approvalCount} item{approvalCount > 1 ? 's' : ''} need your approval</strong>
            {' '}— review response drafts and campaign briefs are ready.
          </span>
          <button className="btn btn-sm" style={s.alertBtn} onClick={() => onNav('approvals')}>
            Review now →
          </button>
        </div>
      )}

      {/* ── Hero / positioning banner ──────────── */}
      <div className="card" style={s.heroBanner}>
        <div style={s.heroLeft}>
          <div style={s.eyebrow}>Okeanos AI Team · Ocean Professional</div>
          <h2 style={s.heroTitle}>A trust-first operating system for growth, leads, and reputation.</h2>
          <p style={s.heroSub}>Built around Okeanos priorities: trust, professionalism, affordability, fast response, and visible approval control.</p>
        </div>
        <div style={s.heroActions}>
          <button className="btn btn-primary" onClick={() => onNav('chat')}>
            Chat with Team Leader
          </button>
          <button className="btn btn-ghost" style={s.approvalsBtn} onClick={() => onNav('approvals')}>
            Approvals {approvalCount > 0 && `(${approvalCount})`}
          </button>
        </div>
      </div>

      {/* ── Metric strip ──────────────────────── */}
      <div style={s.metricGrid}>
        {metrics.map((m) => (
          <div key={m.label} className="card" style={s.metricCard}>
            <div style={s.metricTop}>
              <span style={s.metricLabel}>{m.label}</span>
              <span style={s.metricIcon}>{m.icon}</span>
            </div>
            <div style={s.metricValue}>{m.value}</div>
            <div style={{
              ...s.metricChange,
              color: m.up === true ? 'var(--color-green)' : m.up === false ? 'var(--color-red)' : 'var(--color-amber)',
            }}>
              {m.up === true && '↑ '}{m.up === false && '↓ '}{m.change}
            </div>
            <div style={s.metricSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Agent status strip ────────────────── */}
      <div className="card" style={s.agentStrip}>
        <div style={s.stripHeader}>
          <span style={s.stripTitle}>Team Status</span>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('team')}>View team →</button>
        </div>
        <div style={s.agentRow}>
          {AGENTS.map((a) => {
            const count = tasks.filter((t) => t.assignedTo === a.id && t.status !== 'completed').length;
            return (
              <div key={a.id} style={s.agentPill}>
                <div style={{ ...s.agentAvatar, background: a.color }}>{a.avatar}</div>
                <div style={s.agentInfo}>
                  <div style={s.agentName}>{a.name.replace(' Agent', '')}</div>
                  <div style={s.agentStat}>
                    <span style={s.activeDot} className="pulse" />
                    {count > 0 ? `${count} active` : 'Ready'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Middle columns: ad perf + activity ── */}
      <div style={s.columns}>
        <div style={s.col}>
          {/* Ad Performance */}
          <div className="card" style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>Advertising Performance</span>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('reports')}>View reports →</button>
            </div>
            <div style={s.adMiniGrid}>
              <div style={s.adMiniCard}><div style={s.adMiniLabel}>Spend</div><div style={s.adMiniVal}>{AD_OVERVIEW.spend}</div></div>
              <div style={s.adMiniCard}><div style={s.adMiniLabel}>Campaigns</div><div style={s.adMiniVal}>{AD_OVERVIEW.activeCampaigns}</div></div>
              <div style={s.adMiniCard}><div style={s.adMiniLabel}>Leads</div><div style={s.adMiniVal}>{AD_OVERVIEW.leadsFromAds}</div></div>
              <div style={s.adMiniCard}><div style={s.adMiniLabel}>CPL</div><div style={s.adMiniVal}>{AD_OVERVIEW.cpl}</div></div>
            </div>

            <div style={s.aiRecBox}>
              <div style={s.miniLabel}>AI Recommendation</div>
              <p style={s.aiRecText}>{AD_OVERVIEW.recommendation}</p>
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Campaign', 'Platform', 'Spend', 'Leads', 'CPL', 'Status'].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AD_OVERVIEW.campaigns.map((c) => (
                    <tr key={c.name}>
                      <td style={s.td}>{c.name}</td>
                      <td style={s.td}>{c.platform}</td>
                      <td style={s.td}>{c.spend}</td>
                      <td style={s.td}>{c.leads}</td>
                      <td style={s.td}>{c.cpl}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusPill,
                          background: c.status === 'Top performer' ? 'var(--color-green-muted)' : c.status === 'Worst performer' ? 'var(--color-red-muted)' : 'var(--color-surface-2)',
                          color: c.status === 'Top performer' ? '#065f46' : c.status === 'Worst performer' ? '#991b1b' : 'var(--color-text-secondary)',
                        }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={s.col}>
          {/* Recent Activity */}
          <div className="card" style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>Recent Activity</span>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('tasks')}>View all →</button>
            </div>
            {recentTasks.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No tasks yet — start by chatting with the Team Leader.
              </p>
            )}
            {recentTasks.map((t) => {
              const sm = statusMeta[t.status] || statusMeta.pending;
              return (
                <div key={t.id} style={s.activityRow}>
                  <div style={{ ...s.activityDot, background: agentColors[t.assignedTo] || '#94a3b8' }} />
                  <div style={s.activityBody}>
                    <div style={s.activityTitle}>{t.title}</div>
                    <div style={s.activityMeta}>
                      {agentNames[t.assignedTo] || t.assignedTo}
                      {' · '}
                      <span style={{ fontWeight: 600, color: t.priority === 'high' ? 'var(--color-red)' : t.priority === 'medium' ? 'var(--color-amber)' : 'var(--color-text-muted)' }}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${sm.cls}`}>{sm.label}</span>
                </div>
              );
            })}
          </div>

          {/* Next recommended action */}
          <div className="card" style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>Recommended Next Action</span>
            </div>
            <div style={s.nextActionCard}>
              {approvalCount > 0 ? (
                <>
                  <div style={s.nextActionIcon}>⚠</div>
                  <div>
                    <div style={s.nextActionTitle}>{approvalCount} item{approvalCount > 1 ? 's' : ''} awaiting approval</div>
                    <div style={s.nextActionSub}>Review and approve pending drafts to keep the team moving.</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => onNav('approvals')}>
                      Open Approvals →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={s.nextActionIcon}>◎</div>
                  <div>
                    <div style={s.nextActionTitle}>Set a growth goal</div>
                    <div style={s.nextActionSub}>Tell the AI Team Leader your next objective and it will create structured workstreams across your agents.</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => onNav('chat')}>
                      Chat with Team Leader →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },

  alertBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius)', padding: '10px 14px',
  },
  alertIcon: { fontSize: 14, color: '#d97706', flexShrink: 0 },
  alertText: { flex: 1, fontSize: 13, color: '#92400e' },
  alertBtn: { background: '#d97706', color: '#fff', border: 'none', flexShrink: 0 },

  heroBanner: {
    padding: '18px 22px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, #0b2d4d 0%, #1275bc 58%, #12d6e5 120%)',
    borderColor: '#0b2d4d',
    boxShadow: '0 18px 40px rgba(18,117,188,0.18)',
  },
  heroLeft: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  heroTitle: { fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 6 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 },
  heroActions: { display: 'flex', gap: 8, flexShrink: 0 },
  approvalsBtn: {
    color: '#e5eef8',
    borderColor: 'rgba(255,255,255,0.28)',
    fontWeight: 700,
    letterSpacing: '0.01em',
    textShadow: '0 1px 0 rgba(0,0,0,0.18)',
  },

  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 },
  metricCard: { padding: '12px 14px' },
  metricTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metricLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' },
  metricIcon: { fontSize: 13, color: 'var(--color-border-strong)' },
  metricValue: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1, marginBottom: 3 },
  metricChange: { fontSize: 11, fontWeight: 600, marginBottom: 1 },
  metricSub: { fontSize: 10, color: 'var(--color-text-muted)' },

  agentStrip: { padding: '12px 16px' },
  stripHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stripTitle: { fontSize: 12, fontWeight: 600, color: 'var(--color-text)' },
  agentRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  agentPill: {
    display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 130,
    background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
    borderRadius: 8, padding: '8px 10px',
  },
  agentAvatar: { width: 26, height: 26, borderRadius: 6, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 },
  agentInfo: { minWidth: 0 },
  agentName: { fontSize: 11, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  agentStat: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 },
  activeDot: { width: 5, height: 5, borderRadius: '50%', background: 'var(--color-green)', display: 'inline-block', flexShrink: 0 },

  columns: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12, alignItems: 'start' },
  col: { display: 'flex', flexDirection: 'column', gap: 12 },
  panel: { padding: '14px 16px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  panelTitle: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)' },

  adMiniGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 },
  adMiniCard: { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 7, padding: '9px 10px' },
  adMiniLabel: { fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' },
  adMiniVal: { fontSize: 18, fontWeight: 700, color: 'var(--color-text)' },
  aiRecBox: { background: '#eef6ff', border: '1px solid #bfdbfe', borderRadius: 7, padding: '10px 12px', marginBottom: 10 },
  miniLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 },
  aiRecText: { fontSize: 12, color: 'var(--color-text)', lineHeight: 1.55 },

  tableWrap: { overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 7 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
  th: { textAlign: 'left', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', fontWeight: 600, padding: '8px 10px', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 10 },
  td: { padding: '8px 10px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', fontSize: 11 },
  statusPill: { display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99 },

  activityRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--color-border)' },
  activityDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  activityBody: { flex: 1, minWidth: 0 },
  activityTitle: { fontSize: 12, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  activityMeta: { fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 },

  nextActionCard: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  nextActionIcon: { fontSize: 22, color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 },
  nextActionTitle: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 },
  nextActionSub: { fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.55 },
};
