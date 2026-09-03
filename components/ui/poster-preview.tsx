"use client";

import Image from "next/image";
import { useState } from "react";
import { PlaceholderThumbnail } from "@/components/ui/placeholder-thumbnail";

function toFullSize(href: string) {
  return href.replace("/t/p/w500/", "/t/p/w780/");
}

export function PosterPreview({
  title,
  previewAssetHref,
  thumbnailClassName,
  thumbnailSizes,
  placeholderDense,
}: {
  title: string;
  previewAssetHref?: string | null;
  thumbnailClassName: string;
  thumbnailSizes?: string;
  placeholderDense?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!previewAssetHref) {
    return (
      <PlaceholderThumbnail
        className={`shrink-0 ${thumbnailClassName}`}
        dense={placeholderDense}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${title} poster`}
        className={`relative shrink-0 cursor-zoom-in overflow-hidden ${thumbnailClassName}`}
      >
        <Image
          src={previewAssetHref}
          alt={`poster for ${title}`}
          fill
          className="object-cover"
          sizes={thumbnailSizes}
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/70"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} poster`}
            className="relative w-full max-w-sm aspect-2/3"
          >
            <Image
              src={toFullSize(previewAssetHref)}
              alt={`poster for ${title}`}
              fill
              className="rounded-2xl object-cover"
              sizes="384px"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white font-display text-sm font-bold text-black shadow-md"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
