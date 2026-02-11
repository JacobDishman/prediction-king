import { MessageSquare, Activity, Crown, Users, History, ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { currentUser } from "@/data/mock";
import StrikeBadge from "@/components/StrikeBadge";

const menuItems = [
  { icon: MessageSquare, label: "Chats", desc: "All your group chats", path: "/chats", color: "text-primary", bg: "bg-primary/10" },
  { icon: Activity, label: "My Activity", desc: "Prediction history & stats", path: "/activity", color: "text-ck-green", bg: "bg-ck-green/10" },
  { icon: Crown, label: "King Status", desc: "How the crown works", path: "/rules", color: "text-ck-gold", bg: "bg-ck-gold/10" },
  { icon: Users, label: "Friends", desc: "Manage friends & codes", path: "/friends", color: "text-primary", bg: "bg-primary/10" },
  { icon: History, label: "History & Stats", desc: "Detailed performance data", path: "/activity", color: "text-ck-orange", bg: "bg-ck-orange/10" },
  { icon: ShieldCheck, label: "Rules & Fair Play", desc: "Points system & strike rules", path: "/rules", color: "text-muted-foreground", bg: "bg-secondary" },
];

const MenuPage = () => {
  return (
    <div className="px-4 pt-4 pb-4">
      {/* User card */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary font-heading font-bold text-lg">
          {currentUser.avatar}
        </div>
        <div className="flex-1">
          <span className="font-heading font-bold text-base">{currentUser.name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">#{currentUser.addCode}</span>
            <StrikeBadge strikes={currentUser.strikes} size="sm" />
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-heading text-base font-bold uppercase tracking-wide text-foreground">
        Menu
      </h2>
      <div className="flex flex-col gap-1.5">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-secondary/50 active:bg-secondary"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
