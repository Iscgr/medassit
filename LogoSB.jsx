import React from "react";

export default function LogoSB({ size = 64, className = "" }) {
  const fontSize = Math.round(size * 0.44);

  return (
    <div
      className={`relative flex items-center justify-center rounded-[22px] ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(145deg, #ffe4e6, #fce7f3)",
        boxShadow:
          "inset -4px -4px 14px rgba(236, 72, 153, 0.22), inset 6px 6px 14px rgba(255,255,255,0.90), 0 10px 26px rgba(236, 72, 153, 0.18)",
      }}
    >
      {/* هایلایت بالا-چپ */}
      <span
        className="absolute -top-1 -left-1 rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: "radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)",
          filter: "blur(3px)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />
      {/* هاله پایین-راست */}
      <span
        className="absolute -bottom-2 -right-2 rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: "radial-gradient(closest-side, rgba(244,114,182,0.18), rgba(244,114,182,0) 70%)",
          filter: "blur(6px)",
          pointerEvents: "none",
        }}
      />
      {/* ذرات تزئینی */}
      <span
        className="absolute rounded-full"
        style={{
          width: size * 0.12,
          height: size * 0.12,
          right: size * 0.18,
          top: size * 0.18,
          background: "linear-gradient(135deg, #fecdd3, #f5d0fe)",
          boxShadow: "0 4px 10px rgba(236, 72, 153, 0.25)",
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          width: size * 0.08,
          height: size * 0.08,
          left: size * 0.2,
          bottom: size * 0.22,
          background: "linear-gradient(135deg, #fbcfe8, #ddd6fe)",
          boxShadow: "0 4px 10px rgba(168, 85, 247, 0.25)",
        }}
      />

      {/* مونوگرام SB */}
      <span
        className="select-none font-extrabold tracking-tight bg-clip-text text-transparent"
        style={{
          fontSize,
          backgroundImage: "linear-gradient(90deg, #ec4899, #a855f7)",
          textShadow:
            "0 1px 0 rgba(255,255,255,0.65), 0 6px 18px rgba(168, 85, 247, 0.25)",
          lineHeight: 1,
        }}
      >
        SB
      </span>

      {/* درخشش ظریف مرکز */}
      <span
        className="absolute inset-0 rounded-[22px] pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
    </div>
  );
}