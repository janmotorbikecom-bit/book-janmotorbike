import { Link } from "@tanstack/react-router";
import { Bike, Moon, Sun, Languages } from "lucide-react";
import { useUI } from "@/lib/ui-context";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { theme, toggleTheme, lang, toggleLang, t } = useUI();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex flex-col items-center justify-center bg-black px-3 py-1.5 rounded-sm hover:opacity-90 transition-opacity">
          <div className="flex items-center gap-1 self-center mb-0.5">
            <span className="text-white text-[10px] tracking-[0.2em] font-medium leading-none">JAN'S</span>
            <div className="size-3.5 rounded-full border border-amber-600 flex items-center justify-center bg-amber-900/50">
              <span className="text-[5px] text-amber-500 font-bold">MOTO</span>
            </div>
          </div>
          <div className="relative">
            <span className="text-white text-xl md:text-2xl font-black tracking-widest leading-none">MOTORBIKE</span>
            <div className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-500 rounded-full"></div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-foreground/70 hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground" }}
          >
            {t("browse")}
          </Link>
          <Link
            to="/admin"
            className="rounded-md px-3 py-2 text-foreground/70 hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground" }}
          >
            {t("admin")}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="ml-1 gap-1.5 font-semibold uppercase"
            aria-label="Toggle language"
            title={lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <Languages className="size-4" />
            {lang === "vi" ? "VI" : "EN"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
