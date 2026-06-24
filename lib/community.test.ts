import { describe, expect, it } from 'vitest';
import {
  MAX_COMMUNITY_IMAGE_BYTES,
  buildCommunityUploadPath,
  canViewCommunityPost,
  normalizeCommunityPostForm,
} from './community';

describe('canViewCommunityPost', () => {
  it('shows visible posts to public viewers', () => {
    expect(canViewCommunityPost({ status: 'visible', userId: 'author' }, { viewerId: null, isStaff: false })).toBe(true);
  });

  it('shows hidden posts only to the author or staff', () => {
    const post = { status: 'hidden' as const, userId: 'author' };

    expect(canViewCommunityPost(post, { viewerId: null, isStaff: false })).toBe(false);
    expect(canViewCommunityPost(post, { viewerId: 'other', isStaff: false })).toBe(false);
    expect(canViewCommunityPost(post, { viewerId: 'author', isStaff: false })).toBe(true);
    expect(canViewCommunityPost(post, { viewerId: 'other', isStaff: true })).toBe(true);
  });
});

describe('normalizeCommunityPostForm', () => {
  it('normalizes text, IP, tag and accepted optional image input', () => {
    const formData = new FormData();
    const file = new File(['image'], 'proof.png', { type: 'image/png' });
    formData.set('text', '  성수 팝업 후기입니다  ');
    formData.set('ipId', 'hwasan');
    formData.set('tag', '  팝업 인증!  ');
    formData.set('image', file);

    expect(normalizeCommunityPostForm(formData, new Set(['hwasan']))).toEqual({
      ok: true,
      value: {
        text: '성수 팝업 후기입니다',
        ipId: 'hwasan',
        tag: '팝업인증',
        image: file,
      },
    });
  });

  it('rejects empty text, unknown IP IDs, unsupported images and oversized images', () => {
    const formData = new FormData();
    formData.set('text', ' ');
    formData.set('ipId', 'unknown');
    formData.set('image', new File([new Uint8Array(MAX_COMMUNITY_IMAGE_BYTES + 1)], 'proof.txt', { type: 'text/plain' }));

    expect(normalizeCommunityPostForm(formData, new Set(['hwasan']))).toEqual({
      ok: false,
      errors: {
        text: '포스트 내용을 입력해주세요.',
        ipId: 'IP 채널을 선택해주세요.',
        image: '이미지는 JPEG, PNG, WebP, GIF 형식의 5MB 이하 파일만 업로드할 수 있습니다.',
      },
    });
  });
});

describe('buildCommunityUploadPath', () => {
  it('stores uploads under the authenticated user folder with a safe extension', () => {
    expect(buildCommunityUploadPath({ userId: 'user-1', mimeType: 'image/webp', nonce: 'abc-123' })).toBe(
      'user-1/community/abc-123.webp',
    );
  });
});
