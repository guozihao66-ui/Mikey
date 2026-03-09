import React from 'react';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Overview — Week of March 9, 2026' },
  team:      { title: 'AI Team',   sub: '5 agents active' },
  chat:      { title: 'Chat',      sub: 'AI Team Leader' },
  tasks:     { title: 'Tasks',     sub: 'Activity & task queue' },
  reports:   { title: 'Reports',   sub: 'Generated outputs' },
};

export default function Header({ page }) {
  const { title, sub } = PAGE_TITLES[page] || PAGE_TITLES.dashboard;
  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.sub}>{sub}</p>
      </div>
      <div style={styles.right}>
        <div style={styles.avatar}>MT</div>
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
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text)',
    lineHeight: 1.2,
  },
  sub: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
  },
};
