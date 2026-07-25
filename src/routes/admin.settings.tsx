import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSettings } = useStore();
  const { t } = useUI();
  const [wa, setWa] = useState(settings.whatsapp);
  const [zl, setZl] = useState(settings.zalo);
  const [ms, setMs] = useState(settings.messenger);
  const [owner, setOwner] = useState(settings.ownerName);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSettings({
      whatsapp: wa.trim(),
      zalo: zl.trim(),
      messenger: ms.trim(),
      ownerName: owner.trim(),
    });
    toast.success(t("settings_saved"));
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold">{t("admin_settings")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("settings_desc")}</p>

      <form onSubmit={save} className="max-w-xl rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="owner">{t("settings_owner")}</Label>
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Jan"
            />
          </div>
          <div>
            <Label htmlFor="wa">{t("settings_wa")}</Label>
            <Input
              id="wa"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="e.g. 84900000000 (country code, no +)"
            />
          </div>
          <div>
            <Label htmlFor="zl">{t("settings_zl")}</Label>
            <Input
              id="zl"
              value={zl}
              onChange={(e) => setZl(e.target.value)}
              placeholder="e.g. 84900000000"
            />
          </div>
          <div>
            <Label htmlFor="ms">{t("settings_ms")}</Label>
            <Input
              id="ms"
              value={ms}
              onChange={(e) => setMs(e.target.value)}
              placeholder="e.g. motorent (used in m.me/…)"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t("admin_save")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
