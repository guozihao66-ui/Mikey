// Preloaded task cards — Okeanos Marketing AI Team

let _nextId = 100;
export const nextId = () => ++_nextId;

export const INITIAL_TASKS = [
  // ── In-review (needs approval) ────────────────────────────────────────────
  {
    id: 1,
    title: 'Google review response — J. Morrison (1-star)',
    description:
      'Customer "J. Morrison" left a 1-star review citing delays in project start. Social & Reputation Agent has prepared two response options. Option A is empathetic and brief; Option B is more detailed with a service commitment. Awaiting approval on which to publish.',
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
    title: 'Lead follow-up drafts — March 9 batch (3 leads)',
    description:
      '3 new inquiries via website contact form on March 9. Lead Response Agent has drafted a personalized email + SMS for each lead. All three are quote-ready tier. Awaiting approval before sending.',
    assignedTo: 'lead-response',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'in-review',
    createdAt: '2026-03-09T08:00:00Z',
    updatedAt: '2026-03-09T09:45:00Z',
    tags: ['leads', 'follow-up', 'urgent'],
  },
  {
    id: 3,
    title: 'Meta Ads creative test brief — spring 2026',
    description:
      'Growth Ops Agent has prepared a creative test brief for Meta Ads: 2 new image concepts (pool transformation before/after vs. lifestyle pool scene) targeting GTA homeowners 35-55. Includes audience parameters and budget recommendation. Awaiting approval to brief the design team.',
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-review',
    createdAt: '2026-03-08T15:00:00Z',
    updatedAt: '2026-03-09T10:30:00Z',
    tags: ['campaigns', 'meta-ads', 'creative'],
  },

  // ── In-progress ────────────────────────────────────────────────────────────
  {
    id: 4,
    title: 'Blog post: "Fiberglass vs. Concrete Pools in Ontario"',
    description:
      'Target keyword: "fiberglass pool vs concrete Ontario". 1,000–1,200 words. Includes cost comparison, maintenance, and Ontario climate suitability. Link to product pages. First draft in progress.',
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2026-03-06T11:00:00Z',
    updatedAt: '2026-03-08T10:00:00Z',
    tags: ['seo', 'blog', 'organic'],
  },
  {
    id: 5,
    title: 'CRM pipeline health report — March',
    description:
      'Growth Ops Agent compiling pipeline stage counts, stalled deals (>14 days no activity), and recommended re-engagement actions. Includes 3 priority re-engagement drafts.',
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2026-03-09T07:00:00Z',
    updatedAt: '2026-03-09T10:00:00Z',
    tags: ['crm', 'pipeline', 'nurture'],
  },
  {
    id: 6,
    title: 'Weekly marketing report — Week of Mar 9',
    description:
      'Reporting Agent pulling GA4 traffic, Google Ads CPC/conversions, Meta Ads performance, and lead count. Standard weekly format with recommended actions section.',
    assignedTo: 'reporting',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2026-03-09T08:00:00Z',
    updatedAt: '2026-03-09T11:00:00Z',
    tags: ['reporting', 'weekly'],
  },

  // ── Completed ──────────────────────────────────────────────────────────────
  {
    id: 7,
    title: 'Lead follow-up sequence — March 5 batch (7 leads)',
    description:
      '7 new inquiries via website on March 5. Drafted personalized follow-up email and SMS templates for each lead tier (quote-ready, researching, early-stage). All approved and sent.',
    assignedTo: 'lead-response',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'completed',
    createdAt: '2026-03-05T16:45:00Z',
    updatedAt: '2026-03-06T08:30:00Z',
    tags: ['leads', 'follow-up', 'email'],
  },
  {
    id: 8,
    title: 'Weekly marketing report — Week of Mar 3',
    description:
      'Compiled GA4 traffic, Meta Ads performance, Google Ads CPC/conversions, and lead count. Flagged Meta underperformance. Approved and filed.',
    assignedTo: 'reporting',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'completed',
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-03-08T12:00:00Z',
    tags: ['reporting', 'weekly'],
  },
  {
    id: 9,
    title: 'Homepage CTA copy — 3 variants for A/B test',
    description:
      'Growth Ops Agent drafted 3 headline + CTA variants for homepage hero. Goal: increase quote form submissions. Variants focus on: (A) urgency, (B) social proof, (C) process clarity. Approved and handed off to dev.',
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'completed',
    createdAt: '2026-03-06T09:00:00Z',
    updatedAt: '2026-03-07T13:00:00Z',
    tags: ['cro', 'website', 'conversion'],
  },

  // ── Pending ────────────────────────────────────────────────────────────────
  {
    id: 10,
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
    id: 11,
    title: 'Landing page copy: Scarborough fiberglass pools',
    description:
      'New geo-targeted landing page for Scarborough. ~400 words, local trust signals, timeline, and a clear CTA to book a free consultation.',
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'pending',
    createdAt: '2026-03-09T09:05:00Z',
    updatedAt: '2026-03-09T09:05:00Z',
    tags: ['seo', 'landing-page', 'geo'],
  },
  {
    id: 12,
    title: 'Google Ads creative refresh — spring season',
    description:
      'Growth Ops Agent to draft 3 new responsive search ad variants for "pool installation Ontario" and related spring keywords. Focus on spring availability and fast start dates.',
    assignedTo: 'growth-ops',
    requestedBy: 'team-leader',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-03-09T09:15:00Z',
    updatedAt: '2026-03-09T09:15:00Z',
    tags: ['campaigns', 'google-ads', 'spring'],
  },
  {
    id: 13,
    title: 'Case study: Oakville backyard transformation (Hendersons)',
    description:
      'Content Strategist to write a 300-word project story + photo captions for the Henderson project (Oakville, 32ft fiberglass, complete landscaping package). Use as hero case study.',
    assignedTo: 'content-strategist',
    requestedBy: 'team-leader',
    priority: 'medium',
    status: 'pending',
    createdAt: '2026-03-09T09:10:00Z',
    updatedAt: '2026-03-09T09:10:00Z',
    tags: ['content', 'case-study'],
  },
];

// Seeded approval items (separate from task queue — shown on Approvals page)
export const APPROVAL_ITEMS = [
  {
    id: 'ap-1',
    title: 'Google Review Response — J. Morrison',
    description:
      'Social & Reputation Agent has prepared two response options for the J. Morrison 1-star review. Option A is concise and empathetic; Option B is more detailed.',
    agent: 'social-reputation',
    agentName: 'Social & Reputation Agent',
    priority: 'high',
    type: 'Review Response',
    createdAt: '2026-03-07T14:30:00Z',
    preview: `Option A: "Thank you for your feedback, James. We sincerely apologize for the delay in your project start — this doesn't reflect our standard. We've followed up directly to make this right and look forward to delivering the quality experience Okeanos is known for."\n\nOption B: "James, we appreciate you taking the time to share this. Delays are never acceptable in our process and we take this seriously. Our team has reached out to schedule a call to review your timeline and ensure a smooth path forward. Your satisfaction is our priority."`,
    taskId: 1,
  },
  {
    id: 'ap-2',
    title: 'Lead Follow-up Drafts — March 9 Batch',
    description:
      'Lead Response Agent drafted personalized email + SMS messages for 3 new quote-ready inquiries from March 9. All three are awaiting send approval.',
    agent: 'lead-response',
    agentName: 'Lead Response Agent',
    priority: 'high',
    type: 'Lead Follow-up',
    createdAt: '2026-03-09T09:45:00Z',
    preview: `Lead 1 — Sarah K. (Mississauga, 3-bed lot):\nSubject: "Your Okeanos pool quote — next steps"\nBody: "Hi Sarah, thanks for reaching out! We'd love to help you bring that backyard vision to life. I've noted your lot details and a consultant will be in touch within the hour to confirm a free site visit. In the meantime, feel free to browse our gallery at okeanos.ca/gallery."\n\nLead 2 — D. Patel (North York): similar format...\nLead 3 — M. Chen (Pickering): similar format...`,
    taskId: 2,
  },
  {
    id: 'ap-3',
    title: 'Meta Ads Creative Test Brief — Spring 2026',
    description:
      'Growth Ops Agent has prepared a creative test brief for Meta Ads with 2 new concept directions and audience targeting parameters.',
    agent: 'growth-ops',
    agentName: 'Growth Ops Agent',
    priority: 'medium',
    type: 'Campaign Brief',
    createdAt: '2026-03-09T10:30:00Z',
    preview: `Creative Concept A: Pool transformation before/after — "This was their backyard 6 months ago."\nAudience: GTA homeowners 35-55, household income $120k+, home ownership.\nBudget: $800/wk test.\n\nCreative Concept B: Lifestyle pool scene — "Ontario summers hit different with the right backyard."\nAudience: Same core, expanded to lookalike from past converters.\nBudget: $800/wk test.\n\nRecommendation: Run both for 2 weeks, pause the lower CPL, scale the winner.`,
    taskId: 3,
  },
];
