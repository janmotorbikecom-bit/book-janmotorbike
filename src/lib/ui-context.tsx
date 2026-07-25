import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
export type Lang = "en" | "vi";

type Dict = Record<string, { en: string; vi: string }>;

const DICT: Dict = {
  // Nav / header
  browse: { en: "Browse", vi: "Xe cho thuê" },
  admin: { en: "Admin", vi: "Quản trị" },
  // Storefront
  hero_kicker: {
    en: "Daily · Weekly · Monthly · Instant booking",
    vi: "Ngày · Tuần · Tháng · Đặt ngay",
  },
  hero_title_1: { en: "Find your ride.", vi: "Chọn xe của bạn." },
  hero_title_2: { en: "Book in seconds.", vi: "Đặt trong vài giây." },
  hero_sub: {
    en: "Pick a bike, choose your dates, message us on WhatsApp — done.",
    vi: "Chọn xe, chọn ngày, nhắn WhatsApp — xong.",
  },
  search_placeholder: { en: "Search bikes…", vi: "Tìm xe…" },
  cat_all: { en: "All categories", vi: "Tất cả loại" },
  cat_auto: { en: "Automatic", vi: "Xe tay ga" },
  cat_manual: { en: "Manual", vi: "Xe số" },
  cat_semi: { en: "Semi-Automatic", vi: "Bán tự động" },
  sort_featured: { en: "Featured", vi: "Nổi bật" },
  sort_asc: { en: "Price: low to high", vi: "Giá: thấp đến cao" },
  sort_desc: { en: "Price: high to low", vi: "Giá: cao đến thấp" },
  no_results: { en: "No bikes match your filters.", vi: "Không có xe phù hợp." },
  // Card
  from: { en: "From", vi: "Từ" },
  per_day_short: { en: "/day", vi: "/ngày" },
  per_week_short: { en: "/wk", vi: "/tuần" },
  per_month_short: { en: "/mo", vi: "/tháng" },
  book_now: { en: "Book Now", vi: "Đặt ngay" },
  available: { en: "Available", vi: "Còn xe" },
  rented: { en: "Rented", vi: "Đã thuê" },
  // Modal
  view_details: { en: "View Details", vi: "Chi tiết" },
  category: { en: "Category", vi: "Loại xe" },
  engine: { en: "Engine", vi: "Động cơ" },
  transmission: { en: "Transmission", vi: "Hộp số" },
  description: { en: "Description", vi: "Mô tả" },
  price_daily: { en: "Daily", vi: "Theo ngày" },
  price_weekly: { en: "Weekly", vi: "Theo tuần" },
  price_monthly: { en: "Monthly", vi: "Theo tháng" },
  deposit: { en: "Deposit", vi: "Tiền cọc" },
  your_name: { en: "Your name", vi: "Tên của bạn" },
  your_phone: { en: "Phone / WhatsApp", vi: "Số điện thoại / WhatsApp" },
  from_date: { en: "From date", vi: "Từ ngày" },
  to_date: { en: "To date", vi: "Đến ngày" },
  pick_date: { en: "Pick a date", vi: "Chọn ngày" },
  total_estimate: { en: "Total estimated", vi: "Tổng tiền dự kiến" },
  days: { en: "days", vi: "ngày" },
  book_wa: { en: "Book via WhatsApp", vi: "Đặt qua WhatsApp" },
  book_zalo: { en: "Book via Zalo", vi: "Đặt qua Zalo" },
  book_msgr: { en: "Book via Messenger", vi: "Đặt qua Messenger" },
  disclaimer: {
    en: "You book directly with {name}. No online payment.",
    vi: "Bạn đặt trực tiếp với {name}. Không thanh toán online.",
  },
  wa_msg_intro: {
    en: "Hi {name}, I want to book {bike}.",
    vi: "Chào {name}, tôi muốn đặt {bike}.",
  },
  wa_label_name: { en: "Name", vi: "Tên" },
  wa_label_dates: { en: "Dates", vi: "Ngày" },
  wa_label_total: { en: "Total estimated price", vi: "Tổng tiền dự kiến" },
  wa_label_phone: { en: "Phone", vi: "SĐT" },
  tbd: { en: "TBD", vi: "Chưa chọn" },

  // Admin General
  admin_inventory: { en: "Inventory", vi: "Kho xe" },
  admin_settings: { en: "Settings", vi: "Cài đặt" },
  admin_save: { en: "Save", vi: "Lưu" },
  admin_cancel: { en: "Cancel", vi: "Hủy" },
  admin_edit: { en: "Edit", vi: "Sửa" },
  admin_delete: { en: "Delete", vi: "Xóa" },
  admin_duplicate: { en: "Duplicate", vi: "Nhân bản" },
  admin_add: { en: "Add bike", vi: "Thêm xe" },

  // Settings Page
  settings_desc: {
    en: 'These numbers power every "Book via WhatsApp / Zalo" button on the storefront.',
    vi: 'Các số này được dùng cho các nút "Đặt qua WhatsApp / Zalo" trên trang web.',
  },
  settings_owner: { en: "Your name (shown to customers)", vi: "Tên của bạn (hiển thị cho khách)" },
  settings_wa: { en: "WhatsApp number", vi: "Số WhatsApp" },
  settings_zl: { en: "Zalo number", vi: "Số Zalo" },
  settings_ms: { en: "Messenger username / page ID", vi: "Tên đăng nhập / ID trang Messenger" },
  settings_saved: { en: "Settings saved", vi: "Đã lưu cài đặt" },

  // Inventory Page
  inv_available: { en: "{count} available", vi: "{count} xe rảnh" },
  inv_forsale: { en: "{count} for sale", vi: "{count} xe đang bán" },
  inv_total: { en: "{count} total", vi: "Tổng cộng {count} xe" },
  inv_copy_sale: { en: "Copy Sale Page Link", vi: "Copy Link Trang Bán" },
  inv_open: { en: "Open", vi: "Mở" },
  inv_ready: { en: "Ready", vi: "Rảnh" },
  inv_rented: { en: "Rented", vi: "Đã thuê" },
  inv_price_mo: { en: "Price/mo", vi: "Giá/tháng" },
  inv_empty: { en: "No bikes in inventory yet.", vi: "Chưa có xe nào trong kho." },
  inv_add_first: { en: "Add your first bike", vi: "Thêm chiếc xe đầu tiên" },
  inv_edit_bike: { en: "Edit bike", vi: "Sửa xe" },
  inv_dup_bike: { en: "Duplicate bike", vi: "Nhân bản xe" },
  inv_add_new: { en: "Add new bike", vi: "Thêm xe mới" },

  // BikeForm
  form_images: { en: "Images", vi: "Hình ảnh" },
  form_optimizing: { en: "Optimizing…", vi: "Đang tối ưu…" },
  form_upload_help: {
    en: "Click, drag & drop, or Ctrl+V to upload multiple images",
    vi: "Kéo thả, click hoặc nhấn Ctrl+V để tải ảnh lên",
  },
  form_paste_url: { en: "Or paste image URL here...", vi: "Hoặc dán URL ảnh vào đây..." },
  form_add_link: { en: "Add Link", vi: "Thêm Link" },
  form_main: { en: "Main", vi: "Chính" },
  form_name: { en: "Bike name", vi: "Tên xe" },
  form_cat: { en: "Category", vi: "Loại xe" },
  form_trans: { en: "Transmission", vi: "Hộp số" },
  form_cc: { en: "Engine (cc)", vi: "Động cơ (cc)" },
  form_price_d: { en: "Price / day (VND)", vi: "Giá / ngày (VND)" },
  form_price_w: { en: "Price / week (VND)", vi: "Giá / tuần (VND)" },
  form_price_m: { en: "Price / month (VND)", vi: "Giá / tháng (VND)" },
  form_dep: { en: "Deposit (VND)", vi: "Tiền cọc (VND)" },
  form_desc_en: { en: "Description (EN)", vi: "Mô tả (EN)" },
  form_desc_vi: { en: "Description (VI)", vi: "Mô tả (VI)" },
  form_auto_write: { en: "Auto-write (EN & VI)", vi: "Viết tự động (EN & VI)" },
  form_tip: {
    en: "Tip: Enter submits in fields. In description, use Ctrl/Cmd + Enter to submit.",
    vi: "Mẹo: Nhấn Enter để lưu. Trong mô tả, nhấn Ctrl/Cmd + Enter để lưu.",
  },
  form_is_sale: { en: "Available for Sale?", vi: "Đang đăng bán?" },
  form_sale_help: {
    en: "Show this bike on the hidden /sale page.",
    vi: "Hiển thị xe này trên trang /sale ẩn.",
  },
  form_sale_price: { en: "Sale Price (VND)", vi: "Giá bán (VND)" },
  form_preview: { en: "Preview:", vi: "Xem trước:" },
  form_save_changes: { en: "Save changes", vi: "Lưu thay đổi" },
  form_save_dup: { en: "Save duplicate", vi: "Lưu bản sao" },

  // Toasts
  toast_max_img: { en: "Max {max} images", vi: "Tối đa {max} ảnh" },
  toast_url_added: { en: "Image URL added", vi: "Đã thêm link ảnh" },
  toast_req: {
    en: "Name and at least one image are required",
    vi: "Cần nhập tên và ít nhất 1 ảnh",
  },
  toast_updated: { en: "Bike updated", vi: "Đã cập nhật xe" },
  toast_duplicated: { en: "Bike duplicated", vi: "Đã nhân bản xe" },
  toast_added: { en: "Bike added", vi: "Đã thêm xe" },
  toast_removed: { en: "Bike removed", vi: "Đã xóa xe" },
  toast_copied: { en: "Sale page link copied", vi: "Đã copy link trang bán" },
};

type Ctx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: keyof typeof DICT, vars?: Record<string, string | number>) => string;
  formatVnd: (v: number) => string;
};

const UICtx = createContext<Ctx | null>(null);
const LS_KEY = "moto-ui-pref-v1";

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [lang, setLangState] = useState<Lang>("vi");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.theme === "dark" || p.theme === "light") setThemeState(p.theme);
        if (p.lang === "en" || p.lang === "vi") setLangState(p.lang);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.lang = lang;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ theme, lang }));
    } catch {}
  }, [theme, lang]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
      lang,
      setLang: setLangState,
      toggleLang: () => setLangState((l) => (l === "vi" ? "en" : "vi")),
      t: (key, vars) => {
        let s = DICT[key]?.[lang] ?? String(key);
        if (vars) for (const k of Object.keys(vars)) s = s.replaceAll(`{${k}}`, String(vars[k]));
        return s;
      },
      formatVnd: (v: number) => `${Math.round(v || 0).toLocaleString("vi-VN")}đ`,
    }),
    [theme, lang],
  );

  return <UICtx.Provider value={value}>{children}</UICtx.Provider>;
}

export function useUI() {
  const ctx = useContext(UICtx);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
