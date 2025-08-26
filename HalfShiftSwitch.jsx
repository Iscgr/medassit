import React from "react";

/**
 * HalfShiftSwitch
 * - حرکت گلوله فقط نصف مسیر کامل به سمت راست در حالت فعال
 * - RTL-safe (جهت را تغییر نمی‌دهد، صرفاً میزان جابه‌جایی کمتر است)
 * - API سازگار با shadcn: checked, onCheckedChange, disabled, className
 */
export default function HalfShiftSwitch({ checked = false, onCheckedChange, disabled = false, className = "" }) {
  const toggle = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className={[
        "relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-slate-900" : "bg-slate-200",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          // جابه‌جایی نصف مسیر استاندارد (~12px)
          checked ? "translate-x-[12px]" : "translate-x-0"
        ].join(" ")}
      />
    </button>
  );
}