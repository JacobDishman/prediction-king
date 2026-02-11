import { currentUser, users } from "@/data/mock";
import { Copy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const friends = users.filter((u) => u.id !== "u1");

const FriendsPage = () => {
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.addCode);
    toast({ title: "Copied!", description: "Your add code has been copied." });
  };

  return (
    <div className="px-4 pt-4">
      <h2 className="mb-4 font-heading text-lg font-bold">Friends</h2>

      {/* Add code */}
      <div className="mb-6 rounded-xl border bg-card p-4 text-center shadow-sm">
        <p className="text-xs text-muted-foreground mb-1">Your Add Code</p>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 mx-auto text-2xl font-heading font-bold tracking-widest text-accent"
        >
          {currentUser.addCode}
          <Copy className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Add friend */}
      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Enter friend's code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" className="gap-1">
          <UserPlus className="h-4 w-4" /> Add
        </Button>
      </div>

      {/* Friend list */}
      <div className="flex flex-col gap-2">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {friend.avatar}
            </div>
            <div className="flex-1">
              <span className="font-semibold text-sm">{friend.name}</span>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsPage;
