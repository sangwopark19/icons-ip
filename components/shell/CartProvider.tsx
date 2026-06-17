'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface CartCtx {
  count: number;
  add: () => void;
}

const Ctx = createContext<CartCtx>({ count: 0, add: () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(2);
  return <Ctx.Provider value={{ count, add: () => setCount((c) => c + 1) }}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);
