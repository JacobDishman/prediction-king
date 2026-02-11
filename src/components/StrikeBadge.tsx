import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

interface StrikeBadgeProps {
  strikes: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const StrikeBadge = ({ strikes, showLabel = true, size = "md" }: StrikeBadgeProps) => {
  const bgClass =
    strikes === 0 ? "bg-ck-green" :
    strikes === 1 ? "bg-ck-yellow" :
    strikes === 2 ? "bg-ck-orange" :
    "bg-ck-red";

  const label =
    strikes === 0 ? "All clear" :
    strikes === 1 ? "1 strike" :
    strikes === 2 ? "Careful!" :
    "Locked out";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-white",
        bgClass,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs"
      )}
    >
      <ShieldAlert className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{strikes}/3</span>
      {showLabel && <span className="hidden sm:inline">· {label}</span>}
    </div>
  );
};

export default StrikeBadge;
