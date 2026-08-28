"use client";

import { useState } from "react";
import { CategoryPill } from "@/components/ui/category-pill";

export function CategoryFilter({ categories }: { categories: string[] }) {
  const [active, setActive] = useState<string>(categories[0] ?? "all");

  return (
    <div className="flex flex-wrap gap-2.5">
      {categories.map((category) => (
        <CategoryPill
          key={category}
          label={category}
          active={active === category}
          onClick={() => setActive(category)}
        />
      ))}
    </div>
  );
}
