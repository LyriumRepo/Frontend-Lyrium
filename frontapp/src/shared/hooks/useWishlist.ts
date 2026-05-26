'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { wishlistApi } from '@/shared/lib/api/wishlistRepository';

export function useWishlist(productId: number | string) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const pid = typeof productId === 'string' ? parseInt(productId, 10) : productId;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !pid) {
      setIsWishlisted(false);
      setWishlistId(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    wishlistApi.check(pid)
      .then((result) => {
        if (!cancelled) {
          setIsWishlisted(result.in_wishlist);
          setWishlistId(result.wishlist_id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsWishlisted(false);
          setWishlistId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pid, isAuthenticated, authLoading]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    try {
      if (isWishlisted && wishlistId) {
        await wishlistApi.remove(wishlistId);
        setIsWishlisted(false);
        setWishlistId(null);
      } else {
        const item = await wishlistApi.add(pid);
        setIsWishlisted(true);
        setWishlistId(item.id);
      }
    } catch {
      // revert optimistic change
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isWishlisted, wishlistId, pid]);

  return { isWishlisted, toggle, loading };
}
