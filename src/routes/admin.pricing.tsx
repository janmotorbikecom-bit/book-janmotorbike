import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/pricing")({
  component: AdminPricingRoute,
});

function AdminPricingRoute() {
  const { pricingTiers, updatePricingTier, removePricingTier } = useStore();

  const rates = useMemo(
    () =>
      Object.keys(pricingTiers)
        .map(Number)
        .sort((a, b) => a - b),
    [pricingTiers],
  );
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (rates.length > 0 && !rates.includes(Number(activeTab))) {
      setActiveTab(rates[0].toString());
    }
  }, [rates, activeTab]);

  const [newRate, setNewRate] = useState("");

  function handleAdd() {
    const rate = Number(newRate.replace(/\D/g, ""));
    if (!rate) {
      toast.error("Vui lòng nhập giá tháng hợp lệ");
      return;
    }
    if (pricingTiers[rate]) {
      toast.error("Bảng giá cho mức này đã tồn tại!");
      return;
    }
    const base = pricingTiers[1500000] || Array(26).fill(0);
    updatePricingTier(rate, [...base]);
    setNewRate("");
    setActiveTab(rate.toString());
    toast.success(`Đã tạo bảng giá mới cho ${rate.toLocaleString("vi-VN")}đ`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Bảng giá</h2>
        <p className="text-muted-foreground">
          Thiết lập giá thuê bậc thang theo ngày cho từng mốc giá tháng.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-sm">
        <div className="flex-1">
          <Input
            placeholder="Thêm Rate tháng mới (vd: 2000000)"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" /> Thêm
        </Button>
      </div>

      {rates.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-full justify-start w-auto h-auto p-1 bg-muted rounded-md">
              {rates.map((rate) => (
                <TabsTrigger
                  key={rate}
                  value={rate.toString()}
                  className="whitespace-nowrap px-4 py-2"
                >
                  Rate: {rate.toLocaleString("vi-VN")}đ
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {rates.map((rate) => (
            <TabsContent key={rate} value={rate.toString()}>
              <PricingEditor
                rate={rate}
                initialPrices={pricingTiers[rate]}
                onSave={(prices) => {
                  updatePricingTier(rate, prices);
                  toast.success("Đã lưu bảng giá thành công!");
                }}
                onDelete={() => {
                  if (confirm("Bạn có chắc muốn xóa bảng giá này?")) {
                    removePricingTier(rate);
                  }
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="text-muted-foreground italic">
          Chưa có bảng giá nào. Hãy thêm một mức giá tháng ở trên.
        </p>
      )}
    </div>
  );
}

function PricingEditor({
  rate,
  initialPrices,
  onSave,
  onDelete,
}: {
  rate: number;
  initialPrices: number[];
  onSave: (p: number[]) => void;
  onDelete: () => void;
}) {
  const [prices, setPrices] = useState<number[]>(initialPrices);

  function handleChange(day: number, valueStr: string) {
    const val = Number(valueStr.replace(/\D/g, ""));
    const newPrices = [...prices];
    newPrices[day] = val;
    setPrices(newPrices);
  }

  const days = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Chi tiết bảng giá</CardTitle>
          <CardDescription>Mức giá tháng: {rate.toLocaleString("vi-VN")}đ</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Xóa
          </Button>
          <Button size="sm" onClick={() => onSave(prices)}>
            <Save className="h-4 w-4 mr-2" /> Lưu
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25],
          ].map((chunk, chunkIdx) => (
            <div key={chunkIdx} className="flex flex-col gap-4">
              {chunk.map((day) => (
                <div key={day} className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Ngày {day}</Label>
                  <div className="relative">
                    <Input
                      value={prices[day] === 0 ? "" : prices[day].toLocaleString("vi-VN")}
                      onChange={(e) => handleChange(day, e.target.value)}
                      className="pr-6 text-right font-mono text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
