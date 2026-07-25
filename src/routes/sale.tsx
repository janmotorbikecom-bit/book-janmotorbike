import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Gauge } from "lucide-react";
import { StoreProvider, useStore, type Bike } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "Bikes for Sale — MotoRent" },
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
              />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MotoRent
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
}: {
  bike: Bike;
  whatsapp: string;
  owner: string;
  formatVnd: (v: number) => string;
  lang: "en" | "vi";
}) {
  const price = bike.salePrice ?? 0;
  const msg =
    lang === "vi"
      ? `Chào ${owner}, tôi muốn mua ${bike.name} với giá ${formatVnd(price)}.`
      : `Hi ${owner}, I want to buy the ${bike.name} for ${formatVnd(price)}.`;
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={bike.imageUrl}
          alt={bike.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 border-0 bg-accent text-accent-foreground shadow">
          {bike.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-tight">{bike.name}</h3>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Gauge className="size-3.5" />
            {bike.engineCc}cc
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{bike.description}</p>

        <div className="border-t border-border pt-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {lang === "vi" ? "Giá bán" : "Sale Price"}
          </div>
          <div className="font-display text-3xl font-bold text-accent">{formatVnd(price)}</div>
        </div>

        <Button
          asChild
          className="w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
        >
          <a href={href} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" />
            {lang === "vi" ? "Mua qua WhatsApp" : "Buy via WhatsApp"}
          </a>
        </Button>
      </div>
    </article>
  );
}
