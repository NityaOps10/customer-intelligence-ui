import { MOCK_EVIDENCE, MOCK_INSIGHTS } from './mock.ts';
import { EvidenceReview, Insight } from './types.ts';

const VITE_API_URL = import.meta.env.VITE_API_URL || '';
const VITE_USE_MOCK = import.meta.env.VITE_USE_MOCK ?? 'true';

let VITE_DATASET_ID: string = (() => {
  try {
    return localStorage.getItem('datasetId') || import.meta.env.VITE_DATASET_ID || '2';
  } catch {
    return import.meta.env.VITE_DATASET_ID || '2';
  }
})();

export function setActiveDatasetId(id: number | string) {
  VITE_DATASET_ID = String(id);
  try {
    localStorage.setItem('datasetId', VITE_DATASET_ID);
  } catch {
    // storage unavailable: the switch still lasts until the page reloads
  }
}

export interface ProductCard {
  product_family: string;
  review_count: number;
  avg_rating: number | string | null;
  top_praise: { aspect: string; count: number } | null;
  top_complaint: { aspect: string; count: number } | null;
  insufficient_data: boolean;
}

/**
 * One card per product family.
 */
export async function getProducts(): Promise<ProductCard[]> {
  if (VITE_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return [];
  }

  const response = await fetch(
    `${VITE_API_URL}/api/products?dataset_id=${encodeURIComponent(VITE_DATASET_ID)}`,
    { headers: { Accept: 'application/json' } }
  );

  if (!response.ok) {
    throw new Error(`Failed to load products (status: ${response.status} ${response.statusText})`);
  }

  return (await response.json()) as ProductCard[];
}

/**
 * Insights for the dataset. Pass a product family to see only that product.
 */
export async function getInsights(product?: string): Promise<Insight[]> {
  if (VITE_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return structuredClone(MOCK_INSIGHTS);
  }

  let url = `${VITE_API_URL}/api/insights?dataset_id=${encodeURIComponent(VITE_DATASET_ID)}`;
  if (product) {
    url += `&product=${encodeURIComponent(product)}`;
  }

  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`Failed to load insights (status: ${response.status} ${response.statusText})`);
  }

  const data: any[] = await response.json();
  return data.map((d) => ({ ...d, id: String(d.id) })) as Insight[];
}

/**
 * Supporting evidence reviews for a given insight ID.
 */
export async function getEvidenceForInsight(insightId: string): Promise<EvidenceReview[]> {
  if (VITE_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const evidenceList = MOCK_EVIDENCE[insightId] || [];
    return structuredClone(evidenceList);
  }

  const response = await fetch(
    `${VITE_API_URL}/api/insights/${encodeURIComponent(insightId)}/evidence`,
    { headers: { Accept: 'application/json' } }
  );

  if (!response.ok) {
    throw new Error(`Failed to load evidence reviews (status: ${response.status} ${response.statusText})`);
  }

  return (await response.json()) as EvidenceReview[];
}

/**
 * Sends a review file to the backend. Returns the new dataset id.
 */
export async function uploadDataset(payload: {
  file: File;
  name: string;
  source: string;
  permission: string;
  mapping: Record<string, string>;
}): Promise<{ dataset_id: number; rows_in_file: number; reviews_imported: number }> {
  if (VITE_USE_MOCK === 'true') {
    throw new Error('Upload needs the real backend. Set VITE_USE_MOCK=false in your UI .env file and restart.');
  }

  const form = new FormData();
  form.append('file', payload.file);
  form.append('name', payload.name);
  form.append('source', payload.source);
  form.append('permission_note', payload.permission);
  form.append('text_col', payload.mapping.review_text);
  if (payload.mapping.rating) form.append('rating_col', payload.mapping.rating);
  if (payload.mapping.date) form.append('date_col', payload.mapping.date);
  if (payload.mapping.product) form.append('product_col', payload.mapping.product);

  const response = await fetch(`${VITE_API_URL}/api/datasets`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      if (body.detail) {
        detail = ': ' + (typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail));
      }
    } catch {
      // response had no JSON body
    }
    throw new Error(`Upload failed (status ${response.status})${detail}`);
  }

  return await response.json();
}

/**
 * Progress of the automatic analysis that runs after an upload.
 */
export async function getDatasetStatus(): Promise<{ stage: string; error: string | null }> {
  const response = await fetch(
    `${VITE_API_URL}/api/datasets/${encodeURIComponent(VITE_DATASET_ID)}/status`,
    { headers: { Accept: 'application/json' } }
  );
  if (!response.ok) {
    throw new Error(`Failed to load status (status: ${response.status})`);
  }
  return await response.json();
}

export interface MarketingItem {
  insight_id: number;
  aspect: string;
  count: number;
  denominator: number;
  rate_percent: number | null;
  strength: string;
  low_data: boolean;
  quotes: { review_id: number; quote: string; rating: number | null }[];
  actions?: string[];
}

export interface MarketingIdeas {
  product: string;
  reduce_negative: MarketingItem[];
  attract: MarketingItem[];
}

/**
 * Marketing ideas for one product, built from its insights.
 */
export async function getMarketing(product: string): Promise<MarketingIdeas> {
  if (VITE_USE_MOCK === 'true') {
    return { product, reduce_negative: [], attract: [] };
  }
  const response = await fetch(
    `${VITE_API_URL}/api/marketing?dataset_id=${encodeURIComponent(VITE_DATASET_ID)}&product=${encodeURIComponent(product)}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!response.ok) {
    throw new Error(`Failed to load marketing ideas (status: ${response.status})`);
  }
  return (await response.json()) as MarketingIdeas;
}