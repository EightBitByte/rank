export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[26px] font-extrabold">{value}</div>
      <div className="text-[13px] font-medium opacity-55">{label}</div>
    </div>
  );
}
