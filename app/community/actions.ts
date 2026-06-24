'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCatalogSnapshot } from '@/lib/catalog';
import { isOnboarded, onboardingPath, safeNextPath } from '@/lib/auth/onboarding';
import { getCurrentAuthState } from '@/lib/auth/server';
import { buildCommunityUploadPath, normalizeCommunityPostForm } from '@/lib/community';
import { createClient } from '@/lib/supabase/server';

export interface CommunityPostActionState {
  errors?: {
    text?: string;
    ipId?: string;
    image?: string;
    form?: string;
  };
}

const USER_UPLOADS_BUCKET = 'user-uploads';

function readNext(formData: FormData) {
  const value = formData.get('next');
  return typeof value === 'string' && value.trim() ? safeNextPath(value) : '/community';
}

function loginPath(next: string) {
  return `/login?next=${encodeURIComponent(safeNextPath(next))}`;
}

export async function createCommunityPostAction(
  _state: CommunityPostActionState,
  formData: FormData,
): Promise<CommunityPostActionState> {
  const next = readNext(formData);
  const auth = await getCurrentAuthState();

  if (!auth.isConfigured || !auth.user) {
    redirect(loginPath(next));
  }

  if (!isOnboarded(auth.profile, auth.user.email)) {
    redirect(onboardingPath(next));
  }

  const catalog = await getCatalogSnapshot();
  const normalized = normalizeCommunityPostForm(formData, new Set(catalog.ips.map((ip) => ip.id)));

  if (!normalized.ok) return { errors: normalized.errors };

  const supabase = await createClient();
  const { text, ipId, tag, image } = normalized.value;
  let imagePath: string | null = null;

  if (image) {
    imagePath = buildCommunityUploadPath({
      userId: auth.user.id,
      mimeType: image.type,
      nonce: crypto.randomUUID(),
    });

    const { error } = await supabase.storage
      .from(USER_UPLOADS_BUCKET)
      .upload(imagePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (error) {
      return { errors: { image: '이미지를 업로드하지 못했습니다. 다시 시도해주세요.' } };
    }
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: auth.user.id,
      ip_id: ipId,
      text,
      tag,
      image_path: imagePath,
    })
    .select('id')
    .single();

  if (error) {
    return { errors: { form: '포스트를 저장하지 못했습니다. 다시 시도해주세요.' } };
  }

  revalidatePath('/community');
  revalidatePath('/');
  if (ipId) revalidatePath(`/ip/${ipId}`);

  redirect(next);
}
