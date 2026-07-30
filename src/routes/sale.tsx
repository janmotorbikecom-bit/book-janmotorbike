import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Gauge } from "lucide-react";
import { StoreProvider, useStore, type Bike } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaleDetailDialog } from "@/components/SaleDetailDialog";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "Bikes for Sale — JAN'S MOTORBIKE" },
      { name: "description", content: "Motorbikes available for purchase." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <StoreProvider>
      <SalePage />
    </StoreProvider>
  ),
});

function SalePage() {
  const { bikes, settings } = useStore();
  const { formatVnd, lang } = useUI();
  const list = bikes.filter((b) => b.isForSale && (b.salePrice ?? 0) > 0);
  const [selected, setSelected] = useState<Bike | null>(null);
  const [open, setOpen] = useState(false);

  function openBike(b: Bike) {
    setSelected(b);
    setOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="mb-3 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
            {lang === "vi" ? "Xe thanh lý" : "For Sale"}
          </p>
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            {lang === "vi" ? "Xe máy đang bán" : "Bikes for Sale"}
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/70">
            {lang === "vi"
              ? "Liên hệ trực tiếp với chủ xe qua WhatsApp để mua."
              : "Contact the owner directly via WhatsApp to buy."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {lang === "vi" ? "Hiện không có xe đang bán." : "No bikes are for sale right now."}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => (
              <SaleCard
                key={b.id}
                bike={b}
                whatsapp={settings.whatsapp}
                owner={settings.ownerName}
                formatVnd={formatVnd}
                lang={lang}
                onOpen={() => openBike(b)}
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
}) {
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
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Badge className="absolute left-4 top-4 border border-white/20 bg-white/90 text-black backdrop-blur-md shadow-sm font-bold uppercase tracking-wider text-[10px]">
          {bike.category}
        </Badge>
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
