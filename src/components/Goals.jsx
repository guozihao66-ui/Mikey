import React from 'react';

const STATUS_META = {
  'in-progress': { label: 'In Progress', badge: 'badge-blue' },
  'on-track': { label: 'On Track', badge: 'badge-green' },
  watch: { label: 'Watch', badge: 'badge-amber' },
  completed: { label: 'Completed', badge: 'badge-green' },
};

export default function Goals({ goals = [], tasks = [], onNav }) {
  const enrichedGoals = goals.map((goal) => {
    const matchedTasks = tasks.filter((task) =>
      goal.linkedTaskTitles?.includes(task.title) || task.tags?.includes('goal')
    );
    const active = matchedTasks.filter((t) => t.status !== 'completed').length;
    const completed = matchedTasks.filter((t) => t.status === 'completed').length;
    return { ...goal, matchedTasks, active, completed };
  });

  return (
    <div style={styles.page}>
      <div style={styles.hero} className="card">
        <div>
          <div style={styles.eyebrow}>Goals v1</div>
          <h2 style={styles.title}>Translate strategy into visible workstreams.</h2>
          <p style={styles.sub}>
            This view keeps business objectives separate from day-to-day tasks so managers can see
            what the team is trying to achieve, which workstreams are linked, and what to review next.
          </p>
        </div>
        <div style={styles.heroActions}>
          <button className="btn btn-primary" onClick={() => onNav('chat')}>Create Goal via Team Leader</button>
          <button className="btn btn-ghost" onClick={() => onNav('tasks')}>View Linked Tasks</button>
        </div>
      </div>

      <div style={styles.grid}>
        {enrichedGoals.map((goal) => {
          const status = STATUS_META[goal.status] || STATUS_META['in-progress'];
          return (
            <div key={goal.id} className="card" style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.goalTitle}>{goal.title}</div>
                  <div style={styles.goalMeta}>{goal.timeframe} · Priority {goal.priority} · Owner {goal.owner}</div>
                </div>
                <span className={`badge ${status.badge}`}>{status.label}</span>
              </div>

              <p style={styles.summary}>{goal.summary}</p>

              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Linked Tasks</div>
                  <div style={styles.statValue}>{goal.matchedTasks.length || goal.linkedTaskTitles.length}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Active</div>
                  <div style={styles.statValue}>{goal.active}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Completed</div>
                  <div style={styles.statValue}>{goal.completed}</div>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionLabel}>KPI Focus</div>
                <div style={styles.pillRow}>
                  {goal.kpis.map((kpi) => (
                    <span key={kpi} className="badge badge-gray">{kpi}</span>
                  ))}
                </div>
              </div>

              <div style={styles.twoCol}>
                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Linked Workstreams</div>
                  <ul style={styles.list}>
                    {(goal.matchedTasks.length ? goal.matchedTasks.map((t) => t.title) : goal.linkedTaskTitles).map((item) => (
                      <li key={item} style={styles.listItem}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Recommended Next Actions</div>
                  <ul style={styles.list}>
                    {goal.nextActions.map((item) => (
                      <li key={item} style={styles.listItem}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  hero: { padding: '18px 20px', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end' },
  eyebrow: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', marginBottom: 8 },
  title: { fontSize: 24, lineHeight: 1.15, marginBottom: 8, color: 'var(--color-text)' },
  sub: { color: 'var(--color-text-secondary)', maxWidth: 760, lineHeight: 1.6 },
  heroActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  grid: { display: 'grid', gap: 16 },
  card: { padding: '18px 20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  goalTitle: { fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  goalMeta: { fontSize: 12, color: 'var(--color-text-muted)' },
  summary: { color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 14 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 },
  statBox: { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px' },
  statLabel: { fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)' },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' },
  pillRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  list: { paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, margin: 0 },
  listItem: { color: 'var(--color-text)', lineHeight: 1.55 },
};
