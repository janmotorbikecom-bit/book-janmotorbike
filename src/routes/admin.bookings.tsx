import { createFileRoute } from "@tanstack/react-router";
import { useStore, type Booking, type Bike } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const { bookings, bikes, updateBookingStatus } = useStore();
  const { lang, formatVnd } = useUI();
  const [selectedBikeId, setSelectedBikeId] = useState<string>("All");

  const filteredBookings = useMemo(() => {
    let out = bookings.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (selectedBikeId !== "All") {
      out = out.filter((b) => b.bikeId === selectedBikeId);
    }
    return out;
  }, [bookings, selectedBikeId]);

  const disabledDates = useMemo(() => {
    // If a specific bike is selected, disable dates that are booked
    if (selectedBikeId === "All") return [];
    const bikeBookings = bookings.filter(
      (b) => b.bikeId === selectedBikeId && b.status !== "cancelled",
    );
    return bikeBookings.map((b) => ({
      from: startOfDay(parseISO(b.fromDate)),
      to: endOfDay(parseISO(b.toDate)),
    }));
  }, [bookings, selectedBikeId]);

  const getBikeName = (id: string) => bikes.find((b) => b.id === id)?.name || "Unknown";

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 bg-amber-50">
            {lang === "vi" ? "Chờ xử lý" : "Pending"}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="text-blue-600 bg-blue-50">
            {lang === "vi" ? "Đã xác nhận" : "Confirmed"}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-emerald-600 bg-emerald-50">
            {lang === "vi" ? "Hoàn thành" : "Completed"}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-red-600 bg-red-50">
            {lang === "vi" ? "Đã hủy" : "Cancelled"}
          </Badge>
        );
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {lang === "vi" ? "Quản lý Đặt xe" : "Bookings"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "vi" ? "Theo dõi và quản lý lịch đặt xe" : "Track and manage bookings"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Left: Bookings List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Select value={selectedBikeId} onValueChange={setSelectedBikeId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by bike" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{lang === "vi" ? "Tất cả xe" : "All Bikes"}</SelectItem>
                {bikes.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            {filteredBookings.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                {lang === "vi" ? "Chưa có đơn đặt xe nào." : "No bookings found."}
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{b.customerName}</span>
                      <span className="text-sm text-muted-foreground">{b.phone}</span>
                      {getStatusBadge(b.status)}
                    </div>
                    <div className="text-sm font-medium text-primary mb-1">
                      {getBikeName(b.bikeId)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(b.fromDate), "dd/MM/yyyy")} -{" "}
                      {format(parseISO(b.toDate), "dd/MM/yyyy")}
                      <span className="mx-2">•</span>
                      {formatVnd(b.total)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={b.status}
                      onValueChange={(v) => updateBookingStatus(b.id, v as Booking["status"])}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          {lang === "vi" ? "Chờ xử lý" : "Pending"}
                        </SelectItem>
                        <SelectItem value="confirmed">
                          {lang === "vi" ? "Xác nhận" : "Confirmed"}
                        </SelectItem>
                        <SelectItem value="completed">
                          {lang === "vi" ? "Hoàn thành" : "Completed"}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {lang === "vi" ? "Hủy" : "Cancelled"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Calendar view */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-bold mb-2">{lang === "vi" ? "Lịch xe" : "Calendar"}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedBikeId === "All"
                ? lang === "vi"
                  ? "Chọn 1 xe để xem lịch bận rảnh."
                  : "Select a bike to view its availability."
                : lang === "vi"
                  ? "Các ngày bôi đỏ là ngày xe đã được đặt."
                  : "Red dates are booked."}
            </p>
            <Calendar
              mode="single"
              disabled={disabledDates}
              locale={lang === "vi" ? vi : enUS}
              className="p-0 pointer-events-auto mx-auto border-none"
              classNames={{
                cell: cn(
                  "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                ),
                day_disabled: "text-red-500 bg-red-50 rounded-md font-bold opacity-100",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
