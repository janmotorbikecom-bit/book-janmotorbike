import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImg } from "@/lib/cropImage";
import { useUI } from "@/lib/ui-context";

export function ImageCropperDialog({
  imageSrc,
  open,
  onOpenChange,
  onCropComplete,
}: {
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedFile: File) => void;
}) {
  const { lang } = useUI();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (e) {
      console.error("Error cropping image:", e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{lang === "vi" ? "Căn chỉnh hình ảnh" : "Adjust Image"}</DialogTitle>
        </DialogHeader>
        <div className="relative h-[400px] w-full bg-black/5 rounded-md overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {lang === "vi" ? "Dùng chuột kéo để di chuyển khung hình." : "Drag to move the frame."}
        </p>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            {lang === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={processing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {processing
              ? lang === "vi"
                ? "Đang xử lý..."
                : "Processing..."
              : lang === "vi"
                ? "Lưu"
                : "Crop & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
