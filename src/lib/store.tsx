import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
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
  fromDate: string;
  toDate: string;
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
  loading: boolean;
  addBike: (b: Omit<Bike, "id">) => Promise<void>;
  updateBike: (id: string, b: Partial<Bike>) => Promise<void>;
  removeBike: (id: string) => Promise<void>;
  toggleAvailable: (id: string) => Promise<void>;
  setSettings: (s: Settings) => Promise<void>;
  addReview: (r: Omit<Review, "id" | "createdAt">) => Promise<void>;
  addBooking: (b: Omit<Booking, "id" | "createdAt">) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
  updatePricingTier: (rate: number, prices: number[]) => Promise<void>;
  removePricingTier: (rate: number) => Promise<void>;
};

const StoreCtx = createContext<Store | null>(null);

// ── Mappers: Supabase snake_case ↔ App camelCase ──────────────────
function mapBike(row: Record<string, unknown>): Bike {
  return {
    id: row.id as string,
    name: row.name as string,
    brand: row.brand as string | undefined,
    category: row.category as Bike["category"],
    engineCc: row.engine_cc as number,
    transmission: row.transmission as Bike["transmission"],
    pricePerDay: row.price_per_day as number,
    pricePerWeek: row.price_per_week as number,
    pricePerMonth: row.price_per_month as number,
    deposit: row.deposit as number,
    description: row.description as string,
    descriptionVi: row.description_vi as string | undefined,
    imageUrl: row.image_url as string,
    images: row.images as string[] | undefined,
    available: row.available as boolean,
    isForSale: row.is_for_sale as boolean | undefined,
    salePrice: row.sale_price as number | undefined,
    busyFrom: row.busy_from as string | undefined,
    busyTo: row.busy_to as string | undefined,
  };
}

function mapReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    bikeId: row.bike_id as string,
    rating: row.rating as number,
    comment: row.comment as string,
    authorName: row.author_name as string,
    createdAt: row.created_at as string,
  };
}

function mapBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    bikeId: row.bike_id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    fromDate: row.from_date as string,
    toDate: row.to_date as string,
    total: row.total as number,
    status: row.status as Booking["status"],
    createdAt: row.created_at as string,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bikes, setBikes] = useState<Bike[]>(() => {
    try {
      const cached = localStorage.getItem("jan_bikes_cache");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettingsState] = useState<Settings>(() => {
    try {
      const cached = localStorage.getItem("jan_settings_cache");
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      whatsapp: "84900000000",
      zalo: "84900000000",
      messenger: "motorent",
      ownerName: "Jan",
    };
  });
  const [pricingTiers, setPricingTiers] = useState<Record<number, number[]>>(() => {
    try {
      const cached = localStorage.getItem("jan_tiers_cache");
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_PRICING_TIERS;
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem("jan_bikes_cache");
    } catch {
      return true;
    }
  });

  // ── Load all data from Supabase on mount ──────────────────────
  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      // Only show loading indicator if we don't have cached data
      setLoading((prev) => (bikes.length === 0 ? true : prev));
      try {
        const [
          { data: bikesData },
          { data: settingsData },
          { data: tiersData },
        ] = await Promise.all([
          supabase.from("bikes").select("*").order("created_at", { ascending: false }),
          supabase.from("settings").select("*").eq("id", 1).single(),
          supabase.from("pricing_tiers").select("*").order("rate"),
        ]);

        if (!mounted) return;

        if (bikesData && bikesData.length > 0) {
          const b = bikesData.map((r) => mapBike(r as Record<string, unknown>));
          setBikes(b);
          localStorage.setItem("jan_bikes_cache", JSON.stringify(b));
        }
        if (settingsData) {
          const s = settingsData as Record<string, unknown>;
          const st = {
            whatsapp: s.whatsapp as string,
            zalo: s.zalo as string,
            messenger: s.messenger as string,
            ownerName: s.owner_name as string,
          };
          setSettingsState(st);
          localStorage.setItem("jan_settings_cache", JSON.stringify(st));
        }
        if (tiersData && tiersData.length > 0) {
          const merged: Record<number, number[]> = { ...DEFAULT_PRICING_TIERS };
          (tiersData as { rate: number; prices: number[] }[]).forEach((t) => {
            merged[t.rate] = t.prices;
          });
          setPricingTiers(merged);
          localStorage.setItem("jan_tiers_cache", JSON.stringify(merged));
        }
      } catch (e) {
        console.error("Failed to load critical data from Supabase.", e);
      } finally {
        if (mounted) setLoading(false);
      }

      // Fetch non-blocking data asynchronously
      try {
        Promise.all([
          supabase.from("reviews").select("*").order("created_at", { ascending: false }),
          supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        ]).then(([ { data: reviewsData }, { data: bookingsData } ]) => {
          if (!mounted) return;
          if (reviewsData)
            setReviews(reviewsData.map((r) => mapReview(r as Record<string, unknown>)));
          if (bookingsData)
            setBookings(bookingsData.map((r) => mapBooking(r as Record<string, unknown>)));
        });
      } catch (e) {
        console.error("Failed to load async data from Supabase.", e);
      }
    }
    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────
  const value = useMemo<Store>(
    () => ({
      bikes,
      settings,
      reviews,
      bookings,
      pricingTiers,
      loading,

      addBike: async (b) => {
        const row = {
          name: b.name,
          brand: b.brand,
          category: b.category,
          engine_cc: b.engineCc,
          transmission: b.transmission,
          price_per_day: b.pricePerDay,
          price_per_week: b.pricePerWeek,
          price_per_month: b.pricePerMonth,
          deposit: b.deposit,
          description: b.description,
          description_vi: b.descriptionVi,
          image_url: b.imageUrl,
          images: b.images,
          available: b.available,
          is_for_sale: b.isForSale,
          sale_price: b.salePrice,
          busy_from: b.busyFrom || null,
          busy_to: b.busyTo || null,
        };
        const { data, error } = await supabase.from("bikes").insert(row).select().single();
        if (error) throw new Error(error.message);
        if (data) setBikes((prev) => [mapBike(data as Record<string, unknown>), ...prev]);
      },

      updateBike: async (id, b) => {
        const row: Record<string, unknown> = {};
        if (b.name !== undefined) row.name = b.name;
        if (b.brand !== undefined) row.brand = b.brand;
        if (b.category !== undefined) row.category = b.category;
        if (b.engineCc !== undefined) row.engine_cc = b.engineCc;
        if (b.transmission !== undefined) row.transmission = b.transmission;
        if (b.pricePerDay !== undefined) row.price_per_day = b.pricePerDay;
        if (b.pricePerWeek !== undefined) row.price_per_week = b.pricePerWeek;
        if (b.pricePerMonth !== undefined) row.price_per_month = b.pricePerMonth;
        if (b.deposit !== undefined) row.deposit = b.deposit;
        if (b.description !== undefined) row.description = b.description;
        if (b.descriptionVi !== undefined) row.description_vi = b.descriptionVi;
        if (b.imageUrl !== undefined) row.image_url = b.imageUrl;
        if (b.images !== undefined) row.images = b.images;
        if (b.available !== undefined) row.available = b.available;
        if (b.isForSale !== undefined) row.is_for_sale = b.isForSale;
        if (b.salePrice !== undefined) row.sale_price = b.salePrice;
        if (b.busyFrom !== undefined) row.busy_from = b.busyFrom || null;
        if (b.busyTo !== undefined) row.busy_to = b.busyTo || null;
        const { error } = await supabase.from("bikes").update(row).eq("id", id);
        if (error) throw new Error(error.message);
        setBikes((prev) => prev.map((x) => (x.id === id ? { ...x, ...b } : x)));
      },

      removeBike: async (id) => {
        const { error } = await supabase.from("bikes").delete().eq("id", id);
        if (!error) setBikes((prev) => prev.filter((x) => x.id !== id));
      },

      toggleAvailable: async (id) => {
        const bike = bikes.find((x) => x.id === id);
        if (!bike) return;
        const next = !bike.available;
        const { error } = await supabase.from("bikes").update({ available: next }).eq("id", id);
        if (!error)
          setBikes((prev) => prev.map((x) => (x.id === id ? { ...x, available: next } : x)));
      },

      setSettings: async (s) => {
        const { error } = await supabase
          .from("settings")
          .update({ whatsapp: s.whatsapp, zalo: s.zalo, messenger: s.messenger, owner_name: s.ownerName })
          .eq("id", 1);
        if (!error) setSettingsState(s);
      },

      addReview: async (r) => {
        const { data, error } = await supabase
          .from("reviews")
          .insert({ bike_id: r.bikeId, rating: r.rating, comment: r.comment, author_name: r.authorName })
          .select()
          .single();
        if (!error && data) setReviews((prev) => [mapReview(data as Record<string, unknown>), ...prev]);
      },

      addBooking: async (b) => {
        const { data, error } = await supabase
          .from("bookings")
          .insert({
            bike_id: b.bikeId,
            customer_name: b.customerName,
            phone: b.phone,
            from_date: b.fromDate,
            to_date: b.toDate,
            total: b.total,
            status: b.status,
          })
          .select()
          .single();
        if (!error && data)
          setBookings((prev) => [mapBooking(data as Record<string, unknown>), ...prev]);
      },

      updateBookingStatus: async (id, status) => {
        const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
        if (!error)
          setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      },

      updatePricingTier: async (rate, prices) => {
        await supabase
          .from("pricing_tiers")
          .upsert({ rate, prices }, { onConflict: "rate" });
        setPricingTiers((prev) => ({ ...prev, [rate]: prices }));
      },

      removePricingTier: async (rate) => {
        await supabase.from("pricing_tiers").delete().eq("rate", rate);
        setPricingTiers((prev) => {
          const next = { ...prev };
          delete next[rate];
          return next;
        });
      },
    }),
    [bikes, settings, reviews, bookings, pricingTiers, loading],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
