import { MessageCircle, Gauge, CalendarDays, CalendarRange, Clock } from "lucide-react";
import type { Bike } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUI } from "@/lib/ui-context";

export function BikeCard({ bike, onOpen }: { bike: Bike; onOpen: (b: Bike) => void }) {
  const { lang, t, formatVnd } = useUI();
  const now = new Date().toISOString().split("T")[0];
  const isBusy = bike.busyFrom && bike.busyTo && bike.busyTo >= now;

  const formatDate = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}`;
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30">
      <button
        type="button"
        onClick={() => onOpen(bike)}
        className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10 text-left"
      >
        <img
          src={bike.imageUrl}
          alt={bike.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Badge className="absolute left-4 top-4 border border-white/20 bg-white/90 text-black backdrop-blur-md shadow-sm font-bold uppercase tracking-wider text-[10px] z-20">
          {bike.category}
        </Badge>
        {isBusy && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs flex flex-col items-center gap-1 shadow-xl border border-white/20 transform -rotate-3 scale-110">
              <Clock className="size-5 mb-0.5" />
              <span>{lang === "vi" ? "Đang cho thuê" : "Currently Rented"}</span>
              <span className="text-[10px] opacity-90">{formatDate(bike.busyFrom!)} - {formatDate(bike.busyTo!)}</span>
            </div>
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col p-5">
        <button type="button" onClick={() => onOpen(bike)} className="text-left flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex flex-col gap-0.5 text-left">
              {bike.brand && bike.brand !== "Other" && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                  {bike.brand}
                </span>
              )}
              <h3 className="font-display text-xl font-black uppercase tracking-widest leading-tight text-foreground transition-colors group-hover:text-primary">
                {bike.name}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] text-muted-foreground shrink-0 bg-muted/80 px-2 py-1 rounded-md shadow-inner">
              <Gauge className="size-3" />
              {bike.engineCc}cc
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground font-medium leading-relaxed">
            {lang === "vi" ? bike.descriptionVi || bike.description : bike.description}
          </p>
        </button>

        <div className="mt-5 flex flex-col gap-4 border-t border-border/50 pt-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                {t("price_daily")}
              </div>
              <div className="font-display text-2xl font-black text-primary leading-none">
                {formatVnd(bike.pricePerDay)}
                <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("per_day_short")}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-1.5 py-1 rounded-md border border-border/50 whitespace-nowrap">
                <CalendarDays className="size-3 text-primary/70 shrink-0" />
                {formatVnd(bike.pricePerWeek)}{t("per_week_short")}
              </div>
              <div className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-1.5 py-1 rounded-md border border-border/50 whitespace-nowrap">
                <CalendarRange className="size-3 text-primary/70 shrink-0" />
                {formatVnd(bike.pricePerMonth)}{t("per_month_short")}
              </div>
            </div>
          </div>

          <Button
            onClick={() => onOpen(bike)}
            className="w-full bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-[#25D366]/20 font-bold uppercase tracking-widest text-xs h-11 rounded-xl transition-all"
          >
            <MessageCircle className="size-4 mr-2" />
            {isBusy ? (lang === "vi" ? "Đặt trước (Pre-book)" : "Pre-book") : t("book_now")}
          </Button>
        </div>
      </div>
    </article>
  );
}
