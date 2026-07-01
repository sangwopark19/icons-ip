import 'server-only';

export type CatalogSource = 'supabase' | 'mock';

interface ResolveCatalogSourceOptions {
  env?: Record<string, string | undefined>;
  isSupabaseConfigured: boolean;
  previewDefaultSource?: CatalogSource;
}

export function resolveCatalogSource({
  env = process.env,
  isSupabaseConfigured,
  previewDefaultSource = 'mock',
}: ResolveCatalogSourceOptions): CatalogSource {
  const override = env.ICONS_CATALOG_SOURCE?.trim().toLowerCase();

  if (override === 'mock' || override === 'supabase') {
    return override;
  }

  if (!isSupabaseConfigured) {
    return 'mock';
  }

  if (env.VERCEL_ENV === 'preview') return previewDefaultSource;

  return 'supabase';
}
