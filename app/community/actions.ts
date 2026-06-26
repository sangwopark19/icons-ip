'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCatalogSnapshot } from '@/lib/catalog';
import { isOnboarded, onboardingPath, safeNextPath } from '@/lib/auth/onboarding';
import { getCurrentAuthState } from '@/lib/auth/server';
import {
  buildCommunityUploadPath,
  normalizeCommunityBlockForm,
  normalizeCommunityCommentForm,
  normalizeCommunityLikeForm,
  normalizeCommunityPostForm,
  normalizeCommunityReportForm,
  normalizeCommunityUuid,
} from '@/lib/community';
import { createClient } from '@/lib/supabase/server';

export interface CommunityPostActionState {
  errors?: {
    text?: string;
    ipId?: string;
    image?: string;
    form?: string;
  };
}

export interface CommunityCommentActionState {
  errors?: {
    postId?: string;
    text?: string;
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

function communityErrorPath(next: string) {
  const url = new URL(safeNextPath(next), 'https://icons.local');
  url.searchParams.set('community_error', '1');
  return `${url.pathname}${url.search}${url.hash}`;
}

function readRpcIpId(data: unknown) {
  if (!data || typeof data !== 'object') return null;
  const candidate = Array.isArray(data) ? data[0] : data;
  if (!candidate || typeof candidate !== 'object') return null;
  const ipId = (candidate as { ipId?: unknown; ip_id?: unknown }).ipId ?? (candidate as { ip_id?: unknown }).ip_id;
  return typeof ipId === 'string' && ipId.trim() ? ipId : null;
}

async function requireAuthenticatedCommunityUser(next: string) {
  const auth = await getCurrentAuthState();

  if (!auth.isConfigured || !auth.user) {
    redirect(loginPath(next));
  }

  return { auth, user: auth.user };
}

async function requireCommunityUser(next: string) {
  const { auth, user } = await requireAuthenticatedCommunityUser(next);

  if (!isOnboarded(auth.profile, user.email)) {
    redirect(onboardingPath(next));
  }

  return user;
}

function revalidateCommunitySurfaces(ipId: string | null) {
  revalidatePath('/community');
  revalidatePath('/');
  if (ipId) revalidatePath(`/ip/${ipId}`);
}

function revalidateCommunityModerationSurfaces(ipId: string | null) {
  revalidateCommunitySurfaces(ipId);
  revalidatePath('/search');
}

export async function createCommunityPostAction(
  _state: CommunityPostActionState,
  formData: FormData,
): Promise<CommunityPostActionState> {
  const next = readNext(formData);
  const user = await requireCommunityUser(next);

  const catalog = await getCatalogSnapshot();
  const normalized = normalizeCommunityPostForm(formData, new Set(catalog.ips.map((ip) => ip.id)));

  if (!normalized.ok) return { errors: normalized.errors };

  const supabase = await createClient();
  const { text, ipId, tag, image } = normalized.value;
  let imagePath: string | null = null;

  if (image) {
    imagePath = buildCommunityUploadPath({
      userId: user.id,
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
      user_id: user.id,
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

export async function createCommunityCommentAction(
  _state: CommunityCommentActionState,
  formData: FormData,
): Promise<CommunityCommentActionState> {
  const next = readNext(formData);
  await requireCommunityUser(next);

  const normalized = normalizeCommunityCommentForm(formData);
  if (!normalized.ok) return { errors: normalized.errors };

  const supabase = await createClient();
  const { error, data } = await supabase.rpc('create_post_comment', {
    target_post_id: normalized.value.postId,
    comment_text: normalized.value.text,
  });

  if (error) {
    return { errors: { form: '댓글을 저장하지 못했습니다. 다시 시도해주세요.' } };
  }

  revalidateCommunitySurfaces(readRpcIpId(data));
  redirect(next);
}

export async function setCommunityPostLikeAction(formData: FormData) {
  const next = readNext(formData);
  await requireCommunityUser(next);

  const normalized = normalizeCommunityLikeForm(formData);
  if (!normalized.ok) redirect(communityErrorPath(next));

  const supabase = await createClient();
  const { error, data } = await supabase.rpc('set_post_like', {
    target_post_id: normalized.value.postId,
    should_like: normalized.value.shouldLike,
  });

  if (error) redirect(communityErrorPath(next));

  revalidateCommunitySurfaces(readRpcIpId(data));
  redirect(next);
}

export async function deleteCommunityPostAction(formData: FormData) {
  const next = readNext(formData);
  await requireCommunityUser(next);

  const postId = normalizeCommunityUuid(formData.get('postId'));
  if (!postId) redirect(communityErrorPath(next));

  const supabase = await createClient();
  const { error, data } = await supabase.rpc('delete_own_post', {
    target_post_id: postId,
  });

  if (error) redirect(communityErrorPath(next));

  revalidateCommunitySurfaces(readRpcIpId(data));
  redirect(next);
}

export async function deleteCommunityCommentAction(formData: FormData) {
  const next = readNext(formData);
  await requireCommunityUser(next);

  const commentId = normalizeCommunityUuid(formData.get('commentId'));
  if (!commentId) redirect(communityErrorPath(next));

  const supabase = await createClient();
  const { error, data } = await supabase.rpc('delete_own_comment', {
    target_comment_id: commentId,
  });

  if (error) redirect(communityErrorPath(next));

  revalidateCommunitySurfaces(readRpcIpId(data));
  redirect(next);
}

export async function reportCommunityTargetAction(formData: FormData) {
  const next = readNext(formData);
  await requireAuthenticatedCommunityUser(next);

  const normalized = normalizeCommunityReportForm(formData);
  if (!normalized.ok) redirect(communityErrorPath(next));

  const supabase = await createClient();
  const { error, data } = await supabase.rpc('submit_community_report', {
    target_type: normalized.value.targetType,
    target_id: normalized.value.targetId,
    reason: normalized.value.reason,
  });

  if (error) redirect(communityErrorPath(next));

  revalidateCommunitySurfaces(readRpcIpId(data));
  redirect(next);
}

export async function blockCommunityUserAction(formData: FormData) {
  const next = readNext(formData);
  await requireAuthenticatedCommunityUser(next);

  const normalized = normalizeCommunityBlockForm(formData);
  if (!normalized.ok) redirect(communityErrorPath(next));

  const supabase = await createClient();
  const { error } = await supabase.rpc('block_community_user', {
    target_user_id: normalized.value.targetUserId,
  });

  if (error) redirect(communityErrorPath(next));

  revalidateCommunityModerationSurfaces(null);
  redirect(next);
}
