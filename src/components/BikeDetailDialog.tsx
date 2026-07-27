import { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Cog, Gauge, Tag, Share2, Star } from "lucide-react";
import type { Bike } from "@/lib/store";
import { calculateRentPrice } from "@/lib/bike-catalog";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function BikeDetailDialog({
  bike,
  open,
  onOpenChange,
}: {
  bike: Bike | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { settings, reviews, addReview, addBooking, pricingTiers } = useStore();
  const { t, lang, formatVnd } = useUI();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [activeImg, setActiveImg] = useState(0);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  
  const [gallery, setGallery] = useState<string[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Derive initial gallery from bike.images if available, else load lazily
  useEffect(() => {
    if (open && bike) {
      if (bike.images && bike.images.length > 0) {
        setGallery(bike.images);
      } else {
        setLoadingGallery(true);
        supabase
          .from("bikes")
          .select("images")
          .eq("id", bike.id)
          .single()
          .then(({ data }) => {
            if (data?.images?.length) {
              setGallery(data.images);
            } else if (bike.imageUrl) {
              setGallery([bike.imageUrl]);
            }
            setLoadingGallery(false);
          });
      }
    } else {
      setActiveImg(0);
    }
  }, [open, bike]);

  const days = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(1, differenceInCalendarDays(range.to, range.from) + 1);
  }, [range]);

  useEffect(() => {
    setActiveImg(0);
    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
  }, [bike?.id]);

  const bikeReviews = useMemo(() => {
    if (!bike) return [];
    return reviews
      .filter((r) => r.bikeId === bike.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, bike]);
  const avgRating = bikeReviews.length
    ? bikeReviews.reduce((a, b) => a + b.rating, 0) / bikeReviews.length
    : 0;

  const estimate = useMemo(() => {
    if (!bike || days <= 0) return 0;
    return calculateRentPrice(
      days,
      bike.pricePerDay,
      bike.pricePerWeek,
      bike.pricePerMonth,
      pricingTiers,
    );
  }, [days, bike, pricingTiers]);

  if (!bike) return null;

  const dateLocale = lang === "vi" ? "vi-VN" : "en-US";
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" });

  const message = [
    t("wa_msg_intro", { name: settings.ownerName || "there", bike: bike.name }),
    ``,
    `*${t("wa_label_name")}:* ${name || "—"}`,
    range?.from && range?.to
      ? `*${t("wa_label_dates")}:* ${fmtDate(range.from)} - ${fmtDate(range.to)} (${days} ${t("days")})`
      : `*${t("wa_label_dates")}:* ${t("tbd")}`,
    `*${t("wa_label_total")}:* ${formatVnd(estimate)}`,
    phone ? `*${t("wa_label_phone")}:* ${phone}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const encoded = encodeURIComponent(message);
  const waHref = `https://wa.me/${settings.whatsapp}?text=${encoded}`;
  const zaloHref = `https://zalo.me/${settings.zalo}`;
  const msgrHref = `https://m.me/${settings.messenger}`;

  const copyLink = async () => {
    const url = `${window.location.origin}/?bikeId=${bike.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(lang === "vi" ? "Đã copy link" : "Link copied", { description: url });
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleBooking = (url: string) => {
    if (range?.from && range?.to) {
      addBooking({
        bikeId: bike.id,
        customerName: name || "Guest",
        phone: phone || "",
        fromDate: range.from.toISOString(),
        toDate: range.to.toISOString(),
        total: estimate,
        status: "pending",
      });
    }
    window.open(url, "_blank");
  };

  const submitReview = () => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error(
        lang === "vi" ? "Vui lòng nhập tên và bình luận" : "Please enter your name and comment",
      );
      return;
    }
    addReview({
      bikeId: bike.id,
      rating: reviewRating,
      authorName: reviewName,
      comment: reviewComment,
    });
    setReviewName("");
    setReviewComment("");
    toast.success(lang === "vi" ? "Cảm ơn bạn đã đánh giá!" : "Thanks for your review!");
  };

  const renderReviews = () => (
    <div className="mt-8 border-t border-border pt-5 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{lang === "vi" ? "Đánh giá" : "Reviews"}</h3>
        {bikeReviews.length > 0 && (
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Star className="size-3 fill-amber-500" /> {avgRating.toFixed(1)} (
            {bikeReviews.length})
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {bikeReviews.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {lang === "vi" ? "Chưa có đánh giá nào." : "No reviews yet."}
          </p>
        ) : (
          bikeReviews.map((r) => (
            <div
              key={r.id}
              className="text-sm bg-muted/20 p-3 rounded-lg border border-border/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{r.authorName}</span>
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3",
                        i < r.rating ? "fill-amber-500" : "text-muted opacity-30",
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mt-1.5 text-[13px]">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Add review form */}
      <div className="rounded-xl border border-border p-3.5 bg-muted/30">
        <h4 className="text-xs font-bold mb-2.5">
          {lang === "vi" ? "Viết đánh giá" : "Write a review"}
        </h4>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setReviewRating(i + 1)}
              className={cn(
                "text-amber-500 transition-transform hover:scale-110",
                i < reviewRating ? "fill-amber-500" : "opacity-30",
              )}
            >
              <Star className="size-5" />
            </button>
          ))}
        </div>
        <Input
          placeholder={lang === "vi" ? "Tên của bạn" : "Your name"}
          value={reviewName}
          onChange={(e) => setReviewName(e.target.value)}
          className="h-9 text-xs mb-2.5 bg-background"
        />
        <Textarea
          placeholder={
            lang === "vi" ? "Đánh giá của bạn về chiếc xe..." : "How was the bike?"
          }
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          className="text-xs min-h-[60px] mb-3 bg-background"
        />
        <Button size="sm" className="w-full h-8 text-xs" onClick={submitReview}>
          {lang === "vi" ? "Gửi Đánh Giá" : "Submit Review"}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-4xl flex-col overflow-hidden p-0">
        <DialogTitle className="sr-only">{bike.name}</DialogTitle>
        <div className="grid flex-1 overflow-y-auto md:overflow-hidden gap-0 md:grid-cols-2">
          {/* Left: bike info */}
          <div className="md:h-full md:overflow-y-auto border-b border-border p-4 md:border-b-0 md:border-r">
            <div className="overflow-hidden rounded-xl bg-muted">
              <img
                src={gallery[activeImg] ?? bike.imageUrl}
                alt={bike.name}
                className="aspect-[3/4] w-full object-cover transition"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "overflow-hidden rounded-lg border-2 bg-muted transition",
                      i === activeImg
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-transparent hover:border-border",
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${bike.name} ${i + 1}`}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-display text-xl font-bold leading-tight flex-1 min-w-[200px]">
                {bike.name}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="h-7 text-xs px-2.5 rounded-full border-border"
                >
                  <Share2 className="size-3 mr-1.5" /> {lang === "vi" ? "Chia sẻ" : "Share"}
                </Button>
                <Badge
                  className={cn(
                    "border-0",
                    bike.available
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {bike.available ? t("available") : t("rented")}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <SpecBox
                icon={<Tag className="size-4" />}
                label={t("category")}
                value={bike.category}
              />
              <SpecBox
                icon={<Gauge className="size-4" />}
                label={t("engine")}
                value={`${bike.engineCc}cc`}
              />
              <SpecBox
                icon={<Cog className="size-4" />}
                label={t("transmission")}
                value={bike.transmission}
              />
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold">{t("description")}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {lang === "vi" ? bike.descriptionVi || bike.description : bike.description}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="hidden md:block">
              {renderReviews()}
            </div>
          </div>

          {/* Right: booking */}
          <div className="md:h-full md:overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* 1. Pricing */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center rounded-xl border border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 p-2 shadow-sm transition-transform hover:scale-[1.02]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {t("price_daily")}
                </span>
                <span className="mt-0.5 font-display text-sm font-bold text-blue-700 dark:text-blue-300">
                  {formatVnd(bike.pricePerDay)}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-purple-200/50 bg-purple-50/50 dark:bg-purple-950/20 p-2 shadow-sm transition-transform hover:scale-[1.02]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {t("price_weekly")}
                </span>
                <span className="mt-0.5 font-display text-sm font-bold text-purple-700 dark:text-purple-300">
                  {formatVnd(bike.pricePerWeek)}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-orange-200/50 bg-orange-50/50 dark:bg-orange-950/20 p-2 shadow-sm transition-transform hover:scale-[1.02]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  {t("price_monthly")}
                </span>
                <span className="mt-0.5 font-display text-sm font-bold text-orange-700 dark:text-orange-300">
                  {formatVnd(bike.pricePerMonth)}
                </span>
              </div>
            </div>
            <div className="mt-2.5 flex justify-center">
              <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 px-4 py-1.5 text-sm font-medium border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
                <span className="text-muted-foreground">{t("deposit")}:</span>
                <span className="font-display text-base font-bold tracking-wide text-emerald-700 dark:text-emerald-400">
                  {formatVnd(bike.deposit)}
                </span>
              </div>
            </div>

            {/* 2. Customer info */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="bname" className="text-xs text-muted-foreground">
                  {t("your_name")}
                </Label>
                <Input
                  id="bname"
                  className="h-9"
                  placeholder={lang === "vi" ? "Hãy điền tên của bạn" : "Please enter your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bphone" className="text-xs text-muted-foreground">
                  {t("your_phone")}
                </Label>
                <Input
                  id="bphone"
                  className="h-9"
                  placeholder={lang === "vi" ? "Hãy điền số điện thoại của bạn" : "Please enter your phone number"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* 3. Compact Grid Calendar */}
            <div className="mt-3 flex flex-col items-center border border-border rounded-xl p-2.5 bg-card shadow-sm">
              <div className="flex w-full gap-2 mb-3">
                <div className="flex flex-1 flex-col justify-center rounded-lg border border-border bg-muted/40 p-2 text-sm text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("from_date")}
                  </span>
                  <span className="font-medium leading-none mt-1 text-xs">
                    {range?.from ? fmtDate(range.from) : t("pick_date")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center rounded-lg border border-border bg-muted/40 p-2 text-sm text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("to_date")}
                  </span>
                  <span className="font-medium leading-none mt-1 text-xs">
                    {range?.to ? fmtDate(range.to) : t("pick_date")}
                  </span>
                </div>
              </div>

              <div className="relative w-full max-w-[240px]">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                  locale={lang === "vi" ? vi : enUS}
                  className="p-0 pointer-events-auto [--cell-size:1.6rem] w-full"
                  classNames={{
                    months: "relative flex flex-col w-full",
                    month: "space-y-1 w-full",
                    month_caption: "flex justify-center items-center h-7 mb-2",
                    caption_label: "text-[13px] font-bold capitalize",
                    nav: "absolute inset-x-0 top-0 flex w-full justify-between items-center z-10",
                    button_previous:
                      "h-6 w-6 flex items-center justify-center rounded-md bg-muted/30 border border-border/50 hover:bg-muted opacity-70 hover:opacity-100",
                    button_next:
                      "h-6 w-6 flex items-center justify-center rounded-md bg-muted/30 border border-border/50 hover:bg-muted opacity-70 hover:opacity-100",
                    table: "w-full border-collapse",
                    weekdays: "flex justify-between w-full mb-1",
                    weekday:
                      "text-muted-foreground rounded-md w-(--cell-size) text-center font-bold text-[0.65rem] uppercase tracking-wider",
                    week: "flex w-full mt-0.5 justify-between",
                    cell: "h-(--cell-size) w-(--cell-size) text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                    day: "h-(--cell-size) w-(--cell-size) p-0 font-medium aria-selected:opacity-100 rounded-md transition-colors hover:bg-muted text-xs",
                    range_end: "day-range-end rounded-md bg-primary text-primary-foreground",
                    selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    today: "bg-accent/50 text-accent-foreground ring-1 ring-accent",
                    outside:
                      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                    disabled: "text-muted-foreground opacity-30",
                    range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
                    hidden: "invisible",
                  }}
                />
              </div>

              {/* Legend */}
              <div className="mt-3 flex gap-4 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <div className="size-2.5 rounded-[2px] bg-muted border border-border"></div>
                  <span>{lang === "vi" ? "Còn trống" : "Available"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2.5 rounded-[2px] bg-muted-foreground/30"></div>
                  <span>{lang === "vi" ? "Đã đặt" : "Booked"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2.5 rounded-[2px] bg-primary border border-primary"></div>
                  <span>{lang === "vi" ? "Đã chọn" : "Selected"}</span>
                </div>
              </div>
            </div>

            {/* 4. Estimate */}
            {days > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-accent/15 px-3 py-2 text-sm ring-1 ring-accent/30">
                <span className="font-medium">
                  {t("total_estimate")} ({days} {t("days")})
                </span>
                <span className="font-display text-lg font-bold text-primary">
                  {formatVnd(estimate)}
                </span>
              </div>
            )}

            {/* 5. Multi-channel CTAs */}
            <div className="mt-3 grid gap-1.5">
              <a
                href={waHref}
                onClick={(e) => {
                  e.preventDefault();
                  handleBooking(waHref);
                }}
                aria-disabled={!bike.available}
                className={cn(
                  "flex h-10 w-full items-center justify-center gap-2 rounded-md font-semibold text-white transition text-sm cursor-pointer",
                  "bg-[#25D366] hover:brightness-110",
                  !bike.available && "pointer-events-none opacity-50",
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.031 21.492c-1.63 0-3.23-.434-4.636-1.258l-.332-.196-3.444.903.92-3.357-.215-.342A9.458 9.458 0 0 1 2.564 12c0-5.235 4.26-9.495 9.498-9.495 2.536 0 4.921.988 6.713 2.781a9.452 9.452 0 0 1 2.775 6.714c0 5.234-4.26 9.492-9.519 9.492zm-5.753-3.234c1.23.729 2.651 1.115 4.108 1.115 4.615 0 8.373-3.757 8.373-8.372 0-2.236-.87-4.337-2.45-5.918A8.32 8.32 0 0 0 12.031 3.65c-4.616 0-8.372 3.758-8.372 8.372 0 1.543.407 3.037 1.176 4.34l.441.748-.544 1.988 2.036-.534.448.266z" />
                  <path d="M16.812 13.513c-.262-.132-1.549-.766-1.789-.854-.241-.088-.415-.132-.59.132-.175.263-.675.854-.827 1.029-.153.176-.307.198-.569.066-.263-.132-1.106-.407-2.106-1.302-.779-.696-1.304-1.554-1.457-1.817-.153-.264-.016-.407.115-.538.118-.118.262-.307.394-.461.131-.154.175-.264.262-.439.088-.176.044-.329-.022-.461-.065-.132-.59-1.427-.808-1.953-.213-.515-.429-.445-.59-.453-.153-.008-.328-.008-.503-.008a.972.972 0 0 0-.7.329c-.241.264-.919.899-.919 2.193 0 1.294.941 2.545 1.072 2.721.131.175 1.855 2.83 4.492 3.968.627.272 1.117.433 1.498.555.628.199 1.2.17 1.65.103.504-.075 1.549-.633 1.768-1.246.219-.614.219-1.141.153-1.252-.065-.11-.241-.176-.503-.308z" />
                </svg>
                {t("book_wa")}
              </a>
              <a
                href={zaloHref}
                onClick={(e) => {
                  e.preventDefault();
                  handleBooking(zaloHref);
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md font-semibold text-white transition bg-[#0068FF] hover:brightness-110 text-sm cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.5 10.3c0-4.9-4.2-8.8-9.4-8.8-5.2 0-9.4 3.9-9.4 8.8 0 2.5 1.1 4.7 3 6.3l-1.3 3.4c-.2.4.2.8.5.6l3.8-2c1.1.4 2.2.6 3.4.6 5.2 0 9.4-3.9 9.4-8.9zm-13.6 1.7c-.5 0-.9-.4-.9-.9 0-.5.4-.9.9-.9h4.3c.7 0 1.2-.6 1.2-1.3 0-.7-.5-1.3-1.2-1.3h-4.3c-.5 0-.9-.4-.9-.9 0-.5.4-.9.9-.9h4.3c1.7 0 3 1.4 3 3.1 0 1.7-1.3 3.1-3 3.1H7.9z" />
                </svg>
                {t("book_zalo")}
              </a>
              <a
                href={msgrHref}
                onClick={(e) => {
                  e.preventDefault();
                  handleBooking(msgrHref);
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md font-semibold text-white transition bg-gradient-to-tr from-[#0078FF] via-[#A033FF] to-[#FF5280] hover:brightness-110 text-sm cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 36 36"
                  fill="currentColor"
                >
                  <path d="M18 1C8.61 1 1 8.239 1 17.173c0 4.253 1.7 8.136 4.542 11.082.261.27.424.643.447 1.026l.163 3.655c.068 1.547 1.636 2.502 2.993 1.821l4.08-2.052a2 2 0 0 1 1.503-.122c1.084.346 2.228.534 3.418.534 9.39 0 17-7.239 17-16.173S27.39 1 18 1zm8.384 10.963-4.54 7.214a1.737 1.737 0 0 1-2.455.511l-3.957-2.969a1 1 0 0 0-1.2.04l-4.996 4.195c-.563.473-1.332-.23-1.002-.857l4.54-7.214a1.737 1.737 0 0 1 2.455-.511l3.957 2.969a1 1 0 0 0 1.2-.04l4.996-4.195c.563-.473 1.332.23 1.002.857z" />
                </svg>
                {t("book_msgr")}
              </a>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("disclaimer", {
                name: settings.ownerName || (lang === "vi" ? "chúng tôi" : "us"),
              })}
            </p>

            <div className="block md:hidden">
              {renderReviews()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SpecBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}

function formatVnd(v: number) {
  return `${Math.round(v).toLocaleString("vi-VN")}đ`;
}
