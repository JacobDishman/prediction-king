import { chats, getUserById } from "@/data/mock";
import { Link } from "react-router-dom";
import { Crown, MessageSquare } from "lucide-react";

const GroupChats = () => {
  return (
    <section className="px-4 pt-6">
      <h2 className="mb-3 font-heading text-lg font-bold">My Group Chats</h2>
      <div className="flex flex-col gap-3">
        {chats.map((chat) => {
          const king = chat.members.find((m) => m.isKing);
          const kingUser = king ? getUserById(king.userId) : null;
          const myMembership = chat.members.find((m) => m.userId === "u1");

          return (
            <Link
              key={chat.id}
              to={`/chat/${chat.id}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-secondary"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{chat.name}</span>
                  {chat.activePrediction && (
                    <span className="flex-shrink-0 rounded-full bg-ck-orange px-2 py-0.5 text-[10px] font-bold text-white">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {kingUser && (
                    <span className="flex items-center gap-1">
                      <Crown className="h-3 w-3 text-ck-gold" />
                      {kingUser.name}
                    </span>
                  )}
                  <span>·</span>
                  <span>{chat.members.length} members</span>
                  <span>·</span>
                  <span>{chat.lastActivity}</span>
                </div>
              </div>
              {myMembership && (
                <div className="text-right">
                  <div className="text-sm font-bold">{myMembership.points}</div>
                  <div className="text-[10px] text-muted-foreground">pts</div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default GroupChats;
