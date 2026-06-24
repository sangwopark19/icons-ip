import type { Good } from './data';

export type CommunityPostStatus = 'visible' | 'hidden';

export const MAX_COMMUNITY_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS_BY_MIME_TYPE = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

const IMAGE_ERROR = '이미지는 JPEG, PNG, WebP, GIF 형식의 5MB 이하 파일만 업로드할 수 있습니다.';

export interface CommunityPostVisibilityInput {
  status: CommunityPostStatus;
  userId: string;
}

export interface CommunityViewerInput {
  viewerId: string | null;
  isStaff: boolean;
}

export interface CommunityChannel {
  id: string;
  title: string;
  sub: string;
  color: string;
}

export interface CommunityFeedPost {
  id: string;
  user: string;
  ipId: string | null;
  ipName: string;
  avatar: string;
  text: string;
  likes: number;
  comments: number;
  time: string;
  tag: string;
  img?: string | null;
}

export interface CommunitySnapshot {
  source: 'supabase' | 'mock';
  channels: CommunityChannel[];
  goods: Good[];
  posts: CommunityFeedPost[];
  trending: string[];
}

export function canViewCommunityPost(
  post: CommunityPostVisibilityInput,
  viewer: CommunityViewerInput,
) {
  return post.status === 'visible' || post.userId === viewer.viewerId || viewer.isStaff;
}

export interface CommunityPostFormValue {
  text: string;
  ipId: string | null;
  tag: string | null;
  image: File | null;
}

export interface CommunityPostFormErrors {
  text?: string;
  ipId?: string;
  image?: string;
}

export type CommunityPostFormResult =
  | { ok: true; value: CommunityPostFormValue }
  | { ok: false; errors: CommunityPostFormErrors };

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTag(value: string) {
  const normalized = value.replace(/^#+/, '').replace(/[^\p{L}\p{N}_-]+/gu, '').trim();
  return normalized || null;
}

function imageFromFormData(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

function isAcceptedImage(file: File) {
  return file.size <= MAX_COMMUNITY_IMAGE_BYTES && IMAGE_EXTENSIONS_BY_MIME_TYPE.has(file.type);
}

export function normalizeCommunityPostForm(
  formData: FormData,
  allowedIpIds: ReadonlySet<string>,
): CommunityPostFormResult {
  const text = readString(formData, 'text');
  const rawIpId = readString(formData, 'ipId');
  const ipId = rawIpId && allowedIpIds.has(rawIpId) ? rawIpId : null;
  const image = imageFromFormData(formData.get('image'));
  const errors: CommunityPostFormErrors = {};

  if (!text) errors.text = '포스트 내용을 입력해주세요.';
  if (!ipId) errors.ipId = 'IP 채널을 선택해주세요.';
  if (image && !isAcceptedImage(image)) errors.image = IMAGE_ERROR;

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      text,
      ipId,
      tag: normalizeTag(readString(formData, 'tag')),
      image,
    },
  };
}

export function buildCommunityUploadPath({
  userId,
  mimeType,
  nonce,
}: {
  userId: string;
  mimeType: string;
  nonce: string;
}) {
  const extension = IMAGE_EXTENSIONS_BY_MIME_TYPE.get(mimeType) ?? 'bin';
  return `${userId}/community/${nonce}.${extension}`;
}
