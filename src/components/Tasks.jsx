import React, { useState } from 'react';
import { AGENTS } from '../data/agents.js';

const STATUS_ORDER = ['in-review', 'in-progress', 'pending', 'completed'];

const STATUS_META = {
  completed:     { label: 'Completed',   cls: 'badge-green', icon: '✓' },
  'in-progress': { label: 'In Progress', cls: 'badge-blue',  icon: '↻' },
  'in-review':   { label: 'In Review',   cls: 'badge-amber', icon: '⚑' },
  pending:       { label: 'Pending',     cls: 'badge-gray',  icon: '○' },
};

const PRIORITY_META = {
  high:   { label: 'High',   color: 'var(--color-red)' },
  medium: { label: 'Medium', color: 'var(--color-amber)' },
  low:    { label: 'Low',    color: 'var(--color-text-muted)' },
};

const agentByIds = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

export default function Tasks({ tasks }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const FILTERS = [
    { id: 'all', label: 'All Tasks' },
    { id: 'in-review', label: 'In Review' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
  ];

  const filtered = [...tasks]
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  const selected = filtered.find((t) => t.id === selectedId) || filtered[0] || null;

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.layout}>
      {/* List */}
      <div style={styles.listCol}>
        <div style={styles.filterRow}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                ...styles.filterBtn,
                ...(filter === f.id ? styles.filterBtnActive : {}),
              }}
            >
              {f.label}
              {f.id !== 'all' && (
                <span style={styles.filterCount}>
                  {tasks.filter((t) => t.status === f.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={styles.taskList}>
          {filtered.length === 0 && (
            <div style={styles.empty}>No tasks for this filter.</div>
          )}
          {filtered.map((task) => {
            const sm = STATUS_META[task.status] || STATUS_META.pending;
            const pm = PRIORITY_META[task.priority] || PRIORITY_META.low;
            const agent = agentByIds[task.assignedTo];
            const isActive = selected?.id === task.id;

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
                <div style={styles.taskMeta}>
                  {agent?.name || task.assignedTo} · Updated {formatDate(task.updatedAt)}
                </div>
                {task.tags && (
                  <div style={styles.tagRow}>
                    {task.tags.map((tag) => (
                      <span key={tag} className="badge badge-gray" style={{ fontSize: 10 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div style={styles.detailCol}>
        {selected ? (
          <div className="card" style={styles.detail}>
            <div style={styles.detailHeader}>
              <div style={styles.detailTitleRow}>
                <h2 style={styles.detailTitle}>{selected.title}</h2>
                <span className={`badge ${(STATUS_META[selected.status] || STATUS_META.pending).cls}`}>
                  {(STATUS_META[selected.status] || STATUS_META.pending).label}
                </span>
              </div>
            </div>

            <div style={styles.detailMeta}>
              {[
                { label: 'Assigned to', value: agentByIds[selected.assignedTo]?.name || selected.assignedTo },
                { label: 'Requested by', value: selected.requestedBy === 'team-leader' ? 'AI Team Leader' : selected.requestedBy },
                { label: 'Priority', value: PRIORITY_META[selected.priority]?.label || selected.priority },
                { label: 'Created', value: formatDate(selected.createdAt) },
                { label: 'Updated', value: formatDate(selected.updatedAt) },
              ].map(({ label, value }) => (
                <div key={label} style={styles.metaRow}>
                  <span style={styles.metaLabel}>{label}</span>
                  <span style={styles.metaValue}>{value}</span>
                </div>
              ))}
            </div>

            <div style={styles.descriptionBox}>
              <div style={styles.descLabel}>Brief</div>
              <p style={styles.description}>{selected.description}</p>
            </div>

            {selected.status !== 'completed' && (
              <div style={styles.approvalNote}>
                <span style={styles.approvalIcon}>⚑</span>
                This task output requires human approval before any action is taken.
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

const styles = {
  layout: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    height: '100%',
  },
  listCol: {
    width: 320,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
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
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 'calc(100vh - var(--header-height) - 120px)',
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
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text)',
    lineHeight: 1.4,
    flex: 1,
  },
  detailMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 18,
  },
  metaRow: {
    display: 'flex',
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    width: 100,
    flexShrink: 0,
  },
  metaValue: {
    fontSize: 12,
    color: 'var(--color-text)',
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
