import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import astronautAsset from "@/assets/astronaut.png.asset.json";

interface AstronautMascotProps {
  className?: string;
}

export function AstronautMascot({ className }: AstronautMascotProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let targetX = 0;
    let targetY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (frameRef.current != null) return;
      frameRef.current = requestAnimationFrame(update);
    };

    const update = () => {
      frameRef.current = null;
      const el = imgRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = targetX - cx;
      const dy = targetY - cy;
      // angle relative to "up" — clamp so it feels like the helmet tilting
      const angleDeg = Math.atan2(dx, -dy) * (180 / Math.PI);
      const clamped = Math.max(-18, Math.min(18, angleDeg));
      el.style.transform = `rotate(${clamped.toFixed(2)}deg)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <span className={cn("relative inline-flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-primary/40 blur-xl opacity-70 animate-pulse"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-25%] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.35),transparent_70%)]"
      />
      <img
        ref={imgRef}
        src={astronautAsset.url}
        alt="Ayuniqa astronaut"
        width={96}
        height={96}
        className="relative h-full w-full object-contain drop-shadow-[0_0_10px_hsl(var(--primary)/0.55)] transition-transform duration-150 ease-out will-change-transform"
      />
    </span>
  );
}