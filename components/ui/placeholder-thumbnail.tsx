export function PlaceholderThumbnail({
  className,
  dense = false,
}: {
  className: string;
  dense?: boolean;
}) {
  const stripe = dense
    ? "repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0 5px, transparent 5px 10px)"
    : "repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0 6px, transparent 6px 12px)";
  return (
    <div
      className={`bg-black/[0.03] ${className}`}
      style={{ backgroundImage: stripe }}
    />
  );
}
