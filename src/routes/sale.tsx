import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { MessageCircle, Gauge, Star, Search } from "lucide-react";
import { StoreProvider, useStore, type Bike, type BikeCategory } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SaleDetailDialog } from "@/components/SaleDetailDialog";

type CategoryFilter = "All" | BikeCategory;
type BrandFilter = "All" | string;
type SortOpt = "featured" | "price-asc" | "price-desc";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "Bikes for Sale — JAN'S MOTORBIKE" },
      { name: "description", content: "Motorbikes available for purchase." },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: () => (
    <StoreProvider>
      <SalePage />
    </StoreProvider>
  ),
});

function SalePage() {
  const { bikes, settings, loading } = useStore();
  const { formatVnd, lang, t } = useUI();
  const [selected, setSelected] = useState<Bike | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("All");
  const [brand, setBrand] = useState<BrandFilter>("All");
  const [cc, setCc] = useState<"All" | number>("All");
  const [priceMax, setPriceMax] = useState<number[]>([100000000]);
  const [sort, setSort] = useState<SortOpt>("featured");

  const saleBikes = useMemo(() => bikes.filter((b) => b.isForSale && b.available && (b.salePrice ?? 0) > 0), [bikes]);

  const uniqueCcs = useMemo(() => {
    const ccs = saleBikes.map((b) => b.engineCc).filter((c) => c != null);
    return Array.from(new Set(ccs)).sort((a, b) => a - b);
  }, [saleBikes]);

  const uniqueBrands = useMemo(() => {
    const b = saleBikes.map((x) => x.brand).filter((x): x is string => !!x && x !== "Other");
    return Array.from(new Set(b)).sort();
  }, [saleBikes]);

  const list = useMemo(() => {
    let out = saleBikes;
    if (cat !== "All") out = out.filter((b) => b.category === cat);
    if (brand !== "All") out = out.filter((b) => b.brand === brand);
    if (cc !== "All") out = out.filter((b) => b.engineCc === cc);
    if (q.trim()) {
      const s = q.toLowerCase();
      out = out.filter((b) => b.name.toLowerCase().includes(s));
    }
    out = out.filter((b) => (b.salePrice ?? 0) <= priceMax[0]);

    if (sort === "price-asc") out = [...out].sort((a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0));
    if (sort === "price-desc") out = [...out].sort((a, b) => (b.salePrice ?? 0) - (a.salePrice ?? 0));
    return out;
  }, [saleBikes, cat, brand, cc, sort, q, priceMax]);

  function openBike(b: Bike) {
    setSelected(b);
    setOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section
        className="relative border-b border-border text-primary-foreground bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/Jan-motorbike-customers-motorbike-for-rent-in-hcm.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-24 text-center md:text-left drop-shadow-md">
          <p className="mb-4 inline-block rounded-full bg-accent/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground drop-shadow-sm">
            {lang === "vi" ? "Xe thanh lý" : "For Sale"}
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-black uppercase tracking-widest leading-tight md:text-6xl text-white drop-shadow-lg">
            {lang === "vi" ? "Xe máy đang bán" : "Bikes for Sale"}
          </h1>
          <p className="mt-6 max-w-xl text-white/90 font-medium leading-relaxed mx-auto md:mx-0 drop-shadow-md">
            {lang === "vi"
              ? "Liên hệ trực tiếp với chủ xe qua WhatsApp để mua."
              : "Contact the owner directly via WhatsApp to buy."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm mb-8">
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
                {uniqueBrands.map((b) => (
                  <SelectItem key={b} value={b} className="font-bold uppercase tracking-wider text-xs">
                    {b === "Khác" ? (lang === "vi" ? "Khác" : "Other") : b}
                  </SelectItem>
                ))}
                <SelectItem value="Other" className="font-bold uppercase tracking-wider text-xs">
                  {lang === "vi" ? "Khác" : "Other"}
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
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", "Automatic", "Manual", "Semi-Automatic", "Electric"].map((c) => (
              <Button
                key={c}
                variant={cat === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCat(c as CategoryFilter)}
                className="rounded-full font-bold uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap"
              >
                {c === "All" ? t("cat_all") : c === "Automatic" ? t("cat_auto") : c === "Manual" ? t("cat_manual") : c === "Semi-Automatic" ? t("cat_semi") : t("cat_electric")}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", ...uniqueCcs].map((c) => (
              <Button
                key={c}
                variant={cc === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCc(c as any)}
                className="rounded-full font-bold uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap"
              >
                {c === "All" ? (lang === "vi" ? "Tất cả phân khối" : "All CC") : `${c}cc`}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-2 py-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
              {lang === "vi" ? "Giá tối đa" : "Max Price"}:{" "}
              <span className="text-foreground">{formatVnd(priceMax[0])}</span>
            </Label>
            <Slider
              value={priceMax}
              onValueChange={setPriceMax}
              max={100000000}
              step={1000000}
              className="flex-1"
            />
          </div>
        </div>

        {loading && list.length === 0 ? (
          // Skeleton cards while loading
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-sm animate-pulse">
                <div className="aspect-[3/4] bg-muted w-full" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded mt-1 w-1/3" />
                  <div className="h-11 bg-muted rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {lang === "vi" ? "Hiện không có xe đang bán." : "No bikes are for sale right now."}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((b, i) => (
              <SaleCard
                key={b.id}
                bike={b}
                whatsapp={settings.whatsapp}
                owner={settings.ownerName}
                formatVnd={formatVnd}
                lang={lang}
                onOpen={() => openBike(b)}
                priority={i < 6}
              />
            ))}
          </div>
        )}
      </section>

      <SaleDetailDialog bike={selected} open={open} onOpenChange={setOpen} />

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2019 JAN'S MOTORBIKE
      </footer>
    </div>
  );
}

function SaleCard({
  bike,
  whatsapp,
  owner,
  formatVnd,
  lang,
  onOpen,
}: {
  bike: Bike;
  whatsapp: string;
  owner: string;
  formatVnd: (v: number) => string;
  lang: "en" | "vi";
  onOpen: () => void;
  priority?: boolean;
}) {
  const { reviews } = useStore();
  const bikeReviews = reviews.filter((r) => r.bikeId === bike.id);
  const avgRating = bikeReviews.length > 0 ? bikeReviews.reduce((acc, r) => acc + r.rating, 0) / bikeReviews.length : 0;

  const price = bike.salePrice ?? 0;
  const msg =
    lang === "vi"
      ? `Chào ${owner}, tôi muốn mua ${bike.name} với giá ${formatVnd(price)}.`
      : `Hi ${owner}, I want to buy the ${bike.name} for ${formatVnd(price)}.`;
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10 text-left w-full cursor-pointer"
        aria-label={`Xem chi tiết ${bike.name}`}
      >
        <img
          src={bike.imageUrl}
          alt={bike.name}
          loading="eager"
          fetchPriority="high"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Badge className="absolute left-4 top-4 border border-white/20 bg-white/90 text-black backdrop-blur-md shadow-sm font-bold uppercase tracking-wider text-[10px]">
          {bike.category}
        </Badge>
        {bikeReviews.length > 0 && (
          <Badge className="absolute right-4 top-4 border border-amber-500/30 bg-amber-500/90 text-white backdrop-blur-md shadow-md font-bold text-[11px] z-20 flex items-center gap-1">
            <Star className="size-3.5 fill-white" />
            {avgRating.toFixed(1)} ({bikeReviews.length})
          </Badge>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-black/60 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-sm">
            {lang === "vi" ? "Xem chi tiết" : "View Details"}
          </span>
        </div>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display text-xl font-black uppercase tracking-widest leading-tight text-foreground transition-colors group-hover:text-primary">
              {bike.name}
            </h3>
            <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] text-muted-foreground shrink-0 bg-muted/80 px-2 py-1 rounded-md shadow-inner">
              <Gauge className="size-3" />
              {bike.engineCc}cc
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground font-medium leading-relaxed">{bike.description}</p>
        </div>

        <div className="mt-5 border-t border-border/50 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
            {lang === "vi" ? "Giá bán" : "Sale Price"}
          </div>
          <div className="font-display text-3xl font-black text-accent">{formatVnd(price)}</div>
        </div>

        <Button
          asChild
          className="w-full bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-[#25D366]/20 font-bold uppercase tracking-widest text-xs h-11 mt-4 rounded-xl transition-all"
        >
          <a href={href} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4 mr-2" />
            {lang === "vi" ? "Mua qua WhatsApp" : "Buy via WhatsApp"}
          </a>
        </Button>
      </div>
    </article>
  );
}
