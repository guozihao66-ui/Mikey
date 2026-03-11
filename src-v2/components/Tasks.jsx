import React, { useMemo, useState } from 'react';
import { AGENTS } from '../../src/data/agents.js';

const STATUS_ORDER = ['in-review', 'in-progress', 'pending', 'completed'];

const STATUS_META = {
  completed:     { label: 'Completed',   cls: 'badge-green', icon: '✓' },
  'in-progress': { label: 'In Progress', cls: 'badge-blue',  icon: '↻' },
  'in-review':   { label: 'In Review',   cls: 'badge-amber', icon: '⚑' },
  pending:       { label: 'Pending',     cls: 'badge-gray',  icon: '○' },
};

const PRIORITY_META = {
  high:   { label: 'High',   color: 'var(--color-red)', weight: 3 },
  medium: { label: 'Medium', color: 'var(--color-amber)', weight: 2 },
  low:    { label: 'Low',    color: 'var(--color-text-muted)', weight: 1 },
};

const agentByIds = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getTaskType(task) {
  const tags = task.tags || [];
  const title = (task.title || '').toLowerCase();
  if (tags.includes('goal') || title.includes('growth plan')) return 'goal-planning';
  if (task.assignedTo === 'lead-response' || tags.includes('leads')) return 'lead-response';
  if (task.assignedTo === 'social-reputation' || tags.includes('social') || tags.includes('reputation')) return 'social-reputation';
  if (task.assignedTo === 'content-strategist' || tags.includes('seo') || tags.includes('content')) return 'content';
  if (task.assignedTo === 'reporting' || tags.includes('reporting') || tags.includes('analytics')) return 'reporting';
  if (task.assignedTo === 'growth-ops' || tags.includes('growth-ops') || tags.includes('conversion') || tags.includes('crm')) return 'growth-ops';
  return 'other';
}

const TYPE_LABELS = {
  'goal-planning': 'Goal Planning',
  'lead-response': 'Lead Response',
  'social-reputation': 'Reputation / Social',
  content: 'Content',
  reporting: 'Reporting',
  'growth-ops': 'Growth Ops',
  other: 'Other',
};

export default function Tasks({ tasks }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [outputFilter, setOutputFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated-desc');
  const [selectedId, setSelectedId] = useState(null);

  const FILTERS = [
    { id: 'all', label: 'All Tasks' },
    { id: 'in-review', label: 'In Review' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
  ];

  const filtered = useMemo(() => {
    const list = [...tasks]
      .filter((t) => statusFilter === 'all' || t.status === statusFilter)
      .filter((t) => agentFilter === 'all' || t.assignedTo === agentFilter)
      .filter((t) => typeFilter === 'all' || getTaskType(t) === typeFilter)
      .filter((t) => {
        if (outputFilter === 'all') return true;
        if (outputFilter === 'has-output') return !!t.output;
        if (outputFilter === 'awaiting-approval') return t.status === 'in-review';
        if (outputFilter === 'no-output') return !t.output;
        return true;
      });

    list.sort((a, b) => {
      if (sortBy === 'updated-desc') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'created-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'created-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priority-desc') return (PRIORITY_META[b.priority]?.weight || 0) - (PRIORITY_META[a.priority]?.weight || 0);
      if (sortBy === 'status') return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      return 0;
    });

    return list;
  }, [tasks, statusFilter, agentFilter, typeFilter, outputFilter, sortBy]);

  const selected = filtered.find((t) => t.id === selectedId) || filtered[0] || null;

  const counts = useMemo(() => ({
    total: tasks.length,
    withOutput: tasks.filter((t) => t.output).length,
    inReview: tasks.filter((t) => t.status === 'in-review').length,
    goalPlanning: tasks.filter((t) => getTaskType(t) === 'goal-planning').length,
  }), [tasks]);

  return (
    <div style={styles.layout}>
      <div style={styles.listCol}>
        <div className="card" style={styles.toolbarCard}>
          <div style={styles.toolbarHeader}>
            <div>
              <div style={styles.toolbarTitle}>Tasks v2</div>
              <div style={styles.toolbarSub}>Sort and filter the AI team workload more like a real internal workbench.</div>
            </div>
            <div style={styles.kpiRow}>
              <span className="badge badge-gray">Total {counts.total}</span>
              <span className="badge badge-blue">With output {counts.withOutput}</span>
              <span className="badge badge-amber">In review {counts.inReview}</span>
            </div>
          </div>

          <div style={styles.filterRowPrimary}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  ...styles.filterBtn,
                  ...(statusFilter === f.id ? styles.filterBtnActive : {}),
                }}
              >
                {f.label}
                {f.id !== 'all' && (
                  <span style={styles.filterCount}>{tasks.filter((t) => t.status === f.id).length}</span>
                )}
              </button>
            ))}
          </div>

          <div style={styles.controlsGrid}>
            <FilterControl label="Sort by" value={sortBy} onChange={setSortBy} options={[
              ['updated-desc', 'Recently Updated'],
              ['created-desc', 'Newest Created'],
              ['created-asc', 'Oldest Created'],
              ['priority-desc', 'Highest Priority'],
              ['status', 'Status'],
            ]} />

            <FilterControl label="Assigned agent" value={agentFilter} onChange={setAgentFilter} options={[
              ['all', 'All Agents'],
              ...AGENTS.map((a) => [a.id, a.name]),
            ]} />

            <FilterControl label="Task type" value={typeFilter} onChange={setTypeFilter} options={[
              ['all', 'All Types'],
              ['goal-planning', 'Goal Planning'],
              ['lead-response', 'Lead Response'],
              ['social-reputation', 'Reputation / Social'],
              ['content', 'Content'],
              ['reporting', 'Reporting'],
              ['growth-ops', 'Growth Ops'],
              ['other', 'Other'],
            ]} />

            <FilterControl label="Output / approval" value={outputFilter} onChange={setOutputFilter} options={[
              ['all', 'All States'],
              ['has-output', 'Has Output'],
              ['awaiting-approval', 'Awaiting Approval'],
              ['no-output', 'No Output'],
            ]} />
          </div>
        </div>

        <div style={styles.taskList}>
          {filtered.length === 0 && (
            <div className="card" style={styles.empty}>
              No tasks match the current filters.
            </div>
          )}

          {filtered.map((task) => {
            const sm = STATUS_META[task.status] || STATUS_META.pending;
            const pm = PRIORITY_META[task.priority] || PRIORITY_META.low;
            const agent = agentByIds[task.assignedTo];
            const isActive = selected?.id === task.id;
            const taskType = TYPE_LABELS[getTaskType(task)] || 'Other';

            return (
              <div
                key={task.id}
                className="card"
                onClick={() => setSelectedId(task.id)}
                style={{
                  ...styles.taskCard,
                  ...(isActive ? styles.taskCardActive : {}),
                  borderLeft: `3px solid ${agent?.color || '#64748b'}`,
                }}
              >
                <div style={styles.taskTop}>
                  <span style={{ ...styles.priorityTag, color: pm.color }}>{pm.label}</span>
                  <span className={`badge ${sm.cls}`}>{sm.icon} {sm.label}</span>
                </div>
                <div style={styles.taskTitle}>{task.title}</div>
                <div style={styles.taskMeta}>{agent?.name || task.assignedTo} · Updated {formatDate(task.updatedAt)}</div>
                <div style={styles.cardMetaRow}>
                  <span className="badge badge-gray" style={{ fontSize: 10 }}>{taskType}</span>
                  {task.output && <span className="badge badge-blue" style={{ fontSize: 10 }}>Has Output</span>}
                </div>
                {task.tags && (
                  <div style={styles.tagRow}>
                    {task.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="badge badge-gray" style={{ fontSize: 10 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.detailCol}>
        {selected ? (
          <div className="card" style={styles.detail}>
            <div style={styles.detailHeader}>
              <div style={styles.detailTitleRow}>
                <div>
                  <h2 style={styles.detailTitle}>{selected.title}</h2>
                  <div style={styles.detailPills}>
                    <span className="badge badge-gray">{TYPE_LABELS[getTaskType(selected)] || 'Other'}</span>
                    {selected.output && <span className="badge badge-blue">Output ready</span>}
                  </div>
                </div>
                <span className={`badge ${(STATUS_META[selected.status] || STATUS_META.pending).cls}`}>
                  {(STATUS_META[selected.status] || STATUS_META.pending).label}
                </span>
              </div>
            </div>

            <div style={styles.detailMetaGrid}>
              {[
                { label: 'Assigned to', value: agentByIds[selected.assignedTo]?.name || selected.assignedTo },
                { label: 'Requested by', value: selected.requestedBy === 'team-leader' ? 'AI Team Leader' : selected.requestedBy },
                { label: 'Priority', value: PRIORITY_META[selected.priority]?.label || selected.priority },
                { label: 'Created', value: formatDate(selected.createdAt) },
                { label: 'Updated', value: formatDate(selected.updatedAt) },
                { label: 'Output status', value: selected.output ? 'Draft generated' : 'No draft yet' },
              ].map(({ label, value }) => (
                <div key={label} style={styles.metaCard}>
                  <div style={styles.metaLabel}>{label}</div>
                  <div style={styles.metaValue}>{value}</div>
                </div>
              ))}
            </div>

            <div style={styles.descriptionBox}>
              <div style={styles.descLabel}>Brief</div>
              <p style={styles.description}>{selected.description}</p>
            </div>

            {selected.output && (
              <div style={styles.outputBox}>
                <div style={styles.descLabel}>{selected.outputLabel || 'Latest Output'}</div>
                <pre style={styles.outputText}>{selected.output}</pre>
              </div>
            )}

            <div style={styles.nextActionBox}>
              <div style={styles.descLabel}>Recommended Next Step</div>
              <p style={styles.description}>
                {selected.status === 'in-review'
                  ? 'Review the generated output, then move to Approvals to approve or request changes.'
                  : selected.status === 'in-progress'
                  ? 'Track progress and update the task once the next deliverable is ready.'
                  : selected.status === 'pending'
                  ? 'Prioritize and start execution, or route the task to a specialist workflow.'
                  : 'Task is complete. You can use the output as a reference for future work.'}
              </p>
            </div>

            {selected.status !== 'completed' && (
              <div style={styles.approvalNote}>
                <span style={styles.approvalIcon}>⚑</span>
                {selected.output
                  ? 'A draft output has been generated and is ready for human approval before any action is taken.'
                  : 'This task output requires human approval before any action is taken.'}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ ...styles.detail, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Select a task to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterControl({ label, value, onChange, options }) {
  return (
    <label style={styles.controlWrap}>
      <span style={styles.controlLabel}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
        {options.map(([optValue, optLabel]) => (
          <option key={optValue} value={optValue}>{optLabel}</option>
        ))}
      </select>
    </label>
  );
}

const styles = {
  layout: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    height: '100%',
  },
  listCol: {
    width: 390,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  toolbarCard: {
    padding: '14px',
  },
  toolbarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  toolbarTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 4,
  },
  toolbarSub: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
    maxWidth: 320,
  },
  kpiRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  filterRowPrimary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 10px',
    borderRadius: 99,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  filterBtnActive: {
    background: 'var(--color-primary)',
    color: '#fff',
    borderColor: 'var(--color-primary)',
  },
  filterCount: {
    background: 'rgba(255,255,255,0.25)',
    borderRadius: 99,
    fontSize: 10,
    padding: '0 5px',
    fontWeight: 700,
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  controlWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 10px',
    background: 'var(--color-surface)',
    fontSize: 12,
    color: 'var(--color-text)',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 'calc(100vh - var(--header-height) - 210px)',
    overflowY: 'auto',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 13,
  },
  taskCard: {
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all 0.12s',
  },
  taskCardActive: {
    background: 'var(--color-primary-muted)',
    borderColor: 'var(--color-primary)',
  },
  taskTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityTag: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text)',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    marginBottom: 6,
  },
  cardMetaRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  tagRow: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
  },
  detailCol: {
    flex: 1,
    minHeight: 400,
  },
  detail: {
    padding: '20px',
    height: '100%',
  },
  detailHeader: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: '1px solid var(--color-border)',
  },
  detailTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: 1.4,
    flex: 1,
    marginBottom: 6,
  },
  detailPills: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  detailMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 18,
  },
  metaCard: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '10px 12px',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12,
    color: 'var(--color-text)',
    lineHeight: 1.5,
  },
  descriptionBox: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 14,
  },
  descLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  outputBox: {
    background: '#f8fafc',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 14,
  },
  outputText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontSize: 12,
    lineHeight: 1.65,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
  },
  nextActionBox: {
    background: '#eef6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 14,
  },
  approvalNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--color-amber-muted)',
    border: '1px solid #fcd34d',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 12,
    color: '#92400e',
    fontWeight: 500,
  },
  approvalIcon: { fontSize: 14 },
};
