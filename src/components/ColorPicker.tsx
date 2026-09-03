import { useState, useRef, useEffect, useCallback } from "react";

// ── Color math ──────────────────────────────────────────────────────────────
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if      (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else                h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [Math.round(h), max === 0 ? 0 : Math.round((d / max) * 100), Math.round(max * 100)];
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length !== 3 && clean.length !== 6) return null;
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

function hsvToHex(h: number, s: number, v: number) {
  return rgbToHex(...hsvToRgb(h, s, v));
}

// ── Component ───────────────────────────────────────────────────────────────
interface Props { value: string; onChange: (hex: string) => void; }

export default function ColorPicker({ value, onChange }: Props) {
  const parseHex = (hex: string): [number, number, number] => {
    const rgb = hexToRgb(hex);
    if (!rgb) return [0, 100, 100];
    return rgbToHsv(...rgb);
  };

  const [h, setH] = useState(() => parseHex(value)[0]);
  const [s, setS] = useState(() => parseHex(value)[1]);
  const [v, setV] = useState(() => parseHex(value)[2]);
  const [hexInput, setHexInput] = useState(value.replace(/^#/, "").toUpperCase());
  const [dragging, setDragging] = useState(false);
  const svRef = useRef<HTMLDivElement>(null);

  // Sync from parent when value changes externally
  useEffect(() => {
    const rgb = hexToRgb(value);
    if (rgb) {
      const [nh, ns, nv] = rgbToHsv(...rgb);
      setH(nh); setS(ns); setV(nv);
      setHexInput(value.replace(/^#/, "").toUpperCase());
    }
  }, [value]);

  const emit = useCallback((nh: number, ns: number, nv: number) => {
    const hex = hsvToHex(nh, ns, nv);
    setHexInput(hex.replace(/^#/, "").toUpperCase());
    onChange(hex);
  }, [onChange]);

  const updateSV = useCallback((clientX: number, clientY: number) => {
    const rect = svRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ns = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const nv = Math.max(0, Math.min(100, (1 - (clientY - rect.top) / rect.height) * 100));
    setS(Math.round(ns)); setV(Math.round(nv));
    emit(h, Math.round(ns), Math.round(nv));
  }, [h, emit]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => updateSV(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { e.preventDefault(); updateSV(e.touches[0].clientX, e.touches[0].clientY); };
    const onUp = () => setDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onTouch, { passive: false });
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onTouch);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, [dragging, updateSV]);

  const handleSvPointer = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(true);
    const pt = "touches" in e ? e.touches[0] : e;
    updateSV(pt.clientX, pt.clientY);
  };

  const handleHue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nh = Number(e.target.value);
    setH(nh);
    emit(nh, s, v);
  };

  const handleHexChange = (raw: string) => {
    const clean = raw.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, 6);
    setHexInput(clean);
    const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
    if (full.length === 6) {
      const rgb = hexToRgb("#" + full);
      if (rgb) {
        const [nh, ns, nv] = rgbToHsv(...rgb);
        setH(nh); setS(ns); setV(nv);
        onChange("#" + full.toLowerCase());
      }
    }
  };

  const hueHex = hsvToHex(h, 100, 100);
  const currentHex = hsvToHex(h, s, v);

  // Quick-pick swatches
  const swatches = [
    "#EF4444","#F97316","#EAB308","#22C55E","#10B981","#06B6D4",
    "#3B82F6","#8B5CF6","#EC4899","#6B7280","#0F172A","#FFFFFF",
  ];

  return (
    <div className="space-y-3 select-none">
      {/* SV gradient square */}
      <div
        ref={svRef}
        onMouseDown={handleSvPointer}
        onTouchStart={handleSvPointer}
        className="relative w-full rounded-xl overflow-hidden cursor-crosshair touch-none"
        style={{ height: 148, background: hueHex }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, #000)" }} />
        {/* Cursor */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 18, height: 18,
            left: `${s}%`, top: `${100 - v}%`,
            transform: "translate(-50%, -50%)",
            background: currentHex,
            boxShadow: "0 0 0 2px white, 0 0 0 3.5px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Hue slider + preview swatch */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl shrink-0 border-2 border-white/20 shadow" style={{ background: currentHex }} />
        <div className="flex-1">
          <input
            type="range" min={0} max={359} value={h} onChange={handleHue}
            className="hue-slider w-full h-3 rounded-full cursor-pointer appearance-none outline-none"
            style={{
              background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
            }}
          />
        </div>
      </div>

      {/* Hex input */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
        <span className="text-xs font-bold text-[var(--muted-foreground)] font-mono">#</span>
        <input
          type="text"
          value={hexInput}
          onChange={e => handleHexChange(e.target.value)}
          maxLength={6}
          className="flex-1 bg-transparent text-sm font-mono font-semibold text-[var(--foreground)] outline-none uppercase tracking-widest"
          placeholder="3B82F6"
        />
        <span className="text-xs text-[var(--muted-foreground)]">{currentHex}</span>
      </div>

      {/* Quick swatches */}
      <div className="flex flex-wrap gap-1.5">
        {swatches.map(sw => (
          <button
            key={sw} type="button"
            onClick={() => { const rgb = hexToRgb(sw); if (rgb) { const [nh,ns,nv] = rgbToHsv(...rgb); setH(nh); setS(ns); setV(nv); setHexInput(sw.replace("#","").toUpperCase()); onChange(sw); } }}
            className="w-6 h-6 rounded-md border border-white/20 hover:scale-110 transition-transform shadow-sm"
            style={{ background: sw }}
          />
        ))}
      </div>
    </div>
  );
}
