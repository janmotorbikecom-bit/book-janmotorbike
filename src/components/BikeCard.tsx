import { MessageCircle, Gauge } from "lucide-react";
import type { Bike } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUI } from "@/lib/ui-context";

export function BikeCard({ bike, onOpen }: { bike: Bike; onOpen: (b: Bike) => void }) {
  const { lang, t, formatVnd } = useUI();

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-lg">
      <button
        type="button"
        onClick={() => onOpen(bike)}
        className="relative aspect-[4/3] overflow-hidden bg-white text-left"
      >
        <img
          src={bike.imageUrl}
          alt={bike.name}
          loading="lazy"
          className="size-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        />
        <Badge className="absolute left-4 top-4 border-0 bg-accent text-accent-foreground shadow font-bold uppercase tracking-wider text-[10px]">
          {bike.category}
        </Badge>
      </button>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <button type="button" onClick={() => onOpen(bike)} className="text-left">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display text-xl font-black uppercase tracking-widest leading-tight">
              {bike.name}
            </h3>
            <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground shrink-0 bg-muted/50 px-2 py-1 rounded-md">
              <Gauge className="size-3" />
              {bike.engineCc}cc
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground font-medium leading-relaxed">
            {lang === "vi" ? bike.descriptionVi || bike.description : bike.description}
          </p>
        </button>

        <div className="flex items-end justify-between border-t border-border pt-5 mt-auto">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {t("from")}
            </div>
            <div className="font-display text-2xl font-black text-primary">
              {formatVnd(bike.pricePerDay)}
              <span className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("per_day_short")}
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground space-y-1">
            <div>
              {formatVnd(bike.pricePerWeek)} {t("per_week_short")}
            </div>
            <div>
              {formatVnd(bike.pricePerMonth)} {t("per_month_short")}
            </div>
          </div>
        </div>

        <Button
          onClick={() => onOpen(bike)}
          className="w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 font-bold uppercase tracking-widest text-xs h-12 mt-2 rounded-xl"
        >
          <MessageCircle className="size-4 mr-2" />
          {t("book_now")}
        </Button>
      </div>
    </article>
  );
}
