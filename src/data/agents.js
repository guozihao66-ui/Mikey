// Agent definitions — Okeanos Marketing AI Team (6 agents)

export const AGENTS = [
  {
    id: 'team-leader',
    name: 'AI Team Leader',
    role: 'Strategic Coordinator',
    avatar: 'TL',
    color: '#0f4c81',
    description:
      'Orchestrates the full marketing team. Interprets briefs, routes tasks to specialist agents, manages the approvals queue, and synthesizes outputs into actionable deliverables. Your primary interface to the AI team.',
    capabilities: [
      'Task routing & prioritization',
      'Brief interpretation',
      'Weekly report synthesis',
      'Cross-agent coordination',
      'Approvals queue management',
      'Work status summaries',
    ],
    status: 'active',
  },
  {
    id: 'social-reputation',
    name: 'Social & Reputation Agent',
    role: 'Social Media & Reviews',
    avatar: 'SR',
    color: '#7c3aed',
    description:
      'Manages Okeanos presence on Google, Instagram, Facebook, and Houzz. Drafts review response options, social captions, and flags reputation risks for human review.',
    capabilities: [
      'Google review response drafts',
      'Instagram & Facebook captions',
      'Reputation risk monitoring',
      'Houzz profile content',
      'Social calendar planning',
      'Before/after post copy',
    ],
    status: 'active',
  },
  {
    id: 'content-strategist',
    name: 'Content Strategist Agent',
    role: 'Content & Copywriting',
    avatar: 'CS',
    color: '#059669',
    description:
      'Plans and drafts SEO-aligned blog posts, geo-targeted landing pages, email campaigns, and project case studies. Focuses on Ontario homeowner keywords and fiberglass pool education.',
    capabilities: [
      'Blog post drafts',
      'Geo-targeted landing page copy',
      'Email campaign copy',
      'Keyword research briefs',
      'Content calendar management',
      'Project case study writeups',
    ],
    status: 'active',
  },
  {
    id: 'lead-response',
    name: 'Lead Response Agent',
    role: 'Lead Nurturing & Speed',
    avatar: 'LR',
    color: '#d97706',
    description:
      'Drafts personalized follow-up messages for new inquiries within 30 minutes. Qualifies leads, prepares quote-request acknowledgements, and builds re-engagement sequences for dormant contacts.',
    capabilities: [
      'Instant follow-up drafts (email + SMS)',
      'Lead qualification scripts',
      'Quote acknowledgement emails',
      'Re-engagement sequences',
      'CRM note summaries',
      'Lead tier classification',
    ],
    status: 'active',
  },
  {
    id: 'reporting',
    name: 'Reporting Agent',
    role: 'Analytics & Insights',
    avatar: 'RA',
    color: '#0ea5e9',
    description:
      'Compiles performance data from GA4, Google Ads, and Meta Ads into clear weekly and monthly reports. Surfaces trends, flags anomalies, and recommends next actions with supporting data.',
    capabilities: [
      'Weekly performance reports',
      'Ad spend & ROI analysis',
      'Lead source breakdown',
      'SEO position tracking',
      'Competitor signal summaries',
      'Campaign ROI snapshots',
    ],
    status: 'active',
  },
  {
    id: 'growth-ops',
    name: 'Growth Ops Agent',
    role: 'CRM, Conversion & Campaigns',
    avatar: 'GO',
    color: '#b91c1c',
    description:
      'The operational backbone connecting marketing to pipeline. Manages CRM nurture sequences, identifies website conversion bottlenecks, coordinates campaign operations, and supports workflow approvals.',
    capabilities: [
      'CRM pipeline health & nurture sequences',
      'Website conversion optimization briefs',
      'Campaign operations coordination',
      'Workflow & approvals support',
      'Stalled-deal alerts',
      'Homepage CTA and form improvement briefs',
    ],
    status: 'active',
  },
];

export const getAgent = (id) => AGENTS.find((a) => a.id === id);
