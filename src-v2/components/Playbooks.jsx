import React from 'react';

const PLAYBOOKS = [
  {
    title: 'Negative Review Response Flow',
    owner: 'Social & Reputation Agent',
    goal: 'Protect trust while responding quickly and professionally.',
    steps: [
      'Detect review and classify severity',
      'Draft 2 response options for human review',
      'Escalate if operational issue is unresolved',
      'Publish approved response',
      'Log follow-up action in task queue',
    ],
  },
  {
    title: 'Fast Website Lead Response',
    owner: 'Lead Response Agent',
    goal: 'Keep first response time under 30 minutes for quote-ready inquiries.',
    steps: [
      'Classify inquiry by urgency and intent',
      'Draft personalized email + SMS follow-up',
      'Route to approval',
      'Send approved follow-up',
      'Create next-touch reminder in task queue',
    ],
  },
  {
    title: 'Weekly Marketing Reporting',
    owner: 'Reporting Agent',
    goal: 'Give the team one clean weekly performance readout and next actions.',
    steps: [
      'Pull GA4, paid media, and lead metrics',
      'Summarize wins, risks, and anomalies',
      'Draft action recommendations',
      'Review internally before sharing',
      'Use findings to update next week priorities',
    ],
  },
  {
    title: 'Campaign Ops & Conversion Check',
    owner: 'Growth Ops Agent',
    goal: 'Improve landing page conversion and keep campaigns operationally aligned.',
    steps: [
      'Review active campaign priorities',
      'Check CTA, form friction, and follow-up path',
      'Draft optimization brief',
      'Queue any approval-required changes',
      'Track impact in next reporting cycle',
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
