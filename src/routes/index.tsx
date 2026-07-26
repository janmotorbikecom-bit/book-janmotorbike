import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { StoreProvider, useStore, type Bike, type BikeCategory } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { SiteHeader } from "@/components/SiteHeader";
import { BikeCard } from "@/components/BikeCard";
import { BikeDetailDialog } from "@/components/BikeDetailDialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { bikeId?: string } => {
    return {
      bikeId: search.bikeId as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "MotoRent — Rent a Motorbike by the Day, Week or Month" },
      {
        name: "description",
        content: "Browse available motorbikes. Pick your dates and book instantly via WhatsApp.",
      },
      { property: "og:title", content: "MotoRent — Motorbike Rentals" },
      {
        property: "og:description",
        content: "Flexible daily, weekly and monthly motorbike rentals. Book in one tap.",
      },
    ],
  }),
  component: () => (
    <StoreProvider>
      <Storefront />
    </StoreProvider>
  ),
});

type CategoryFilter = "All" | BikeCategory;
type BrandFilter = "All" | string;
type SortOpt = "featured" | "price-asc" | "price-desc";

function Storefront() {
  const { bikes } = useStore();
  const { t, lang, formatVnd } = useUI();
  const searchParams = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("All");
  const [brand, setBrand] = useState<BrandFilter>("All");
  const [priceMax, setPriceMax] = useState<number[]>([1000000]);
  const [sort, setSort] = useState<SortOpt>("featured");
  const [selected, setSelected] = useState<Bike | null>(null);
  const [open, setOpen] = useState(false);

  // Parse ?bikeId and open dialog automatically
  useEffect(() => {
    if (searchParams.bikeId && !selected && bikes.length > 0) {
      const b = bikes.find((x) => x.id === searchParams.bikeId);
      if (b) {
        setSelected(b);
        setOpen(true);
      }
    }
  }, [searchParams.bikeId, bikes, selected]);

  function openBike(b: Bike) {
    setSelected(b);
    setOpen(true);
  }

  const list = useMemo(() => {
    let out = bikes.filter((b) => b.available);
    if (cat !== "All") out = out.filter((b) => b.category === cat);
    if (brand !== "All") out = out.filter((b) => b.brand === brand);
    if (q.trim()) {
      const s = q.toLowerCase();
      out = out.filter((b) => b.name.toLowerCase().includes(s));
    }
    // Filter by max price per day
    out = out.filter((b) => b.pricePerDay <= priceMax[0]);

    if (sort === "price-asc") out = [...out].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price-desc") out = [...out].sort((a, b) => b.pricePerDay - a.pricePerDay);
    return out;
  }, [bikes, cat, brand, sort, q, priceMax]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section
        className="relative border-b border-border text-primary-foreground bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/Jan-motorbike-customers-motorbike-for-rent-in-hcm.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-24 text-center md:text-left drop-shadow-md">
          <p className="mb-4 inline-block rounded-full bg-accent/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground drop-shadow-sm">
            {t("hero_kicker")}
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-black uppercase tracking-widest leading-tight md:text-6xl text-white drop-shadow-lg">
            {t("hero_title_1")}{" "}
            <span className="text-accent drop-shadow-lg">{t("hero_title_2")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-white/90 font-medium leading-relaxed mx-auto md:mx-0 drop-shadow-md">
            {t("hero_sub")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search_placeholder")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-11 h-12 rounded-xl border-muted bg-muted/50 font-medium"
              />
            </div>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="sm:w-40 h-12 rounded-xl font-bold uppercase tracking-wider text-xs">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="font-bold uppercase tracking-wider text-xs">
                  {lang === "vi" ? "Tất cả hãng" : "All Brands"}
                </SelectItem>
                <SelectItem value="Honda" className="font-bold uppercase tracking-wider text-xs">
                  Honda
                </SelectItem>
                <SelectItem value="Yamaha" className="font-bold uppercase tracking-wider text-xs">
                  Yamaha
                </SelectItem>
                <SelectItem value="Vespa" className="font-bold uppercase tracking-wider text-xs">
                  Vespa
                </SelectItem>
                <SelectItem value="SYM" className="font-bold uppercase tracking-wider text-xs">
                  SYM
                </SelectItem>
                <SelectItem value="Suzuki" className="font-bold uppercase tracking-wider text-xs">
                  Suzuki
                </SelectItem>
                <SelectItem value="Other" className="font-bold uppercase tracking-wider text-xs">
                  {lang === "vi" ? "Khác" : "Other"}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={cat} onValueChange={(v) => setCat(v as CategoryFilter)}>
              <SelectTrigger className="sm:w-48 h-12 rounded-xl font-bold uppercase tracking-wider text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="font-bold uppercase tracking-wider text-xs">
                  {t("cat_all")}
                </SelectItem>
                <SelectItem
                  value="Automatic"
                  className="font-bold uppercase tracking-wider text-xs"
                >
                  {t("cat_auto")}
                </SelectItem>
                <SelectItem value="Manual" className="font-bold uppercase tracking-wider text-xs">
                  {t("cat_manual")}
                </SelectItem>
                <SelectItem
                  value="Semi-Automatic"
                  className="font-bold uppercase tracking-wider text-xs"
                >
                  {t("cat_semi")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortOpt)}>
              <SelectTrigger className="sm:w-52 h-12 rounded-xl font-bold uppercase tracking-wider text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured" className="font-bold uppercase tracking-wider text-xs">
                  {t("sort_featured")}
                </SelectItem>
                <SelectItem
                  value="price-asc"
                  className="font-bold uppercase tracking-wider text-xs"
                >
                  {t("sort_asc")}
                </SelectItem>
                <SelectItem
                  value="price-desc"
                  className="font-bold uppercase tracking-wider text-xs"
                >
                  {t("sort_desc")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-2 py-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
              {lang === "vi" ? "Giá tối đa/ngày" : "Max Price/Day"}:{" "}
              <span className="text-foreground">{formatVnd(priceMax[0])}</span>
            </Label>
            <Slider
              value={priceMax}
              onValueChange={setPriceMax}
              max={1500000}
              step={50000}
              className="flex-1"
            />
          </div>
        </div>

        <div className="mt-10">
          {list.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">
              {t("no_results")}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {list.map((b) => (
                <BikeCard key={b.id} bike={b} onOpen={openBike} />
              ))}
            </div>
          )}
        </div>
      </section>

      <BikeDetailDialog bike={selected} open={open} onOpenChange={setOpen} />

      <footer className="border-t border-border py-12 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted/10">
        © {new Date().getFullYear()} MotoRent
      </footer>
    </div>
  );
}
