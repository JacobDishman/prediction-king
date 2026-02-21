import { currentUser, users } from "@/data/mock";
import { Copy, UserPlus, Check, X, CircleDot } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import StrikeBadge from "@/components/StrikeBadge";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Current user's numeric DB id (mirrors seed: user_id 1 = "You")
const CURRENT_USER_DB_ID = 1;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PendingRequest {
  request_id: number;
  sender_id: number;
  sender_name: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const FriendsPage = () => {
  const [code, setCode] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  // Pending friend requests from the DB
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Friends list — still sourced from mock for the non-wired portions of the app
  const friends = users.filter((u) => u.id !== "u1");

  // ---- fetch incoming requests on mount ----
  useEffect(() => {
    fetch(`${API_BASE}/api/friend-requests/incoming/${CURRENT_USER_DB_ID}`)
      .then((r) => r.json())
      .then((data: PendingRequest[]) => {
        setPendingRequests(data);
        setLoadingRequests(false);
      })
      .catch(() => setLoadingRequests(false));
  }, []);

  // ---- copy own add code ----
  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.addCode);
    toast({ title: "Copied!", description: "Your add code has been copied." });
  };

  // ---- send a friend request ----
  const handleAddFriend = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode || adding) return;

    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/api/friend-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderUserId: CURRENT_USER_DB_ID,
          addCode: trimmedCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Couldn't send request",
          description: data.error || "Something went wrong.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request sent!",
          description: `Friend request sent to ${data.receiverName}.`,
        });
        setCode("");
      }
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the server.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddFriend();
  };

  // ---- accept or decline a request ----
  const handleRespond = async (requestId: number, action: "accept" | "decline") => {
    try {
      const res = await fetch(`${API_BASE}/api/friend-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        // Remove from local list regardless of accept/decline
        setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId));
        toast({
          title: action === "accept" ? "Friend added!" : "Request declined",
          description:
            action === "accept"
              ? "You are now friends."
              : "The request has been removed.",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        toast({
          title: "Error",
          description: data.error || "Could not update request.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach the server.", variant: "destructive" });
    }
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
          onKeyDown={handleKeyDown}
          disabled={adding}
          className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-60"
        />
        <button
          onClick={handleAddFriend}
          disabled={adding || !code.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="h-4 w-4" />
          {adding ? "Sending…" : "Add"}
        </button>
      </div>

      {/* Pending Requests */}
      {!loadingRequests && pendingRequests.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Pending Requests
          </h3>
          <div className="space-y-1.5">
            {pendingRequests.map((req) => (
              <div
                key={req.request_id}
                className="flex items-center gap-3 rounded-xl border border-ck-orange/20 bg-card p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ck-orange/15 text-ck-orange font-bold text-sm">
                  {req.sender_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm">{req.sender_name}</span>
                  <p className="text-[10px] text-muted-foreground">Wants to be friends</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleRespond(req.request_id, "accept")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRespond(req.request_id, "decline")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-ck-red/15 text-ck-red hover:bg-ck-red/25 transition-colors"
                  >
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
