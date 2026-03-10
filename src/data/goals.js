export const INITIAL_GOALS = [
  {
    id: 'goal-1',
    title: 'Increase monthly orders by 10',
    timeframe: 'Next month',
    priority: 'high',
    status: 'in-progress',
    owner: 'AI Team Leader',
    summary: 'Treat this as a growth objective that requires coordinated work across funnel diagnosis, lead response acceleration, and trust-building assets.',
    kpis: [
      'Qualified leads',
      'Consultation bookings',
      'Average response time',
      'Quote-to-close rate',
    ],
    linkedTaskTitles: [
      'Growth Plan Workstream: Funnel & Conversion Diagnosis',
      'Growth Plan Workstream: Lead Response Acceleration',
      'Growth Plan Workstream: Trust & Demand Support',
    ],
    nextActions: [
      'Review funnel bottlenecks and identify the biggest conversion leaks',
      'Tighten response speed for quote-ready leads',
      'Publish stronger bottom-of-funnel trust assets',
    ],
  },
  {
    id: 'goal-2',
    title: 'Keep lead response under 30 minutes',
    timeframe: 'This month',
    priority: 'high',
    status: 'on-track',
    owner: 'Lead Response Agent',
    summary: 'Maintain response-time discipline for qualified inquiries and prevent quote-ready opportunities from stalling.',
    kpis: [
      'Average lead response time',
      'Qualified inquiry follow-up rate',
      'Consultation booking rate',
    ],
    linkedTaskTitles: [
      'Lead follow-up drafts — March 9 batch (3 leads)',
      'Lead follow-up sequence — March 5 batch (7 leads)',
    ],
    nextActions: [
      'Prioritize quote-ready inquiries',
      'Review pending follow-up drafts daily',
      'Escalate aged leads quickly',
    ],
  },
  {
    id: 'goal-3',
    title: 'Improve paid media efficiency',
    timeframe: 'This month',
    priority: 'medium',
    status: 'watch',
    owner: 'Growth Ops Agent',
    summary: 'Improve ad spend efficiency by identifying the strongest campaign, reducing wasted spend, and aligning creative with high-intent traffic.',
    kpis: [
      'Ad spend',
      'Leads from ads',
      'CPL',
      'Top / worst campaign',
    ],
    linkedTaskTitles: [
      'Meta Ads creative test brief — spring 2026',
      'Google Ads creative refresh — spring season',
    ],
    nextActions: [
      'Review worst-performing campaign',
      'Refresh creative and landing page alignment',
      'Shift budget toward higher-intent search',
    ],
  },
];
