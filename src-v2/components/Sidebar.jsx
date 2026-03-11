// ── V2 Sidebar ─────────────────────────────────────────────────────────────
// Changes vs V1:
//   - Richer brand section with "V2 Preview" pill
//   - Section dividers in nav (Operations / Analysis)
//   - Active item uses a solid accent indicator
//   - Footer shows agent count + quick status

import React from 'react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: '▦', section: null },
  { id: 'goals',     label: 'Goals',      icon: '◎', section: null },
  { id: 'chat',      label: 'Command Chat', icon: '◻', section: 'Operations' },
  { id: 'approvals', label: 'Approvals',  icon: '✓', badge: 'approvalBadge', section: null },
  { id: 'tasks',     label: 'Tasks',      icon: '☰', badge: 'taskBadge', section: null },
  { id: 'team',      label: 'AI Team',    icon: '◈', section: 'Insights' },
  { id: 'reports',   label: 'Reports',    icon: '⊞', section: null },
  { id: 'playbooks', label: 'Playbooks',  icon: '◑', section: null },
];

export default function Sidebar({ active, onNav, taskBadge, approvalBadge }) {
  const badges = { taskBadge, approvalBadge };
  let lastSection = null;

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.logoWrap}>
          <div style={styles.logoO}>O</div>
        </div>
        <div style={styles.brandText}>
          <div style={styles.brandName}>Okeanos</div>
          <div style={styles.brandRow}>
            <div style={styles.brandSub}>Marketing AI Team</div>
            <div style={styles.v2Pill}>PM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map((item) => {
          const isActive = active === item.id;
          const badgeCount = item.badge ? badges[item.badge] : 0;
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div style={styles.navSection}>{item.section}</div>
              )}
              <button
                onClick={() => onNav(item.id)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
                {badgeCount > 0 && (
                  <span style={{
                    ...styles.badge,
                    ...(item.id === 'approvals' ? styles.badgeAmber : {}),
                  }}>
                    {badgeCount}
                  </span>
                )}
                {isActive && <span style={styles.activeBar} />}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerPulse}>
          <span style={styles.pulseDot} className="pulse" />
          <span style={styles.footerText}>6 agents active</span>
        </div>
        <div style={styles.footerMode}>AI-draft · human-approve</div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    minWidth: 'var(--sidebar-width)',
    background: '#0b1e34',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '18px 14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: 'linear-gradient(135deg, #0f4c81 0%, #0ea5e9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
  },
  logoO: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 800,
  },
  brandText: { minWidth: 0 },
  brandName: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.2,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  brandSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
  },
  v2Pill: {
    background: 'rgba(245,158,11,0.18)',
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: 800,
    padding: '1px 6px',
    borderRadius: 99,
    letterSpacing: '0.06em',
  },
  nav: {
    flex: 1,
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    overflowY: 'auto',
  },
  navSection: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.25)',
    padding: '10px 10px 4px',
  },
  navItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    width: '100%',
    padding: '8px 10px',
    borderRadius: 7,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.13s',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  navIcon: {
    fontSize: 13,
    width: 17,
    textAlign: 'center',
    flexShrink: 0,
  },
  navLabel: { flex: 1 },
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
  badgeAmber: {
    background: '#f59e0b',
  },
  activeBar: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 18,
    background: '#0ea5e9',
    borderRadius: '2px 0 0 2px',
  },
  footer: {
    padding: '12px 14px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  footerPulse: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
  },
  footerText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
  footerMode: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.02em',
  },
};
