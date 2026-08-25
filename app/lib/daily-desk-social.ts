import 'server-only';

import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { dailyDeskSocialCopy, renderDailyDeskGraphic } from '@/lib/daily-desk';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { DailyDeskBrief, DailyDeskSocialAsset, DailyDeskSocialVersion } from '@/lib/daily-desk-types';

type SocialDraftOverrides = Partial<{
  headline: string;
  supportingText: string;
  caption: string;
  altText: string;
}>;

type SocialDraftResult = {
  asset: DailyDeskSocialAsset;
  version: DailyDeskSocialVersion;
  created: boolean;
};

function record(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function asAsset(value: unknown) {
  const asset = record(value);
  if (!asset || typeof asset.id !== 'string') throw new Error('The Daily Desk social asset could not be created.');
  return asset as unknown as DailyDeskSocialAsset;
}

function asVersion(value: unknown) {
  const version = record(value);
  if (!version || typeof version.id !== 'string') throw new Error('The Daily Desk social version could not be recorded.');
  return version as unknown as DailyDeskSocialVersion;
}

function bounded(value: string, maximum: number, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > maximum) throw new Error(`${label} is invalid.`);
  return normalized;
}

/**
 * Generates only SVG from fixed brand tokens. The object is private from its
 * first write; approval changes readiness for manual posting and never
 * invokes a publishing adapter.
 */
export async function ensureDailyDeskSocialDraft(input: {
  supabase: SupabaseClient;
  ownerId: string;
  runId: string;
  brief: Pick<DailyDeskBrief, 'region' | 'offer'>;
  overrides?: SocialDraftOverrides;
  forceNewVersion?: boolean;
}): Promise<SocialDraftResult> {
  const assetResult = await input.supabase.rpc('ensure_daily_desk_social_asset', {
    target_run_id: input.runId,
  });
  if (assetResult.error) throw new Error('The Daily Desk social asset is unavailable.');
  const asset = asAsset(assetResult.data);

  const existingResult = await input.supabase
    .from('daily_desk_social_asset_versions')
    .select('*')
    .eq('asset_id', asset.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingResult.error) throw new Error('The Daily Desk social version is unavailable.');
  if (existingResult.data && !input.forceNewVersion) {
    return {
      asset: { ...asset, currentVersion: existingResult.data as DailyDeskSocialVersion },
      version: existingResult.data as DailyDeskSocialVersion,
      created: false,
    };
  }

  const baseCopy = dailyDeskSocialCopy(input.brief);
  const headline = bounded(input.overrides?.headline || baseCopy.headline, 180, 'Headline');
  const supportingText = bounded(input.overrides?.supportingText || baseCopy.supportingText, 300, 'Supporting text');
  const caption = bounded(input.overrides?.caption || baseCopy.caption, 5_000, 'Caption');
  const altText = bounded(input.overrides?.altText || baseCopy.altText, 2_000, 'Alt text');
  const svg = renderDailyDeskGraphic({ headline, supportingText, footer: baseCopy.footer });
  const graphicSha256 = createHash('sha256').update(svg).digest('hex');
  const versionId = crypto.randomUUID();
  const storagePath = `daily-desk/${input.ownerId}/${asset.id}/${versionId}.svg`;
  const storage = getSupabaseAdmin().storage.from('agent-media-private');
  const upload = await storage.upload(storagePath, Buffer.from(svg, 'utf8'), {
    contentType: 'image/svg+xml',
    upsert: false,
  });
  if (upload.error) throw new Error('The private Daily Desk preview could not be stored.');

  const tokens = {
    width: 1080,
    height: 1350,
    format: 'svg',
    headline,
    supportingText,
    footer: baseCopy.footer,
    palette: ['#f7f4ed', '#ffffff', '#183229', '#126b4e', '#d9b96e'],
  };
  const versionResult = await input.supabase.rpc('record_daily_desk_social_version', {
    target_asset_id: asset.id,
    target_version_id: versionId,
    target_storage_path: storagePath,
    target_caption: caption,
    target_alt_text: altText,
    target_graphic_sha256: graphicSha256,
    target_graphic_tokens: tokens,
  });
  if (versionResult.error) {
    await storage.remove([storagePath]);
    throw new Error('The Daily Desk social version could not be saved.');
  }
  const version = asVersion(versionResult.data);
  return {
    asset: { ...asset, current_version_id: version.id, currentVersion: version },
    version,
    created: true,
  };
}
