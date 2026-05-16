import { useState, useEffect, useCallback } from "react";
import { rentalOfferService } from "@/services/rentalOfferService";

/**
 * Hook to manage rental offers state and fetching.
 */
export function useRentalOffers(filters = {}) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchOffers = useCallback(async (isLoadMore = false) => {
    setLoading(true);
    try {
      const result = await rentalOfferService.getOffers({
        ...filters,
        lastVisible: isLoadMore ? lastVisible : null
      });

      if (isLoadMore) {
        setOffers(prev => [...prev, ...result.offers]);
      } else {
        setOffers(result.offers);
      }

      setLastVisible(result.lastVisible);
      setHasMore(result.offers.length === (filters.limitCount || 20));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, lastVisible]);

  useEffect(() => {
    fetchOffers();
  }, [filters.airportCode, filters.brand, filters.category, filters.onlyHeroDeals]);

  return {
    offers,
    loading,
    error,
    hasMore,
    loadMore: () => fetchOffers(true),
    refresh: () => fetchOffers(false)
  };
}
