import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Upload, Loader2, X, Sparkles, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUI } from "@/lib/ui-context";
import { ImageCropperDialog } from "./ImageCropperDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore, type Bike, type BikeCategory, type Transmission } from "@/lib/store";
import { optimizeImageToWebP } from "@/lib/image-utils";
import { toast } from "sonner";

const MAX_IMAGES = 4;

export function BikeForm({
  initial,
  mode = initial ? "edit" : "add",
  onDone,
}: {
  initial?: Partial<Bike>;
  mode?: "add" | "edit" | "clone";
  onDone?: () => void;
}) {
  const { addBike, updateBike } = useStore();
  const { lang, t } = useUI();
  const isEdit = mode === "edit" && initial?.id;

  const formatNum = (val: string | number) => {
    if (val === undefined || val === null) return "";
    const strVal = String(val).replace(/\D/g, "");
    if (strVal === "") return "";
    return Number(strVal).toLocaleString("vi-VN");
  };
  const parseNum = (val: string) => Number(val.replace(/\D/g, ""));

  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "Other");
  const [category, setCategory] = useState<BikeCategory>(initial?.category ?? "Automatic");
  const [transmission, setTransmission] = useState<Transmission>(
    initial?.transmission ?? "Automatic",
  );
  const [engineCc, setEngineCc] = useState(String(initial?.engineCc ?? 110));
  const [pricePerDay, setPricePerDay] = useState(formatNum(initial?.pricePerDay ?? 150000));
  const [pricePerWeek, setPricePerWeek] = useState(formatNum(initial?.pricePerWeek ?? 750000));
  const [pricePerMonth, setPricePerMonth] = useState(formatNum(initial?.pricePerMonth ?? 1500000));
  const [deposit, setDeposit] = useState(formatNum(initial?.deposit ?? 2000000));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionVi, setDescriptionVi] = useState(initial?.descriptionVi ?? "");
  const [isForSale, setIsForSale] = useState<boolean>(initial?.isForSale ?? false);
  const [salePrice, setSalePrice] = useState(formatNum(initial?.salePrice ?? 25000000));
  // For clone: keep the source images so admin can save immediately or replace.
  const initialImages =
    mode === "clone" && initial?.images ? initial.images : (initial?.images ?? []);
  const [images, setImages] = useState<string[]>(initialImages);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleFilesSelect(files: File[]) {
    if (files.length) {
      void processFiles(files);
    }
  }
  const formRef = useRef<HTMLFormElement>(null);

  async function processFiles(files: File[]) {
    if (!files.length) return;
    setProcessing(true);
    try {
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        toast.error(t("toast_max_img", { max: MAX_IMAGES }));
        return;
      }
      const slice = files.slice(0, remaining);
      const results = await Promise.all(
        slice.map((f) =>
          optimizeImageToWebP(f, {
            maxWidth: 1280,
            maxHeight: 1280,
            quality: 0.82,
          }),
        ),
      );
      setImages((prev) => [...prev, ...results].slice(0, MAX_IMAGES));
      toast.success(`Added ${results.length} image${results.length > 1 ? "s" : ""}`);
      if (files.length > slice.length) {
        toast.message(`Only first ${slice.length} used (max ${MAX_IMAGES}).`);
      }
    } catch {
      toast.error("Failed to process image");
    } finally {
      setProcessing(false);
    }
  }

  // Clipboard paste handler (scoped to the form/modal)
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const it of items) {
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        handleFilesSelect(files);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [images.length]);

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function addImageUrl() {
    if (!imageUrlInput.trim()) return;
    if (images.length >= MAX_IMAGES) {
      toast.error(t("toast_max_img", { max: MAX_IMAGES }));
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
    toast.success(t("toast_url_added"));
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) handleFilesSelect(files);
  }

  function autoGenerateDescription() {
    if (!name) {
      toast.error(
        lang === "vi" ? "Vui lòng nhập tên xe trước khi tạo mô tả" : "Please enter bike name first",
      );
      return;
    }

    let descEn = "";
    let descVi = "";

    if (category === "Automatic") {
      descVi = `Trải nghiệm sự tự do và thoải mái tối đa với ${name}. Mẫu xe tay ga ${engineCc}cc này nổi bật với thiết kế thanh lịch, khả năng vận hành vô cùng êm ái và siêu tiết kiệm nhiên liệu. Cốp xe rộng chứa đồ thoải mái, yên xe êm ái cho những chuyến đi dài. Lựa chọn hoàn hảo để vi vu khám phá mọi ngóc ngách đường phố một cách sành điệu và tiện lợi nhất!`;
      descEn = `Experience ultimate freedom and comfort with the ${name}. This ${engineCc}cc automatic scooter stands out with its elegant design, incredibly smooth operation, and exceptional fuel efficiency. Featuring spacious under-seat storage and a comfortable saddle for long rides, it's the perfect choice for exploring every corner of the city in style and absolute convenience!`;
    } else if (category === "Manual") {
      descVi = `Khơi dậy đam mê tốc độ và khẳng định cá tính cùng ${name}! Sức mạnh từ khối động cơ ${engineCc}cc kết hợp với hộp số côn tay linh hoạt mang đến cảm giác lái cực kỳ phấn khích và thể thao. Thiết kế góc cạnh, nam tính cùng khả năng bứt tốc mạnh mẽ sẽ biến mỗi chuyến đi của bạn thành một cuộc phiêu lưu đích thực. Người bạn đồng hành lý tưởng cho những tín đồ ưa thích sự mạnh mẽ trên mọi cung đường.`;
      descEn = `Ignite your passion for speed and make a bold statement with the ${name}! Powered by a robust ${engineCc}cc engine and a highly responsive manual transmission, it delivers an exhilarating and sporty riding experience. Its aggressive, masculine design and powerful acceleration will turn every journey into a true adventure. The ideal companion for riders who crave power and performance on any road.`;
    } else {
      descVi = `Khám phá sự bền bỉ và tiện dụng tuyệt vời cùng ${name}. Mẫu xe số ${engineCc}cc này được thiết kế để chinh phục mọi địa hình với động cơ cực kỳ bền bỉ và khả năng luồn lách linh hoạt. Tiết kiệm xăng tối đa, mang lại trải nghiệm lái mượt mà và vô cùng an toàn. Một chiếc xe "quốc dân" hoàn hảo cho những chuyến đi phượt xa hoặc đi lại hằng ngày!`;
      descEn = `Discover incredible durability and unmatched versatility with the ${name}. This ${engineCc}cc semi-automatic bike is engineered to conquer all terrains with a highly reliable engine and outstanding agility. Delivering maximum fuel efficiency, it provides a smooth and incredibly safe riding experience. The perfect all-rounder for both long road trips and daily city commutes!`;
    }

    setDescription(descEn);
    setDescriptionVi(descVi);
    toast.success(
      lang === "vi" ? "Đã tạo mô tả tự động (EN & VI)!" : "Auto-description generated (EN & VI)!",
    );
  }

  async function submit() {
    if (!name || images.length === 0) {
      toast.error(t("toast_req"));
      return;
    }
    const payload = {
      name,
      brand,
      category,
      transmission,
      engineCc: Number(engineCc),
      pricePerDay: parseNum(pricePerDay),
      pricePerWeek: parseNum(pricePerWeek),
      pricePerMonth: parseNum(pricePerMonth),
      deposit: parseNum(deposit),
      description,
      descriptionVi,
      imageUrl: images[0],
      images,
      available: initial?.available ?? true,
      isForSale,
      salePrice: isForSale ? parseNum(salePrice) : undefined,
    };
    setSaving(true);
    try {
      if (isEdit && initial?.id) {
        await updateBike(initial.id, payload);
        toast.success(t("toast_updated"));
      } else {
        await addBike(payload);
        toast.success(mode === "clone" ? t("toast_duplicated") : t("toast_added"));
      }
      onDone?.();
    } catch (err) {
      console.error("[BikeForm] save error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(
        lang === "vi"
          ? `Lưu thất bại: ${errMsg}`
          : `Save failed: ${errMsg}`,
      );
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submit();
  }

  // Enter to submit on inputs; Ctrl/Cmd+Enter in textarea.
  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    const tag = target.tagName;
    if (e.key !== "Enter") return;
    if (tag === "TEXTAREA") {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        void submit();
      }
      return;
    }
    if (tag === "INPUT") {
      const type = (target as HTMLInputElement).type;
      if (type === "file") return;
      e.preventDefault();
      void submit();
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} onKeyDown={onKeyDown} className="grid gap-4">
      <div>
        <Label>
          {t("form_images")} ({images.length}/{MAX_IMAGES})
        </Label>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground hover:bg-muted"
        >
          {processing ? (
            <>
              <Loader2 className="size-6 animate-spin text-accent" />
              {t("form_optimizing")}
            </>
          ) : (
            <>
              <Upload className="size-6 text-accent" />
              {t("form_upload_help")}
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) handleFilesSelect(files);
              e.target.value = "";
            }}
          />
        </label>

        <div className="mt-2 flex gap-2">
          <Input
            placeholder={t("form_paste_url")}
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                addImageUrl();
              }
            }}
            className="h-9 text-sm"
          />
          <Button type="button" variant="secondary" onClick={addImageUrl} className="h-9 shrink-0">
            <LinkIcon className="mr-1.5 size-4" />
            {t("form_add_link")}
          </Button>
        </div>

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted"
              >
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="size-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {t("form_main")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">{t("form_name")}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label>{lang === "vi" ? "Hãng xe" : "Brand"}</Label>
          <Select value={brand} onValueChange={(v) => setBrand(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Honda">Honda</SelectItem>
              <SelectItem value="Yamaha">Yamaha</SelectItem>
              <SelectItem value="Vespa">Vespa</SelectItem>
              <SelectItem value="SYM">SYM</SelectItem>
              <SelectItem value="Suzuki">Suzuki</SelectItem>
              <SelectItem value="Other">{lang === "vi" ? "Khác" : "Other"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("form_cat")}</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as BikeCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("form_trans")}</Label>
          <Select value={transmission} onValueChange={(v) => setTransmission(v as Transmission)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cc">{t("form_cc")}</Label>
          <Input
            id="cc"
            type="number"
            value={engineCc}
            onChange={(e) => setEngineCc(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pd">{t("form_price_d")}</Label>
          <Input
            id="pd"
            type="text"
            inputMode="numeric"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(formatNum(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="pw">{t("form_price_w")}</Label>
          <Input
            id="pw"
            type="text"
            inputMode="numeric"
            value={pricePerWeek}
            onChange={(e) => setPricePerWeek(formatNum(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="pm">{t("form_price_m")}</Label>
          <Input
            id="pm"
            type="text"
            inputMode="numeric"
            value={pricePerMonth}
            onChange={(e) => setPricePerMonth(formatNum(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="dep">{t("form_dep")}</Label>
          <Input
            id="dep"
            type="text"
            inputMode="numeric"
            value={deposit}
            onChange={(e) => setDeposit(formatNum(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="desc">{t("form_desc_en")}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs font-semibold text-emerald-600 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-700 transition"
              onClick={autoGenerateDescription}
            >
              <Sparkles className="mr-1.5 size-3" /> {t("form_auto_write")}
            </Button>
          </div>
          <Textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="English description..."
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="descVi">{t("form_desc_vi")}</Label>
          <Textarea
            id="descVi"
            rows={3}
            value={descriptionVi}
            onChange={(e) => setDescriptionVi(e.target.value)}
            placeholder="Vietnamese description..."
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("form_tip")}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="forsale" className="text-sm font-semibold">
              {t("form_is_sale")}
            </Label>
            <p className="text-xs text-muted-foreground">{t("form_sale_help")}</p>
          </div>
          <Switch id="forsale" checked={isForSale} onCheckedChange={setIsForSale} />
        </div>
        {isForSale && (
          <div className="mt-3">
            <Label htmlFor="salePrice">{t("form_sale_price")}</Label>
            <Input
              id="salePrice"
              type="text"
              inputMode="numeric"
              value={salePrice}
              onChange={(e) => setSalePrice(formatNum(e.target.value))}
              placeholder="25.000.000"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t("form_preview")} {salePrice || 0}đ
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          {t("admin_cancel")}
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {lang === "vi" ? "Đang lưu..." : "Saving..."}
            </>
          ) : isEdit ? (
            t("form_save_changes")
          ) : mode === "clone" ? (
            t("form_save_dup")
          ) : (
            t("admin_add")
          )}
        </Button>
      </div>

    </form>
  );
}
