import React from 'react';

const PLAYBOOKS = [
  {
    title: 'New Inquiry → 24h Response Workflow',
    owner: 'Lead Response Agent',
    goal: 'Ensure every qualified inquiry receives a fast, professional response across call, email, and text within 24 hours.',
    steps: [
      'Capture source and location of the inquiry',
      'Classify lead quality and urgency',
      'Prepare call / email / text follow-up draft',
      'Route message for approval if needed',
      'Create next reminder after 2 days / 4 days / 1 week',
    ],
  },
  {
    title: 'Quote Sent → Follow-Up Workflow',
    owner: 'Growth Ops Agent',
    goal: 'Keep quotes from going cold by pairing reminders, incentive follow-ups, and consultation reactivation.',
    steps: [
      'Log quote date and pricing context',
      'Set a 3-day follow-up reminder',
      'Draft next-touch messaging tied to timing, trust, and clarity',
      'Escalate high-intent or stalled opportunities',
      'Update pipeline status after outreach',
    ],
  },
  {
    title: 'Project Completion → Review Request Workflow',
    owner: 'Social & Reputation Agent',
    goal: 'Turn successful installs into reputation growth using QR, Google review requests, and rapid response discipline.',
    steps: [
      'Confirm project finished and client is satisfied',
      'Draft thank-you + review request sequence',
      'Use QR / card handoff for Google review request',
      'Draft responses to any new review quickly',
      'Log follow-up if additional customer care is needed',
    ],
  },
  {
    title: 'Showroom / Site Visit Preparation Workflow',
    owner: 'Content Strategist Agent',
    goal: 'Support higher quote confidence with brochure, design discussion guidance, and before/after proof assets.',
    steps: [
      'Prepare key talking points for design, timing, and pricing clarity',
      'Bundle brochure, before/after photos, and proof assets',
      'Surface likely objections: hidden fees, maintenance, disruption, timeline',
      'Recommend next-step CTA after the visit',
      'Sync notes back into follow-up workflow',
    ],
  },
  {
    title: 'Partner Referral Growth Workflow',
    owner: 'Growth Ops Agent',
    goal: 'Create repeatable lead flow from landscapers, builders, realtors, and other strategic partners.',
    steps: [
      'Identify priority partner segment',
      'Define offer, commission, or referral value proposition',
      'Draft outreach brief and follow-up cadence',
      'Track referred leads and close quality',
      'Feed best-performing partners into weekly reporting',
    ],
  },
  {
    title: 'Priority Market Targeting Workflow',
    owner: 'Reporting Agent',
    goal: 'Concentrate effort on high-fit GTA markets, postal codes, and permit-informed areas where Okeanos can win profitably.',
    steps: [
      'Review permit activity and historical opportunity signals',
      'Rank target areas by demand and fit',
      'Align campaigns and content to selected geographies',
      'Highlight neighbourhood density or grouped-offer opportunities',
      'Report market-level performance and next targeting moves',
    ],
  },
];

export default function Playbooks() {
  return (
    <div style={styles.page}>
      <div style={styles.intro} className="card">
        <h2 style={styles.title}>Core Operating Playbooks</h2>
        <p style={styles.text}>
          These are the prototype workflows that best communicate how Okeanos turns trust, fast response,
          and operational discipline into repeatable execution.
        </p>
      </div>

      <div style={styles.grid}>
        {PLAYBOOKS.map((playbook) => (
          <div key={playbook.title} className="card" style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <h3 style={styles.cardTitle}>{playbook.title}</h3>
                <p style={styles.owner}>Owner: {playbook.owner}</p>
              </div>
              <span className="badge badge-blue">Prototype workflow</span>
            </div>
            <p style={styles.goal}><strong>Goal:</strong> {playbook.goal}</p>
            <ol style={styles.list}>
              {playbook.steps.map((step) => (
                <li key={step} style={styles.listItem}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  intro: {
    padding: '18px 20px',
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  text: {
    color: 'var(--color-text-secondary)',
    maxWidth: 760,
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  card: {
    padding: '18px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  owner: {
    color: 'var(--color-text-muted)',
    fontSize: 12,
  },
  goal: {
    marginBottom: 12,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
  },
  list: {
    paddingLeft: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  listItem: {
    color: 'var(--color-text)',
    lineHeight: 1.5,
  },
};
