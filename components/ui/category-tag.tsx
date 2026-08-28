// Hues spread around the wheel so adjacent categories don't collide.
const CATEGORY_HUES = [250, 150, 39, 320, 200, 90];

function hueForCategory(category: string): number {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0;
  }
  return CATEGORY_HUES[Math.abs(hash) % CATEGORY_HUES.length];
}

export function CategoryTag({ category }: { category: string }) {
  const hue = hueForCategory(category);

  return (
    <span
      className="inline-block rounded-full px-[9px] py-[2px] font-display text-[11px] font-bold"
      style={{
        backgroundColor: `oklch(90% 0.05 ${hue})`,
        color: `oklch(35% 0.14 ${hue})`,
      }}
    >
      {category}
    </span>
  );
}
