import { useParams, Link } from "react-router-dom";
import { getChatById, getUserById, currentUser } from "@/data/mock";
import { ArrowLeft, Crown, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import StrikeBadge from "@/components/StrikeBadge";

const LeaderboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const chat = getChatById(id || "");

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Chat not found</p>
        <Link to="/chats" className="text-primary text-sm mt-2">Back to chats</Link>
      </div>
    );
  }

  const sorted = [...chat.members].sort((a, b) => b.points - a.points);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5">
        <Link to={`/chat/${id}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h2 className="font-heading font-bold text-sm">Leaderboard</h2>
          <p className="text-[10px] text-muted-foreground">{chat.name}</p>
        </div>
      </div>

      {/* Weekly Reset */}
      <div className="flex items-center justify-center gap-2 bg-secondary/50 px-4 py-2 text-[10px] text-muted-foreground">
        <TrendingUp className="h-3 w-3" />
        <span>Weekly reset in 4 days</span>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Top 3 podium */}
        {sorted.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6 pt-4">
            {/* 2nd place */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground border-2 border-muted">
                {getUserById(sorted[1].userId)?.avatar}
              </div>
              <div className="mt-1.5 rounded-t-lg bg-secondary w-16 h-16 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">2nd</span>
                <span className="text-sm font-bold tabular-nums">{sorted[1].points.toLocaleString()}</span>
              </div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center -mt-4">
              <Crown className="h-5 w-5 text-ck-gold mb-1" />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-base font-bold text-primary border-2 border-primary">
                {getUserById(sorted[0].userId)?.avatar}
              </div>
              <div className="mt-1.5 rounded-t-lg bg-primary/10 border border-primary/20 w-16 h-20 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-primary">1st</span>
                <span className="text-sm font-bold tabular-nums">{sorted[0].points.toLocaleString()}</span>
              </div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground border-2 border-muted">
                {getUserById(sorted[2].userId)?.avatar}
              </div>
              <div className="mt-1.5 rounded-t-lg bg-secondary w-16 h-12 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">3rd</span>
                <span className="text-sm font-bold tabular-nums">{sorted[2].points.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="space-y-1.5">
          {sorted.map((member, idx) => {
            const user = getUserById(member.userId);
            if (!user) return null;
            const isMe = user.id === currentUser.id;
            const isKing = member.isKing;

            return (
              <div
                key={member.userId}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                  isMe ? "border-primary/30 bg-primary/5" : "border-border bg-card",
                  isKing && "border-ck-gold/30"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  idx === 0 ? "bg-ck-gold/20 text-ck-gold" :
                  idx === 1 ? "bg-muted text-muted-foreground" :
                  idx === 2 ? "bg-ck-orange/20 text-ck-orange" :
                  "bg-secondary text-muted-foreground"
                )}>
                  {idx + 1}
                </div>

                {/* Avatar */}
                <div className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-bold text-sm",
                  isKing ? "bg-ck-gold/20 text-ck-gold" : "bg-secondary text-foreground"
                )}>
                  {user.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("font-semibold text-sm", isMe && "text-primary")}>
                      {isMe ? "You" : user.name}
                    </span>
                    {isKing && <Crown className="h-3 w-3 text-ck-gold" />}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Award className="h-2.5 w-2.5" />
                      {member.minorityWins} minority
                    </span>
                    <StrikeBadge strikes={user.strikes} size="sm" showLabel={false} />
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{member.points.toLocaleString()}</div>
                  <div className="text-[9px] text-muted-foreground">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
