import { useEffect, useRef, useState, useMemo, type FormEvent, type KeyboardEvent } from "react";
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
import { generateFakeReviewsForBike } from "@/lib/fake-reviews";

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
  const { addBike, updateBike, pricingTiers } = useStore();
  const { lang, t } = useUI();
  const isEdit = mode === "edit" && initial?.id;

  const formatNum = (val: string | number) => {
    if (val === undefined || val === null) return "";
    const strVal = String(val).replace(/\D/g, "");
    if (strVal === "") return "";
    return Number(strVal).toLocaleString("vi-VN");
  };
  const parseNum = (val: string) => Number(val.replace(/\D/g, ""));

  const { bikes } = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "Honda");
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  const uniqueBrands = useMemo(() => {
    const b = bikes.map((x) => x.brand).filter((x): x is string => !!x && x !== "Other");
    const base = ["Honda", "Yamaha", "Vespa", "SYM", "Suzuki"];
    if (initial?.brand && initial.brand !== "Other") base.push(initial.brand);
    return Array.from(new Set([...base, ...b])).sort();
  }, [bikes, initial?.brand]);
  const [category, setCategory] = useState<BikeCategory>(initial?.category ?? "Automatic");
  const [transmission, setTransmission] = useState<Transmission>(
    initial?.transmission ?? "Automatic",
  );
  const [engineCc, setEngineCc] = useState(String(initial?.engineCc ?? 110));
  const [pricePerMonth, setPricePerMonth] = useState(formatNum(initial?.pricePerMonth ?? 1500000));
  const [deposit, setDeposit] = useState(formatNum(initial?.deposit ?? 2000000));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionVi, setDescriptionVi] = useState(initial?.descriptionVi ?? "");
  const [isForSale, setIsForSale] = useState<boolean>(initial?.isForSale ?? false);
  const [salePrice, setSalePrice] = useState(formatNum(initial?.salePrice ?? 25000000));
  const [busyFrom, setBusyFrom] = useState(initial?.busyFrom ?? "");
  const [busyTo, setBusyTo] = useState(initial?.busyTo ?? "");
  
  // For clone: keep the source images so admin can save immediately or replace.
  const initialImages =
    mode === "clone" && initial?.images ? initial.images : (initial?.images ?? []);
  const [images, setImages] = useState<string[]>(initialImages);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generateReviews, setGenerateReviews] = useState(!isEdit);

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

    const templatesAuto = [
      {
        vi: `Dịch vụ cho thuê xe máy chất lượng cao với dòng xe ${name}. Mẫu xe tay ga ${engineCc}cc cho thuê này nổi bật với khả năng vận hành êm ái, siêu tiết kiệm nhiên liệu và cốp chứa đồ rộng rãi. Đây là lựa chọn hoàn hảo khi bạn cần thuê xe tay ga để di chuyển, đi làm hay vi vu khám phá đường phố mỗi ngày!`,
        en: `Top-quality motorbike for rent: The ${name}. This ${engineCc}cc automatic scooter for rent stands out with its incredibly smooth operation, exceptional fuel efficiency, and spacious under-seat storage. If you are looking to rent a scooter for daily commutes or city exploration, this is the perfect choice for long-term motorbike rental!`,
      },
      {
        vi: `Thuê xe tay ga ${name} ${engineCc}cc tại cửa hàng của chúng tôi để trải nghiệm chuyến đi tuyệt vời. Xe được thiết kế hiện đại, máy êm, tiết kiệm xăng và cực kỳ dễ lái. Phù hợp cho cả việc dạo phố hay những chuyến công tác dài ngày. Đặt thuê xe máy ngay hôm nay!`,
        en: `Rent the ${engineCc}cc ${name} automatic scooter at our shop for a fantastic riding experience. Modern design, smooth engine, highly fuel-efficient, and incredibly easy to handle. Perfect for city tours or long business trips. Book your motorbike rental today!`,
      },
      {
        vi: `Bạn đang tìm thuê xe máy tay ga? Chiếc ${name} (${engineCc}cc) chính là sự ưu tiên hàng đầu. Vận hành mượt mà, cốp đồ siêu rộng và cực kỳ bền bỉ. Dịch vụ thuê xe của chúng tôi luôn đảm bảo xe ở trạng thái tốt nhất trước khi giao cho bạn.`,
        en: `Looking to rent an automatic scooter? The ${name} (${engineCc}cc) is a top priority. Smooth performance, massive under-seat storage, and outstanding reliability. Our motorbike rental service always ensures the bike is in pristine condition before handing it over to you.`,
      }
    ];

    const templatesManual = [
      {
        vi: `Cho thuê xe máy tay côn thể thao - ${name}. Sở hữu khối động cơ ${engineCc}cc mạnh mẽ cùng hộp số côn tay linh hoạt, chiếc xe này mang đến cảm giác lái cực kỳ phấn khích. Dịch vụ thuê xe máy của chúng tôi cam kết xe luôn được bảo dưỡng hoàn hảo, sẵn sàng đồng hành cùng bạn trên mọi cung đường phượt hay di chuyển hàng ngày.`,
        en: `Manual motorbike for rent: The aggressive and powerful ${name}! Powered by a robust ${engineCc}cc engine, this manual motorcycle delivers a sporty and exhilarating riding experience. Our motorbike rental service ensures this bike is perfectly maintained. The ideal companion for riders looking to rent a motorbike with true power and performance!`,
      },
      {
        vi: `Thuê xe côn tay ${name} ${engineCc}cc để thỏa mãn đam mê tốc độ! Mẫu xe đậm chất thể thao, sang số cực mượt và bứt tốc vô cùng ấn tượng. Là lựa chọn số 1 cho các anh em cần thuê xe đi phượt hoặc đơn giản là muốn thể hiện cá tính mạnh mẽ trên đường phố.`,
        en: `Rent the ${engineCc}cc ${name} manual bike to satisfy your thirst for speed! A purely sporty model with smooth gear shifting and impressive acceleration. The number one choice for riders needing a rental bike for road trips or simply wanting to show off a bold personality on the streets.`,
      }
    ];

    const templatesSemi = [
      {
        vi: `Cho thuê xe số bền bỉ và tiết kiệm xăng - ${name}. Mẫu xe số ${engineCc}cc này được thiết kế để chinh phục mọi địa hình với sự linh hoạt đáng kinh ngạc. Nếu bạn đang tìm kiếm một dịch vụ cho thuê xe máy, tiết kiệm nhiên liệu tối đa cho việc đi lại hằng ngày thì đây chính là chiếc xe hoàn hảo để thuê!`,
        en: `Reliable semi-automatic motorbike for rent: The ${name}. This ${engineCc}cc bike is engineered to conquer all terrains with outstanding agility and durability. Delivering maximum fuel efficiency, it is the best motorbike rental option for daily commuting and city riding. Discover the best bike for rent today!`,
      },
      {
        vi: `Thuê xe số ${name} ${engineCc}cc - lựa chọn kinh tế và cực kỳ thực dụng. Xe hoạt động siêu ổn định, leo dốc khỏe và mức tiêu hao nhiên liệu thấp. Dịch vụ thuê xe của chúng tôi luôn bảo dưỡng định kỳ để đảm bảo bạn có một phương tiện an toàn và đáng tin cậy.`,
        en: `Rent the ${engineCc}cc ${name} semi-automatic - an economical and highly practical choice. Super stable operation, strong uphill climbing, and low fuel consumption. Our rental service performs regular maintenance to ensure you have a safe and reliable vehicle.`,
      }
    ];

    let selectedTemplate;
    if (category === "Automatic") {
      selectedTemplate = templatesAuto[Math.floor(Math.random() * templatesAuto.length)];
    } else if (category === "Manual") {
      selectedTemplate = templatesManual[Math.floor(Math.random() * templatesManual.length)];
    } else if (category === "Electric") {
      selectedTemplate = {
        vi: `Cho thuê xe điện ${name} - tiết kiệm, bảo vệ môi trường. Di chuyển mượt mà, không tiếng ồn. Lựa chọn hoàn hảo cho việc đi lại trong thành phố.`,
        en: `Electric bike for rent: The ${name}. Eco-friendly, silent, and smooth riding. Perfect for city commuting.`,
      };
    } else {
      selectedTemplate = templatesSemi[Math.floor(Math.random() * templatesSemi.length)];
    }

    descEn = selectedTemplate.en;
    descVi = selectedTemplate.vi;

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
    const pm = parseNum(pricePerMonth);
    let pd = 150000;
    let pw = 750000;
    
    const schedule = pricingTiers[pm];
    if (schedule) {
      pd = schedule[1] || 150000;
      pw = schedule[7] || 750000;
    } else {
      const ratio = pm / 1500000;
      const base = pricingTiers[1500000];
      if (base) {
        pd = Math.round((base[1] * ratio) / 10000) * 10000;
        pw = Math.round((base[7] * ratio) / 10000) * 10000;
      }
    }

    const payload = {
      name,
      brand,
      category,
      transmission,
      engineCc: Number(engineCc),
      pricePerDay: pd,
      pricePerWeek: pw,
      pricePerMonth: pm,
      deposit: parseNum(deposit),
      description,
      descriptionVi,
      imageUrl: images[0],
      images,
      available: initial?.available ?? true,
      isForSale,
      salePrice: isForSale ? parseNum(salePrice) : undefined,
      busyFrom: busyFrom || undefined,
      busyTo: busyTo || undefined,
    };
    setSaving(true);
    try {
      if (isEdit && initial?.id) {
        await updateBike(initial.id, payload);
        toast.success(t("toast_updated"));
      } else {
        const addedBike = await addBike(payload);
        if (addedBike && generateReviews) {
          try {
            await generateFakeReviewsForBike(addedBike.id);
            toast.success(lang === "vi" ? "Đã tạo review tự động!" : "Auto-reviews generated!");
          } catch (e) {
            console.error("Failed to generate reviews:", e);
            toast.error(lang === "vi" ? "Lỗi tạo review" : "Failed to generate reviews");
          }
        }
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
          <Label>{t("form_brand")}</Label>
          {!isCustomBrand ? (
            <Select
              value={uniqueBrands.includes(brand) ? brand : (uniqueBrands[0] || "Honda")}
              onValueChange={(v) => {
                if (v === "NEW_BRAND") {
                  setIsCustomBrand(true);
                  setBrand("");
                } else {
                  setBrand(v);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                {uniqueBrands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
                <SelectItem value="NEW_BRAND" className="text-accent font-bold">
                  + {lang === "vi" ? "Thêm hãng khác" : "Add new brand"}
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2 mt-1">
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={lang === "vi" ? "Nhập tên hãng..." : "Enter brand name..."}
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCustomBrand(false);
                  setBrand(uniqueBrands[0] || "Honda");
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
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
              <SelectItem value="Electric">Electric</SelectItem>
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
              <SelectItem value="Electric">Electric</SelectItem>
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

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-3">
          <Label className="text-sm font-semibold">
            {lang === "vi" ? "Thời gian bận (Short-term rental)" : "Busy Dates (Short-term)"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {lang === "vi"
              ? "Cập nhật khoảng thời gian xe đang cho thuê ngắn hạn để hiển thị trên web."
              : "Set the period this bike is currently rented out short-term."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{lang === "vi" ? "Từ ngày" : "Busy From"}</Label>
            <Input type="date" value={busyFrom} onChange={(e) => setBusyFrom(e.target.value)} />
          </div>
          <div>
            <Label>{lang === "vi" ? "Đến ngày" : "Busy To"}</Label>
            <Input type="date" value={busyTo} onChange={(e) => setBusyTo(e.target.value)} />
          </div>
        </div>
      </div>

      {!isEdit && (
        <div className="flex items-center space-x-2 rounded-lg border bg-accent/30 p-4">
          <Switch
            id="generate-reviews"
            checked={generateReviews}
            onCheckedChange={setGenerateReviews}
          />
          <Label htmlFor="generate-reviews" className="flex flex-col gap-1">
            <span className="font-semibold text-accent-foreground">
              {lang === "vi" ? "Tự động tạo Review ảo" : "Auto-generate fake reviews"}
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              {lang === "vi" 
                ? "Tạo tự động số lượng ngẫu nhiên review 4.8 - 5.0 sao cho xe này" 
                : "Automatically generate a random amount of 4.8 - 5.0 star reviews for this bike"}
            </span>
          </Label>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t mt-8">
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
