'use client';

import { useRouter } from 'next/navigation';
import { hrefFor } from '@/lib/routes';

export type Go = (route: string, param?: string | null) => void;

export function useGo(): Go {
  const router = useRouter();
  return (route, param) => {
    router.push(hrefFor(route, param));
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
}
