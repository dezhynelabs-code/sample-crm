import type { Campaign } from '@/types/campaign';

// Ported from campaignCPL() / campaignConvRate() in the original app.js.
export function campaignCPL(c: Campaign): number {
  return c.leadsGen > 0 ? c.spend / c.leadsGen : 0;
}

// Conversion rate isn't tracked independently in this simplified model,
// so it's approximated from a fixed multiplier on lead volume — flagged
// here as an approximation rather than silently presented as measured data.
export function campaignConvRate(c: Campaign): number {
  return c.leadsGen > 0 ? Math.min(35, Math.round((c.leadsGen / (c.spend || 1)) * 100 * 10) / 10) : 0;
}
