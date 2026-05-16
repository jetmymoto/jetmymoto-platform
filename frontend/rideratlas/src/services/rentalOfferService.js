import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  startAfter,
  or
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Service to fetch rental offers from Firestore.
 */
export const rentalOfferService = {
  /**
   * Fetch active rental offers with filtering and sorting.
   */
  async getOffers({
    airportCode,
    brand,
    category,
    minDealScore = 0,
    onlyHeroDeals = false,
    limitCount = 20,
    lastVisible = null
  } = {}) {
    try {
      let q = query(
        collection(db, "rental_offers"),
        where("status", "==", "active")
      );

      if (airportCode) {
        const code = airportCode.toUpperCase();
        q = query(q, or(
          where("airport_code", "==", code),
          where("associated_airports", "array-contains", code)
        ));
      }

      if (brand && brand !== "all") {
        q = query(q, where("brand", "==", brand));
      }

      if (category && category !== "all") {
        q = query(q, where("category", "==", category.toLowerCase()));
      }

      if (onlyHeroDeals) {
        q = query(q, where("lead_magnet_tier", "==", "hero_deal"));
      }

      if (minDealScore > 0) {
        q = query(q, where("deal_score", ">=", minDealScore));
      }

      // Note: Firestore requires specific composite indexes for or() + orderBy.
      // If index is missing, it will throw an error with a link to create it.
      q = query(q, orderBy("deal_score", "desc"));

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        offers,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        count: offers.length
      };
    } catch (error) {
      console.error("[rentalOfferService] Error fetching offers:", error);
      throw error;
    }
  }
};
