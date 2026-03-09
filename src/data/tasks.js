// Preloaded task cards for the Okeanos Marketing AI Team

let _nextId = 100;
export const nextId = () => ++_nextId;

export const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Draft response to 1-star Google review',
    description:
      'Customer "J. Morrison" left a 1-star review citing delays in project start. Need a professional, empathetic reply that addresses the concern and highlights our quality commitment.',
    assignedTo: 'social-reputation',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: '2026-03-07T09:15:00Z',
    updatedAt: '2026-03-07T14:30:00Z',
    tags: ['reputation', 'google', 'urgent'],
  },
  {
    id: 2,
    title: 'Write blog post: "Fiberglass vs. Concrete Pools in Ontario"',
    description:
      'Target keyword: "fiberglass pool vs concrete Ontario". 1,000–1,200 words. Include cost comparison, maintenance, and Ontario climate suitability. Link to product pages.',
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2026-03-06T11:00:00Z',
    updatedAt: '2026-03-08T10:00:00Z',
    tags: ['seo', 'blog', 'organic'],
  },
  {
    id: 3,
    title: 'Follow-up sequence for March 5 web inquiry batch',
    description:
      '7 new inquiries came in via the website contact form on March 5. Draft personalized follow-up email and SMS templates for each lead tier (quote-ready, researching, early-stage).',
    assignedTo: 'lead-response',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'completed',
    createdAt: '2026-03-05T16:45:00Z',
    updatedAt: '2026-03-06T08:30:00Z',
    tags: ['leads', 'follow-up', 'email'],
  },
  {
    id: 4,
    title: 'Weekly marketing report — Week of Mar 3',
    description:
      'Compile GA4 traffic, Meta Ads performance, Google Ads CPC/conversions, and lead count into the standard weekly report format.',
    assignedTo: 'reporting',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'completed',
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-03-08T12:00:00Z',
    tags: ['reporting', 'weekly'],
  },
  {
    id: 5,
    title: 'Instagram caption series: pool transformations (5 posts)',
    description:
      'Write 5 Instagram captions for before/after pool transformation photos. Tone: inspiring, community-oriented. Include relevant GTA pool hashtags.',
    assignedTo: 'social-reputation',
    requestedBy: 'team-leader',
    priority: 'low',
    status: 'pending',
    createdAt: '2026-03-09T09:00:00Z',
    updatedAt: '2026-03-09T09:00:00Z',
    tags: ['social', 'instagram', 'content'],
  },
  {
    id: 6,
    title: 'Landing page copy: Scarborough fiberglass pools',
    description:
      'New geo-targeted landing page for Scarborough. ~400 words, focus on local trust signals, timeline, and a clear CTA to book a free consultation.',
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'pending',
    createdAt: '2026-03-09T09:05:00Z',
    updatedAt: '2026-03-09T09:05:00Z',
    tags: ['seo', 'landing-page', 'geo'],
  },
];
