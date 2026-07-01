import 'server-only';

export type CatalogSource = 'supabase' | 'mock';

interface ResolveCatalogSourceOptions {
  env?: Record<string, string | undefined>;
  isSupabaseConfigured: boolean;
}

export function resolveCatalogSource({
  env = process.env,
  isSupabaseConfigured,
}: ResolveCatalogSourceOptions): CatalogSource {
  const override = env.ICONS_CATALOG_SOURCE?.trim().toLowerCase();

  if (override === 'mock' || override === 'supabase') {
    return override;
  }

  if (!isSupabaseConfigured || env.VERCEL_ENV === 'preview') {
    return 'mock';
  }

  return 'supabase';
}
