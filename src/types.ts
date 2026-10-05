export type Aspect = 'delivery' | 'price' | 'onboarding' | 'quality' | 'support' | string;

export type Sentiment = 'positive' | 'negative' | 'neutral';

export type Strength = 'strong' | 'moderate' | 'weak';

export interface Insight {
  id: string;
  claim: string;
  aspect: Aspect;
  sentiment: Sentiment;
  count: number;
  denominator: number;
  rate: number | null;
  previous_rate: number | null; // null when there is no earlier period to compare
  strength: Strength;
  low_data: boolean;
}

export interface EvidenceReview {
  review_id: string | number;
  date: string | null;   // reviews can have no date
  rating: number | null; // or no rating
  source: string | null; // or no source
  text: string;
  span_start: number;
  span_end: number;
}