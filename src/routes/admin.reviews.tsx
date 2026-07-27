import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { Trash2, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const { reviews, bikes, removeReview } = useStore();
  const { lang, t } = useUI();

  const getBikeName = (bikeId: string) => {
    const bike = bikes.find((b) => b.id === bikeId);
    return bike ? bike.name : "Unknown Bike";
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === "vi" ? "Bạn có chắc chắn muốn xóa đánh giá này không?" : "Are you sure you want to delete this review?")) {
      await removeReview(id);
      toast.success(lang === "vi" ? "Đã xóa đánh giá" : "Review deleted");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">
          {lang === "vi" ? "Quản lý Đánh giá" : "Review Management"}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {lang === "vi" ? "Quản lý và xóa các đánh giá của khách hàng." : "Manage and delete customer reviews."}
        </p>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-card">
            <MessageSquare className="size-8 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {lang === "vi" ? "Chưa có đánh giá nào." : "No reviews yet."}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">{review.authorName}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {getBikeName(review.bikeId)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", { locale: lang === "vi" ? vi : undefined })}
                  </span>
                </div>
                
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < review.rating ? "fill-amber-500" : "text-muted opacity-30"}`}
                    />
                  ))}
                </div>

                <p className="text-sm text-foreground/90 mt-1">
                  {review.comment}
                </p>
              </div>

              <div className="flex-shrink-0 self-end md:self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(review.id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-border"
                >
                  <Trash2 className="size-4 mr-1.5" />
                  {lang === "vi" ? "Xóa" : "Delete"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
