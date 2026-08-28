"use client";

import { useState } from "react";
import { CategoryPill } from "@/components/ui/category-pill";
import type { Category, CategoryKey } from "@/lib/rank-data";

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState<CategoryKey>(
    categories[0]?.key ?? "all",
  );

  return (
    <div className="flex flex-wrap gap-2.5">
      {categories.map((category) => (
        <CategoryPill
          key={category.key}
          label={category.label}
          active={active === category.key}
          onClick={() => setActive(category.key)}
        />
      ))}
    </div>
  );
}
