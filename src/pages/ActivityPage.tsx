import { activityHistory, strikeHistory, currentUser } from "@/data/mock";
import { TrendingUp, TrendingDown, Clock, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import StrikeBadge from "@/components/StrikeBadge";

const ActivityPage = () => {
  const wins = activityHistory.filter((a) => a.result === "won").length;
  const losses = activityHistory.filter((a) => a.result === "lost").length;
  const totalEarned = activityHistory.reduce((sum, a) => sum + (a.pointsChange > 0 ? a.pointsChange : 0), 0);
  const totalLost = activityHistory.reduce((sum, a) => sum + (a.pointsChange < 0 ? Math.abs(a.pointsChange) : 0), 0);

  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="mb-4 font-heading text-base font-bold uppercase tracking-wide text-foreground">
        My Activity
      </h2>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-ck-green" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Record</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-ck-green tabular-nums">{wins}</span>
            <span className="text-xs text-muted-foreground">-</span>
            <span className="text-xl font-bold text-ck-red tabular-nums">{losses}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {((wins / (wins + losses)) * 100).toFixed(0)}% win rate
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Net Points</span>
          </div>
          <div className="text-xl font-bold tabular-nums text-primary">
            +{(totalEarned - totalLost).toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="text-ck-green">+{totalEarned}</span>
            <span className="text-ck-red">-{totalLost}</span>
          </div>
        </div>
      </div>

      {/* Prediction History */}
      <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Recent Predictions
      </h3>
      <div className="space-y-1.5 mb-5">
        {activityHistory.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              item.result === "won" ? "border-ck-green/20 bg-ck-green/5" :
              item.result === "lost" ? "border-ck-red/20 bg-ck-red/5" :
              "border-border bg-card"
            )}
          >
            {/* Result icon */}
            <div className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
              item.result === "won" ? "bg-ck-green/15" :
              item.result === "lost" ? "bg-ck-red/15" :
              "bg-secondary"
            )}>
              {item.result === "won" ? (
                <TrendingUp className="h-4 w-4 text-ck-green" />
              ) : item.result === "lost" ? (
                <TrendingDown className="h-4 w-4 text-ck-red" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{item.question}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                <span>{item.chatName}</span>
                <span className="text-border">|</span>
                <span>Picked: {item.yourPick}</span>
              </div>
            </div>

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <div className={cn(
                "text-sm font-bold tabular-nums",
                item.pointsChange > 0 ? "text-ck-green" : "text-ck-red"
              )}>
                {item.pointsChange > 0 ? "+" : ""}{item.pointsChange}
              </div>
              <div className="text-[9px] text-muted-foreground">{item.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Strike History */}
      <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Strike Log
      </h3>
      <div className="space-y-1.5">
        {strikeHistory.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
              entry.strikes === 0 ? "bg-ck-green/15" :
              entry.strikes === 1 ? "bg-ck-yellow/15" :
              entry.strikes >= 2 ? "bg-ck-red/15" : "bg-secondary"
            )}>
              <ShieldAlert className={cn(
                "h-4 w-4",
                entry.strikes === 0 ? "text-ck-green" :
                entry.strikes === 1 ? "text-ck-yellow" :
                "text-ck-red"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{entry.reason}</p>
              <span className="text-[10px] text-muted-foreground">{entry.date}</span>
            </div>
            <span className={cn(
              "text-xs font-bold tabular-nums",
              entry.strikes === 0 ? "text-ck-green" :
              entry.strikes === 1 ? "text-ck-yellow" :
              "text-ck-red"
            )}>
              {entry.strikes}/3
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
