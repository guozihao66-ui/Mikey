import React, { useState } from 'react';

const APPROVAL_ITEMS = [
  'Require approval for social posts',
  'Require approval for review responses',
  'Require approval for lead follow-ups',
  'Require approval for campaign / ad briefs',
  'Never auto-publish public-facing content',
];

const BRAND_ITEMS = [
  'Professional tone',
  'Trust-first messaging',
  'Affordability emphasis',
  'Low-maintenance positioning',
  'Warranty confidence in key sales assets',
];

const MARKET_ITEMS = [
  'Oakville as a primary trust / family-value market',
  'Vaughan for strong suburban demand',
  'Selective postal-code targeting in Brampton',
  'Referral / partner growth through landscapers and builders',
  'Google Ads + before/after content as top channel priorities',
];

const LEAD_ITEMS = [
  'Target first response under 30 minutes',
  'Escalate quote-ready leads faster than general inquiries',
  'Use 3-day and 1-week follow-up checkpoints after quotes',
  'Request Google reviews immediately after successful project completion',
  'Route stalled opportunities back into follow-up workflows',
];

function Toggle({ label, defaultChecked = true }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button onClick={() => setChecked((v) => !v)} style={styles.toggleRow}>
      <div>
        <div style={styles.toggleLabel}>{label}</div>
      </div>
      <div style={{ ...styles.toggle, justifyContent: checked ? 'flex-end' : 'flex-start', background: checked ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%)' : 'var(--color-surface-3)' }}>
        <span style={styles.toggleKnob} />
      </div>
    </button>
  );
}

function SectionCard({ title, sub, children }) {
  return (
    <div className="card" style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardSub}>{sub}</div>
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  );
}

export default function Settings() {
  return (
    <div style={styles.page}>
      <div className="card" style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Configuration</div>
          <h2 style={styles.title}>Prototype Settings</h2>
          <p style={styles.sub}>
            This is a lightweight control surface for client demos. It shows how Okeanos could tune approvals,
            messaging priorities, market focus, and lead-handling standards without exposing heavy backend setup.
          </p>
        </div>
        <div style={styles.heroBadges}>
          <span className="badge badge-blue">Demo-ready</span>
          <span className="badge badge-amber">Configurable</span>
        </div>
      </div>

      <div style={styles.grid}>
        <SectionCard title="Approval Controls" sub="Human review stays in control of public-facing actions.">
          {APPROVAL_ITEMS.map((item, idx) => (
            <Toggle key={item} label={item} defaultChecked={idx !== 2 ? true : true} />
          ))}
        </SectionCard>

        <SectionCard title="Brand & Tone" sub="Keep AI output aligned with how Okeanos wants to be perceived.">
          {BRAND_ITEMS.map((item) => (
            <Toggle key={item} label={item} />
          ))}
        </SectionCard>

        <SectionCard title="Market Focus" sub="Demonstrates that the AI team can prioritize specific markets and growth channels.">
          {MARKET_ITEMS.map((item) => (
            <Toggle key={item} label={item} />
          ))}
        </SectionCard>

        <SectionCard title="Lead Handling Targets" sub="Service standards and sales follow-up logic that support response speed and conversion.">
          {LEAD_ITEMS.map((item) => (
            <Toggle key={item} label={item} />
          ))}
        </SectionCard>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  hero: {
    padding: '18px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(229,244,255,0.96) 100%)',
  },
  eyebrow: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-mid)', marginBottom: 8 },
  title: { fontSize: 24, lineHeight: 1.1, color: 'var(--color-text)', marginBottom: 8 },
  sub: { fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 760 },
  heroBadges: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  card: { padding: '16px 16px 14px' },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 },
  cardSub: { fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.55 },
  cardBody: { display: 'flex', flexDirection: 'column', gap: 8 },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-2)',
    borderRadius: 10,
    padding: '10px 12px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  toggleLabel: { fontSize: 12, color: 'var(--color-text)', lineHeight: 1.45, fontWeight: 600 },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 999,
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    display: 'block',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
};
