import { currentUser, users } from "@/data/mock";
import { Copy, UserPlus, Check, X, CircleDot } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import StrikeBadge from "@/components/StrikeBadge";

const friends = users.filter((u) => u.id !== "u1");

const pendingRequests = [
  { id: "pr1", name: "Dakota", avatar: "D" },
  { id: "pr2", name: "Jamie", avatar: "J" },
];

const FriendsPage = () => {
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.addCode);
    toast({ title: "Copied!", description: "Your add code has been copied." });
  };

  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="mb-4 font-heading text-base font-bold uppercase tracking-wide text-foreground">
        Friends
      </h2>

      {/* Add code */}
      <div className="mb-4 rounded-xl border border-primary/20 bg-card p-4 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Your Add Code</p>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 mx-auto text-2xl font-heading font-bold tracking-[0.2em] text-primary"
        >
          {currentUser.addCode}
          <Copy className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="text-[10px] text-muted-foreground mt-1">Tap to copy</p>
      </div>

      {/* Add friend */}
      <div className="mb-5 flex gap-2">
        <input
          placeholder="Enter friend's code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Pending Requests
          </h3>
          <div className="space-y-1.5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-xl border border-ck-orange/20 bg-card p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ck-orange/15 text-ck-orange font-bold text-sm">
                  {req.avatar}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm">{req.name}</span>
                  <p className="text-[10px] text-muted-foreground">Wants to be friends</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
                    <Check className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-ck-red/15 text-ck-red hover:bg-ck-red/25 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend list */}
      <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
        My Friends
      </h3>
      <div className="space-y-1.5">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
              {friend.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm">{friend.name}</span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <CircleDot className="h-2 w-2 text-ck-green" />
                Online
              </div>
            </div>
            <StrikeBadge strikes={friend.strikes} size="sm" showLabel={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsPage;
