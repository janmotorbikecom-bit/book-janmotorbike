import { createFileRoute, useOutletContext } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Copy, Link as LinkIcon, Tag } from "lucide-react";
import { useStore, type Bike } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BikeForm } from "@/components/BikeForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: Inventory,
});

function Inventory() {
  const { role } = useOutletContext<{ role: "admin" | "staff" }>();
  const { bikes, toggleAvailable, removeBike } = useStore();
  const { formatVnd, t } = useUI();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bike | null>(null);

  const [mode, setMode] = useState<"add" | "edit" | "clone">("add");

  const groupedBikes = useMemo(() => {
    const groups: Record<string, Bike[]> = {};
    for (const bike of bikes) {
      if (!groups[bike.category]) groups[bike.category] = [];
      groups[bike.category].push(bike);
    }
    return groups;
  }, [bikes]);

  function openNew() {
    setEditing(null);
    setMode("add");
    setOpen(true);
  }
  async function openEdit(b: Bike) {
    try {
      const { data } = await supabase.from("bikes").select("images").eq("id", b.id).single();
      setEditing({ ...b, images: data?.images || [] });
    } catch {
      setEditing(b);
    }
    setMode("edit");
    setOpen(true);
  }
  function openClone(b: Bike) {
    // Strip id + images so admin drops fresh photos, keep all other fields.
    const { id: _id, images: _images, imageUrl: _imageUrl, name, ...rest } = b;
    void _id;
    void _images;
    void _imageUrl;
    setEditing({
      ...rest,
      name: `${name} (copy)`,
    } as Bike);
    setMode("clone");
    setOpen(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("admin_inventory")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("inv_available", { count: bikes.filter((b) => b.available).length })} ·{" "}
            {t("inv_forsale", { count: bikes.filter((b) => b.isForSale).length })} ·{" "}
            {t("inv_total", { count: bikes.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const url = `${window.location.origin}/sale`;
              try {
                await navigator.clipboard.writeText(url);
                toast.success(t("toast_copied"), { description: url });
              } catch {
                toast.error("Copy failed");
              }
            }}
            title="Copy hidden /sale link"
          >
            <LinkIcon className="size-4" /> {t("inv_copy_sale")}
          </Button>
          <Button variant="outline" asChild title="Open /sale in new tab">
            <a href="/sale" target="_blank" rel="noreferrer">
              <Tag className="size-4" /> {t("inv_open")}
            </a>
          </Button>
          {role === "admin" && (
            <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="size-4" /> {t("admin_add")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedBikes).map(([category, catBikes]) => (
          <section key={category}>
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-2">
              <h2 className="font-display text-xl font-bold">{category}</h2>
              <Badge variant="secondary" className="rounded-full">
                {catBikes.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {catBikes.map((b) => (
                <div
                  key={b.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative aspect-[3/4] bg-muted">
                    <img
                      src={b.imageUrl}
                      alt={b.name}
                      loading="lazy"
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute right-2 top-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm border border-border">
                        <Switch
                          checked={b.available}
                          disabled={role !== "admin"}
                          onCheckedChange={() => {
                            toggleAvailable(b.id);
                            toast.success(
                              t("toast_status", {
                                name: b.name,
                                status: !b.available ? t("available") : t("rented"),
                              }),
                            );
                          }}
                          className="data-[state=checked]:bg-emerald-500 scale-75 origin-right"
                        />
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                            b.available ? "text-emerald-600" : "text-muted-foreground",
                          )}
                        >
                          {b.available ? t("inv_ready") : t("inv_rented")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold truncate" title={b.name}>
                          {b.name}
                        </h3>
                        {b.brand && (
                          <div className="text-xs text-muted-foreground mt-0.5">{b.brand}</div>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground font-medium">
                        {b.engineCc}cc
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                          {t("inv_price_mo")}
                        </div>
                        <div className="font-bold text-primary">{formatVnd(b.pricePerMonth)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                          {t("deposit")}
                        </div>
                        <div className="font-medium text-foreground">{formatVnd(b.deposit)}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 pt-1">
                      {role === "admin" ? (
                        <>
                          <Button variant="secondary" className="flex-1" onClick={() => openEdit(b)}>
                            <Pencil className="size-4 mr-1.5" /> {t("admin_edit")}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openClone(b)}
                            title={t("admin_duplicate")}
                            className="shrink-0"
                          >
                            <Copy className="size-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              if (confirm(t("admin_confirm_delete"))) {
                                removeBike(b.id);
                              }
                            }}
                            className="shrink-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                            title={t("admin_delete")}
                          >
                            <Trash2 className="size-4 text-muted-foreground hover:text-current" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="secondary" className="flex-1 opacity-50 cursor-not-allowed" title="Staff cannot edit">
                          <Pencil className="size-4 mr-1.5" /> {t("admin_edit")} (Locked)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {bikes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="mb-4 text-muted-foreground">{t("inv_empty")}</p>
            {role === "admin" && (
              <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 size-4" /> {t("admin_add_first")}
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit"
                ? t("inv_edit_bike")
                : mode === "clone"
                  ? t("inv_dup_bike")
                  : t("inv_add_new")}
            </DialogTitle>
          </DialogHeader>
          <BikeForm
            key={editing?.id ?? "new"}
            initial={editing ?? undefined}
            mode={mode}
            onDone={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
