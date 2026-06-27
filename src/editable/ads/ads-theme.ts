// ✏️ EDITABLE — theme the ads to match this site. Devs own this file.
// You control the LOOK here (radius, border, shadow, background, label color).
// You CANNOT change the ad's shape/fit from here — that stays locked in
// src/lib/ad-slots.ts, so the ad always displays correctly no matter what.

import type { AdSkin } from '@/lib/ads/ad-frame'

// Site-wide default skin — tuned to the deep-navy + signature-red brand.
export const adSkin: AdSkin = {
  radius: '20px',
  border: '1px solid rgba(11,26,77,0.08)',
  shadow: '0 14px 40px rgba(11,26,77,0.08)',
  background: '#ffffff',
  labelClassName: 'bg-[#e02424] text-white',
}

// Optional per-slot overrides — adjust only where you need to.
export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '16px', shadow: 'none', border: '1px solid rgba(11,26,77,0.10)' },
  popup: { radius: '24px' },
  header: { radius: '24px', background: '#f4f5f8' },
}

/** Merge site default + per-slot override for a slot. */
export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
// junior tweak
