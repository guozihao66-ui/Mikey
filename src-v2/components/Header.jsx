// ── V2 Header ───────────────────────────────────────────────────────────────
// Changes vs V1:
//   - Shows the current page context with a dynamic badge
//   - "V2 Preview" label with accent color instead of plain amber "Prototype Mode"
//   - Cleaner right-side layout

import React from 'react';

const PAGE_META = {
  dashboard: { title: 'Dashboard',       sub: 'Command Center — Week of March 9, 2026',      badge: null },
  goals:     { title: 'Goals',           sub: 'Business objectives and linked workstreams',    badge: null },
  team:      { title: 'AI Team',         sub: '6 agents · all active',                         badge: 'team' },
  chat:      { title: 'Command Chat',    sub: 'AI Team Leader · routing & task creation',       badge: 'live' },
  tasks:     { title: 'Tasks',           sub: 'Active task queue',                              badge: null },
  reports:   { title: 'Reports',         sub: 'Generated outputs & analytics',                  badge: null },
  approvals: { title: 'Approvals',       sub: 'Items awaiting your sign-off',                   badge: 'action' },
  playbooks: { title: 'Playbooks',       sub: 'Standard workflows & processes',                 badge: null },
};

const BADGE_STYLES = {
  live:   { bg: '#dcfce7', color: '#15803d', text: '● Live' },
  action: { bg: '#fffbeb', color: '#92400e', text: '⚠ Action needed' },
  team:   { bg: '#dbeafe', color: '#1e40af', text: '◈ All active' },
};

export default function Header({ page }) {
  const meta = PAGE_META[page] || PAGE_META.dashboard;
  const badgeStyle = meta.badge ? BADGE_STYLES[meta.badge] : null;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{meta.title}</h1>
          {badgeStyle && (
            <span style={{ ...styles.contextBadge, background: badgeStyle.bg, color: badgeStyle.color }}>
              {badgeStyle.text}
            </span>
          )}
        </div>
        <p style={styles.sub}>{meta.sub}</p>
      </div>
      <div style={styles.right}>
        <div style={styles.v2Badge}>Prototype Mode</div>
        <div style={styles.modelBadge}>workflow-first</div>
        <div style={styles.avatar} title="Marketing Team">OK</div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 'var(--header-height)',
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  left: {},
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: 1.2,
  },
  contextBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 99,
    letterSpacing: '0.03em',
  },
  sub: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    marginTop: 1,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
  },
  v2Badge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0b5d78',
    background: 'var(--color-accent-muted)',
    border: '1px solid #a5f3fc',
    borderRadius: 6,
    padding: '3px 9px',
    letterSpacing: '0.02em',
  },
  modelBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    padding: '3px 9px',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'default',
  },
};
