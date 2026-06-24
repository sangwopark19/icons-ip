import 'server-only';

import { DATA, type Ip } from '@/lib/data';
import { getCatalogSnapshot } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';
import {
  canViewCommunityPost,
  type CommunityChannel,
  type CommunityFeedPost,
  type CommunityPostStatus,
  type CommunitySnapshot,
} from '@/lib/community';

const USER_UPLOADS_BUCKET = 'user-uploads';
const COMMUNITY_FEED_LIMIT = 30;
const SIGNED_IMAGE_EXPIRES_IN_SECONDS = 60 * 60;

interface CommunityPostRow {
  id: string;
  user_id: string;
  ip_id: string | null;
  text: string;
  tag: string | null;
  created_at: string;
  image_path: string | null;
  status: CommunityPostStatus;
}

interface PublicProfileRow {
  id: string;
  nickname: string | null;
}

interface CommunityReactionCountRow {
  post_id: string;
  likes_count: number | string | null;
  comments_count: number | string | null;
}

type CommunitySupabaseClient = Awaited<ReturnType<typeof createClient>>;

function channelFromIp(ip: Ip): CommunityChannel {
  return {
    id: ip.id,
    title: ip.title,
    sub: ip.sub,
    color: ip.v.color,
  };
}

function formatPostTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
}

async function reactionCountsByPostId(supabase: CommunitySupabaseClient, postIds: string[]) {
  const { data, error } = await supabase.rpc('community_post_reaction_counts', {
    target_post_ids: postIds,
  });

  if (error) {
    throw new Error(`Failed to load post reactions: ${error.message}`);
  }

  const likesByPostId = new Map<string, number>();
  const commentsByPostId = new Map<string, number>();

  for (const row of (data ?? []) as CommunityReactionCountRow[]) {
    likesByPostId.set(row.post_id, Number(row.likes_count ?? 0));
    commentsByPostId.set(row.post_id, Number(row.comments_count ?? 0));
  }

  return { likesByPostId, commentsByPostId };
}

async function signedImageUrlByPath(supabase: CommunitySupabaseClient, paths: string[]) {
  const entries = await Promise.all(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(USER_UPLOADS_BUCKET)
        .createSignedUrl(path, SIGNED_IMAGE_EXPIRES_IN_SECONDS);

      if (error || !data?.signedUrl) {
        return null;
      }

      return [path, data.signedUrl] as const;
    }),
  );

  return new Map(entries.filter((entry): entry is [string, string] => entry !== null));
}

function publicAuthorName(profile: PublicProfileRow | undefined, userId: string) {
  return profile?.nickname?.trim() || `fan_${userId.slice(0, 6)}`;
}

function postFallbackIp(ips: Ip[]) {
  return ips[0] ?? null;
}

function toCommunityPost(
  row: CommunityPostRow,
  ipsById: Map<string, Ip>,
  fallbackIp: Ip | null,
  profilesById: Map<string, PublicProfileRow>,
  likesByPostId: Map<string, number>,
  commentsByPostId: Map<string, number>,
  imageUrlByPath: Map<string, string>,
): CommunityFeedPost {
  const ip = row.ip_id ? ipsById.get(row.ip_id) : null;
  const displayIp = ip ?? fallbackIp;

  return {
    id: row.id,
    user: publicAuthorName(profilesById.get(row.user_id), row.user_id),
    ipId: row.ip_id,
    ipName: displayIp?.title ?? '커뮤니티',
    avatar: displayIp?.v.color ?? 'var(--holo)',
    text: row.text,
    likes: likesByPostId.get(row.id) ?? 0,
    comments: commentsByPostId.get(row.id) ?? 0,
    time: formatPostTime(row.created_at),
    tag: row.tag?.trim() || '커뮤니티',
    img: row.image_path ? imageUrlByPath.get(row.image_path) ?? null : null,
  };
}

function mockPosts(ips: Ip[]): CommunityFeedPost[] {
  const fallbackIp = postFallbackIp(ips);
  const ipsByTitle = new Map(ips.map((ip) => [ip.title, ip]));

  return DATA.POSTS.map((post) => {
    const ip = ipsByTitle.get(post.ipName) ?? fallbackIp;
    return {
      id: post.id,
      user: post.user,
      ipId: ip?.id ?? null,
      ipName: post.ipName,
      avatar: post.avatar,
      text: post.text,
      likes: post.likes,
      comments: post.comments,
      time: post.time,
      tag: post.tag,
      img: post.img,
    };
  });
}

async function getSupabasePosts(ips: Ip[]) {
  const supabase = await createClient();
  const postsResult = await supabase
    .from('posts')
    .select('id,user_id,ip_id,text,tag,created_at,image_path,status')
    .eq('status', 'visible')
    .order('created_at', { ascending: false })
    .limit(COMMUNITY_FEED_LIMIT);

  if (postsResult.error) {
    throw new Error(`Failed to load community posts: ${postsResult.error.message}`);
  }

  const posts = ((postsResult.data ?? []) as CommunityPostRow[]).filter((post) =>
    canViewCommunityPost({ status: post.status, userId: post.user_id }, { viewerId: null, isStaff: false }),
  );
  if (!posts.length) return [];

  const postIds = posts.map((post) => post.id);
  const userIds = Array.from(new Set(posts.map((post) => post.user_id)));
  const imagePaths = Array.from(new Set(posts.map((post) => post.image_path).filter((path): path is string => Boolean(path))));

  const [profilesResult, reactionCounts, imageUrlByPath] = await Promise.all([
    supabase.from('public_profiles').select('id,nickname').in('id', userIds),
    reactionCountsByPostId(supabase, postIds),
    signedImageUrlByPath(supabase, imagePaths),
  ]);

  if (profilesResult.error) {
    throw new Error(`Failed to load community authors: ${profilesResult.error.message}`);
  }

  const ipsById = new Map(ips.map((ip) => [ip.id, ip]));
  const fallbackIp = postFallbackIp(ips);
  const profilesById = new Map(((profilesResult.data ?? []) as PublicProfileRow[]).map((profile) => [profile.id, profile]));

  return posts.map((post) =>
    toCommunityPost(
      post,
      ipsById,
      fallbackIp,
      profilesById,
      reactionCounts.likesByPostId,
      reactionCounts.commentsByPostId,
      imageUrlByPath,
    ),
  );
}

export async function getCommunitySnapshot(): Promise<CommunitySnapshot> {
  const catalog = await getCatalogSnapshot();

  return {
    source: catalog.source,
    channels: catalog.ips.map(channelFromIp),
    goods: catalog.goods,
    posts: catalog.source === 'mock' ? mockPosts(catalog.ips) : await getSupabasePosts(catalog.ips),
    trending: DATA.TRENDING,
  };
}
