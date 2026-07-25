import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedBikes,
  DEFAULT_PRICING_TIERS,
  type Bike,
  type BikeCategory,
  type Transmission,
} from "./bike-catalog";

export type { Bike, BikeCategory, Transmission };

export type Settings = {
  whatsapp: string;
  zalo: string;
  messenger: string;
  ownerName: string;
};

export type Review = {
  id: string;
  bikeId: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  bikeId: string;
  customerName: string;
  phone: string;
  fromDate: string; // ISO string
  toDate: string; // ISO string
  total: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

type Store = {
  bikes: Bike[];
  settings: Settings;
  reviews: Review[];
  bookings: Booking[];
  pricingTiers: Record<number, number[]>;
  addBike: (b: Omit<Bike, "id">) => void;
  updateBike: (id: string, b: Partial<Bike>) => void;
  removeBike: (id: string) => void;
  toggleAvailable: (id: string) => void;
  setSettings: (s: Settings) => void;
  addReview: (r: Omit<Review, "id" | "createdAt">) => void;
  addBooking: (b: Omit<Booking, "id" | "createdAt">) => void;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
  updatePricingTier: (rate: number, prices: number[]) => void;
  removePricingTier: (rate: number) => void;
};

const StoreCtx = createContext<Store | null>(null);

const LS_KEY = "moto-rental-store-v4";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bikes, setBikes] = useState<Bike[]>(seedBikes);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettingsState] = useState<Settings>({
    whatsapp: "84900000000",
    zalo: "84900000000",
    messenger: "motorent",
    ownerName: "Jan",
  });
  const [pricingTiers, setPricingTiers] = useState<Record<number, number[]>>(DEFAULT_PRICING_TIERS);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.bikes) setBikes(parsed.bikes);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.settings) setSettingsState((s) => ({ ...s, ...parsed.settings }));
        if (parsed.pricingTiers)
          // Merge: DEFAULT_PRICING_TIERS takes precedence for any new rates added in code;
          // user-edited values in localStorage override defaults for existing rates
          setPricingTiers({ ...DEFAULT_PRICING_TIERS, ...parsed.pricingTiers });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ bikes, settings, reviews, bookings, pricingTiers }),
    );
  }, [bikes, settings, reviews, bookings, pricingTiers, hydrated]);

  const value = useMemo<Store>(
    () => ({
      bikes,
      settings,
      reviews,
      bookings,
      pricingTiers,
      addBike: (b) => setBikes((prev) => [{ ...b, id: crypto.randomUUID() }, ...prev]),
      updateBike: (id, b) =>
        setBikes((prev) => prev.map((x) => (x.id === id ? { ...x, ...b } : x))),
      removeBike: (id) => setBikes((prev) => prev.filter((x) => x.id !== id)),
      toggleAvailable: (id) =>
        setBikes((prev) => prev.map((x) => (x.id === id ? { ...x, available: !x.available } : x))),
      setSettings: (s) => setSettingsState(s),
      addReview: (r) =>
        setReviews((prev) => [
          { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ...prev,
        ]),
      addBooking: (b) =>
        setBookings((prev) => [
          { ...b, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ...prev,
        ]),
      updateBookingStatus: (id, status) =>
        setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x))),
      updatePricingTier: (rate, prices) => setPricingTiers((prev) => ({ ...prev, [rate]: prices })),
      removePricingTier: (rate) =>
        setPricingTiers((prev) => {
          const next = { ...prev };
          delete next[rate];
          return next;
        }),
    }),
    [bikes, settings, reviews, bookings, pricingTiers],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
