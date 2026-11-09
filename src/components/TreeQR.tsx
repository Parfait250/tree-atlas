import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Public URL encoded in every tree's QR label. */
export function treeUrl(id: string) {
  const origin = typeof window === "undefined" ? "https://tree-atlas.lovable.app" : window.location.origin;
  return `${origin}/tree/${encodeURIComponent(id)}`;
}

export function TreeQR({ id, size = 160, className }: { id: string; size?: number; className?: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(treeUrl(id), { width: size * 2, margin: 1, errorCorrectionLevel: "M" }).then(setSrc).catch(() => setSrc(""));
  }, [id, size]);
  if (!src) return <div style={{ width: size, height: size }} className={className} />;
  return <img src={src} alt={`QR code for tree ${id}`} width={size} height={size} className={className} />;
}
