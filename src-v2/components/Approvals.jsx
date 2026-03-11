import React, { useEffect, useState } from 'react';
import { AGENTS } from '../../src/data/agents.js';

const agentColors = Object.fromEntries(AGENTS.map((a) => [a.id, a.color]));

const TYPE_BADGES = {
  'Review Response': { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  'Lead Follow-up':  { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  'Campaign Brief':  { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Approvals({ items, onAction }) {
  const [selected, setSelected] = useState(items[0]?.id ?? null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!items.find((i) => i.id === selected)) {
      setSelected(items[0]?.id ?? null);
    }
  }, [items, selected]);

  const pending = items.filter((i) => !i.resolved);
  const resolved = items.filter((i) => i.resolved);
  const activeItem = items.find((i) => i.id === selected) || null;

  useEffect(() => {
    setFeedback(activeItem?.feedback || '');
  }, [activeItem?.id]);

  function handleApprove(id) {
    onAction(id, 'approved', feedback);
  }

  function handleRequestChanges(id) {
    onAction(id, 'changes-requested', feedback);
  }

  return (
    <div style={styles.page}>
      <div style={styles.listCol}>
        <div className="card" style={styles.summaryCard}>
          <div style={styles.summaryTitle}>Approval Workflow</div>
          <div style={styles.summaryText}>This prototype emphasizes governance: AI drafts, humans review, then the team revises or executes.</div>
        </div>

        {pending.length > 0 && (
          <>
            <div style={styles.listSection}>Awaiting Review ({pending.length})</div>
            {pending.map((item) => (
              <ApprovalListItem
                key={item.id}
                item={item}
                active={selected === item.id}
                onClick={() => setSelected(item.id)}
              />
            ))}
          </>
        )}

        {pending.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✓</div>
            <div style={styles.emptyText}>All caught up — no pending approvals.</div>
          </div>
        )}

        {resolved.length > 0 && (
          <>
            <div style={{ ...styles.listSection, marginTop: 16 }}>Resolved ({resolved.length})</div>
            {resolved.map((item) => (
              <ApprovalListItem
                key={item.id}
                item={item}
                active={selected === item.id}
                onClick={() => setSelected(item.id)}
              />
            ))}
          </>
        )}
      </div>

      <div style={styles.detailCol}>
        {activeItem ? (
          <ApprovalDetail
            item={activeItem}
            feedback={feedback}
            setFeedback={setFeedback}
            onApprove={() => handleApprove(activeItem.id)}
            onRequestChanges={() => handleRequestChanges(activeItem.id)}
          />
        ) : (
          <div className="card" style={styles.emptyDetail}>
            <p style={styles.emptyDetailText}>Select an item from the list to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalListItem({ item, active, onClick }) {
  const color = agentColors[item.agent] || '#64748b';
  const isResolved = !!item.resolved;
  return (
    <button
      style={{
        ...styles.listItem,
        ...(active ? styles.listItemActive : {}),
        ...(isResolved ? styles.listItemResolved : {}),
      }}
      onClick={onClick}
    >
      <div style={{ ...styles.listItemDot, background: color }} />
      <div style={styles.listItemBody}>
        <div style={styles.listItemTitle}>{item.title}</div>
        <div style={styles.listItemMeta}>
          {item.agentName} · <span style={{ fontWeight: 600, color: item.priority === 'high' ? 'var(--color-red)' : 'var(--color-amber)' }}>{item.priority}</span>
        </div>
      </div>
      {item.lastAction === 'changes-requested' && !item.resolved && (
        <span style={styles.revisionBadge}>Revision</span>
      )}
      {isResolved && (
        <span style={{
          ...styles.resolvedBadge,
          background: item.resolved === 'approved' ? 'var(--color-green-muted)' : '#fee2e2',
          color: item.resolved === 'approved' ? '#065f46' : '#991b1b',
        }}>
          {item.resolved === 'approved' ? 'Approved' : 'Closed'}
        </span>
      )}
      {!isResolved && !item.lastAction && <span style={styles.pendingDot} />}
    </button>
  );
}

function ApprovalDetail({ item, feedback, setFeedback, onApprove, onRequestChanges }) {
  const color = agentColors[item.agent] || '#64748b';
  const palette = TYPE_BADGES[item.type] || { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  const isResolved = !!item.resolved;

  return (
    <div className="card" style={styles.detail}>
      <div style={styles.detailHeader}>
        <div style={styles.detailHeaderLeft}>
          <div style={{ ...styles.detailAgentDot, background: color }} />
          <div>
            <div style={styles.detailTitle}>{item.title}</div>
            <div style={styles.detailMeta}>{item.agentName} · {formatDate(item.createdAt)}</div>
          </div>
        </div>
        <span style={{ ...styles.typeBadge, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
          {item.type}
        </span>
      </div>

      <div style={styles.detailSection}>
        <div style={styles.detailSectionLabel}>Context</div>
        <p style={styles.detailDesc}>{item.description}</p>
      </div>

      <div style={styles.detailSection}>
        <div style={styles.detailSectionLabel}>Draft Preview</div>
        <div style={styles.previewBox}>
          <pre style={styles.previewText}>{item.preview}</pre>
        </div>
      </div>

      <div style={styles.reviewGrid}>
        <div style={styles.detailSection}>
          <div style={styles.detailSectionLabel}>Reviewer Feedback</div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add revision notes, tone adjustments, execution guidance, or approval conditions here..."
            style={styles.textarea}
            disabled={isResolved && item.resolved === 'approved'}
          />
        </div>

        <div style={styles.detailSection}>
          <div style={styles.detailSectionLabel}>Review Checklist</div>
          <div style={styles.checklistBox}>
            <div style={styles.checkItem}>• Is the tone aligned with Okeanos: trust, professionalism, and clarity?</div>
            <div style={styles.checkItem}>• Does the draft protect brand reputation and avoid overpromising?</div>
            <div style={styles.checkItem}>• Are the next steps, CTA, and ownership clear enough to execute?</div>
            <div style={styles.checkItem}>• If approved, is this ready to move into execution without ambiguity?</div>
          </div>
        </div>
      </div>

      {item.feedback && (
        <div style={styles.feedbackBox}>
          <div style={styles.detailSectionLabel}>Latest Saved Feedback</div>
          <p style={styles.detailDesc}>{item.feedback}</p>
        </div>
      )}

      {!isResolved ? (
        <div style={styles.actions}>
          <button className="btn btn-primary" style={styles.approveBtn} onClick={onApprove}>Approve</button>
          <button className="btn btn-ghost" style={styles.rejectBtn} onClick={onRequestChanges}>Request Changes</button>
          <div style={styles.actionHint}>Use feedback to turn approvals into a revision loop instead of a dead end.</div>
        </div>
      ) : (
        <div style={{
          ...styles.resolvedBanner,
          background: item.resolved === 'approved' ? 'var(--color-green-muted)' : '#fee2e2',
          borderColor: item.resolved === 'approved' ? '#a7f3d0' : '#fca5a5',
          color: item.resolved === 'approved' ? '#065f46' : '#991b1b',
        }}>
          {item.resolved === 'approved'
            ? '✓ Approved — this item has been passed to the team for execution.'
            : '↩ Returned for changes — the team should revise and resubmit.'}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 16,
    alignItems: 'start',
  },
  summaryCard: {
    padding: '12px 14px',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
  listCol: { display: 'flex', flexDirection: 'column', gap: 4 },
  listSection: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-muted)',
    padding: '4px 2px 6px',
  },
  listItem: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8,
    background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
  },
  listItemActive: { border: '1px solid var(--color-primary)', background: 'var(--color-primary-muted)' },
  listItemResolved: { opacity: 0.7 },
  listItemDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  listItemBody: { flex: 1, minWidth: 0 },
  listItemTitle: { fontSize: 12, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  listItemMeta: { fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 },
  revisionBadge: {
    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#fffbeb', color: '#92400e', flexShrink: 0,
  },
  resolvedBadge: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, flexShrink: 0 },
  pendingDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--color-amber)', flexShrink: 0 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '24px 12px', color: 'var(--color-text-muted)' },
  emptyIcon: { fontSize: 24, color: 'var(--color-green)' },
  emptyText: { fontSize: 12, textAlign: 'center' },
  detail: { padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
  detailHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  detailHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  detailAgentDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 3 },
  detailTitle: { fontSize: 14, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3 },
  detailMeta: { fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 },
  typeBadge: { fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, flexShrink: 0 },
  detailSection: { display: 'flex', flexDirection: 'column', gap: 6 },
  detailSectionLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' },
  detailDesc: { fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 },
  previewBox: { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 14px', maxHeight: 320, overflow: 'auto' },
  previewText: { fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 },
  reviewGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 },
  checklistBox: { background: 'var(--color-accent-muted)', border: '1px solid #b6f3f7', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  checkItem: { fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 },
  textarea: {
    minHeight: 96, resize: 'vertical', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px',
    fontSize: 12, lineHeight: 1.6, color: 'var(--color-text)', background: 'var(--color-surface)',
  },
  feedbackBox: { background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 14px' },
  actions: { display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, borderTop: '1px solid var(--color-border)' },
  approveBtn: { minWidth: 100 },
  rejectBtn: { minWidth: 140 },
  actionHint: { flex: 1, fontSize: 11, color: 'var(--color-text-muted)' },
  resolvedBanner: { fontSize: 13, fontWeight: 500, padding: '10px 14px', borderRadius: 8, border: '1px solid' },
  emptyDetail: { padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyDetailText: { fontSize: 13, color: 'var(--color-text-muted)' },
};
