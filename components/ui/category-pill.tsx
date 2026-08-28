import type { ButtonHTMLAttributes } from "react";

type CategoryPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
};

export function CategoryPill({
  label,
  active = false,
  className = "",
  ...props
}: CategoryPillProps) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full border-2 px-5 py-[10px] font-display text-sm font-bold ${
        active
          ? "border-rank-orange bg-rank-orange text-white"
          : "border-black/15 bg-transparent text-rank-fg"
      } ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}
