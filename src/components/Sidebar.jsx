import React from 'react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'team',      label: 'AI Team',   icon: '◈' },
  { id: 'chat',      label: 'Chat',      icon: '◻' },
  { id: 'tasks',     label: 'Tasks',     icon: '☰' },
  { id: 'reports',   label: 'Reports',   icon: '⊞' },
];

export default function Sidebar({ active, onNav, taskBadge }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.brandMark}>O</div>
        <div>
          <div style={styles.brandName}>Okeanos</div>
          <div style={styles.brandSub}>Marketing AI Team</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {item.id === 'tasks' && taskBadge > 0 && (
                <span style={styles.badge}>{taskBadge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.statusDot} />
        <span style={styles.statusText}>All agents online</span>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    minWidth: 'var(--sidebar-width)',
    background: 'var(--color-primary)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
  },
  brandName: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.2,
  },
  brandSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    lineHeight: 1.2,
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 10px',
    borderRadius: 7,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
  },
  navIcon: {
    fontSize: 15,
    width: 18,
    textAlign: 'center',
    flexShrink: 0,
  },
  navLabel: {
    flex: 1,
  },
  badge: {
    background: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 99,
    padding: '1px 6px',
    minWidth: 18,
    textAlign: 'center',
  },
  footer: {
    padding: '14px 16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#10b981',
    flexShrink: 0,
  },
  statusText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
};
