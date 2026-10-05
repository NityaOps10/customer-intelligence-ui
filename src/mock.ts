import { EvidenceReview, Insight } from './types.ts';

function createEvidenceReview(
  review_id: string,
  date: string,
  rating: number,
  source: string,
  prefix: string,
  span: string,
  suffix: string
): EvidenceReview {
  const span_start = prefix.length;
  const span_end = prefix.length + span.length;
  const text = prefix + span + suffix;
  return {
    review_id,
    date,
    rating,
    source,
    text,
    span_start,
    span_end,
  };
}

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    claim: 'Customers report slow shipping and tracking delays',
    aspect: 'delivery',
    sentiment: 'negative',
    count: 41,
    denominator: 612,
    rate: 6.7,
    previous_rate: 4.8,
    strength: 'strong',
    low_data: false,
  },
  {
    id: 'ins-2',
    claim: 'Users find renewal pricing steep without proportional new features',
    aspect: 'price',
    sentiment: 'negative',
    count: 28,
    denominator: 580,
    rate: 4.8,
    previous_rate: 3.2,
    strength: 'moderate',
    low_data: false,
  },
  {
    id: 'ins-3',
    claim: 'New users praise intuitive setup wizards and quick time-to-value',
    aspect: 'onboarding',
    sentiment: 'positive',
    count: 53,
    denominator: 612,
    rate: 8.7,
    previous_rate: 6.1,
    strength: 'strong',
    low_data: false,
  },
  {
    id: 'ins-4',
    claim: 'Frequent session disconnects during peak team collaboration hours',
    aspect: 'quality',
    sentiment: 'negative',
    count: 19,
    denominator: 590,
    rate: 3.2,
    previous_rate: 5.0,
    strength: 'weak',
    low_data: false,
  },
  {
    id: 'ins-5',
    claim: 'Technical support engineers resolve complex migration tickets rapidly',
    aspect: 'support',
    sentiment: 'positive',
    count: 36,
    denominator: 612,
    rate: 5.9,
    previous_rate: 4.5,
    strength: 'moderate',
    low_data: false,
  },
  {
    id: 'ins-6',
    claim: 'Custom packaging tears easily during cross-border transit',
    aspect: 'delivery',
    sentiment: 'negative',
    count: 5,
    denominator: 54,
    rate: 9.3,
    previous_rate: 7.4,
    strength: 'weak',
    low_data: true,
  },
];

export const MOCK_EVIDENCE: Record<string, EvidenceReview[]> = {
  'ins-1': [
    createEvidenceReview(
      'rev-101',
      '2026-09-18',
      2,
      'Trustpilot',
      'Overall the product itself is decent, but ',
      'standard delivery took over two weeks to arrive',
      ' with zero tracking updates until it hit our local hub. We almost cancelled the order.'
    ),
    createEvidenceReview(
      'rev-102',
      '2026-09-24',
      1,
      'G2',
      'Ordered on a Monday hoping for delivery before the weekend seminar. ',
      'The package was delayed in transit without any proactive alert',
      ', causing major disruption for our team.'
    ),
    createEvidenceReview(
      'rev-103',
      '2026-09-29',
      2,
      'Capterra',
      "Delivery courier misrouted the package twice and customer service couldn't locate it for 4 business days. The ",
      "tracking link stayed stuck on 'label created'",
      ' for nearly a week before moving.'
    ),
    createEvidenceReview(
      'rev-104',
      '2026-10-01',
      1,
      'Zendesk',
      'Expedited shipping fee was charged at checkout, yet ',
      'our parcel arrived 6 days late',
      '. Unacceptable for mission-critical team hardware.'
    ),
  ],
  'ins-2': [
    createEvidenceReview(
      'rev-201',
      '2026-09-12',
      2,
      'G2',
      'We love using the software daily, but the recent tier change means ',
      'annual renewal jumped by 35% without any major feature additions',
      '. Our finance team is now pushing us to look for budget alternatives.'
    ),
    createEvidenceReview(
      'rev-202',
      '2026-09-20',
      3,
      'Trustpilot',
      'The core platform is reliable. However, ',
      'pricing feels disproportionate for mid-sized marketing teams',
      " who don't need enterprise governance modules."
    ),
    createEvidenceReview(
      'rev-203',
      '2026-09-27',
      2,
      'Capterra',
      'When our contract came up for renewal this quarter, ',
      'the sudden cost increase felt unjustified',
      ' given the minimal product roadmap updates shipped this year.'
    ),
    createEvidenceReview(
      'rev-204',
      '2026-10-02',
      3,
      'Zendesk',
      'Great UI and dependable uptime, but ',
      'seat licenses are getting far too expensive',
      ' for growing startups that need to add occasional editors.'
    ),
  ],
  'ins-3': [
    createEvidenceReview(
      'rev-301',
      '2026-09-08',
      5,
      'G2',
      'Migrating from our legacy CRM took less than an afternoon. ',
      'The step-by-step onboarding checklist got our 12 reps working within minutes',
      ' without requiring custom professional services.'
    ),
    createEvidenceReview(
      'rev-302',
      '2026-09-16',
      5,
      'Trustpilot',
      'I was dreading configuring the workspace integrations, but ',
      'the guided interactive wizard made onboarding delightfully smooth',
      ' and self-explanatory for our non-technical managers.'
    ),
    createEvidenceReview(
      'rev-303',
      '2026-09-22',
      5,
      'App Store',
      'Outstanding first-run experience. ',
      'We achieved complete team adoption in under 48 hours',
      ' thanks to the clean sample templates and default permission roles.'
    ),
    createEvidenceReview(
      'rev-304',
      '2026-09-30',
      4,
      'Capterra',
      'Very impressed by the clarity of initial setup. ',
      'The interactive onboarding tour saved us dozens of hours of manual training',
      ' during company rollout.'
    ),
  ],
  'ins-4': [
    createEvidenceReview(
      'rev-401',
      '2026-09-14',
      2,
      'G2',
      'Everything is fine during morning standup, but ',
      'we experience random browser disconnects around 2 PM Eastern',
      ' when both our European and US teams edit the same canvas.'
    ),
    createEvidenceReview(
      'rev-402',
      '2026-09-25',
      2,
      'Zendesk',
      'The application often freezes during heavy sync operations, and ',
      'users are unexpectedly logged out mid-session',
      ', losing unsaved filter parameters.'
    ),
    createEvidenceReview(
      'rev-403',
      '2026-10-03',
      3,
      'Trustpilot',
      'Reliability has dipped slightly this month. ',
      'Multiple teammates reported intermittent socket timeout errors',
      ' while exporting large customer campaign reports.'
    ),
  ],
  'ins-5': [
    createEvidenceReview(
      'rev-501',
      '2026-09-11',
      5,
      'Zendesk',
      'Ran into a critical schema mismatch while importing 200k user records. ',
      'Support engineer Sarah responded within 10 minutes and deployed a patch',
      ' to unblock our launch.'
    ),
    createEvidenceReview(
      'rev-502',
      '2026-09-19',
      5,
      'G2',
      "Hands down the best B2B vendor support I've encountered. ",
      'Their technical specialist jumped on a live debug call with our devops lead',
      ' and fixed our webhook authorization issue immediately.'
    ),
    createEvidenceReview(
      'rev-503',
      '2026-09-28',
      5,
      'Capterra',
      'Whenever we open an escalated priority ticket, ',
      'the tier-2 support team provides thorough, root-cause explanations',
      ' instead of canned robotic replies.'
    ),
    createEvidenceReview(
      'rev-504',
      '2026-10-02',
      4,
      'Trustpilot',
      'Customer success and technical support are truly top notch. ',
      'They helped us configure SSO and SAML in a single afternoon',
      ' with zero downtime for our active users.'
    ),
  ],
  'ins-6': [
    createEvidenceReview(
      'rev-601',
      '2026-09-15',
      2,
      'Trustpilot',
      'The international shipping box arrived heavily creased and ',
      'the internal cardboard divider tore open in transit',
      ', allowing the contents to rub together.'
    ),
    createEvidenceReview(
      'rev-602',
      '2026-09-23',
      1,
      'Zendesk',
      'We received our trial sample shipment in Canada, but ',
      'the thin custom paper packaging had split along the seam',
      ' before we even opened the outer postal sleeve.'
    ),
    createEvidenceReview(
      'rev-603',
      '2026-10-01',
      2,
      'G2',
      'Beautiful presentation aesthetic, however ',
      'the exterior branded carton lacks reinforcement for overseas freight',
      ' and scuffs very easily.'
    ),
  ],
};
