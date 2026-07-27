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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, addDays, subDays, isSameDay } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Phone, User, Calendar as CalendarIcon, DollarSign, Tag } from "lucide-react";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const { bookings, bikes, updateBookingStatus } = useStore();
  const { lang, formatVnd } = useUI();
  const [selectedBikeId, setSelectedBikeId] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

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
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">{lang === "vi" ? "Danh sách" : "List"}</TabsTrigger>
            <TabsTrigger value="calendar">{lang === "vi" ? "Lịch (Gantt)" : "Calendar"}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "list" ? (
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
      ) : (
        <CalendarGanttView 
          bikes={bikes} 
          bookings={bookings} 
          lang={lang} 
          formatVnd={formatVnd} 
          updateBookingStatus={updateBookingStatus} 
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
}

function CalendarGanttView({ bikes, bookings, lang, formatVnd, updateBookingStatus, getStatusBadge }: any) {
  const [startDate, setStartDate] = useState(() => startOfDay(new Date()));
  const daysToShow = 14;

  const dates = Array.from({ length: daysToShow }).map((_, i) => addDays(startDate, i));

  // Sort bookings so confirmed/completed show on top if multiple overlap
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const w: Record<string, number> = { completed: 3, confirmed: 2, pending: 1, cancelled: 0 };
      return (w[b.status] || 0) - (w[a.status] || 0);
    });
  }, [bookings]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setStartDate(subDays(startDate, 7))}>
            <ChevronLeft className="size-4 mr-1" />
            {lang === "vi" ? "7 ngày trước" : "Prev 7 days"}
          </Button>
          <span className="font-bold text-sm bg-accent/10 text-accent-foreground px-3 py-1.5 rounded-md border border-border">
            {format(startDate, "dd/MM/yyyy")} - {format(dates[dates.length - 1], "dd/MM/yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setStartDate(addDays(startDate, 7))}>
            {lang === "vi" ? "7 ngày sau" : "Next 7 days"}
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium bg-card px-3 py-1.5 rounded-full border border-border shadow-sm">
           <div className="flex items-center gap-1"><div className="size-2.5 rounded-sm bg-amber-500"></div> {lang === "vi" ? "Chờ xử lý" : "Pending"}</div>
           <div className="flex items-center gap-1"><div className="size-2.5 rounded-sm bg-blue-500"></div> {lang === "vi" ? "Xác nhận" : "Confirmed"}</div>
           <div className="flex items-center gap-1"><div className="size-2.5 rounded-sm bg-emerald-500"></div> {lang === "vi" ? "Hoàn thành" : "Completed"}</div>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-border rounded-xl bg-card shadow-sm scrollbar-thin">
        <div className="min-w-[900px]">
          {/* Header Row */}
          <div className="grid grid-cols-[180px_repeat(14,minmax(50px,1fr))] border-b border-border bg-muted/50 relative">
            <div className="p-3 font-bold text-xs sticky left-0 bg-muted/50 border-r border-border z-20 flex items-center shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
              {lang === "vi" ? "Xe" : "Bike"}
            </div>
            {dates.map((d) => (
              <div key={d.toISOString()} className={cn("p-2 text-center border-r border-border text-[10px] font-medium flex flex-col items-center justify-center", isSameDay(d, startOfDay(new Date())) && "bg-primary/10 text-primary font-bold")}>
                <span className="uppercase text-muted-foreground">{format(d, "EEE")}</span>
                <span className="text-sm">{format(d, "dd/MM")}</span>
              </div>
            ))}
          </div>
          
          {/* Bike Rows */}
          {bikes.map((bike: any) => {
            const bikeBookings = sortedBookings.filter((b: any) => b.bikeId === bike.id && b.status !== "cancelled");
            
            // Synthesize a fake booking for manually locked bikes
            if (bike.busyFrom && bike.busyTo) {
              bikeBookings.push({
                id: `manual-${bike.id}`,
                bikeId: bike.id,
                fromDate: bike.busyFrom,
                toDate: bike.busyTo,
                status: "confirmed", // Red color
                customerName: lang === "vi" ? "Đang thuê (Khóa thủ công)" : "Rented (Manual)",
                phone: "-",
                total: 0,
                isManual: true,
              });
            }

            return (
              <div key={bike.id} className="grid grid-cols-[180px_repeat(14,minmax(50px,1fr))] border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors relative">
                <div className="p-3 text-[11px] font-semibold sticky left-0 bg-card border-r border-border z-10 flex items-center shadow-[1px_0_5px_rgba(0,0,0,0.05)] truncate" title={bike.name}>
                  <div className="truncate pr-2">
                    {bike.name}
                    <div className="text-[9px] text-muted-foreground font-normal mt-0.5">{bike.licensePlate || bike.category}</div>
                  </div>
                </div>
                {dates.map((d) => {
                  const booking = bikeBookings.find((b: any) => {
                     const from = startOfDay(parseISO(b.fromDate));
                     const to = startOfDay(parseISO(b.toDate));
                     return d >= from && d <= to;
                  });
                  
                  return (
                    <div key={d.toISOString()} className="border-r border-border p-1 relative min-h-[44px]">
                       {booking && (
                         <Popover>
                           <PopoverTrigger asChild>
                             <button className={cn(
                               "absolute inset-y-1 z-0 flex items-center overflow-hidden whitespace-nowrap px-1.5 text-[10px] font-bold text-white transition-transform hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background",
                               booking.status === "pending" ? "bg-amber-500" :
                               booking.status === "confirmed" ? "bg-blue-500" :
                               "bg-emerald-500",
                               isSameDay(d, startOfDay(parseISO(booking.fromDate))) ? "left-1 rounded-l-md" : "left-0",
                               isSameDay(d, startOfDay(parseISO(booking.toDate))) ? "right-1 rounded-r-md" : "right-0"
                             )}>
                               {isSameDay(d, startOfDay(parseISO(booking.fromDate))) ? booking.customerName : ""}
                             </button>
                           </PopoverTrigger>
                           <PopoverContent className="w-80 p-0" align="start" sideOffset={8}>
                             <div className="p-4 border-b border-border bg-muted/30">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold">{booking.customerName}</h4>
                                  {getStatusBadge(booking.status)}
                                </div>
                                <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                  <CalendarIcon className="size-3" />
                                  {format(parseISO(booking.fromDate), "dd/MM/yyyy")} - {format(parseISO(booking.toDate), "dd/MM/yyyy")}
                                </div>
                             </div>
                             <div className="p-4 grid gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="size-4 text-foreground" />
                                  {booking.phone}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Tag className="size-4 text-foreground" />
                                  <span className="font-bold text-primary">{formatVnd(booking.total)}</span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                  {booking.isManual ? (
                                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200 w-full">
                                      {lang === "vi" ? "Xe bị khóa thủ công. Hãy vào phần Kho xe -> Sửa để mở khóa." : "Manually locked. Edit the bike in Inventory to unlock."}
                                    </div>
                                  ) : (
                                    <Select
                                      value={booking.status}
                                      onValueChange={(v) => updateBookingStatus(booking.id, v as Booking["status"])}
                                    >
                                      <SelectTrigger className="flex-1 h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">{lang === "vi" ? "Chờ xử lý" : "Pending"}</SelectItem>
                                        <SelectItem value="confirmed">{lang === "vi" ? "Xác nhận" : "Confirmed"}</SelectItem>
                                        <SelectItem value="completed">{lang === "vi" ? "Hoàn thành" : "Completed"}</SelectItem>
                                        <SelectItem value="cancelled">{lang === "vi" ? "Hủy" : "Cancelled"}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                             </div>
                           </PopoverContent>
                         </Popover>
                       )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
