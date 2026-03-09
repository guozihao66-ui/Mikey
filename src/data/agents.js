// Agent definitions for the Okeanos Marketing AI Team

export const AGENTS = [
  {
    id: 'team-leader',
    name: 'AI Team Leader',
    role: 'Strategic Coordinator',
    avatar: 'TL',
    color: '#0f4c81',
    description:
      'Orchestrates the marketing team, interprets briefs, routes tasks, and synthesizes output into actionable deliverables. Your primary interface to the AI team.',
    capabilities: [
      'Task routing & prioritization',
      'Brief interpretation',
      'Weekly report synthesis',
      'Work summaries',
      'Cross-agent coordination',
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
      'Manages Okeanos presence on Google, Instagram, Facebook, and Houzz. Drafts review response templates, social captions, and flags reputation risks.',
    capabilities: [
      'Google review responses',
      'Instagram & Facebook captions',
      'Reputation monitoring alerts',
      'Houzz profile content',
      'Social calendar planning',
    ],
    status: 'active',
  },
  {
    id: 'content-strategist',
    name: 'Content Strategist Agent',
    role: 'Content & SEO',
    avatar: 'CS',
    color: '#059669',
    description:
      'Plans and drafts SEO-aligned blog posts, landing page copy, and email campaigns. Focuses on Ontario homeowner keywords and fiberglass pool education.',
    capabilities: [
      'Blog post drafts',
      'Landing page copy',
      'Email campaigns',
      'Keyword research briefs',
      'Content calendar management',
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
      'Drafts immediate follow-up messages for new inquiries, qualifies leads, and prepares personalized quote-request acknowledgements under 5 minutes.',
    capabilities: [
      'Instant follow-up drafts',
      'Lead qualification scripts',
      'Quote acknowledgement emails',
      'Re-engagement sequences',
      'CRM note summaries',
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
      'Compiles performance data from GA4, Meta Ads, and Google Ads into clear weekly and monthly reports with recommended actions.',
    capabilities: [
      'Weekly performance reports',
      'Ad spend analysis',
      'Lead source breakdown',
      'SEO position tracking',
      'Campaign ROI summaries',
    ],
    status: 'active',
  },
];

export const getAgent = (id) => AGENTS.find((a) => a.id === id);
