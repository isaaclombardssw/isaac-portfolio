"use client";

import { ArrowUpRight, Disc3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SiSpotify, SiTidal } from "react-icons/si";
import { cn } from "../../lib/utils";

export interface MusicItem {
  id: string;
  name: string;
  role: string;
  href: string;
  accent: string;
  icon?: string; // favicon path
  platform?: "spotify" | "tidal";
  placeholder?: boolean;
}

function Glyph({ item }: { item: MusicItem }) {
  if (item.platform === "spotify") return <SiSpotify className="h-9 w-9" style={{ color: item.accent }} />;
  if (item.platform === "tidal") return <SiTidal className="h-9 w-9" style={{ color: item.accent }} />;
  if (item.icon) return <Image src={item.icon} alt="" width={40} height={40} className="h-10 w-10" />;
  return <Disc3 className="h-9 w-9" style={{ color: item.accent }} />;
}

export default function MusicShowcase({ items }: { items: MusicItem[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = items.filter((_, i) => i % 3 === 0);
  const col2 = items.filter((_, i) => i % 3 === 1);
  const col3 = items.filter((_, i) => i % 3 === 2);
  const columns = [
    { items: col1, offset: "", size: "w-[150px] h-[160px]" },
    { items: col2, offset: "mt-[68px]", size: "w-[168px] h-[178px]" },
    { items: col3, offset: "mt-[32px]", size: "w-[158px] h-[168px]" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl select-none flex-col items-start gap-10 px-4 md:flex-row md:gap-14 md:px-6">
      {/* Left: staggered tile grid */}
      <div className="flex flex-shrink-0 gap-3">
        {columns.map((col, ci) => (
          <div key={ci} className={cn("flex flex-col gap-3", col.offset)}>
            {col.items.map((item) => (
              <Tile
                key={item.id}
                item={item}
                className={col.size}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Right: name list */}
      <div className="flex w-full flex-1 flex-col gap-5 pt-0 md:pt-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} hoveredId={hoveredId} onHover={setHoveredId} />
        ))}
      </div>
    </div>
  );
}

function Tile({
  item,
  className,
  hoveredId,
  onHover,
}: {
  item: MusicItem;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === item.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <a
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/5 transition-all duration-300",
        className,
        isDimmed ? "opacity-45" : "opacity-100",
        isActive ? "scale-[1.03] shadow-lg" : "",
      )}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${item.accent}44, ${item.accent}1f 55%, #ffffff 100%)`,
      }}
    >
      <Glyph item={item} />
    </a>
  );
}

function ItemRow({
  item,
  hoveredId,
  onHover,
}: {
  item: MusicItem;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === item.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <a
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={cn("block cursor-pointer transition-opacity duration-300", isDimmed ? "opacity-50" : "opacity-100")}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="h-3 w-4 flex-shrink-0 rounded-[5px] transition-all duration-300"
          style={{ backgroundColor: isActive ? item.accent : "color-mix(in oklab, var(--foreground) 25%, transparent)", width: isActive ? 20 : undefined }}
        />
        <span
          className={cn(
            "text-[18px] font-semibold leading-none tracking-tight transition-colors duration-300",
            isActive ? "text-foreground" : "text-foreground/80",
          )}
        >
          {item.name}
        </span>
        <span
          className={cn(
            "ml-0.5 flex items-center transition-all duration-200",
            isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
          )}
        >
          <ArrowUpRight className="h-4 w-4" style={{ color: item.accent }} />
        </span>
      </div>
      <p className="mt-1.5 pl-[27px] text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {item.placeholder ? `${item.role} · coming soon` : item.role}
      </p>
    </a>
  );
}
